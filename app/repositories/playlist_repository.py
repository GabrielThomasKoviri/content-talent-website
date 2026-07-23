from typing import List, Tuple, Optional
from app.models.playlist import Playlist, PlaylistVideo
from app.models.video import Video

class PlaylistRepository:
    """
    Data access layer for performing CRUD operations on Playlist Peewee entities.
    """

    def create_playlist(self, playlist_data: dict, user_id: int) -> Playlist:
        """
        Commits a new Playlist record into DB and attaches initial video IDs in junction table.
        """
        data = dict(playlist_data)
        video_ids = data.pop("video_ids", []) or []
        playlist = Playlist.create(user=user_id, **data)

        for order, vid_id in enumerate(video_ids):
            if Video.select().where((Video.id == vid_id) & (Video.user == user_id)).exists():
                PlaylistVideo.create(playlist=playlist, video=vid_id, order=order)

        return playlist

    def get_playlist_by_id(self, playlist_id: int, user_id: int, page: int = 1, limit: int = 20) -> Tuple[Optional[Playlist], List[Video], int]:
        """
        Retrieves a playlist by ID ensuring ownership check along with paginated attached videos and total count.
        """
        playlist = Playlist.get_or_none((Playlist.id == playlist_id) & (Playlist.user == user_id))
        if not playlist:
            return None, [], 0

        query = (Video.select()
                 .join(PlaylistVideo)
                 .where(PlaylistVideo.playlist == playlist)
                 .order_by(PlaylistVideo.order.asc()))
        total = query.count()
        videos = list(query.paginate(page, limit))
        return playlist, videos, total

    def get_all_playlists_by_user(self, user_id: int, page: int = 1, limit: int = 20) -> Tuple[List[Tuple[Playlist, int]], int]:
        """
        Fetches a paginated list of playlists created by user_id along with total count using Peewee paginate().
        """
        query = Playlist.select().where(Playlist.user == user_id).order_by(Playlist.created_at.desc())
        total = query.count()
        playlists = list(query.paginate(page, limit))

        results = []
        for p in playlists:
            v_count = PlaylistVideo.select().where(PlaylistVideo.playlist == p).count()
            results.append((p, v_count))

        return results, total

    def update_playlist(self, playlist_id: int, user_id: int, update_data: dict) -> Optional[Playlist]:
        """
        Updates playlist textual metadata (name, description) and replaces attached video associations.
        """
        data = dict(update_data)
        video_ids = data.pop("video_ids", None)

        playlist = Playlist.get_or_none((Playlist.id == playlist_id) & (Playlist.user == user_id))
        if not playlist:
            return None

        for k, v in data.items():
            if v is not None:
                setattr(playlist, k, v)
        playlist.save()

        if video_ids is not None:
            PlaylistVideo.delete().where(PlaylistVideo.playlist == playlist).execute()
            for order, vid_id in enumerate(video_ids):
                if Video.select().where((Video.id == vid_id) & (Video.user == user_id)).exists():
                    PlaylistVideo.create(playlist=playlist, video=vid_id, order=order)

        return playlist

    def delete_playlist(self, playlist_id: int, user_id: int) -> bool:
        """
        Deletes a playlist record from DB and clears junction table links.
        """
        playlist = Playlist.get_or_none((Playlist.id == playlist_id) & (Playlist.user == user_id))
        if not playlist:
            return False
        playlist.delete_instance(recursive=True)
        return True

    def get_available_videos_for_playlist(self, playlist_id: int, user_id: int, page: int = 1, limit: int = 20) -> Tuple[List[Video], int]:
        """
        Executes Peewee query returning paginated list of creator videos NOT attached to the specified playlist.
        """
        attached_subquery = PlaylistVideo.select(PlaylistVideo.video_id).where(PlaylistVideo.playlist_id == playlist_id)
        query = Video.select().where((Video.user == user_id) & (Video.id.not_in(attached_subquery))).order_by(Video.created_at.desc())
        total = query.count()
        videos = list(query.paginate(page, limit))
        return videos, total

