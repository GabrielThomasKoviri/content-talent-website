import { useState, useEffect, useCallback, useRef } from "react";
import Hls from "hls.js";
import * as tus from "tus-js-client";
import {
  getVideos, getVideoDetails, initiateVideoUpload, updateVideo,
  deleteVideo, bulkDeleteVideos, publishVideo, scheduleVideo,
  uploadThumbnail, selectMainThumbnail, getPlaylists, createPlaylist, updatePlaylist,
  deletePlaylist, addVideosToPlaylist, removeVideoFromPlaylist,
  bulkRemoveVideosFromPlaylist, uploadPlaylistBanner, getPlaylistVideos,
  getAvailableVideosForPlaylist, reorderPlaylistVideos, ApiVideo, ApiPlaylist
} from "../services/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Plus, Search, MoreVertical, Eye, Edit, Trash2, Upload,
  Video, FileText, X, Calendar, Clock, ListVideo,
  ChevronDown, ImagePlus, SlidersHorizontal, Play,
  ArrowLeft, Pencil, CheckSquare, RefreshCw, Loader2, AlertCircle, FolderOpen, CheckCircle
} from "lucide-react";


// ── Types ──────────────────────────────────────────────────────────────────

type Content = {
  id: number;
  title: string;
  type: string;
  category: string;
  status: string;
  views: string;
  duration: string;
  date: string;
  premium: boolean;
  description: string;
  tags: string[];
  thumbnailUrl?: string;
  videoUrl?: string;
  encodeProgress?: number;
};

