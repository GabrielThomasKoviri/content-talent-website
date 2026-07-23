import math
from fastapi import HTTPException, status
from app.config import get_settings
from app.repositories.playlist_repository import PlaylistRepository
from app.schemas.playlist_schemas import (
    PlaylistCreateRequest,
    PlaylistCreateResponse,
    PlaylistSummaryResponse,
    PlaylistResponse,
    PlaylistUpdateRequest,
    PlaylistBannerUploadUrlResponse,
    PlaylistItemVideoResponse
)
from app.schemas.common_schemas import PaginatedResponse

class PlaylistService:
    """
    Business logic and cloud orchestration layer for Playlist operations (Peewee ORM).
    """
    def __init__(self):
        self.repo = PlaylistRepository()

    def _to_video_dto(self, video) -> PlaylistItemVideoResponse:
        return PlaylistItemVideoResponse(
            id=video.id,
            title=video.title,
            description=video.description,
            bunny_video_id=video.bunny_video_id,
            main_thumbnail_url=video.main_thumbnail_url
        )

    def create_playlist(self, user_id: int, payload: PlaylistCreateRequest) -> PlaylistCreateResponse:
        """
        Saves playlist record in DB, links initial video IDs, and returns deterministic banner image_upload_url (playlist_{id}.jpg).
        """
        settings = get_settings()
        pull_zone = (settings.BUNNY_PULL_ZONE_URL or "https://your-pull-zone.b-cdn.net").rstrip("/")
        storage_zone = settings.BUNNY_STORAGE_ZONE_NAME or "YOUR_STORAGE_ZONE"

        playlist_data = payload.model_dump()
        playlist = self.repo.create_playlist(playlist_data, user_id)

        thumbnail_url = f"{pull_zone}/assets/playlists/playlist_{playlist.id}.jpg"
        image_upload_url = f"https://storage.bunnycdn.com/{storage_zone}/assets/playlists/playlist_{playlist.id}.jpg"

        playlist.thumbnail_url = thumbnail_url
        playlist.save()

        playlist_obj, videos, v_count = self.repo.get_playlist_by_id(playlist.id, user_id)
        video_dtos = [self._to_video_dto(v) for v in videos]

        return PlaylistCreateResponse(
            id=playlist.id,
            name=playlist.name,
            description=playlist.description,
            thumbnail_url=playlist.thumbnail_url,
            image_upload_url=image_upload_url,
            video_count=v_count,
            videos=video_dtos
        )

    def list_user_playlists(self, user_id: int, page: int = 1, limit: int = 20) -> PaginatedResponse[PlaylistSummaryResponse]:
        """
        Fetches paginated creator playlists and returns lightweight summary DTOs containing video_count.
        """
        results, total = self.repo.get_all_playlists_by_user(user_id, page, limit)
        items = [
            PlaylistSummaryResponse(
                id=p.id,
                name=p.name,
                description=p.description,
                thumbnail_url=p.thumbnail_url,
                video_count=v_count
            )
            for p, v_count in results
        ]
        total_pages = math.ceil(total / limit) if total > 0 else 1
        return PaginatedResponse(
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            items=items
        )

    def get_playlist_details(self, user_id: int, playlist_id: int, page: int = 1, limit: int = 20) -> PlaylistResponse:
        """
        Fetches single playlist details and a paginated list of attached video DTOs.
        """
        playlist, videos, total_videos = self.repo.get_playlist_by_id(playlist_id, user_id, page, limit)
        if not playlist:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Playlist {playlist_id} not found")

        video_dtos = [self._to_video_dto(v) for v in videos]
        total_pages = math.ceil(total_videos / limit) if total_videos > 0 else 1

        return PlaylistResponse(
            id=playlist.id,
            name=playlist.name,
            description=playlist.description,
            thumbnail_url=playlist.thumbnail_url,
            video_count=total_videos,
            page=page,
            limit=limit,
            total_pages=total_pages,
            videos=video_dtos
        )

    def update_playlist(self, user_id: int, playlist_id: int, payload: PlaylistUpdateRequest) -> PlaylistResponse:
        """
        Updates playlist textual metadata (name, description) and attached video mappings in DB.
        """
        update_data = payload.model_dump(exclude_unset=True)
        playlist = self.repo.update_playlist(playlist_id, user_id, update_data)
        if not playlist:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Playlist {playlist_id} not found")

        return self.get_playlist_details(user_id, playlist_id)

    def generate_banner_upload_url(self, user_id: int, playlist_id: int) -> PlaylistBannerUploadUrlResponse:
        """
        Generates write-only Bunny Storage URL to overwrite/update deterministic banner asset (playlist_{id}.jpg).
        """
        playlist, _, _ = self.repo.get_playlist_by_id(playlist_id, user_id)
        if not playlist:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Playlist {playlist_id} not found")

        settings = get_settings()
        pull_zone = (settings.BUNNY_PULL_ZONE_URL or "https://your-pull-zone.b-cdn.net").rstrip("/")
        storage_zone = settings.BUNNY_STORAGE_ZONE_NAME or "YOUR_STORAGE_ZONE"

        thumbnail_url = f"{pull_zone}/assets/playlists/playlist_{playlist_id}.jpg"
        image_upload_url = f"https://storage.bunnycdn.com/{storage_zone}/assets/playlists/playlist_{playlist_id}.jpg"

        return PlaylistBannerUploadUrlResponse(
            thumbnail_url=thumbnail_url,
            image_upload_url=image_upload_url
        )

    def delete_playlist(self, user_id: int, playlist_id: int) -> dict:
        """
        Deletes playlist record and associated junction links from DB via PlaylistRepository.
        """
        success = self.repo.delete_playlist(playlist_id, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Playlist {playlist_id} not found")
        return {"status": "success", "message": f"Playlist {playlist_id} deleted successfully."}

    def get_available_videos(self, user_id: int, playlist_id: int, page: int = 1, limit: int = 20) -> PaginatedResponse[PlaylistItemVideoResponse]:
        """
        Fetches a paginated list of creator videos available to be added to the playlist.
        """
        videos, total = self.repo.get_available_videos_for_playlist(playlist_id, user_id, page, limit)
        video_dtos = [self._to_video_dto(v) for v in videos]
        total_pages = math.ceil(total / limit) if total > 0 else 1

        return PaginatedResponse(
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            items=video_dtos
        )

