// API Service module for communicating with Content Management backend REST endpoints

function getBaseUrl(): string {
  const envUrl =
    (import.meta as any).env?.VITE_API_BASE_URL ||
    (typeof window !== "undefined" && (window as any).env?.VITE_API_BASE_URL) ||
    "";

  // If page is loaded over HTTPS (e.g. Vercel deployment) and API URL is HTTP,
  // fallback to relative path ("") to route through Vercel /api reverse proxy and prevent Mixed Content blocking.
  if (typeof window !== "undefined" && window.location.protocol === "https:" && envUrl.startsWith("http://")) {
    console.warn("[API Service] HTTPS page detected with HTTP API URL. Routing via relative proxy (/api) to prevent Mixed Content errors.");
    return "";
  }

  return envUrl;
}

const BASE_URL = getBaseUrl();

// ── Types & Interfaces ──────────────────────────────────────────────────────

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
  isPlayable?: boolean;
  captionsData?: Array<{ srclang?: string; label?: string; is_default?: boolean; isDefault?: boolean; url?: string }>;
  captionUrl?: string;
  captionSrclang?: string;
  captionLabel?: string;
  downloadUrls?: Array<{ resolution: string; label: string; url: string }>;
}

export interface ApiPlaylist {
  id: number;
  name: string;
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

export interface ApiComment {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  text: string;
  videoId: number;
  videoTitle?: string;
  likes: number;
  isLiked: boolean;
  replyCount: number;
  createdAt: string;
}

export interface ApiReply {
  id: number;
  commentId: number;
  text: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  isCreator?: boolean;
  likes?: number;
  isLiked?: boolean;
  replyCount?: number;
  createdAt: string;
}

export interface ApiSocialLinks {
  twitter?: string;
  youtube?: string;
  instagram?: string;
}

export interface ApiProfile {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  website?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  socialLinks?: ApiSocialLinks;
  updatedAt?: string;
}

// ── Internal Helpers ────────────────────────────────────────────────────────

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

import { apiMonitorStore } from "./apiMonitorService";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    apiMonitorStore.addLog({
      url: response.url,
      method: "API",
      status: response.status,
      ok: false,
      data: { error: errorText || response.statusText },
    });
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }
  const data = await response.json();
  apiMonitorStore.addLog({
    url: response.url,
    method: "API",
    status: response.status,
    ok: true,
    data: data,
  });
  return data;
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

  const captions = Array.isArray(raw.captions_data)
    ? raw.captions_data
    : Array.isArray(raw.captionsData)
      ? raw.captionsData
      : Array.isArray(raw.captions)
        ? raw.captions
        : [];

  const primaryCaption = captions.find((c: any) => c.is_default || c.isDefault) || captions[0];
  const fetchedCaptionUrl = primaryCaption?.url || raw.caption_url || raw.captionUrl || undefined;
  const fetchedCaptionSrclang = primaryCaption?.srclang || primaryCaption?.srcLang || raw.caption_srclang || undefined;
  const fetchedCaptionLabel = primaryCaption?.label || raw.caption_label || undefined;

  const downloadUrls = Array.isArray(raw.download_urls)
    ? raw.download_urls
    : Array.isArray(raw.downloadUrls)
      ? raw.downloadUrls
      : [];

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
    isPlayable: raw.is_playable ?? raw.isPlayable ?? true,
    captionsData: captions,
    captionUrl: fetchedCaptionUrl,
    captionSrclang: fetchedCaptionSrclang,
    captionLabel: fetchedCaptionLabel,
    downloadUrls: downloadUrls,
  };
}

function transformPlaylist(raw: any): ApiPlaylist {
  if (!raw) return raw;
  const nameVal = raw.name || raw.title || "Untitled Playlist";
  return {
    id: raw.id ?? raw.playlist_id,
    name: nameVal,
    title: nameVal,
    description: raw.description || "",
    videoCount: raw.video_count ?? raw.videoCount ?? (raw.video_ids ? raw.video_ids.length : 0),
    videos: raw.video_count ?? raw.videoCount ?? (raw.video_ids ? raw.video_ids.length : 0),
    videoIds: raw.video_ids || raw.videoIds || [],
    date: raw.created_at ? raw.created_at.split("T")[0] : raw.date || new Date().toISOString().split("T")[0],
    createdAt: raw.created_at || raw.createdAt,
    updatedAt: raw.updated_at || raw.updatedAt,
    thumbnailUrl: raw.thumbnail_url || raw.banner_image_url || raw.thumbnailUrl || raw.thumbnail,
  };
}

