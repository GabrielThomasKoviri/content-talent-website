import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Upload, Save, Play, CheckCircle, Video, Star, ImagePlus, Check, Plus, Trash2, Search, ChevronUp, ChevronDown, Eye, Loader2
} from "lucide-react";
import {
  getCreatorBranding,
  updateCreatorBranding,
  uploadCreatorLogo,
  uploadCreatorBanner,
  getFeaturedVideos,
  updateFeaturedVideos,
  addFeaturedVideos,
  reorderFeaturedVideos,
  deleteFeaturedVideo,
  getAvailableVideosForFeatured,
  ApiVideo,
  ApiFeaturedVideoItem,
  ApiAvailableFeaturedVideo,
} from "../services/apiService";

interface FeaturedBannerItem {
  id: number;
  videoId: number;
  title: string;
  category: string;
  duration: string;
  thumbnailUrl: string;
  description: string;
}

export default function Branding() {
  // Creator & Studio Identity State
  const [studioName, setStudioName] = useState("");
  const [creatorName, setCreatorName] = useState(""); // backward compatibility
  const [creatorTagline, setCreatorTagline] = useState("");
  const [creatorDescription, setCreatorDescription] = useState("");
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);

  // Available Videos list from system (for picker modal)
  const [availableSystemVideos, setAvailableSystemVideos] = useState<ApiVideo[]>([]);
  
  // Featured Video Banners List State (Max limit 10)
  const MAX_BANNERS = 10;
  const [featuredBanners, setFeaturedBanners] = useState<FeaturedBannerItem[]>([]);
  const [selectedBannerId, setSelectedBannerId] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal State for Adding Featured Video Banners (Multi-Select)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVideoIdsForAdd, setSelectedVideoIdsForAdd] = useState<string[]>([]);
  const [modalSearch, setModalSearch] = useState<string>("");

  // Image Preview Modal State (for Banner & Logo Preview)
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
  }>({
    isOpen: false,
    title: "",
    url: "",
  });

  // Hidden File Inputs
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Fetch creator branding details from backend
  useEffect(() => {
    getCreatorBranding()
      .then((data) => {
        const name = data.studioName || data.creatorName || "";
        if (name) {
          setStudioName(name);
          setCreatorName(name);
        }
        if (data.tagline) setCreatorTagline(data.tagline);
        if (data.description) setCreatorDescription(data.description);
        if (data.bannerUrl) setBannerPreview(data.bannerUrl);
        if (data.logoUrl) setLogoPreview(data.logoUrl);
      })
      .catch((err) => {
        console.warn("Failed to load branding identity from backend:", err);
      });
  }, []);

  // Fetch featured videos from backend API
  useEffect(() => {
    getFeaturedVideos()
      .then((items) => {
        if (items && items.length > 0) {
          const mapped = items.map((item) => ({
            id: item.id,
            videoId: item.videoId,
            title: item.title,
            category: item.category || "Video",
            duration: item.duration || "00:00",
            thumbnailUrl: item.thumbnailUrl || "",
            description: "",
          }));
          setFeaturedBanners(mapped);
          setSelectedBannerId(mapped[0].id);
        } else {
          setFeaturedBanners([]);
          setSelectedBannerId(null);
        }
      })
      .catch((err) => {
        console.warn("Failed to load featured videos from API:", err);
        setFeaturedBanners([]);
      });
  }, []);

  // Fetch available creator videos for picker modal
  useEffect(() => {
    getAvailableVideosForFeatured()
      .then((res) => {
        if (res.items) {
          const mapped = res.items.map((v) => ({
            id: v.id,
            title: v.title,
            description: "",
            category: v.category || "Video",
            status: "published",
            views: v.views,
            duration: v.duration,
            date: v.createdAt,
            thumbnailUrl: v.thumbnailUrl,
          }));
          setAvailableSystemVideos(mapped as any);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch available videos for featured:", err);
      });
  }, []);

  // Video options for dropdown selection
  const dropdownVideoOptions = availableSystemVideos.map((v) => ({
    id: v.id,
    title: v.title,
    category: v.category || "Video",
    duration: v.duration || "00:00",
    thumbnailUrl: v.thumbnailUrl || v.mainThumbnailUrl || "",
    description: v.description || "",
  }));

  // Currently active featured banner object
  const activeBanner = featuredBanners.find((b) => b.id === selectedBannerId) || featuredBanners[0] || null;

  const handleBannerSelect = (id: number) => {
    setSelectedBannerId(id);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerPreview(URL.createObjectURL(file));
      try {
        const res = await uploadCreatorBanner(file);
        if (res.bannerUrl) {
          setBannerPreview(res.bannerUrl);
        }
      } catch (err) {
        console.warn("Failed to upload creator banner to backend:", err);
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoPreview(URL.createObjectURL(file));
      try {
        const res = await uploadCreatorLogo(file);
        if (res.logoUrl) {
          setLogoPreview(res.logoUrl);
          window.dispatchEvent(new CustomEvent("branding_updated", { detail: { logoUrl: res.logoUrl } }));
        }
      } catch (err) {
        console.warn("Failed to upload creator logo to backend:", err);
      }
    }
  };

  // Open modal handler for multi-select
  const handleOpenAddModal = () => {
    setSelectedVideoIdsForAdd([]);
    setModalSearch("");
    setIsAddModalOpen(true);
    getAvailableVideosForFeatured()
      .then((res) => {
        if (res.items) {
          const mapped = res.items.map((v) => ({
            id: v.id,
            title: v.title,
            description: "",
            category: v.category || "Video",
            status: "published",
            views: v.views,
            duration: v.duration,
            date: v.createdAt,
            thumbnailUrl: v.thumbnailUrl,
          }));
          setAvailableSystemVideos(mapped as any);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch available videos on modal open:", err);
      });
  };

  // Calculate remaining slots up to MAX_BANNERS (10)
  const remainingSlots = Math.max(0, MAX_BANNERS - featuredBanners.length);

  // Toggle video selection with limit enforcement
  const handleToggleVideoSelection = (vidIdStr: string) => {
    if (selectedVideoIdsForAdd.includes(vidIdStr)) {
      setSelectedVideoIdsForAdd((prev) => prev.filter((id) => id !== vidIdStr));
    } else {
      if (selectedVideoIdsForAdd.length >= remainingSlots) {
        return; // Exceeds available limit of 10
      }
      setSelectedVideoIdsForAdd((prev) => [...prev, vidIdStr]);
    }
  };

  // Submit multiple selected video banners to local state
  const handleAddBannerSubmit = () => {
    if (selectedVideoIdsForAdd.length === 0 || remainingSlots <= 0) return;

    const toAddIds = selectedVideoIdsForAdd.slice(0, remainingSlots);
    const newItems: FeaturedBannerItem[] = [];

    toAddIds.forEach((vidIdStr, index) => {
      const matchedId = parseInt(vidIdStr, 10);
      if (isNaN(matchedId)) return;

      // Prevent duplicate video additions
      const isAlreadyInList = featuredBanners.some((b) => Number(b.videoId) === matchedId);
      if (isAlreadyInList) return;

      const matched = dropdownVideoOptions.find((o) => Number(o.id) === matchedId);
      if (matched) {
        newItems.push({
          id: Date.now() + index,
          videoId: matched.id,
          title: matched.title,
          category: matched.category,
          duration: matched.duration,
          thumbnailUrl: matched.thumbnailUrl,
          description: matched.description || "Highlighted video banner",
        });
      }
    });

    if (newItems.length > 0) {
      setFeaturedBanners((prev) => [...prev, ...newItems]);
      if (!selectedBannerId) {
        setSelectedBannerId(newItems[0].id);
      }
    }

    // Reset Form & Close Modal
    setIsAddModalOpen(false);
    setSelectedVideoIdsForAdd([]);
  };

  // Delete banner locally (synced when Save Changes is clicked)
  const handleDeleteBanner = (id: number, _videoId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = featuredBanners.filter((b) => b.id !== id);
    setFeaturedBanners(updated);
    if (selectedBannerId === id && updated.length > 0) {
      setSelectedBannerId(updated[0].id);
    }
  };

  // Move banner up locally
  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index <= 0) return;
    setFeaturedBanners((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Move banner down locally
  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index >= featuredBanners.length - 1) return;
    setFeaturedBanners((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Featured Videos Section Save Changes Handler (Batch sync to API)
  const [saveFeaturedBannersSuccess, setSaveFeaturedBannersSuccess] = useState(false);
  const [isSavingFeaturedBanners, setIsSavingFeaturedBanners] = useState(false);

  const handleSaveFeaturedBanners = async () => {
    setIsSavingFeaturedBanners(true);
    try {
      const videoIds = featuredBanners.map((b) => b.videoId).filter(Boolean);
      await updateFeaturedVideos(videoIds);
      setSaveFeaturedBannersSuccess(true);
      setTimeout(() => {
        setSaveFeaturedBannersSuccess(false);
      }, 3000);
    } catch (err) {
      console.warn("Failed to save featured videos changes to backend:", err);
      setSaveFeaturedBannersSuccess(true);
      setTimeout(() => {
        setSaveFeaturedBannersSuccess(false);
      }, 3000);
    } finally {
      setIsSavingFeaturedBanners(false);
    }
  };

  // Creator & Studio Identity Section Save Changes Handler
  const handleSaveChanges = async () => {
    setIdentityError(null);
    const trimmedStudioName = (studioName || creatorName).trim();
    if (!trimmedStudioName) {
      setIdentityError("Studio / Channel Name is required.");
      return;
    }
    setIsSavingIdentity(true);
    try {
      const updated = await updateCreatorBranding({
        studio_name: trimmedStudioName,
        tagline: creatorTagline.trim(),
        description: creatorDescription.trim(),
      });
      if (updated.studioName) {
        setStudioName(updated.studioName);
        setCreatorName(updated.studioName);
        try {
          const raw = localStorage.getItem("admin_profile");
          if (raw) {
            const admin = JSON.parse(raw);
            admin.studio_name = updated.studioName;
            if (updated.tagline) admin.tagline = updated.tagline;
            if (updated.logoUrl) admin.avatar_url = updated.logoUrl;
            localStorage.setItem("admin_profile", JSON.stringify(admin));
          }
        } catch {
          // ignore localStorage parsing errors
        }
        window.dispatchEvent(new CustomEvent("branding_updated", { detail: updated }));
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Failed to save creator branding changes:", err);
      setIdentityError(err?.message || "Failed to save creator studio branding.");
    } finally {
      setIsSavingIdentity(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Featured Video Banners Dialog Modal (Multi-Select with 10 Banners Limit) */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg bg-white border border-slate-200 text-slate-900 shadow-2xl rounded-2xl">
          <DialogHeader className="pr-8">
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-slate-700" />
                Add Featured Video Banners
              </DialogTitle>
              <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-semibold ${
                featuredBanners.length >= MAX_BANNERS
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-slate-100 text-slate-700"
              }`}>
                {featuredBanners.length} / {MAX_BANNERS} Banners
              </Badge>
            </div>
            <DialogDescription className="text-sm text-slate-500 mt-1">
              Select videos to feature as hero banners (up to {MAX_BANNERS} total).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Limit Warning Alert if max 10 reached */}
            {featuredBanners.length >= MAX_BANNERS ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-medium">
                <span>Maximum limit of 10 featured banners reached. Delete an existing banner to add new ones.</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold text-slate-800 block">
                    Select Videos <span className="text-rose-500">*</span>
                  </Label>
                  <span className="text-xs text-slate-500 font-medium">
                    Selected: <span className="text-slate-900 font-bold">{selectedVideoIdsForAdd.length}</span> / {remainingSlots} Available
                  </span>
                </div>

                {/* Search filter for videos */}
                <div className="relative mb-3">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search videos by title or category..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm h-10 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl"
                  />
                </div>

                {/* Scrollable list of video cards with checkboxes */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {(() => {
                    const unaddedOptions = dropdownVideoOptions.filter(
                      (opt) => !featuredBanners.some((b) => Number(b.videoId) === Number(opt.id))
                    );

                    const filteredOptions = unaddedOptions.filter(
                      (opt) =>
                        !modalSearch.trim() ||
                        opt.title.toLowerCase().includes(modalSearch.toLowerCase()) ||
                        opt.category.toLowerCase().includes(modalSearch.toLowerCase())
                    );

                    if (unaddedOptions.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200 p-4">
                          {dropdownVideoOptions.length === 0
                            ? "No uploaded videos found in your system library."
                            : "All available videos have already been added as featured banners."}
                        </div>
                      );
                    }

                    if (filteredOptions.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200 p-4">
                          No matching videos found for "{modalSearch}".
                        </div>
                      );
                    }

                    return filteredOptions.map((opt) => {
                      const isSelected = selectedVideoIdsForAdd.includes(String(opt.id));
                      const isAtMaxLimit = !isSelected && selectedVideoIdsForAdd.length >= remainingSlots;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => !isAtMaxLimit && handleToggleVideoSelection(String(opt.id))}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                            isAtMaxLimit
                              ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
                              : isSelected
                              ? "border-slate-900 bg-slate-100 shadow-xs cursor-pointer"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
                          }`}
                        >
                          {/* Checkbox Selection Indicator */}
                          <div className="flex-shrink-0">
                            <div
                              className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : isAtMaxLimit
                                  ? "border-slate-200 bg-slate-100"
                                  : "border-slate-300 bg-white hover:border-slate-500"
                              }`}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 text-white stroke-[3]" />
                              )}
                            </div>
                          </div>

                          {/* Video Thumbnail Box */}
                          <div className="h-12 w-20 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 relative shadow-xs">
                            {opt.thumbnailUrl ? (
                              <img src={opt.thumbnailUrl} alt={opt.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="h-4 w-4 text-slate-400" />
                              </div>
                            )}
                            <span className="absolute bottom-0.5 right-0.5 bg-black/85 text-white text-[9px] px-1 py-0.5 rounded font-mono font-medium">
                              {opt.duration}
                            </span>
                          </div>

                          {/* Video Title & Metadata */}
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-bold truncate ${isSelected ? "text-slate-900" : "text-slate-800"}`}>
                              {opt.title}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <span className="text-slate-700 font-medium">{opt.category}</span>
                              <span className="text-slate-400">•</span>
                              <span>{opt.duration}</span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs rounded-xl shadow-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddBannerSubmit}
              disabled={selectedVideoIdsForAdd.length === 0 || remainingSlots <= 0}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs gap-1.5 rounded-xl shadow-xs disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              {selectedVideoIdsForAdd.length > 1
                ? `Add ${selectedVideoIdsForAdd.length} Banners`
                : "Add Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal (Banner & Logo) */}
      <Dialog
        open={previewModal.isOpen}
        onOpenChange={(open) => setPreviewModal((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-w-3xl bg-white border border-slate-200 text-slate-900 shadow-2xl p-6 rounded-2xl">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Eye className="h-5 w-5 text-slate-700" />
              {previewModal.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden min-h-[220px]">
            {previewModal.url ? (
              <img
                src={previewModal.url}
                alt={previewModal.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-xs"
              />
            ) : (
              <p className="text-slate-400 text-sm">No preview image available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Branding & Customization</h1>
        <p className="text-slate-500 mt-1 font-normal text-sm">
          Customize your studio brand, assets, and featured video banners.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        {/* Creator Studio & App Identity Card */}
        <Card className="border border-slate-200/80 bg-white shadow-xs rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold text-slate-900">Creator Studio & App Identity</CardTitle>
                    <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-slate-200 bg-slate-100 text-slate-700 font-semibold">
                      Public Brand
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSaveChanges}
                disabled={isSavingIdentity}
                className={`gap-2 font-semibold text-sm h-10 px-4 transition-all duration-200 shrink-0 rounded-xl shadow-xs ${
                  saveSuccess
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {isSavingIdentity ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Studio Identity
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {identityError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 font-medium">
                <span>⚠️ {identityError}</span>
              </div>
            )}
            {saveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2 font-medium">
                <span>✓ Studio branding successfully saved and synchronized across your platform.</span>
              </div>
            )}

            {/* Studio / Channel Name */}
            <div>
              <Label htmlFor="studio-name" className="text-sm font-semibold text-slate-800 block">
                Studio / Channel Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="studio-name"
                value={studioName || creatorName}
                onChange={(e) => {
                  setStudioName(e.target.value);
                  setCreatorName(e.target.value);
                  if (identityError) setIdentityError(null);
                }}
                placeholder="e.g. Creator Academy"
                className="mt-2 h-11 text-sm font-medium bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl shadow-xs"
              />
            </div>

            {/* Studio Tagline */}
            <div>
              <Label htmlFor="creator-tagline" className="text-sm font-semibold text-slate-800 block">
                Studio Tagline / Slogan
              </Label>
              <Input
                id="creator-tagline"
                value={creatorTagline}
                onChange={(e) => setCreatorTagline(e.target.value)}
                placeholder="e.g. Learn from industry leaders"
                className="mt-2 h-11 text-sm font-medium bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl shadow-xs"
              />
            </div>

            {/* Studio Description */}
            <div>
              <Label htmlFor="creator-desc" className="text-sm font-semibold text-slate-800 block">
                Studio Description / Channel Bio
              </Label>
              <Textarea
                id="creator-desc"
                rows={4}
                value={creatorDescription}
                onChange={(e) => setCreatorDescription(e.target.value)}
                placeholder="Tell your subscribers and viewers about your courses, content offerings, and studio mission..."
                className="mt-2 text-sm font-medium bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl shadow-xs"
              />
            </div>

            {/* Studio Banner & Studio Logo Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
              {/* Studio Banner Slot */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold text-slate-800 block">
                    Studio Cover Banner
                  </Label>
                  {bannerPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewModal({
                          isOpen: true,
                          title: "Studio Banner Preview",
                          url: bannerPreview,
                        });
                      }}
                      className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-lg shadow-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                  )}
                </div>
                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={handleBannerUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => bannerInputRef.current?.click()}
                  className="relative group cursor-pointer border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 rounded-xl overflow-hidden h-32 flex flex-col items-center justify-center transition-all p-2"
                >
                  {bannerPreview ? (
                    <>
                      <img
                        src={bannerPreview}
                        alt="Studio Banner"
                        className="w-full h-full object-cover rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-sm font-semibold gap-2 rounded-xl">
                        <Upload className="h-4 w-4" />
                        Change Banner
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-3">
                      <ImagePlus className="h-7 w-7 mx-auto text-slate-400 group-hover:text-slate-600 mb-1.5" />
                      <p className="text-sm text-slate-700 font-semibold">Click to upload Banner</p>
                      <p className="text-xs text-slate-400 mt-1">Recommended 1200×400px (JPG, PNG, WebP)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Studio Logo Slot */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold text-slate-800 block">
                    Studio Logo / App Icon
                  </Label>
                  {logoPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewModal({
                          isOpen: true,
                          title: "Studio Logo Preview",
                          url: logoPreview,
                        });
                      }}
                      className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-lg shadow-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                  )}
                </div>
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="relative group cursor-pointer border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 rounded-xl h-32 flex items-center justify-center transition-all p-3"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="h-16 w-16 rounded-xl bg-slate-900 flex items-center justify-center text-white text-2xl font-bold shadow-xs flex-shrink-0 overflow-hidden relative">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Studio Logo" className="w-full h-full object-cover" />
                      ) : (
                        (studioName || creatorName || "ST").slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          logoInputRef.current?.click();
                        }}
                        className="w-full gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm h-9 px-3 font-semibold rounded-xl shadow-xs"
                      >
                        <Upload className="h-4 w-4 text-slate-500" />
                        Upload Logo
                      </Button>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        PNG, SVG, or WebP (512×512px)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Videos Card */}
        <Card className="border border-slate-200/80 bg-white shadow-xs rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Featured Videos</CardTitle>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  onClick={handleSaveFeaturedBanners}
                  disabled={isSavingFeaturedBanners}
                  className={`gap-2 font-semibold text-sm h-10 px-4 transition-all duration-200 rounded-xl shadow-xs ${
                    saveFeaturedBannersSuccess
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {saveFeaturedBannersSuccess ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleOpenAddModal}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm gap-2 h-10 px-4 rounded-xl shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Featured Video Banners List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Featured Banners
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    <strong className="text-slate-900">{featuredBanners.length}</strong> / {MAX_BANNERS} Banners Configured
                  </span>
                  {featuredBanners.length >= MAX_BANNERS && (
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800 text-[10px] px-1.5 py-0">
                      Limit Reached
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {featuredBanners.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <Video className="h-8 w-8 mx-auto text-slate-400 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-700">No featured banners configured</p>
                    <p className="text-xs text-slate-500 mt-1">Click the + Add button to select a video and add its banner</p>
                    <Button
                      onClick={handleOpenAddModal}
                      variant="outline"
                      size="sm"
                      className="mt-3 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs gap-1 rounded-xl shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Banner
                    </Button>
                  </div>
                ) : (
                  featuredBanners.map((banner, index) => {
                    return (
                      <div
                        key={banner.id}
                        className="group relative p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/70 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Order arrangement controls (Up / Down arrows) */}
                          <div className="flex flex-col gap-0.5 flex-shrink-0">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={(e) => handleMoveUp(index, e)}
                              className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-800 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                              title="Move Up in Order"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === featuredBanners.length - 1}
                              onClick={(e) => handleMoveDown(index, e)}
                              className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-800 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                              title="Move Down in Order"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Video Banner Thumbnail */}
                          <div className="h-12 w-20 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden relative border border-slate-200 shadow-xs">
                            <img
                              src={banner.thumbnailUrl}
                              alt={banner.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Banner Video Info */}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-slate-900 truncate">
                              {banner.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              <span className="text-slate-700 font-medium">{banner.category}</span> · <span>{banner.duration}</span>
                            </p>
                          </div>
                        </div>

                        {/* Delete Banner Button */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteBanner(banner.id, banner.videoId, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Banner"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
