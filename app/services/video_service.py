import math
import time
from typing import Optional
from fastapi import HTTPException, status
from app.config import get_settings
from app.repositories.video_repository import VideoRepository
from app.utils.bunny_client import (
    create_bunny_video,
    get_bunny_video_status,
    delete_bunny_video,
    delete_bunny_storage_file
)
from app.utils.bunny_signature import generate_tus_signature, generate_signed_playback_url
from app.schemas.video_schemas import (
    VideoInitiateRequest,
    VideoInitiateResponse,
    VideoResponse,
    VideoUpdateRequest,
    ThumbnailUploadUrlRequest,
    ThumbnailUploadUrlResponse,
    SelectMainThumbnailRequest,
    DeleteThumbnailRequest,
    BunnyWebhookPayload
)
from app.schemas.common_schemas import PaginatedResponse

class VideoService:
    """
    Business logic and cloud orchestration layer for Video operations (Peewee ORM).
    """
    def __init__(self):
        self.repo = VideoRepository()

    def _to_video_response(self, video) -> VideoResponse:
        settings = get_settings()
        playback_url = None
        if video.is_playable or video.status in ("READY", "PLAYABLE"):
            playback_url = generate_signed_playback_url(
                settings.BUNNY_PULL_ZONE_URL,
                video.bunny_video_id,
                settings.BUNNY_STREAM_TOKEN_KEY
            )

        return VideoResponse(
            id=video.id,
            bunny_video_id=video.bunny_video_id,
            title=video.title,
            description=video.description,
            category=video.category,
            tags=list(video.tags or []),
            status=video.status,
            encode_progress=video.encode_progress,
            is_playable=video.is_playable,
            playback_url=playback_url,
            main_thumbnail_url=video.main_thumbnail_url,
            caption_url=video.caption_url,
            caption_language=video.caption_language or "en",
            alt_thumbnail_urls=list(video.alt_thumbnail_urls or []),
            created_at=video.created_at
        )

    def initiate_video_upload(self, user_id: int, payload: VideoInitiateRequest) -> VideoInitiateResponse:
        """
        Orchestrates Bunny container reservation, HMAC TUS signature generation, CDN URL pre-calculation, and DB insertion.
        """
        settings = get_settings()
        library_id = settings.BUNNY_STREAM_LIBRARY_ID or "123456"
        api_key = settings.BUNNY_STREAM_API_KEY or "dev_api_key"

        bunny_container = create_bunny_video(payload.title)
        bunny_video_id = bunny_container.get("guid")

        expiration_time = int(time.time()) + 86400  # 24 hours validity
        signature = generate_tus_signature(library_id, api_key, expiration_time, bunny_video_id)

        pull_zone = (settings.BUNNY_PULL_ZONE_URL or "https://your-pull-zone.b-cdn.net").rstrip("/")
        main_thumbnail_url = f"{pull_zone}/{bunny_video_id}/thumbnail.jpg"
        alt_thumbnail_urls = [
            f"{pull_zone}/{bunny_video_id}/thumb_2.jpg",
            f"{pull_zone}/{bunny_video_id}/thumb_3.jpg"
        ]

        video_data = {
            "bunny_video_id": bunny_video_id,
            "title": payload.title,
            "description": payload.description,
            "category": payload.category,
            "tags": payload.tags or [],
            "status": "PENDING",
            "encode_progress": 0,
            "is_playable": False,
            "main_thumbnail_url": main_thumbnail_url,
            "alt_thumbnail_urls": alt_thumbnail_urls,
            "caption_url": f"{pull_zone}/{bunny_video_id}/captions/en.vtt",
            "caption_language": "en"
        }

        video = self.repo.create_video(video_data, user_id)

        return VideoInitiateResponse(
            id=video.id,
            bunny_video_id=video.bunny_video_id,
            bunny_library_id=str(library_id),
            status=video.status,
            signature=signature,
            expiration_time=expiration_time,
            main_thumbnail_url=video.main_thumbnail_url,
            alt_thumbnail_urls=video.alt_thumbnail_urls
        )

    def handle_bunny_webhook(self, payload: BunnyWebhookPayload) -> dict:
        """
        Processes status code state machine (0 to 10) from Bunny Stream webhook events and updates database state.
        """
        status_map = {
            0: ("PENDING", 0, False),
            1: ("PROCESSING", 10, False),
            2: ("ENCODING", 50, False),
            3: ("READY", 100, True),
            4: ("PLAYABLE", 75, True),
            5: ("FAILED", 0, False),
            6: ("PENDING", 0, False),
            7: ("UPLOAD_FINISHED", 0, False),
            8: ("UPLOAD_FAILED", 0, False),
            9: ("READY", 100, True),
            10: ("READY", 100, True)
        }

        status_code = payload.Status
        db_status, progress, is_playable = status_map.get(status_code, ("PENDING", 0, False))

        caption_url = None
        if status_code in (3, 4, 9, 10):
            status_data = get_bunny_video_status(payload.VideoGuid)
            if status_data and "encodeProgress" in status_data:
                progress = status_data.get("encodeProgress", progress)
            settings = get_settings()
            pull_zone = (settings.BUNNY_PULL_ZONE_URL or "https://your-pull-zone.b-cdn.net").rstrip("/")
            caption_url = f"{pull_zone}/{payload.VideoGuid}/captions/en.vtt"

        self.repo.update_video_status(payload.VideoGuid, db_status, progress, is_playable, caption_url=caption_url)
        return {"status": "success"}

    def get_video_details(self, user_id: int, video_id: int) -> VideoResponse:
        """
        Fetches video details from DB; if state is ENCODING, queries Bunny Stream API for live encodeProgress sync.
        """
        video = self.repo.get_video_by_id(video_id, user_id)
        if not video:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Video asset {video_id} not found")

        if video.status in ("ENCODING", "PROCESSING"):
            status_data = get_bunny_video_status(video.bunny_video_id)
            if status_data:
                prog = status_data.get("encodeProgress", video.encode_progress)
                code = status_data.get("status", 2)
                is_playable = code in (3, 4) or prog >= 75
                db_status = "READY" if code == 3 else ("PLAYABLE" if code == 4 else "ENCODING")
                video = self.repo.update_video_status(video.bunny_video_id, db_status, prog, is_playable) or video

        return self._to_video_response(video)

    def list_user_videos(self, user_id: int, page: int = 1, limit: int = 20) -> PaginatedResponse[VideoResponse]:
        """
        Fetches a paginated list of videos created by the authenticated creator and returns a PaginatedResponse envelope.
        """
        videos, total = self.repo.get_all_videos_by_user(user_id, page, limit)
        items = [self._to_video_response(v) for v in videos]
        total_pages = math.ceil(total / limit) if total > 0 else 1
        return PaginatedResponse(
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            items=items
        )

    def update_video_metadata(self, user_id: int, video_id: int, payload: VideoUpdateRequest) -> VideoResponse:
        """
        Validates ownership and applies partial textual metadata updates (title, description, category, tags) in DB.
        """
        update_data = payload.model_dump(exclude_unset=True)
        video = self.repo.update_video_metadata(video_id, user_id, update_data)
        if not video:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Video asset {video_id} not found")
        return self._to_video_response(video)

    def generate_thumbnail_upload_url(self, user_id: int, video_id: int, payload: ThumbnailUploadUrlRequest) -> ThumbnailUploadUrlResponse:
        """
        Evaluates 0-indexed slot (0 for Bunny Stream API, 1/2 for Bunny Storage API) and returns write-only image_upload_url.
        """
        video = self.repo.get_video_by_id(video_id, user_id)
        if not video:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Video asset {video_id} not found")

        settings = get_settings()
        pull_zone = (settings.BUNNY_PULL_ZONE_URL or "https://your-pull-zone.b-cdn.net").rstrip("/")
        lib_id = settings.BUNNY_STREAM_LIBRARY_ID or "123456"
        storage_zone = settings.BUNNY_STORAGE_ZONE_NAME or "YOUR_STORAGE_ZONE"

        if payload.slot == 0:
            thumbnail_url = f"{pull_zone}/{video.bunny_video_id}/thumbnail.jpg"
            image_upload_url = f"https://video.bunnycdn.com/library/{lib_id}/videos/{video.bunny_video_id}/thumbnail"
        elif payload.slot == 1:
            thumbnail_url = f"{pull_zone}/{video.bunny_video_id}/thumb_2.jpg"
            image_upload_url = f"https://storage.bunnycdn.com/{storage_zone}/{video.bunny_video_id}/thumb_2.jpg"
        elif payload.slot == 2:
            thumbnail_url = f"{pull_zone}/{video.bunny_video_id}/thumb_3.jpg"
            image_upload_url = f"https://storage.bunnycdn.com/{storage_zone}/{video.bunny_video_id}/thumb_3.jpg"
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Thumbnail slot must be 0, 1, or 2")

        return ThumbnailUploadUrlResponse(
            slot=payload.slot,
            thumbnail_url=thumbnail_url,
            image_upload_url=image_upload_url
        )

    def select_main_thumbnail(self, user_id: int, video_id: int, payload: SelectMainThumbnailRequest) -> VideoResponse:
        """
        Executes thumbnail swapping logic between main cover and alt thumbnails in DB.
        """
        video = self.repo.swap_main_thumbnail(video_id, user_id, payload.selected_main_thumbnail)
        if not video:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Video asset {video_id} not found")
        return self._to_video_response(video)

    def delete_alternative_thumbnail(self, user_id: int, video_id: int, payload: DeleteThumbnailRequest) -> VideoResponse:
        """
        Issues HTTP DELETE to Bunny Storage API to remove physical cloud image and updates DB list via VideoRepository.
        """
        video = self.repo.get_video_by_id(video_id, user_id)
        if not video:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Video asset {video_id} not found")

        # Extract filename from URL
        target_url = payload.thumbnail_url
        file_path = f"{video.bunny_video_id}/{target_url.split('/')[-1]}"
        delete_bunny_storage_file(file_path)

        updated_video = self.repo.delete_alt_thumbnail_url(video_id, user_id, target_url) or video
        return self._to_video_response(updated_video)

    def delete_video_asset(self, user_id: int, video_id: int) -> dict:
        """
        Issues HTTP DELETE to Bunny Stream API to remove cloud video container and drops video record from DB.
        """
        video = self.repo.get_video_by_id(video_id, user_id)
        if not video:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Video asset {video_id} not found")

        delete_bunny_video(video.bunny_video_id)
        self.repo.delete_video(video_id, user_id)
        return {"status": "success", "message": f"Video asset {video_id} dropped successfully."}