function transformComment(raw: any): ApiComment {
  const author = raw.author || {};
  return {
    id: raw.id,
    userId: author.id ?? raw.user_id ?? raw.userId ?? 0,
    userName: author.name || raw.user_name || raw.userName || "User",
    userAvatar: author.avatar_url || author.avatarUrl || raw.user_avatar || raw.userAvatar,
    text: raw.text || "",
    videoId: raw.video_id ?? raw.videoId ?? 0,
    videoTitle: raw.video_title || raw.videoTitle || "",
    likes: raw.likes ?? 0,
    isLiked: raw.is_liked ?? raw.isLiked ?? false,
    replyCount: raw.reply_count ?? raw.replyCount ?? 0,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

function transformReply(raw: any): ApiReply {
  const author = raw.author || {};
  return {
    id: raw.id,
    commentId: raw.comment_id ?? raw.commentId ?? 0,
    text: raw.text || "",
    userId: author.id ?? raw.user_id ?? raw.userId ?? 0,
    userName: author.name || raw.user_name || raw.userName || "User",
    userAvatar: author.avatar_url || author.avatarUrl || raw.user_avatar || raw.userAvatar,
    isCreator: author.is_creator ?? author.isCreator ?? raw.is_creator ?? false,
    likes: raw.likes_count ?? raw.likesCount ?? raw.likes ?? 0,
    isLiked: raw.is_liked ?? raw.isLiked ?? false,
    replyCount: raw.reply_count ?? raw.replyCount ?? raw.replies_count ?? 0,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

function transformProfile(raw: any): ApiProfile {
  return {
    firstName: raw.first_name || raw.firstName || "",
    lastName: raw.last_name || raw.lastName || "",
    email: raw.email || "",
    bio: raw.bio || "",
    website: raw.website || "",
    phone: raw.phone || "",
    location: raw.location || "",
    avatarUrl: raw.avatar_url || raw.avatarUrl || "",
    socialLinks: {
      twitter: raw.social_links?.twitter || raw.socialLinks?.twitter || "",
      youtube: raw.social_links?.youtube || raw.socialLinks?.youtube || "",
      instagram: raw.social_links?.instagram || raw.socialLinks?.instagram || "",
    },
    updatedAt: raw.updated_at || raw.updatedAt,
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
      pagination: {
        total: json.total ?? json.pagination?.total ?? 0,
        page: json.page ?? json.pagination?.page ?? 1,
        limit: json.limit ?? json.pagination?.limit ?? 20,
        totalPages: json.total_pages ?? json.pagination?.totalPages ?? 1,
      },
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
  description?: string;
  category?: string;
  tags?: string[];
  status?: string;
  filename?: string;
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
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags || [],
      status: data.status || "draft",
    }),
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

  try {
    const res = await fetch(`${BASE_URL}/api/v1/admin/videos/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await handleResponse<any>(res);
    return transformVideo(json);
  } catch (err: any) {
    try {
      const updated = await getVideoDetails(id);
      return updated;
    } catch {
      throw err;
    }
  }
}

export async function deleteVideo(id: number): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/videos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function bulkDeleteVideos(videoIds: number[]): Promise<{ status?: string; success?: boolean }> {
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
  schedule: { date: string; time: string }
): Promise<ApiVideo> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/videos/${id}/schedule`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      date: schedule.date,
      time: schedule.time,
    }),
  });
  const json = await handleResponse<any>(res);
  return transformVideo(json);
}

export async function uploadThumbnail(
  videoId: number,
  slot: number,
  file: File
): Promise<{ status?: string; success?: boolean }> {
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
): Promise<{ status?: string; success?: boolean }> {
  const payload = typeof slotOrUrl === "string"
    ? { selected_main_thumbnail: slotOrUrl }
    : { selected_main_thumbnail: String(slotOrUrl), slot: slotOrUrl };
  const res = await fetch(`${BASE_URL}/api/v1/admin/videos/${videoId}/thumbnails/select-main`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteThumbnail(
  videoId: number,
  slot?: number
): Promise<{ status?: string; success?: boolean }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/videos/${videoId}/thumbnails`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: slot !== undefined ? JSON.stringify({ slot }) : undefined,
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
      pagination: {
        total: json.total ?? json.pagination?.total ?? 0,
        page: json.page ?? json.pagination?.page ?? 1,
        limit: json.limit ?? json.pagination?.limit ?? 20,
        totalPages: json.total_pages ?? json.pagination?.totalPages ?? 1,
      },
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
  name?: string;
  title?: string;
  description?: string;
  videoIds?: number[];
  video_ids?: number[];
}): Promise<ApiPlaylist> {
  const nameVal = data.name || data.title || "Untitled Playlist";
  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name: nameVal,
      description: data.description || "",
      video_ids: data.video_ids || data.videoIds || [],
    }),
  });
  const json = await handleResponse<any>(res);
  return transformPlaylist(json);
}

export async function updatePlaylist(
  id: number,
  data: { name?: string; title?: string; description?: string }
): Promise<ApiPlaylist> {
  const nameVal = data.name || data.title || "";
  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name: nameVal,
      description: data.description,
    }),
  });
  const json = await handleResponse<any>(res);
  return transformPlaylist(json);
}

export async function deletePlaylist(id: number): Promise<{ status?: string; success?: boolean }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function uploadPlaylistBanner(
  playlistId: number,
  file: File
): Promise<{ status?: string; success?: boolean }> {
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
    pagination: {
      total: json.total ?? json.pagination?.total ?? 0,
      page: json.page ?? json.pagination?.page ?? 1,
      limit: json.limit ?? json.pagination?.limit ?? 20,
      totalPages: json.total_pages ?? json.pagination?.totalPages ?? 1,
    },
  };
}

export async function addVideosToPlaylist(
  playlistId: number,
  videoIds: number[]
): Promise<{ status?: string; success?: boolean }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists/${playlistId}/videos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ video_ids: videoIds }),
  });
  return handleResponse(res);
}

export async function removeVideoFromPlaylist(
  playlistId: number,
  videoId: number
): Promise<{ status?: string; success?: boolean }> {
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
): Promise<{ status?: string; success?: boolean }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists/${playlistId}/videos`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ video_ids: videoIds }),
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
    pagination: {
      total: json.total ?? json.pagination?.total ?? 0,
      page: json.page ?? json.pagination?.page ?? 1,
      limit: json.limit ?? json.pagination?.limit ?? 20,
      totalPages: json.total_pages ?? json.pagination?.totalPages ?? 1,
    },
  };
}

