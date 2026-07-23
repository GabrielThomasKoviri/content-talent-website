from app.models.video import Video

class VideoRepository:
    """
    Data access layer for performing CRUD operations on Video Peewee entities.
    """

    def create_video(self, video_data: dict, user_id: int) -> Video:
        """
        Commits a new Video record into the database with initial status 'PENDING' linked to user_id.
        """
        return Video.create(user=user_id, **video_data)

    def get_video_by_id(self, video_id: int, user_id: int) -> Optional[Video]:
        """
        Fetches a video record by integer primary key ID ensuring ownership authorization (user_id).
        """
        return Video.get_or_none((Video.id == video_id) & (Video.user == user_id))

    def get_video_by_bunny_id(self, bunny_video_id: str) -> Optional[Video]:
        """
        Fetches a video record by string Bunny GUID (bunny_video_id) for webhook event processing.
        """
        return Video.get_or_none(Video.bunny_video_id == bunny_video_id)

    def get_all_videos_by_user(self, user_id: int, page: int = 1, limit: int = 20) -> Tuple[List[Video], int]:
        """
        Fetches a paginated list of video records and total count owned by the creator using Peewee paginate().
        """
        query = Video.select().where(Video.user == user_id).order_by(Video.created_at.desc())
        total = query.count()
        items = list(query.paginate(page, limit))
        return items, total

    def update_video_metadata(self, video_id: int, user_id: int, update_data: dict) -> Optional[Video]:
        """
        Updates textual fields (title, description, category, tags) of a video asset in DB.
        """
        video = self.get_video_by_id(video_id, user_id)
        if not video:
            return None
        for k, v in update_data.items():
            if v is not None:
                setattr(video, k, v)
        video.save()
        return video

    def update_video_status(self, bunny_video_id: str, status: str, encode_progress: int, is_playable: bool, caption_url: Optional[str] = None) -> Optional[Video]:
        """
        Updates state machine fields (status, encode_progress, is_playable) of a video record in DB.
        """
        video = self.get_video_by_bunny_id(bunny_video_id)
        if not video:
            return None
        video.status = status
        video.encode_progress = encode_progress
        video.is_playable = is_playable
        if caption_url:
            video.caption_url = caption_url
        video.save()
        return video

    def swap_main_thumbnail(self, video_id: int, user_id: int, new_main_url: str) -> Optional[Video]:
        """
        Updates main_thumbnail_url and pushes the previous main URL into alt_thumbnail_urls list.
        """
        video = self.get_video_by_id(video_id, user_id)
        if not video:
            return None
        old_main = video.main_thumbnail_url
        video.main_thumbnail_url = new_main_url
        alts = list(video.alt_thumbnail_urls or [])
        if new_main_url in alts:
            alts.remove(new_main_url)
        if old_main and old_main not in alts:
            alts.append(old_main)
        video.alt_thumbnail_urls = alts
        video.save()
        return video

    def delete_alt_thumbnail_url(self, video_id: int, user_id: int, target_url: str) -> Optional[Video]:
        """
        Removes a target thumbnail URL entry from alt_thumbnail_urls array in DB.
        """
        video = self.get_video_by_id(video_id, user_id)
        if not video:
            return None
        alts = list(video.alt_thumbnail_urls or [])
        if target_url in alts:
            alts.remove(target_url)
            video.alt_thumbnail_urls = alts
            video.save()
        return video

    def delete_video(self, video_id: int, user_id: int) -> bool:
        """
        Deletes a video record from DB and cascades playlist association cleanup.
        """
        video = self.get_video_by_id(video_id, user_id)
        if not video:
            return False
        video.delete_instance(recursive=True)
        return True