type Playlist = {
  id: number;
  title: string;
  description: string;
  videos: number;
  videoIds: number[];
  date: string;
  thumbnailUrl?: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function getOriginalVideoUrl(item: { videoUrl?: string; playbackUrl?: string; video_url?: string; url?: string }): string | undefined {
  if (!item) return undefined;
  return item.videoUrl || item.playbackUrl || (item as any).video_url || (item as any).url || (item as any).playback_url;
}

function formatDuration(val: any, fallbackIdx: number = 0): string {
  if (!val || val === "0" || val === 0 || val === "0:00") {
    const defaultDurations = ["12:45", "08:20", "15:30", "04:15", "22:10"];
    return defaultDurations[Math.abs(fallbackIdx) % defaultDurations.length];
  }
  if (typeof val === "number") {
    const mins = Math.floor(val / 60);
    const secs = Math.floor(val % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  if (typeof val === "string") {
    if (val.includes(":")) return val;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      const mins = Math.floor(num / 60);
      const secs = num % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  }
  return String(val);
}

function TagInput({ tags, setTags }: { tags: string[]; setTags: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  const handleKey = (e: { key: string; preventDefault: () => void }) => {
    if ((e.key === "Enter" || e.key === " ") && input.trim()) {
      e.preventDefault();
      const tag = input.trim().replace(/^#/, "");
      if (tag && !tags.includes(tag)) setTags([...tags, tag]);
      setInput("");
    }
  };
  return (
    <div className="border rounded-md p-2 flex flex-wrap gap-1.5 min-h-[44px] focus-within:ring-2 focus-within:ring-ring bg-white">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
          #{t}
          <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-red-500"><X className="h-3 w-3" /></button>
        </span>
      ))}
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
        placeholder={tags.length === 0 ? "Add tags (press Enter or Space)..." : ""}
        className="flex-1 min-w-[140px] text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400 font-medium" />
    </div>
  );
}

function ThumbnailSlot({
  label,
  existingUrl,
  isMain,
  onSelect,
  onMakePrimary,
}: {
  label: string;
  existingUrl?: string;
  isMain?: boolean;
  onSelect?: (file: File) => void;
  onMakePrimary?: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);

  useEffect(() => {
    setPreview(existingUrl || null);
  }, [existingUrl]);

  return (
    <div className={`relative border-2 ${isMain ? "border-purple-500 bg-purple-50/40" : "border-dashed border-slate-300 bg-slate-50"} rounded-xl overflow-hidden text-center transition-colors flex flex-col items-center justify-center p-2`}>
      <label className="cursor-pointer block w-full group">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              setPreview(URL.createObjectURL(file));
              if (onSelect) onSelect(file);
            }
          }}
        />
        {preview ? (
          <div className="relative w-full h-20 bg-slate-900 rounded-md overflow-hidden group">
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white p-1">
              <ImagePlus className="h-4 w-4 mb-0.5 text-purple-300" />
              <span className="text-[10px] font-semibold">Change Image</span>
            </div>
          </div>
        ) : (
          <div className="p-2">
            <ImagePlus className="h-5 w-5 mx-auto text-slate-400 group-hover:text-purple-600 mb-1" />
            <p className="text-[11px] text-slate-500 group-hover:text-purple-600 font-medium">{label}</p>
          </div>
        )}
      </label>
      
      <div className="mt-1 flex items-center justify-between w-full px-1">
        <span className="text-[10px] font-semibold text-slate-600 truncate">{label}</span>
        {isMain ? (
          <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full">Primary</span>
        ) : onMakePrimary && preview ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMakePrimary();
            }}
            className="text-[9px] font-semibold text-purple-600 hover:text-purple-800 hover:underline"
          >
            Make Primary
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ── Date range dialog ──────────────────────────────────────────────────────
function DateRangeDialog({ open, onClose, from, to, onChange }: {
  open: boolean; onClose: () => void;
  from: string; to: string;
  onChange: (from: string, to: string) => void;
}) {
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Filter by Date</DialogTitle>
          <DialogDescription>Select a single date or a date range</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-sm">From Date</Label>
            <Input type="date" value={localFrom} onChange={(e) => setLocalFrom(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-sm">To Date <span className="text-gray-400 font-normal">(optional)</span></Label>
            <Input type="date" value={localTo} min={localFrom} onChange={(e) => setLocalTo(e.target.value)} className="mt-1" />
          </div>
          {localFrom && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-700">
              {localTo && localTo !== localFrom
                ? <>Showing content from <strong>{localFrom}</strong> to <strong>{localTo}</strong></>
                : <>Showing content on <strong>{localFrom}</strong></>}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onChange("", ""); setLocalFrom(""); setLocalTo(""); onClose(); }}>Clear</Button>
          <Button onClick={() => { onChange(localFrom, localTo); onClose(); }}>Apply Filter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Videos dialog (multi-select) ──────────────────────────────────────
function AddVideosDialog({ open, onClose, excludeIds, allVideos, playlistId, onAdd }: {
  open: boolean; onClose: () => void;
  excludeIds: number[];
  allVideos: Content[];
  playlistId?: number;
  onAdd: (ids: number[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [apiAvailable, setApiAvailable] = useState<Content[] | null>(null);

  useEffect(() => {
    if (open && playlistId) {
      getAvailableVideosForPlaylist(playlistId, { search })
        .then((res) => {
          const mapped: Content[] = res.data.map((item) => ({
            id: item.id,
            title: item.title,
            type: "Video",
            category: item.category || "Uncategorized",
            status: (item.status === "published" ? "Published" : item.status === "scheduled" ? "Scheduled" : "Draft") as any,
            views: item.views !== undefined ? item.views.toString() : "0",
            duration: item.duration || "0:00",
            date: item.date || new Date().toISOString().split("T")[0],
            premium: !!item.premium,
            description: item.description || "",
            tags: item.tags || [],
            thumbnailUrl: item.thumbnailUrl,
          }));
          setApiAvailable(mapped);
        })
        .catch((err) => {
          console.warn("Failed to fetch available videos for playlist", err);
          setApiAvailable(null);
        });
    } else {
      setApiAvailable(null);
    }
  }, [open, playlistId, search]);

  const available = apiAvailable !== null
    ? apiAvailable
    : allVideos.filter(
        (c) => !excludeIds.includes(c.id) &&
          c.title.toLowerCase().includes(search.toLowerCase())
      );

  const toggle = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === available.length ? [] : available.map((v) => v.id));

  const handleAdd = () => {
    onAdd(selected);
    setSelected([]);
    setSearch("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => { setSelected([]); setSearch(""); onClose(); }}>
      <DialogContent className="max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Add Videos to Playlist</DialogTitle>
          <DialogDescription>Select one or more videos to add</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search videos..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {available.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-500 pb-1 border-b">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-purple-600"
                checked={selected.length === available.length && available.length > 0}
                onChange={toggleAll}
              />
              <span>Select all ({available.length})</span>
              {selected.length > 0 && <span className="text-purple-600 font-medium ml-auto">{selected.length} selected</span>}
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {available.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">
                {search ? "No matching videos" : "No more videos to add"}
              </p>
            ) : (
              available.map((v) => (
                <label key={v.id} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${selected.includes(v.id) ? "border-purple-500 bg-purple-50" : "border-slate-200 hover:border-purple-300 hover:bg-slate-50"}`}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-purple-600 flex-shrink-0"
                    checked={selected.includes(v.id)}
                    onChange={() => toggle(v.id)}
                  />
                  <div className="h-10 w-16 rounded bg-slate-900 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    {v.thumbnailUrl ? (
                      <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                    ) : (
                      <Video className="h-4 w-4 text-purple-400" />
                    )}
                    <span className="absolute bottom-0.5 right-0.5 text-white text-[10px] bg-black/70 px-1 rounded">{v.duration}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{v.title}</div>
                    <div className="text-xs text-slate-500">{v.category} · {v.date}</div>
                  </div>
                  <Badge variant={v.status === "Published" ? "default" : "secondary"} className="text-xs flex-shrink-0">{v.status}</Badge>
                </label>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setSelected([]); setSearch(""); onClose(); }}>Cancel</Button>
          <Button disabled={selected.length === 0} onClick={handleAdd} className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="h-4 w-4" />Add Videos ({selected.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Select Playlist dialog (used inside upload dialog) ─────────────────────
function SelectPlaylistDialog({ open, onClose, playlists, selected, onToggle }: {
  open: boolean; onClose: () => void; playlists: Playlist[];
  selected: number[]; onToggle: (id: number) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription>Select one or more playlists for this video</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-64 overflow-y-auto py-1">
          {playlists.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No playlists yet</p>
          ) : (
            playlists.map((pl) => (
              <label key={pl.id} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${selected.includes(pl.id) ? "border-purple-500 bg-purple-50" : "border-slate-200 hover:bg-slate-50"}`}>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-purple-600 flex-shrink-0"
                  checked={selected.includes(pl.id)}
                  onChange={() => onToggle(pl.id)}
                />
                <div className="h-10 w-14 rounded bg-slate-900 flex items-center justify-center flex-shrink-0">
                  <ListVideo className="h-4 w-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{pl.title}</div>
                  <div className="text-xs text-slate-500">{pl.videos} videos</div>
                </div>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose} className="bg-slate-900 text-white hover:bg-slate-800">Done ({selected.length} selected)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Upload / Edit video dialog ─────────────────────────────────────────────
function UploadEditDialog({ open, onClose, isEdit = false, content, playlists, onSaveSuccess }: {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  content?: Content;
  playlists: Playlist[];
  onSaveSuccess: () => void;
}) {
  const [title, setTitle] = useState(content?.title || "");
  const [category, setCategory] = useState(content?.category || "Education");
  const [description, setDescription] = useState(content?.description || "");
  const [tags, setTags] = useState<string[]>(content?.tags ?? []);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [selectedPlaylists, setSelectedPlaylists] = useState<number[]>([]);
  const [playlistPickerOpen, setPlaylistPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [slot0File, setSlot0File] = useState<File | null>(null);
  const [slot1File, setSlot1File] = useState<File | null>(null);
  const [slot2File, setSlot2File] = useState<File | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setUploadProgress(null);
    if (content && open) {
      setTitle(content.title || "");
      setCategory(content.category || "Education");
      setDescription(content.description || "");
      setTags(content.tags || []);
      setVideoFile(null);
      setSlot0File(null);
      setSlot1File(null);
      setSlot2File(null);
      setError(null);

      // Fetch full video details from API to populate any missing past metadata
      getVideoDetails(content.id)
        .then((full) => {
          if (full) {
            if (full.title) setTitle(full.title);
            if (full.category) setCategory(full.category);
            if (full.description) setDescription(full.description);
            if (full.tags && Array.isArray(full.tags)) setTags(full.tags);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch extended video details for edit form", err);
        });
    } else if (!content && open) {
      setTitle("");
      setCategory("Education");
      setDescription("");
      setTags([]);
      setSelectedPlaylists([]);
      setVideoFile(null);
      setSlot0File(null);
      setSlot1File(null);
      setSlot2File(null);
      setError(null);
    }
  }, [content?.id, open]);

  const togglePlaylist = (id: number) =>
    setSelectedPlaylists((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSave = async (status: "published" | "draft" | "scheduled") => {
    setError(null);
    setUploadProgress(null);
    if (!title.trim()) {
      setError("Please enter a title for the video before saving.");
      return;
    }

    if (!isEdit && !videoFile) {
      setError("Please select a video file to upload.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && content) {
        // Editing existing content (e.g. Draft or Scheduled video -> Publish)
        await updateVideo(content.id, {
          title: title.trim(),
          category,
          description,
          tags,
          status,
        });

        if (slot0File) await uploadThumbnail(content.id, 0, slot0File);
        if (slot1File) await uploadThumbnail(content.id, 1, slot1File);
        if (slot2File) await uploadThumbnail(content.id, 2, slot2File);

        if (status === "published") {
          await publishVideo(content.id);
        } else if (status === "scheduled" && scheduleDate && scheduleTime) {
          await scheduleVideo(content.id, { date: scheduleDate, time: scheduleTime });
        }
      } else {
        // Creating NEW video upload
        const initRes = await initiateVideoUpload({
          title: title.trim(),
          filename: videoFile ? videoFile.name : "video.mp4",
          category,
          description,
          tags,
          status: status === "published" ? "pending" : status,
        });

        if (initRes.id) {
          if (slot0File) await uploadThumbnail(initRes.id, 0, slot0File);
          if (slot1File) await uploadThumbnail(initRes.id, 1, slot1File);
          if (slot2File) await uploadThumbnail(initRes.id, 2, slot2File);

          if (videoFile && initRes.signature) {
            try {
              await new Promise<void>((resolve) => {
                const upload = new tus.Upload(videoFile, {
                  endpoint: "https://video.bunnycdn.com/tusupload",
                  storeFingerprintForResuming: false,
                  removeFingerprintOnSuccess: true,
                  retryDelays: [0, 3000, 5000],
                  chunkSize: 5 * 1024 * 1024,
                  uploadSize: videoFile.size,
                  headers: {
                    AuthorizationSignature: String(initRes.signature),
                    AuthorizationExpire: String(initRes.expirationTime || Math.floor(Date.now() / 1000) + 3600),
                    VideoId: String(initRes.bunnyVideoId || initRes.id),
                    LibraryId: String(initRes.bunnyLibraryId || "123456"),
                  },
                  metadata: {
                    filetype: videoFile.type || "video/mp4",
                    title: title.trim(),
                  },
                  onProgress: (bytesUploaded, bytesTotal) => {
                    if (bytesTotal > 0) {
                      const pct = Math.round((bytesUploaded / bytesTotal) * 100);
                      setUploadProgress(pct);
                    }
                  },
                  onError: (err) => {
                    console.warn("TUS stream notice:", err);
                    resolve();
                  },
                  onSuccess: () => {
                    console.log("TUS binary stream uploaded successfully!");
                    setUploadProgress(100);
                    resolve();
                  },
                });
                upload.start();
              });
            } catch (tErr) {
              console.warn("TUS background stream exception:", tErr);
            }
          }

          if (status === "scheduled" && scheduleDate && scheduleTime) {
            await scheduleVideo(initRes.id, { date: scheduleDate, time: scheduleTime });
          }

          for (const plId of selectedPlaylists) {
            await addVideosToPlaylist(plId, [initRes.id]);
          }
        }
      }
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to save video asset:", err);
      setError(err?.message || "An error occurred while saving the video asset. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SelectPlaylistDialog
        open={playlistPickerOpen}
        onClose={() => setPlaylistPickerOpen(false)}
        playlists={playlists}
        selected={selectedPlaylists}
        onToggle={togglePlaylist}
      />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Content Details" : "Upload New Content"}</DialogTitle>
            <DialogDescription>{isEdit ? "Update your content details below" : "Add new video asset to your platform"}</DialogDescription>
          </DialogHeader>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl font-medium">
              {error}
            </div>
          )}

          {uploadProgress !== null && (
            <div className="p-3 text-xs bg-purple-50 border border-purple-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-purple-900">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />
                  Streaming binary upload via TUS...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div><Label>Title</Label><Input placeholder="Enter content title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" /></div>
            <div>
              <Label>Category</Label>
              <Select value={category.toLowerCase()} onValueChange={(val) => setCategory(val.charAt(0).toUpperCase() + val.slice(1))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Textarea placeholder="Enter content description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" /></div>
            <div>
              <Label>Thumbnails</Label>
              <p className="text-xs text-slate-500 mb-2">Upload custom thumbnail images.</p>
              <div className="grid grid-cols-3 gap-3">
                <ThumbnailSlot
                  label="Thumbnail 1"
                  isMain={true}
                  existingUrl={content?.thumbnailUrl || (content as any)?.mainThumbnailUrl || (content as any)?.main_thumbnail_url}
                  onSelect={(f) => {
                    setSlot0File(f);
                    if (content) uploadThumbnail(content.id, 0, f);
                  }}
                />
                <ThumbnailSlot
                  label="Thumbnail 2"
                  existingUrl={(content as any)?.altThumbnailUrls?.[0] || (content as any)?.alt_thumbnail_urls?.[0]}
                  onSelect={(f) => {
                    setSlot1File(f);
                    if (content) uploadThumbnail(content.id, 1, f);
                  }}
                  onMakePrimary={() => {
                    if (content) {
                      const url = (content as any)?.altThumbnailUrls?.[0] || (content as any)?.alt_thumbnail_urls?.[0] || 1;
                      selectMainThumbnail(content.id, url).then(() => onSaveSuccess());
                    }
                  }}
                />
                <ThumbnailSlot
                  label="Thumbnail 3"
                  existingUrl={(content as any)?.altThumbnailUrls?.[1] || (content as any)?.alt_thumbnail_urls?.[1]}
                  onSelect={(f) => {
                    setSlot2File(f);
                    if (content) uploadThumbnail(content.id, 2, f);
                  }}
                  onMakePrimary={() => {
                    if (content) {
                      const url = (content as any)?.altThumbnailUrls?.[1] || (content as any)?.alt_thumbnail_urls?.[1] || 2;
                      selectMainThumbnail(content.id, url).then(() => onSaveSuccess());
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <Label>Tags</Label>
              <p className="text-xs text-slate-500 mb-1.5">Help viewers discover your content</p>
              <TagInput tags={tags} setTags={setTags} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>Playlists</Label>
                <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => setPlaylistPickerOpen(true)}>
                  <ListVideo className="h-3.5 w-3.5" />Add to Playlist
                </Button>
              </div>
              {selectedPlaylists.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {playlists.filter((p) => selectedPlaylists.includes(p.id)).map((p) => (
                    <span key={p.id} className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {p.title}
                      <button type="button" onClick={() => togglePlaylist(p.id)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Not added to any playlist</p>
              )}
            </div>

            {!isEdit && (
              <div>
                <Label>Video File</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/mp4,video/mov,video/avi,video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setVideoFile(file);
                      if (!title) {
                        setTitle(file.name.replace(/\.[^/.]+$/, ""));
                      }
                    }
                  }}
                />

                {videoFile ? (
                  <div className="mt-1.5 border-2 border-purple-200 bg-purple-50/60 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center text-white flex-shrink-0">
                        <Video className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{videoFile.name}</p>
                        <p className="text-xs text-slate-500">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      className="text-slate-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                      onClick={() => setVideoFile(null)}
                    >
                      <X className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        setVideoFile(file);
                        if (!title) {
                          setTitle(file.name.replace(/\.[^/.]+$/, ""));
                        }
                      }
                    }}
                    className="mt-1.5 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 hover:border-purple-500 hover:bg-purple-50/30 transition-all cursor-pointer group block"
                  >
                    <Upload className="h-10 w-10 mx-auto text-slate-400 group-hover:text-purple-600 mb-2 transition-colors" />
                    <p className="text-sm font-medium text-slate-700 group-hover:text-purple-700 mb-1">Drag & drop your video file here</p>
                    <p className="text-xs text-slate-400 mb-3">Supports MP4, MOV, AVI up to 4GB</p>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="bg-white hover:bg-slate-100 border-slate-300 text-slate-800 font-medium shadow-xs"
                    >
                      <FolderOpen className="h-3.5 w-3.5 mr-1.5 text-purple-600" /> Browse Files
                    </Button>
                  </div>
                )}
              </div>
            )}

            {scheduleMode && (
              <div className="border border-purple-200 bg-purple-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-700 font-medium text-sm">
                    <Calendar className="h-4 w-4" />Schedule Publishing Date
                  </div>
                  <button type="button" onClick={() => setScheduleMode(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date</Label><Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="mt-1" /></div>
                  <div><Label>Time</Label><Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="mt-1" /></div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button variant="outline" onClick={() => handleSave("draft")} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save as Draft"}
            </Button>
            {scheduleMode ? (
              <Button
                disabled={!scheduleDate || !scheduleTime || submitting}
                onClick={() => handleSave("scheduled")}
                className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                Confirm Schedule
              </Button>
            ) : (
              <div className="flex">
                <Button className="rounded-r-none bg-slate-900 hover:bg-slate-800 text-white" onClick={() => handleSave("published")} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={submitting}>
                    <Button className="rounded-l-none px-2 bg-slate-950 hover:bg-black text-white border-l border-slate-800"><ChevronDown className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSave("published")}><Video className="mr-2 h-4 w-4" />Publish Now</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setScheduleMode(true)}><Clock className="mr-2 h-4 w-4" />Schedule Publish</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Edit video details dialog ──────────────────────────────────────────────
function EditVideoDialog({ open, onClose, content, playlists, onSaveSuccess }: {
  open: boolean; onClose: () => void; content: Content | null; playlists: Playlist[]; onSaveSuccess: () => void;
}) {
  if (!content) return null;
  return <UploadEditDialog open={open} onClose={onClose} isEdit content={content} playlists={playlists} onSaveSuccess={onSaveSuccess} />;
}

// ── Create / Edit Playlist metadata dialog ─────────────────────────────────
function PlaylistMetaDialog({ open, onClose, playlist, allVideos, onSaveSuccess }: {
  open: boolean;
  onClose: () => void;
  playlist?: Playlist;
  allVideos: Content[];
  onSaveSuccess: () => void;
}) {
  const isEdit = !!playlist;
  const [title, setTitle] = useState(playlist?.title || "");
  const [description, setDescription] = useState(playlist?.description || "");
  const [addVideosOpen, setAddVideosOpen] = useState(false);
  const [videoIds, setVideoIds] = useState<number[]>(playlist?.videoIds ?? []);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (playlist) {
      setTitle(playlist.title);
      setDescription(playlist.description);
      setVideoIds(playlist.videoIds || []);
    } else {
      setTitle("");
      setDescription("");
      setVideoIds([]);
    }
  }, [playlist, open]);

  const addedVideos = allVideos.filter((c) => videoIds.includes(c.id));

  const handleSave = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      if (isEdit && playlist) {
        await updatePlaylist(playlist.id, { title, description });
      } else {
        await createPlaylist({ title, description, videoIds });
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save playlist:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AddVideosDialog
        open={addVideosOpen}
        onClose={() => setAddVideosOpen(false)}
        excludeIds={videoIds}
        allVideos={allVideos}
        onAdd={(ids) => setVideoIds((prev) => [...prev, ...ids.filter((id) => !prev.includes(id))])}
      />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Playlist Details" : "Create New Playlist"}</DialogTitle>
            <DialogDescription>{isEdit ? "Update playlist title and description" : "Create a new structured video collection"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Playlist Banner</Label>
              <label className="mt-1.5 border-2 border-dashed border-slate-300 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors group block bg-slate-50">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  if (e.target.files && e.target.files[0] && playlist) {
                    uploadPlaylistBanner(playlist.id, e.target.files[0]);
                  }
                }} />
                <ImagePlus className="h-8 w-8 text-slate-400 group-hover:text-purple-600 mb-1" />
                <p className="text-xs text-slate-500 group-hover:text-purple-600 font-medium">Click to upload banner image</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Recommended resolution: 1280×720</p>
              </label>
            </div>
            <div><Label>Title</Label><Input placeholder="e.g. React Masterclass Series" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea placeholder="Describe what this playlist covers..." rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" /></div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Videos ({videoIds.length})</Label>
                <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => setAddVideosOpen(true)}>
                  <Plus className="h-3.5 w-3.5" />Add Videos
                </Button>
              </div>
              {addedVideos.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50">
                  <p className="text-xs text-slate-400">No videos added yet</p>
                  <Button variant="link" size="sm" className="text-xs text-purple-600 mt-1" onClick={() => setAddVideosOpen(true)}>Add videos now</Button>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {addedVideos.map((v) => (
                    <div key={v.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="h-9 w-14 rounded bg-slate-900 flex items-center justify-center flex-shrink-0">
                        <Video className="h-3.5 w-3.5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{v.title}</div>
                        <div className="text-xs text-slate-400">{v.duration}</div>
                      </div>
                      <button type="button" onClick={() => setVideoIds((p) => p.filter((x) => x !== v.id))} className="text-slate-400 hover:text-red-500">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSave} disabled={submitting || !title.trim()} className="bg-slate-900 text-white hover:bg-slate-800">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Save Changes" : "Create Playlist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── HLS Video Player helper component ─────────────────────────────────────
function HlsVideoPlayer({
  videoSrc,
  poster,
  onLoadedMetadata,
  onError,
}: {
  videoSrc: string;
  poster?: string;
  onLoadedMetadata?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
  onError?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    let hls: Hls | null = null;

    if (videoSrc.includes(".m3u8") && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal && onError) {
          onError();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl") || !videoSrc.includes(".m3u8")) {
      video.src = videoSrc;
      video.play().catch(() => {});
    } else if (onError) {
      onError();
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoSrc, onError]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      playsInline
      crossOrigin="anonymous"
      poster={poster}
      onLoadedMetadata={onLoadedMetadata}
      onError={onError}
      className="w-full h-full object-contain"
    />
  );
}

// ── Video Player dialog ───────────────────────────────────────────────────
function VideoPlayerDialog({ open, onClose, content, onPlaybackError }: {
  open: boolean; onClose: () => void; content: Content | null; onPlaybackError?: (msg: string) => void;
}) {
  const [playbackError, setPlaybackError] = useState(false);
  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);
  const [loadingStream, setLoadingStream] = useState(false);
  const [dynamicDuration, setDynamicDuration] = useState<string | null>(null);

  useEffect(() => {
    setPlaybackError(false);
    setDynamicDuration(null);
    setFetchedUrl(null);

    if (content && open) {
      const existing = getOriginalVideoUrl(content);
      if (existing) {
        setFetchedUrl(existing);
      } else {
        setLoadingStream(true);
        getVideoDetails(content.id)
          .then((res) => {
            const url = res.playbackUrl || res.videoUrl || (res as any).playback_url || (res as any).video_url;
            if (url) {
              setFetchedUrl(url);
            } else {
              setPlaybackError(true);
              if (onPlaybackError) {
                onPlaybackError(`Something went wrong: Backend has not generated a stream URL for "${content.title}".`);
              }
            }
          })
          .catch((err) => {
            console.warn("Failed to fetch video details from backend API", err);
            setPlaybackError(true);
            if (onPlaybackError) {
              onPlaybackError(`Something went wrong loading video asset from server for "${content.title}".`);
            }
          })
          .finally(() => setLoadingStream(false));
      }
    }
  }, [content?.id, open]);

  if (!content) return null;

  const videoSrc = fetchedUrl || getOriginalVideoUrl(content);

  const handleVideoError = () => {
    setPlaybackError(true);
    if (onPlaybackError) {
      onPlaybackError(`Something went wrong loading video "${content.title}". Media stream unreachable.`);
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const dur = e.currentTarget.duration;
    if (dur && !isNaN(dur) && isFinite(dur)) {
      setDynamicDuration(formatDuration(dur, content.id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl text-white">
        <DialogHeader className="sr-only">
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description || content.title}</DialogDescription>
        </DialogHeader>

        <div className="relative w-full bg-black flex items-center justify-center overflow-hidden" style={{ aspectRatio: "16/9" }}>
          {loadingStream ? (
            <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <p className="text-xs font-medium">Fetching original stream URL from server...</p>
            </div>
          ) : playbackError || !videoSrc ? (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900 border border-red-900/50 rounded-xl max-w-md mx-auto my-12 space-y-3">
              <div className="h-12 w-12 rounded-full bg-red-950/80 border border-red-800 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Something went wrong</h3>
                <p className="text-sm text-slate-400 mt-1">Unable to play video asset. The original video URL is missing or media server is unreachable.</p>
              </div>
              <Button variant="outline" size="sm" className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 text-xs mt-2" onClick={() => setPlaybackError(false)}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Try Again
              </Button>
            </div>
          ) : (
            <HlsVideoPlayer
              key={content.id}
              videoSrc={videoSrc}
              poster={content.thumbnailUrl}
              onError={handleVideoError}
              onLoadedMetadata={handleLoadedMetadata}
            />
          )}
        </div>

        <div className="p-6 space-y-4 bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-xl leading-tight text-white">{content.title}</h2>
              <p className="text-sm text-slate-400 mt-1">{content.category} · {content.date}</p>
            </div>
            <Badge variant={content.status === "Published" ? "default" : content.status === "Draft" ? "secondary" : "outline"} className="flex-shrink-0">
              {content.status}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Views", value: content.views || "0" },
              { label: "Duration", value: dynamicDuration || formatDuration(content.duration, content.id) },
              { label: "Access Tier", value: content.premium ? "Premium" : "Free" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-3 text-center">
                <div className="font-bold text-base text-white">{s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>

          {content.description && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{content.description}</p>
            </div>
          )}

          {content.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {content.tags.map((t) => (
                <span key={t} className="bg-purple-950/80 border border-purple-800/50 text-purple-300 text-xs px-2.5 py-0.5 rounded-full">#{t}</span>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── View content details dialog ────────────────────────────────────────────
function ViewContentDialog({ open, onClose, content, onPlay }: {
  open: boolean; onClose: () => void; content: Content | null; onPlay: (c: Content) => void;
}) {
  if (!content) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>Content details & metadata</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className="relative h-48 w-full rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer group"
            onClick={() => { onClose(); onPlay(content); }}
          >
            {content.thumbnailUrl ? (
              <img src={content.thumbnailUrl} alt={content.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
              <Video className="h-16 w-16 text-purple-400 opacity-50" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="h-7 w-7 text-purple-700 ml-1" />
              </div>
            </div>
            <div className="absolute top-3 left-3">
              <Badge variant={content.status === "Published" ? "default" : content.status === "Draft" ? "secondary" : "outline"}>{content.status}</Badge>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-0.5 rounded">{content.duration}</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Views", value: content.views || "0" },
              { label: "Category", value: content.category },
              { label: "Date Added", value: content.date },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <div className="font-bold text-sm text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
          <div>
            <Label className="text-xs text-slate-400 uppercase tracking-wide">Description</Label>
            <p className="mt-1 text-sm text-slate-700 leading-relaxed">{content.description || "No description provided."}</p>
          </div>
          {content.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {content.tags.map((t) => <span key={t} className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full">#{t}</span>)}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => { onClose(); onPlay(content); }} className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
            <Play className="h-4 w-4 fill-white" />Play Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Playlist Detail Screen ─────────────────────────────────────────────────
function PlaylistDetailScreen({
  playlist, playlists, allVideos, onBack, onEditMeta, onRefresh,
}: {
  playlist: Playlist;
  playlists: Playlist[];
  allVideos: Content[];
  onBack: () => void;
  onEditMeta: (pl: Playlist) => void;
  onRefresh: () => void;
}) {
  const [playlistVideos, setPlaylistVideos] = useState<Content[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [addVideosOpen, setAddVideosOpen] = useState(false);
  const [editVideoContent, setEditVideoContent] = useState<Content | null>(null);
  const [playingVideo, setPlayingVideo] = useState<Content | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoadingVideos(true);
    try {
      const res = await getPlaylistVideos(playlist.id);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: Content[] = res.data.map((item: ApiVideo) => ({
          id: item.id,
          title: item.title,
          type: "Video",
          category: item.category || "Education",
          status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Draft",
          views: item.views !== undefined ? item.views.toString() : "0",
          duration: item.duration || "0:00",
          date: item.date || new Date().toISOString().split("T")[0],
          premium: !!item.premium,
          description: item.description || "",
          tags: item.tags || [],
          thumbnailUrl: item.thumbnailUrl,
        }));
        setPlaylistVideos(mapped);
      } else {
        const fallback = allVideos.filter((c) => (playlist.videoIds || []).includes(c.id));
        setPlaylistVideos(fallback);
      }
    } catch (err) {
      console.warn("Failed to fetch playlist videos from API", err);
      const fallback = allVideos.filter((c) => (playlist.videoIds || []).includes(c.id));
      setPlaylistVideos(fallback);
    } finally {
      setLoadingVideos(false);
    }
  }, [playlist.id, playlist.videoIds, allVideos]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const videos = playlistVideos;
  const currentVideoIds = videos.map((v) => v.id);

  const toggleSelect = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === videos.length ? [] : videos.map((v) => v.id));

  const removeSelected = async () => {
    try {
      await bulkRemoveVideosFromPlaylist(playlist.id, selected);
      setSelected([]);
      fetchVideos();
      onRefresh();
    } catch (err) {
      console.error("Failed to remove videos from playlist:", err);
    }
  };

  const removeSingle = async (id: number) => {
    try {
      await removeVideoFromPlaylist(playlist.id, id);
      setSelected((prev) => prev.filter((x) => x !== id));
      fetchVideos();
      onRefresh();
    } catch (err) {
      console.error("Failed to remove video from playlist:", err);
    }
  };

  const handleAdd = async (ids: number[]) => {
    try {
      await addVideosToPlaylist(playlist.id, ids);
      fetchVideos();
      onRefresh();
    } catch (err) {
      console.error("Failed to add videos to playlist:", err);
    }
  };

  return (
    <div className="space-y-4">
      <AddVideosDialog
        open={addVideosOpen}
        onClose={() => setAddVideosOpen(false)}
        excludeIds={currentVideoIds}
        allVideos={allVideos}
        playlistId={playlist.id}
        onAdd={handleAdd}
      />
      <EditVideoDialog
        open={!!editVideoContent}
        onClose={() => setEditVideoContent(null)}
        content={editVideoContent}
        playlists={playlists}
        onSaveSuccess={onRefresh}
      />
      <VideoPlayerDialog
        open={!!playingVideo}
        onClose={() => setPlayingVideo(null)}
        content={playingVideo}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 border border-slate-200">
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Button>
          <h2 className="text-2xl font-bold text-slate-900">{playlist.title}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-purple-600"
            onClick={() => onEditMeta(playlist)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800" onClick={() => setAddVideosOpen(true)}>
          <Plus className="h-4 w-4" />Add Videos
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 shadow-sm">
          <CheckSquare className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-900">{selected.length} video{selected.length > 1 ? "s" : ""} selected</span>
          <Button variant="destructive" size="sm" className="ml-auto gap-1.5" onClick={removeSelected}>
            <Trash2 className="h-3.5 w-3.5" />Remove from Playlist
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])}>Cancel</Button>
        </div>
      )}

      <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          {loadingVideos ? (
            <div className="flex items-center justify-center py-16 text-slate-500 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <span className="font-medium text-sm">Loading playlist videos...</span>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ListVideo className="h-12 w-12 mx-auto mb-3 opacity-40 text-purple-600" />
              <p className="font-semibold text-slate-700">No videos in this playlist</p>
              <Button variant="link" className="text-purple-600 mt-1" onClick={() => setAddVideosOpen(true)}>Add videos now</Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded accent-purple-600 cursor-pointer"
                      checked={selected.length === videos.length && videos.length > 0}
                      onChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="font-bold text-slate-700">Video Asset</TableHead>
                  <TableHead className="font-bold text-slate-700">Status</TableHead>
                  <TableHead className="font-bold text-slate-700">Views</TableHead>
                  <TableHead className="font-bold text-slate-700">Date Added</TableHead>
                  <TableHead className="w-10 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((v) => (
                  <TableRow
                    key={v.id}
                    className="group cursor-pointer hover:bg-slate-50 transition-colors"
                    onMouseEnter={() => setHoveredId(v.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded accent-purple-600 cursor-pointer"
                        checked={selected.includes(v.id)}
                        onChange={() => toggleSelect(v.id)}
                      />
                    </TableCell>
                    <TableCell onClick={() => setPlayingVideo(v)}>
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-24 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 overflow-hidden group/thumb shadow-sm">
                          {v.thumbnailUrl ? (
                            <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                          ) : (
                            <Video className="h-5 w-5 text-purple-400 opacity-60" />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/40 transition-colors flex items-center justify-center">
                            <Play className="h-6 w-6 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity fill-white" />
                          </div>
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded font-mono">{v.duration}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">{v.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{v.category}</div>
                          {v.premium && <Badge variant="secondary" className="mt-1 text-[10px]">Premium</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={v.status === "Published" ? "default" : v.status === "Draft" ? "secondary" : "outline"}>
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm font-medium">{v.views || "0"}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{v.date}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                      <div className={`transition-opacity ${hoveredId === v.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4 text-slate-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPlayingVideo(v)}>
                              <Play className="mr-2 h-4 w-4 fill-slate-700" />Play Video
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditVideoContent(v)}>
                              <Pencil className="mr-2 h-4 w-4" />Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => removeSingle(v.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />Remove from Playlist
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400 font-medium">{videos.length} video{videos.length !== 1 ? "s" : ""} in playlist</p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ContentManagement() {
  const [contents, setContents] = useState<Content[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation & Filter states
  const [activeTab, setActiveTab] = useState("videos");
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [playlistSearch, setPlaylistSearch] = useState("");
  const [playlistSortBy, setPlaylistSortBy] = useState("newest");

  // Dialog states
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewContent, setViewContent] = useState<Content | null>(null);
  const [editContent, setEditContent] = useState<Content | null>(null);
  const [playingVideo, setPlayingVideo] = useState<Content | null>(null);
  const [newPlaylistOpen, setNewPlaylistOpen] = useState(false);
  const [editPlaylistMeta, setEditPlaylistMeta] = useState<Playlist | null>(null);

  // Notification Toast state
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: "", message: "" });
  const showToast = useCallback((title: string, message: string) => {
    setToast({ show: true, title, message });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 5000);
  }, []);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const vRes = await getVideos({
        status: filterStatus !== "all" ? filterStatus.toLowerCase() : undefined,
        category: filterCategory !== "all" ? filterCategory : undefined,
        search: search.trim() || undefined,
        sort: sortBy,
        dateFrom: filterDateFrom || undefined,
        dateTo: filterDateTo || undefined,
      });

      if (vRes?.data && Array.isArray(vRes.data)) {
        const mapped: Content[] = vRes.data.map((item: ApiVideo) => ({
          id: item.id,
          title: item.title,
          type: "Video",
          category: item.category || "Education",
          status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Draft",
          views: item.views !== undefined ? item.views.toString() : "0",
          duration: item.duration || "0:00",
          date: item.date || new Date().toISOString().split("T")[0],
          premium: !!item.premium,
          description: item.description || "",
          tags: item.tags || [],
          thumbnailUrl: item.thumbnailUrl,
          encodeProgress: item.encodeProgress,
        }));
        setContents(mapped);
      }

      const pRes = await getPlaylists({
        search: playlistSearch.trim() || undefined,
        sort: playlistSortBy,
      });

      if (pRes?.data && Array.isArray(pRes.data)) {
        const mappedPl: Playlist[] = pRes.data.map((item: ApiPlaylist) => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          videos: item.videoCount ?? (item.videoIds ? item.videoIds.length : 0),
          videoIds: item.videoIds || [],
          date: item.date || new Date().toISOString().split("T")[0],
          thumbnailUrl: item.thumbnailUrl,
        }));
        setPlaylists(mappedPl);
      }
    } catch (err) {
      console.warn("Failed to fetch data from backend API", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [filterStatus, filterCategory, search, sortBy, filterDateFrom, filterDateTo, playlistSearch, playlistSortBy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time status polling for transcoding assets (silent background refresh)
  useEffect(() => {
    const hasTranscoding = contents.some((c) => {
      const s = (c.status || "").toLowerCase();
      return (
        (c.encodeProgress !== undefined && c.encodeProgress < 100) ||
        ["pending", "processing", "encoding", "uploading"].includes(s)
      );
    });

    if (hasTranscoding) {
      const timer = setInterval(() => {
        loadData(true);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [contents, loadData]);

  const handleDeleteVideo = async (id: number) => {
    try {
      await deleteVideo(id);
      loadData();
    } catch (err) {
      console.error("Failed to delete video:", err);
    }
  };

  const handleDeletePlaylist = async (id: number) => {
    try {
      await deletePlaylist(id);
      if (activePlaylist?.id === id) {
        setActivePlaylist(null);
      }
      loadData();
    } catch (err) {
      console.error("Failed to delete playlist:", err);
    }
  };

  const uniqueCategories = Array.from(new Set(contents.map((c) => c.category))).filter(Boolean);

  const activeCount =
    [filterStatus, filterCategory].filter((v) => v !== "all").length +
    (filterDateFrom ? 1 : 0);

  const resetFilters = () => {
    setFilterStatus("all");
    setFilterCategory("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSortBy("newest");
    setSearch("");
  };

  const dateLabel = filterDateFrom
    ? filterDateTo && filterDateTo !== filterDateFrom
      ? `${filterDateFrom} → ${filterDateTo}`
      : filterDateFrom
    : null;

  // ── If viewing a playlist detail, render that screen ─────────────────────
  if (activePlaylist) {
    return (
      <div className="space-y-6">
        <PlaylistMetaDialog
          open={!!editPlaylistMeta}
          onClose={() => setEditPlaylistMeta(null)}
          playlist={editPlaylistMeta ?? undefined}
          allVideos={contents}
          onSaveSuccess={loadData}
        />
        <PlaylistDetailScreen
          playlist={activePlaylist}
          playlists={playlists}
          allVideos={contents}
          onBack={() => setActivePlaylist(null)}
          onEditMeta={(pl) => setEditPlaylistMeta(pl)}
          onRefresh={loadData}
        />
      </div>
    );
  }

  // ── Main view ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <UploadEditDialog open={uploadOpen} onClose={() => setUploadOpen(false)} playlists={playlists} onSaveSuccess={loadData} />
      <EditVideoDialog open={!!editContent} onClose={() => setEditContent(null)} content={editContent} playlists={playlists} onSaveSuccess={loadData} />
      <ViewContentDialog open={!!viewContent} onClose={() => setViewContent(null)} content={viewContent} onPlay={(c) => setPlayingVideo(c)} />
      <VideoPlayerDialog open={!!playingVideo} onClose={() => setPlayingVideo(null)} content={playingVideo} onPlaybackError={(msg) => showToast("Something went wrong", msg)} />
      <PlaylistMetaDialog open={newPlaylistOpen} onClose={() => setNewPlaylistOpen(false)} allVideos={contents} onSaveSuccess={loadData} />
      <PlaylistMetaDialog open={!!editPlaylistMeta} onClose={() => setEditPlaylistMeta(null)} playlist={editPlaylistMeta ?? undefined} allVideos={contents} onSaveSuccess={loadData} />
      <DateRangeDialog
        open={dateRangeOpen}
        onClose={() => setDateRangeOpen(false)}
        from={filterDateFrom}
        to={filterDateTo}
        onChange={(f, t) => { setFilterDateFrom(f); setFilterDateTo(t); }}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Content Management</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Upload, organize, and manage your OTT video library</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => loadData()} title="Refresh Data" className="h-10 w-10 border-slate-200 bg-white">
            <RefreshCw className={`h-4 w-4 text-slate-700 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {activeTab === "videos" && (
            <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 font-semibold shadow-md" onClick={() => setUploadOpen(true)}>
              <Plus className="h-4 w-4" />Upload Content
            </Button>
          )}
          {activeTab === "playlists" && (
            <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800 h-10 px-4 font-semibold shadow-md" onClick={() => setNewPlaylistOpen(true)}>
              <Plus className="h-4 w-4" />New Playlist
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Prominent high-contrast active tab switcher */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <TabsList className="bg-slate-200/80 p-1 rounded-xl">
            <TabsTrigger
              value="videos"
              className="gap-2 px-5 py-2 rounded-lg font-semibold transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-700 hover:text-slate-900"
            >
              <Video className="h-4 w-4" />Videos
              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "videos" ? "bg-white/20 text-white" : "bg-slate-300 text-slate-700"}`}>
                {contents.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="playlists"
              className="gap-2 px-5 py-2 rounded-lg font-semibold transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-700 hover:text-slate-900"
            >
              <ListVideo className="h-4 w-4" />Playlists
              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "playlists" ? "bg-white/20 text-white" : "bg-slate-300 text-slate-700"}`}>
                {playlists.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {activeTab === "videos" && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="search" placeholder="Search videos..." className="pl-9 w-64 bg-white border-slate-200"
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button variant={showFilters ? "default" : "outline"} className="gap-2 border-slate-200 bg-white"
                onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4" />Filters
                {activeCount > 0 && <span className="ml-1 bg-slate-900 text-white rounded-full text-xs font-bold px-1.5">{activeCount}</span>}
              </Button>
            </div>
          )}

          {activeTab === "playlists" && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="search" placeholder="Search playlists..." className="pl-9 w-64 bg-white border-slate-200"
                  value={playlistSearch} onChange={(e) => setPlaylistSearch(e.target.value)} />
              </div>
              <Select value={playlistSortBy} onValueChange={setPlaylistSortBy}>
                <SelectTrigger className="h-10 text-sm w-40 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="title">Title A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* ── Videos Tab ── */}
        <TabsContent value="videos">
          <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            {showFilters && (
              <CardHeader className="bg-slate-50 border-b border-slate-200 p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <Label className="text-xs mb-1 block font-semibold text-slate-500">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="h-9 text-sm bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block font-semibold text-slate-500">Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="h-9 text-sm bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {uniqueCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block font-semibold text-slate-500">Date</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1.5 text-sm w-full justify-start bg-white"
                      onClick={() => setDateRangeOpen(true)}
                    >
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                      <span className="truncate flex-1 text-left">{dateLabel ?? "Pick date or range"}</span>
                      {dateLabel && (
                        <X className="h-3 w-3 flex-shrink-0 text-slate-400 hover:text-red-500"
                          onClick={(e) => { e.stopPropagation(); setFilterDateFrom(""); setFilterDateTo(""); }} />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-slate-500 font-semibold">Sort by:</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-8 text-sm w-36 bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest first</SelectItem>
                        <SelectItem value="oldest">Oldest first</SelectItem>
                        <SelectItem value="views">Most views</SelectItem>
                        <SelectItem value="title">Title A–Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {activeCount > 0 && (
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-slate-500 h-8" onClick={resetFilters}>
                      <X className="h-3 w-3" />Clear filters
                    </Button>
                  )}
                </div>
              </CardHeader>
            )}

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-500 gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <span className="font-medium text-sm">Loading video assets from server...</span>
                </div>
              ) : contents.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <Video className="h-12 w-12 mx-auto mb-3 opacity-40 text-purple-600" />
                  <p className="font-semibold text-slate-700">No video content found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your search or active filters</p>
                  <Button variant="link" className="text-purple-600 mt-2 font-medium" onClick={resetFilters}>Reset filters</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-200">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">Video Asset</TableHead>
                      <TableHead className="font-bold text-slate-700">Category</TableHead>
                      <TableHead className="font-bold text-slate-700">Status</TableHead>
                      <TableHead className="font-bold text-slate-700">Views</TableHead>
                      <TableHead className="font-bold text-slate-700">Duration</TableHead>
                      <TableHead className="font-bold text-slate-700">Date Added</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contents.map((content) => (
                      <TableRow key={content.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                        <TableCell onClick={() => setPlayingVideo(content)}>
                          <div className="flex items-center gap-3">
                            <div className="h-16 w-24 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 relative overflow-hidden group/thumb shadow-sm">
                              {content.thumbnailUrl ? (
                                <img src={content.thumbnailUrl} alt={content.title} className="w-full h-full object-cover" />
                              ) : (
                                <Video className="h-6 w-6 text-purple-400 opacity-60" />
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/40 transition-colors flex items-center justify-center">
                                <Play className="h-7 w-7 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity fill-white" />
                              </div>
                              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded font-mono">{content.duration}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">{content.title}</div>
                              {((content.encodeProgress !== undefined && content.encodeProgress < 100) ||
                                ["Pending", "pending", "Processing", "processing", "Encoding", "encoding", "Uploading", "uploading"].includes(content.status)) ? (
                                <div className="mt-1 space-y-1">
                                  <div className="w-36 bg-slate-100 border border-slate-200 rounded-full h-2 overflow-hidden relative">
                                    <div
                                      className="bg-purple-600 h-full transition-all duration-500 rounded-full"
                                      style={{ width: `${Math.max(content.encodeProgress ?? 35, 10)}%` }}
                                    />
                                  </div>
                                  <div className="text-[10px] font-semibold text-purple-600 flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                                    <span>
                                      {content.encodeProgress !== undefined && content.encodeProgress > 0
                                        ? `${content.encodeProgress}% uploaded / encoding`
                                        : `${content.status} · Processing stream...`}
                                    </span>
                                  </div>
                                </div>
                              ) : content.premium ? (
                                <Badge variant="secondary" className="mt-1 text-[10px]">Premium</Badge>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">{content.category}</TableCell>
                        <TableCell>
                          <Badge variant={content.status === "Published" || content.status === "published" ? "default" : content.status === "Draft" || content.status === "draft" ? "secondary" : "outline"}>
                            {content.status} {content.encodeProgress !== undefined ? `(${content.encodeProgress}%)` : ""}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium text-sm">{content.views}</TableCell>
                        <TableCell className="text-slate-600 font-mono text-xs">{content.duration}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{content.date}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4 text-slate-600" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border border-slate-200 shadow-lg">
                              <DropdownMenuItem onClick={() => setPlayingVideo(content)}>
                                <Play className="mr-2 h-4 w-4 fill-slate-700 text-slate-700" />Play Video
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setViewContent(content)}>
                                <Eye className="mr-2 h-4 w-4" />View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditContent(content)}>
                                <Edit className="mr-2 h-4 w-4" />Edit Content
                              </DropdownMenuItem>
                              {content.status !== "Published" && content.status !== "published" && (
                                <DropdownMenuItem onClick={() => {
                                  publishVideo(content.id).then(() => loadData(true));
                                }}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />Publish
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteVideo(content.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />Delete Asset
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Playlists Tab ── */}
        <TabsContent value="playlists">
          <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-500 gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <span className="font-medium text-sm">Loading playlists...</span>
                </div>
              ) : playlists.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <ListVideo className="h-12 w-12 mx-auto mb-3 opacity-40 text-purple-600" />
                  <p className="font-semibold text-slate-700">No playlists found</p>
                  <Button variant="link" className="text-purple-600 mt-2 font-medium" onClick={() => setNewPlaylistOpen(true)}>Create a new playlist</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-200">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">Playlist Collection</TableHead>
                      <TableHead className="font-bold text-slate-700">Videos Count</TableHead>
                      <TableHead className="font-bold text-slate-700">Date Created</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playlists.map((pl) => (
                      <TableRow key={pl.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="relative h-14 w-24 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer group shadow-sm"
                              onClick={() => setActivePlaylist(pl)}
                            >
                              {pl.thumbnailUrl ? (
                                <img src={pl.thumbnailUrl} alt={pl.title} className="w-full h-full object-cover" />
                              ) : (
                                <ListVideo className="h-6 w-6 text-purple-400 opacity-60" />
                              )}
                              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded font-bold">{pl.videos}</span>
                            </div>
                            <div>
                              <button
                                className="font-semibold text-slate-900 text-left hover:text-purple-700 transition-colors text-sm"
                                onClick={() => setActivePlaylist(pl)}
                              >
                                {pl.title}
                              </button>
                              <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{pl.description || "No description provided."}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium text-sm">{pl.videos} videos</TableCell>
                        <TableCell className="text-slate-600 text-sm">{pl.date}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4 text-slate-600" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border border-slate-200 shadow-lg">
                              <DropdownMenuItem onClick={() => setActivePlaylist(pl)}>
                                <ListVideo className="mr-2 h-4 w-4" />Open Playlist
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditPlaylistMeta(pl)}>
                                <Edit className="mr-2 h-4 w-4" />Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePlaylist(pl.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />Delete Playlist
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Top-Right Floating Toast Notification ── */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full bg-slate-900 text-white border border-red-500/60 shadow-2xl rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="h-9 w-9 rounded-full bg-red-950/80 border border-red-800 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-white">{toast.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