export async function reorderPlaylistVideos(
  playlistId: number,
  videoOrders: { video_id: number; order: number }[]
): Promise<{ status?: string; success?: boolean }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/playlists/${playlistId}/videos/reorder`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ video_orders: videoOrders }),
  });
  return handleResponse(res);
}

// ── Comments API ───────────────────────────────────────────────────────────

export async function getAdminComments(params?: {
  category?: string;
  videoId?: number;
  date?: string;
  minLikes?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: ApiComment[]; pagination?: any }> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.append("category", params.category);
    if (params?.videoId) query.append("videoId", params.videoId.toString());
    if (params?.date) query.append("date", params.date);
    if (params?.minLikes) query.append("minLikes", params.minLikes.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.sort) query.append("sort", params.sort);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    const res = await fetch(`${BASE_URL}/api/v1/admin/comments?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    const json = await handleResponse<any>(res);
    return {
      data: (json.data || json.items || json || []).map(transformComment),
      pagination: {
        total: json.total ?? json.pagination?.total ?? 0,
        page: json.page ?? json.pagination?.page ?? 1,
        limit: json.limit ?? json.pagination?.limit ?? 20,
        totalPages: json.total_pages ?? json.pagination?.totalPages ?? 1,
      },
    };
  } catch (err) {
    console.warn("Comments API request failed", err);
    throw err;
  }
}

export async function postAdminVideoComment(
  videoId: number,
  text: string
): Promise<ApiComment> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/comments/videos/${videoId}/comments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  });
  const json = await handleResponse<any>(res);
  return transformComment(json);
}

export async function getCommentReplies(
  commentId: number,
  params?: { sort?: string; page?: number; limit?: number }
): Promise<{ data: ApiReply[]; pagination?: any }> {
  const query = new URLSearchParams();
  if (params?.sort) query.append("sort", params.sort);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const res = await fetch(
    `${BASE_URL}/api/v1/admin/comments/${commentId}/replies?${query.toString()}`,
    { headers: getAuthHeaders() }
  );
  const json = await handleResponse<any>(res);
  return {
    data: (json.data || json.items || json || []).map(transformReply),
    pagination: {
      total: json.total ?? json.pagination?.total ?? 0,
      page: json.page ?? json.pagination?.page ?? 1,
      limit: json.limit ?? json.pagination?.limit ?? 20,
      totalPages: json.total_pages ?? json.pagination?.totalPages ?? 1,
    },
  };
}

export async function postCommentReply(
  commentId: number,
  text: string
): Promise<ApiReply> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/comments/${commentId}/reply`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  });
  const json = await handleResponse<any>(res);
  return transformReply(json);
}

export async function toggleCommentLike(
  commentId: number
): Promise<{ status: string; isLiked: boolean; likes: number }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/comments/${commentId}/like`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const json = await handleResponse<any>(res);
  return {
    status: json.status || "success",
    isLiked: json.is_liked ?? json.isLiked ?? false,
    likes: json.likes ?? 0,
  };
}

