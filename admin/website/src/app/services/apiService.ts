// API Service module for communicating with Content Management backend REST endpoints

const BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && (window as any).env?.VITE_API_BASE_URL) ||
  "";

export interface ApiVideo {
  id: number;
  title: string;
  description?: string;
  category?: string;
  status: string;
  views?: number | string;
  duration?: string;
  date?: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt?: string;
  premium?: boolean;
  tags?: string[];
  thumbnailUrl?: string;
  mainThumbnailUrl?: string;
  altThumbnail1Url?: string;
  altThumbnail2Url?: string;
  altThumbnailUrls?: string[];
  bunnyVideoId?: string;
  playbackUrl?: string;
  videoUrl?: string;
  encodeProgress?: number;
}

export interface ApiPlaylist {
  id: number;
  title: string;
  description?: string;
  videoCount?: number;
  videoIds?: number[];
  videos?: number;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  thumbnailUrl?: string;
}

function getAuthToken(): string {
  return (
    localStorage.getItem("access_token") ||
    (import.meta as any).env?.VITE_API_TOKEN ||
    (typeof window !== "undefined" && (window as any).env?.VITE_API_TOKEN) ||
    ""
  );
}

function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }
  return response.json();
}

function transformVideo(raw: any): ApiVideo {
  if (!raw) return raw;
  const bunnyId = raw.bunny_video_id || raw.bunnyVideoId;
  const directPlayback = raw.playback_url || raw.playbackUrl || raw.video_url || raw.videoUrl || raw.url;

  const altUrls = Array.isArray(raw.alt_thumbnail_urls)
    ? raw.alt_thumbnail_urls
    : Array.isArray(raw.altThumbnailUrls)
    ? raw.altThumbnailUrls
    : [raw.alt_thumbnail_1_url, raw.alt_thumbnail_2_url].filter(Boolean);

  return {
    id: raw.id ?? raw.video_id,
    title: raw.title || "Untitled Video",
    description: raw.description || "",
    category: raw.category || "Uncategorized",
    status: raw.status ? String(raw.status) : "draft",
    views: raw.views_count ?? raw.views ?? 0,
    duration: raw.duration || "0:00",
    date: raw.created_at ? raw.created_at.split("T")[0] : raw.date || new Date().toISOString().split("T")[0],
    publishedAt: raw.published_at || raw.publishedAt,
    scheduledAt: raw.scheduled_at || raw.scheduledAt,
    createdAt: raw.created_at || raw.createdAt,
    premium: raw.is_premium ?? raw.premium ?? false,
    tags: Array.isArray(raw.tags) ? raw.tags : typeof raw.tags === "string" ? JSON.parse(raw.tags) : [],
    thumbnailUrl: raw.main_thumbnail_url || raw.thumbnailUrl || raw.thumbnail,
    mainThumbnailUrl: raw.main_thumbnail_url || raw.mainThumbnailUrl,
    altThumbnail1Url: altUrls[0] || raw.alt_thumbnail_1_url || raw.altThumbnail1Url,
    altThumbnail2Url: altUrls[1] || raw.alt_thumbnail_2_url || raw.altThumbnail2Url,
    altThumbnailUrls: altUrls,
    bunnyVideoId: bunnyId,
    playbackUrl: directPlayback,
    videoUrl: directPlayback,
    encodeProgress: raw.encode_progress ?? raw.encodeProgress ?? (raw.encode_progress === 0 ? 0 : raw.is_playable === false ? 65 : undefined),
  };
}

function transformPlaylist(raw: any): ApiPlaylist {
  if (!raw) return raw;
  return {
    id: raw.id ?? raw.playlist_id,
    title: raw.title || "Untitled Playlist",
    description: raw.description || "",
    videoCount: raw.video_count ?? raw.videoCount ?? (raw.video_ids ? raw.video_ids.length : 0),
    videos: raw.video_count ?? raw.videoCount ?? (raw.video_ids ? raw.video_ids.length : 0),
    videoIds: raw.video_ids || raw.videoIds || [],
    date: raw.created_at ? raw.created_at.split("T")[0] : raw.date || new Date().toISOString().split("T")[0],
    createdAt: raw.created_at || raw.createdAt,
    updatedAt: raw.updated_at || raw.updatedAt,
    thumbnailUrl: raw.banner_image_url || raw.thumbnailUrl || raw.thumbnail,
  };
}