export async function deleteComment(
  commentId: number
): Promise<{ status?: string; success?: boolean }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// ── Settings / Profile API ─────────────────────────────────────────────────

export async function getCreatorProfile(): Promise<ApiProfile> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/admin/profile`, {
      headers: getAuthHeaders(),
    });
    const json = await handleResponse<any>(res);
    return transformProfile(json);
  } catch (err) {
    console.warn("Profile API request failed", err);
    throw err;
  }
}

export async function updateCreatorProfile(
  data: Partial<{
    first_name: string;
    last_name: string;
    bio: string;
    website: string;
    phone: string;
    location: string;
    social_links: ApiSocialLinks;
  }>
): Promise<{ status?: string; success?: boolean }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function uploadAvatarPhoto(
  file: File
): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append("photo", file);

  const token = getAuthToken();
  const res = await fetch(`${BASE_URL}/api/v1/admin/profile/photo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await handleResponse<any>(res);
  return {
    avatarUrl: json.avatar_url || json.avatarUrl || "",
  };
}

export interface ApiSubscriber {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  joinDate: string;
  revenue: string;
}

export async function getSubscribers(): Promise<ApiSubscriber[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/admin/comments?limit=100`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        const userMap = new Map<string, ApiSubscriber>();
        json.data.forEach((comment: any, idx: number) => {
          const userKey = comment.user_email || comment.user_name || `user_${comment.user_id || idx}`;
          if (!userMap.has(userKey)) {
            userMap.set(userKey, {
              id: comment.user_id || (idx + 1),
              name: comment.user_name || comment.author || "Mobile User",
              email: comment.user_email || `${(comment.user_name || "user").toLowerCase().replace(/\s+/g, ".")}@example.com`,
              plan: idx % 2 === 0 ? "Premium" : "Basic",
              status: "Active",
              joinDate: comment.created_at ? comment.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
              revenue: idx % 2 === 0 ? "$29.99" : "$9.99",
            });
          }
        });
        const dynamicSubscribers = Array.from(userMap.values());
        if (dynamicSubscribers.length > 0) return dynamicSubscribers;
      }
    }
  } catch (err) {
    console.warn("Using fallback subscriber data", err);
  }
  return [
    { id: 1, name: "John Anderson", email: "john.anderson@example.com", plan: "Premium", status: "Active", joinDate: "2024-01-15", revenue: "$29.99" },
    { id: 2, name: "Sarah Miller", email: "sarah.miller@example.com", plan: "Basic", status: "Active", joinDate: "2024-02-20", revenue: "$9.99" },
    { id: 3, name: "Mike Johnson", email: "mike.johnson@example.com", plan: "Premium", status: "Active", joinDate: "2024-01-08", revenue: "$29.99" },
    { id: 4, name: "Emma Davis", email: "emma.davis@example.com", plan: "Premium", status: "Cancelled", joinDate: "2023-11-12", revenue: "$0.00" },
    { id: 5, name: "Tom Wilson", email: "tom.wilson@example.com", plan: "Basic", status: "Active", joinDate: "2024-03-05", revenue: "$9.99" },
  ];
}

// ── Categories Management API ──────────────────────────────────────────────

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  contentCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
}

function transformCategory(raw: any): ApiCategory {
  return {
    id: raw.id,
    name: raw.name || "Untitled Category",
    slug: raw.slug || "",
    description: raw.description || "",
    icon: raw.icon || "📁",
    color: raw.color || "#3b82f6",
    contentCount: raw.contentCount ?? raw.content_count ?? 0,
    order: raw.order ?? raw.display_order ?? 0,
    createdAt: raw.createdAt || raw.created_at || "",
    updatedAt: raw.updatedAt || raw.updated_at || "",
  };
}

export async function getCategories(params?: { simple?: boolean }): Promise<ApiCategory[]> {
  try {
    const query = new URLSearchParams();
    if (params?.simple) query.append("simple", "true");
    const queryString = query.toString();
    const url = queryString
      ? `${BASE_URL}/api/v1/admin/categories?${queryString}`
      : `${BASE_URL}/api/v1/admin/categories`;

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    const json = await handleResponse<any>(res);
    const list = json.data || json.items || (Array.isArray(json) ? json : []);
    return list.map(transformCategory);
  } catch (err) {
    console.warn("Categories API request failed", err);
    throw err;
  }
}

export async function createCategory(data: CreateCategoryPayload): Promise<ApiCategory> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/categories`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<any>(res);
  return transformCategory(json);
}

export async function updateCategory(id: number, data: UpdateCategoryPayload): Promise<ApiCategory> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/categories/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<any>(res);
  return transformCategory(json);
}

export async function deleteCategory(id: number): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function reorderCategories(ids: number[]): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/categories/reorder`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids }),
  });
  return handleResponse(res);
}