// ── Videos API ─────────────────────────────────────────────────────────────

export async function getVideos(params?: {
  status?: string;
  category?: string;
  search?: string;
  sort?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: ApiVideo[]; pagination?: any }> {
  try {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.category) query.append("category", params.category);
    if (params?.search) query.append("search", params.search);
    if (params?.sort) query.append("sort", params.sort);
    if (params?.dateFrom) query.append("dateFrom", params.dateFrom);
    if (params?.dateTo) query.append("dateTo", params.dateTo);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    const res = await fetch(`${BASE_URL}/api/v1/admin/videos?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    const json = await handleResponse<any>(res);
    return {
      data: (json.data || json.items || json || []).map(transformVideo),
      pagination: json.pagination || { total: json.total || 0, page: json.page || 1, limit: json.limit || 20 },
    };
  } catch (err) {
    console.warn("Video API request failed", err);
    throw err;
  }
}

export async function getVideoDetails(id: number): Promise<ApiVideo> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/videos/${id}`, {
    headers: getAuthHeaders(),
  });
  const json = await handleResponse<any>(res);
  return transformVideo(json);
}

export async function initiateVideoUpload(data: {
  title: string;
  filename: string;
  category?: string;
  description?: string;
  tags?: string[];
  status?: string;
}): Promise<{
  id: number;
  bunnyVideoId?: string;
  bunnyLibraryId?: string;
  uploadUrl?: string;
  signature?: string;
  expirationTime?: number;
  status?: string;
  encodeProgress?: number;
}> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/videos/initiate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<any>(res);
  return {
    id: json.id || json.video_id,
    bunnyVideoId: json.bunny_video_id || json.bunnyVideoId,
    bunnyLibraryId: json.bunny_library_id || json.bunnyLibraryId,
    uploadUrl: json.upload_url || json.uploadUrl,
    signature: json.signature,
    expirationTime: json.expiration_time || json.expirationTime,
    status: json.status,
    encodeProgress: json.encode_progress ?? json.encodeProgress ?? 0,
  };
}

export async function updateVideo(
  id: number,
  data: Partial<ApiVideo>
): Promise<ApiVideo> {
  const payload: any = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.category !== undefined) payload.category = data.category;
  if (data.tags !== undefined) payload.tags = data.tags;
  if (data.premium !== undefined) payload.is_premium = data.premium;

  const res = await fetch(`${BASE_URL}/api/v1/admin/videos/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<any>(res);
  return transformVideo(json);
}

export async function deleteVideo(id: number): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/videos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function bulkDeleteVideos(videoIds: number[]): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/videos/bulk-delete`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ video_ids: videoIds }),
  });
  return handleResponse(res);
}

export async function publishVideo(id: number): Promise<ApiVideo> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/videos/${id}/publish`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const json = await handleResponse<any>(res);
  return transformVideo(json);
}

export async function scheduleVideo(
  id: number,
  schedule: { date: string; time: string; timezone?: string }
): Promise<ApiVideo> {
  const userTimezone = schedule.timezone || (typeof Intl !== "undefined" && Intl.DateTimeFormat().resolvedOptions().timeZone) || "UTC";
  const res = await fetch(`${BASE_URL}/api/v1/admin/videos/${id}/schedule`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      date: schedule.date,
      time: schedule.time,
      timezone: userTimezone,
    }),
  });
  const json = await handleResponse<any>(res);
  return transformVideo(json);
}

export async function uploadThumbnail(
  videoId: number,
  slot: number,
  file: File
): Promise<{ success: boolean; message?: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAuthToken();
  const res = await fetch(`${BASE_URL}/api/v1/admin/videos/${videoId}/thumbnails/upload?slot=${slot}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
}

export async function selectMainThumbnail(
  videoId: number,
  slotOrUrl: number | string
): Promise<{ success: boolean }> {
  const payload = typeof slotOrUrl === "string"
    ? { selected_main_thumbnail: slotOrUrl, slot: 0 }
    : { slot: slotOrUrl };
  const res = await fetch(`${BASE_URL}/api/v1/admin/videos/${videoId}/thumbnails/select-main`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteThumbnail(
  videoId: number,
  slot: number
): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/videos/${videoId}/thumbnails`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ slot }),
  });
  return handleResponse(res);
}

// ── Playlists API ──────────────────────────────────────────────────────────

export async function getPlaylists(params?: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: ApiPlaylist[]; pagination?: any }> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.sort) query.append("sort", params.sort);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    const res = await fetch(`${BASE_URL}/api/v1/admin/playlists?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    const json = await handleResponse<any>(res);
    return {
      data: (json.data || json.items || json || []).map(transformPlaylist),
      pagination: json.pagination || { total: json.total || 0, page: json.page || 1, limit: json.limit || 20 },
    };
  } catch (err) {
    console.warn("Playlist API request failed", err);
    throw err;
  }
}

export async function getPlaylistDetails(id: number): Promise<ApiPlaylist> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists/${id}`, {
    headers: getAuthHeaders(),
  });
  const json = await handleResponse<any>(res);
  return transformPlaylist(json);
}

export async function createPlaylist(data: {
  title: string;
  description?: string;
  videoIds?: number[];
}): Promise<ApiPlaylist> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name: data.title,
      title: data.title,
      description: data.description,
      video_ids: data.videoIds || [],
    }),
  });
  const json = await handleResponse<any>(res);
  return transformPlaylist(json);
}

export async function updatePlaylist(
  id: number,
  data: { title?: string; description?: string }
): Promise<ApiPlaylist> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name: data.title,
      title: data.title,
      description: data.description,
    }),
  });
  const json = await handleResponse<any>(res);
  return transformPlaylist(json);
}

export async function deletePlaylist(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function uploadPlaylistBanner(
  playlistId: number,
  file: File
): Promise<{ success: boolean }> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAuthToken();
  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists/${playlistId}/thumbnail/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
}

export async function getPlaylistVideos(
  playlistId: number,
  params?: { search?: string; page?: number; limit?: number }
): Promise<{ data: ApiVideo[]; pagination?: any }> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists/${playlistId}/videos?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  const json = await handleResponse<any>(res);
  return {
    data: (json.data || json.items || json || []).map(transformVideo),
    pagination: json.pagination,
  };
}

export async function addVideosToPlaylist(
  playlistId: number,
  videoIds: number[]
): Promise<{ success: boolean; videoCount?: number }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists/${playlistId}/videos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ video_ids: videoIds, videoIds }),
  });
  return handleResponse(res);
}

export async function removeVideoFromPlaylist(
  playlistId: number,
  videoId: number
): Promise<{ success: boolean; videoCount?: number }> {
  const res = await fetch(
    `${BASE_URL}/api/v1/admin/playlists/${playlistId}/videos/${videoId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(res);
}

export async function bulkRemoveVideosFromPlaylist(
  playlistId: number,
  videoIds: number[]
): Promise<{ success: boolean; videoCount?: number }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists/${playlistId}/videos`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ video_ids: videoIds, videoIds }),
  });
  return handleResponse(res);
}

export async function reorderPlaylistVideos(
  playlistId: number,
  videoIds: number[]
): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists/${playlistId}/videos/reorder`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ video_ids: videoIds, videoIds }),
  });
  return handleResponse(res);
}

export async function getAvailableVideosForPlaylist(
  playlistId: number,
  params?: { search?: string; category?: string; sort?: string; page?: number; limit?: number }
): Promise<{ data: ApiVideo[]; pagination?: any }> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.category) query.append("category", params.category);
  if (params?.sort) query.append("sort", params.sort);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const res = await fetch(
    `${BASE_URL}/api/v1/admin/playlists/${playlistId}/available_videos?${query.toString()}`,
    { headers: getAuthHeaders() }
  );
  const json = await handleResponse<any>(res);
  return {
    data: (json.data || json.items || json || []).map(transformVideo),
    pagination: json.pagination,
  };
}
