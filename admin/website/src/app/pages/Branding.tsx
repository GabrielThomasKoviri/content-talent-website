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
  Upload, Smartphone, Monitor, Save, Play, CheckCircle, Video, Star, ImagePlus, Check, Plus, Trash2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { getVideos, ApiVideo } from "../services/apiService";

interface FeaturedBannerItem {
  id: number;
  videoId: number;
  title: string;
  category: string;
  duration: string;
  thumbnailUrl: string;
  description: string;
}

const defaultSystemVideos: FeaturedBannerItem[] = [
  {
    id: 1,
    videoId: 101,
    title: "Mastering Next.js 14 & AI Integrations",
    category: "Development",
    duration: "14:20",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    description: "Learn how to build production-ready AI applications using Next.js 14 Server Actions, Vercel AI SDK, and OpenAI models from start to finish.",
  },
  {
    id: 2,
    videoId: 102,
    title: "Fullstack Architecture Masterclass 2026",
    category: "Architecture",
    duration: "28:45",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    description: "Deep dive into clean scalable microservice architecture, API design, real-time sync, and modern serverless database infrastructure.",
  },
  {
    id: 3,
    videoId: 103,
    title: "UI/UX Motion Design in Tailwind & CSS",
    category: "Design",
    duration: "09:15",
    thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
    description: "Craft ultra-smooth 60fps web animations, dynamic glassmorphic interfaces, and dark studio responsive components with vanilla CSS.",
  },
];

export default function Branding() {
  // Creator Identity State
  const [creatorName, setCreatorName] = useState("Creator Academy");
  const [creatorTagline, setCreatorTagline] = useState("Learn from industry leaders");
  const [creatorDescription, setCreatorDescription] = useState(
    "Your premier portal for high-impact software engineering, UI design, and modern technology courses taught by top industry pioneers."
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80"
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Available Videos list from system (for dropdown)
  const [availableSystemVideos, setAvailableSystemVideos] = useState<ApiVideo[]>([]);
  
  // Featured Video Banners List State
  const [featuredBanners, setFeaturedBanners] = useState<FeaturedBannerItem[]>(defaultSystemVideos);
  const [selectedBannerId, setSelectedBannerId] = useState<number>(1);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal State for Adding Featured Video Banner
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVideoIdForAdd, setSelectedVideoIdForAdd] = useState<string>("");
  const [bannerDescriptionForAdd, setBannerDescriptionForAdd] = useState<string>("");

  // Hidden File Inputs
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Fetch system videos for dropdown selection
  useEffect(() => {
    getVideos()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setAvailableSystemVideos(res.data);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch system videos for dropdown, using defaults:", err);
      });
  }, []);

  // Combined video list for dropdown options (merging API videos + fallback system videos)
  const dropdownVideoOptions = availableSystemVideos.length > 0
    ? availableSystemVideos.map((v) => ({
        id: v.id,
        title: v.title,
        category: v.category || "Video",
        duration: v.duration || "05:00",
        thumbnailUrl: v.thumbnailUrl || v.mainThumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
        description: v.description || "",
      }))
    : defaultSystemVideos.map((v) => ({
        id: v.videoId,
        title: v.title,
        category: v.category,
        duration: v.duration,
        thumbnailUrl: v.thumbnailUrl,
        description: v.description,
      }));

  // Currently active featured banner object
  const activeBanner = featuredBanners.find((b) => b.id === selectedBannerId) || featuredBanners[0] || {
    id: 0,
    videoId: 0,
    title: creatorName,
    category: "Featured",
    duration: "0:00",
    thumbnailUrl: bannerPreview || "",
    description: creatorDescription,
  };

  const handleBannerSelect = (id: number) => {
    setSelectedBannerId(id);
  };

  const handleDescriptionChange = (newDesc: string) => {
    setFeaturedBanners((prev) =>
      prev.map((b) => (b.id === selectedBannerId ? { ...b, description: newDesc } : b))
    );
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Open modal handler
  const handleOpenAddModal = () => {
    if (dropdownVideoOptions.length > 0) {
      const firstOpt = dropdownVideoOptions[0];
      setSelectedVideoIdForAdd(String(firstOpt.id));
      setBannerDescriptionForAdd(firstOpt.description || "");
    }
    setIsAddModalOpen(true);
  };

  // When dropdown selection changes in modal
  const handleSelectVideoInModal = (vidIdStr: string) => {
    setSelectedVideoIdForAdd(vidIdStr);
    const matched = dropdownVideoOptions.find((o) => String(o.id) === vidIdStr);
    if (matched && matched.description) {
      setBannerDescriptionForAdd(matched.description);
    }
  };

  // Submit new featured video banner (contains only Video Dropdown + Description)
  const handleAddBannerSubmit = () => {
    if (!selectedVideoIdForAdd) return;

    const matched = dropdownVideoOptions.find((o) => String(o.id) === selectedVideoIdForAdd);
    if (!matched) return;

    const newId = Date.now();
    const newBannerItem: FeaturedBannerItem = {
      id: newId,
      videoId: matched.id,
      title: matched.title,
      category: matched.category,
      duration: matched.duration,
      thumbnailUrl: matched.thumbnailUrl,
      description: bannerDescriptionForAdd.trim() || matched.description || "Highlighted video banner",
    };

    setFeaturedBanners((prev) => [newBannerItem, ...prev]);
    setSelectedBannerId(newId);

    // Reset Form
    setIsAddModalOpen(false);
    setSelectedVideoIdForAdd("");
    setBannerDescriptionForAdd("");
  };

  const handleDeleteBanner = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = featuredBanners.filter((b) => b.id !== id);
    setFeaturedBanners(updated);
    if (selectedBannerId === id && updated.length > 0) {
      setSelectedBannerId(updated[0].id);
    }
  };

  const handleSaveChanges = () => {
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Add Featured Video Banner Dialog Modal (Contains ONLY 2 fields: Video Dropdown + Description) */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-400" />
              Add Featured Video Banner
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Select an existing video to showcase its banner thumbnail at the top of the app and provide a custom description for it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Field 1: Video Dropdown */}
            <div>
              <Label htmlFor="select-video" className="text-xs font-semibold text-slate-200 block mb-1.5">
                Select Video <span className="text-rose-400">*</span>
              </Label>
              <Select value={selectedVideoIdForAdd} onValueChange={handleSelectVideoInModal}>
                <SelectTrigger id="select-video" className="w-full bg-slate-950 border-slate-800 text-slate-100 text-sm">
                  <SelectValue placeholder="Choose a video from system..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  {dropdownVideoOptions.map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)} className="focus:bg-slate-800 focus:text-white">
                      <div className="flex items-center gap-2 py-0.5">
                        <span className="font-medium">{opt.title}</span>
                        <span className="text-[10px] text-slate-400">({opt.category})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Field 2: Description for that Banner */}
            <div>
              <Label htmlFor="banner-desc" className="text-xs font-semibold text-slate-200 block mb-1.5">
                Banner Description
              </Label>
              <Textarea
                id="banner-desc"
                rows={4}
                placeholder="Enter description to display below this video banner at the top of the app..."
                value={bannerDescriptionForAdd}
                onChange={(e) => setBannerDescriptionForAdd(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-100 text-sm focus:border-purple-500 leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddBannerSubmit}
              disabled={!selectedVideoIdForAdd}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Branding & Customization</h1>
          <p className="text-slate-400 mt-1 font-medium text-sm">
            Manage creator identity, logo, banner, and featured video banners for app hero section
          </p>
        </div>
        <Button
          onClick={handleSaveChanges}
          className={`gap-2 font-semibold shadow-lg transition-all duration-200 ${
            saveSuccess
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
              : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20"
          }`}
        >
          {saveSuccess ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Saved Successfully!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Creator Identity & Featured Videos */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Creator Identity Card */}
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-white">Creator Identity</CardTitle>
                  <p className="text-xs text-slate-400 font-normal">
                    Manage creator name, tagline, description, banner, and logo branding
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {/* Creator Name */}
              <div>
                <Label htmlFor="creator-name" className="text-slate-200 text-sm font-semibold">
                  Creator Name
                </Label>
                <Input
                  id="creator-name"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="e.g. Creator Academy"
                  className="mt-1.5 bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-purple-500"
                />
              </div>

              {/* Creator Tagline */}
              <div>
                <Label htmlFor="creator-tagline" className="text-slate-200 text-sm font-semibold">
                  Tagline
                </Label>
                <Input
                  id="creator-tagline"
                  value={creatorTagline}
                  onChange={(e) => setCreatorTagline(e.target.value)}
                  placeholder="e.g. Learn from industry leaders"
                  className="mt-1.5 bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-purple-500"
                />
              </div>

              {/* Creator Description */}
              <div>
                <Label htmlFor="creator-desc" className="text-slate-200 text-sm font-semibold">
                  Description
                </Label>
                <Textarea
                  id="creator-desc"
                  rows={3}
                  value={creatorDescription}
                  onChange={(e) => setCreatorDescription(e.target.value)}
                  placeholder="Tell your viewers about your channel or brand..."
                  className="mt-1.5 bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-purple-500"
                />
              </div>

              {/* Creator Banner & Creator Logo Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                {/* Creator Banner Slot */}
                <div>
                  <Label className="text-slate-200 text-sm font-semibold mb-2 block">
                    Creator Banner
                  </Label>
                  <input
                    type="file"
                    ref={bannerInputRef}
                    onChange={handleBannerUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => bannerInputRef.current?.click()}
                    className="relative group cursor-pointer border-2 border-dashed border-slate-800 hover:border-purple-500/70 bg-slate-950/60 rounded-xl overflow-hidden h-28 flex flex-col items-center justify-center transition-all p-2"
                  >
                    {bannerPreview ? (
                      <>
                        <img
                          src={bannerPreview}
                          alt="Creator Banner"
                          className="w-full h-full object-cover rounded-lg opacity-85 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1.5">
                          <Upload className="h-4 w-4 text-purple-400" />
                          Change Banner
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-3">
                        <ImagePlus className="h-6 w-6 mx-auto text-slate-500 group-hover:text-purple-400 mb-1" />
                        <p className="text-xs text-slate-400 font-medium">Click to upload Banner</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Recommended 1200x400px</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Creator Logo Slot */}
                <div>
                  <Label className="text-slate-200 text-sm font-semibold mb-2 block">
                    Creator Logo
                  </Label>
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className="relative group cursor-pointer border-2 border-dashed border-slate-800 hover:border-purple-500/70 bg-slate-950/60 rounded-xl h-28 flex items-center justify-center transition-all p-3"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0 overflow-hidden relative">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Creator Logo" className="w-full h-full object-cover" />
                        ) : (
                          creatorName.slice(0, 2).toUpperCase() || "CA"
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs"
                        >
                          <Upload className="h-3.5 w-3.5 text-purple-400" />
                          Upload Logo
                        </Button>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium truncate">
                          PNG or SVG (512x512px)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Videos Card */}
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-white">Featured Videos</CardTitle>
                    <p className="text-xs text-slate-400 font-normal">
                      Highlight video banners to feature at the top of your app
                    </p>
                  </div>
                </div>

                {/* + Add Button */}
                <Button
                  onClick={handleOpenAddModal}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs gap-1.5 shadow-md shadow-purple-600/20"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Featured Video Banners List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Featured Banners
                  </Label>
                  <span className="text-xs text-slate-400">
                    {featuredBanners.length} Banners Configured
                  </span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {featuredBanners.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
                      <Video className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                      <p className="text-sm font-medium text-slate-400">No featured banners configured</p>
                      <p className="text-xs text-slate-500 mt-1">Click the + Add button to select a video and add its banner</p>
                      <Button
                        onClick={handleOpenAddModal}
                        variant="outline"
                        size="sm"
                        className="mt-3 border-purple-600 text-purple-400 hover:bg-purple-950 text-xs gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Banner
                      </Button>
                    </div>
                  ) : (
                    featuredBanners.map((banner) => {
                      const isSelected = banner.id === selectedBannerId;
                      return (
                        <div
                          key={banner.id}
                          onClick={() => handleBannerSelect(banner.id)}
                          className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-950/50 ring-1 ring-purple-500/30"
                              : "bg-slate-950/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-950"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Selection indicator radio/check */}
                            <div
                              className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
                                isSelected
                                  ? "bg-purple-600 border-purple-500 text-white"
                                  : "border-slate-700 group-hover:border-slate-500"
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>

                            {/* Video Banner Thumbnail */}
                            <div className="h-12 w-20 rounded-lg bg-slate-900 flex-shrink-0 overflow-hidden relative border border-slate-800">
                              <img
                                src={banner.thumbnailUrl}
                                alt={banner.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Banner Video Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                                  {banner.title}
                                </h4>
                                {isSelected && (
                                  <Badge className="bg-purple-600 text-white text-[10px] px-1.5 py-0 h-4">
                                    Shown at Top
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5 truncate">
                                {banner.description || "No description set"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBannerSelect(banner.id);
                              }}
                              className={`text-xs h-8 ${
                                isSelected
                                  ? "bg-purple-600 text-white hover:bg-purple-500"
                                  : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                              }`}
                            >
                              {isSelected ? "Active Banner" : "Show Banner"}
                            </Button>

                            {/* Delete Banner Button */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteBanner(banner.id, e)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
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

              {/* Edit Description for Selected Banner */}
              {activeBanner && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="banner-edit-desc" className="text-slate-200 text-sm font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-400 fill-purple-400/20" />
                      Banner Description
                    </Label>
                    <span className="text-xs text-purple-400 font-medium truncate max-w-[220px]">
                      Editing for: "{activeBanner.title}"
                    </span>
                  </div>
                  <Textarea
                    id="banner-edit-desc"
                    rows={3}
                    value={activeBanner.description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    placeholder="Enter description to display below this banner at the top of the app..."
                    className="bg-slate-900 border-slate-800 text-slate-100 focus:border-purple-500 text-sm leading-relaxed"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live App Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-slate-800 pb-3">
                <CardTitle className="text-base font-bold text-white flex items-center justify-between">
                  <span>Live App Preview</span>
                  <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300 text-[10px] font-normal">
                    Real-time
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4">
                <Tabs defaultValue="mobile">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-950 border border-slate-800 p-1 mb-4">
                    <TabsTrigger
                      value="mobile"
                      className="gap-2 text-xs text-slate-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      Mobile
                    </TabsTrigger>
                    <TabsTrigger
                      value="desktop"
                      className="gap-2 text-xs text-slate-400 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      <Monitor className="h-3.5 w-3.5" />
                      Desktop
                    </TabsTrigger>
                  </TabsList>

                  {/* Mobile Preview Screen */}
                  <TabsContent value="mobile" className="mt-0 focus-visible:outline-none">
                    <div className="mx-auto max-w-[280px] border-[6px] border-slate-800 rounded-[2.5rem] p-2 bg-slate-950 shadow-2xl">
                      <div className="bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800/80 text-white min-h-[460px] flex flex-col justify-between">
                        
                        <div>
                          {/* App Top Bar */}
                          <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow overflow-hidden flex-shrink-0">
                              {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                              ) : (
                                creatorName.slice(0, 2).toUpperCase() || "CA"
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-xs font-bold text-white truncate leading-tight">
                                {creatorName || "Creator Academy"}
                              </h3>
                              <p className="text-[10px] text-slate-400 truncate leading-tight">
                                {creatorTagline || "Learn from the best"}
                              </p>
                            </div>
                          </div>

                          {/* Top Featured Video Banner & Description Display at the top of the app */}
                          <div className="relative group">
                            {/* Featured Video Banner Image */}
                            <div className="h-36 bg-slate-950 overflow-hidden relative">
                              <img
                                src={activeBanner.thumbnailUrl || bannerPreview || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"}
                                alt={activeBanner.title || "Featured Video Banner"}
                                className="w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                              
                              {/* Top Banner Tag */}
                              <span className="absolute top-2 left-2 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                                Featured Banner
                              </span>

                              {/* Play Button Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-10 w-10 rounded-full bg-purple-600/90 border border-purple-400/50 flex items-center justify-center text-white shadow-lg backdrop-blur-sm">
                                  <Play className="h-4 w-4 fill-white ml-0.5" />
                                </div>
                              </div>
                            </div>

                            {/* Banner Description Section rendered right at the top of app */}
                            <div className="p-3 bg-slate-900/95 border-b border-slate-800">
                              <h4 className="text-xs font-bold text-white line-clamp-1">
                                {activeBanner.title}
                              </h4>
                              <p className="text-[10px] text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                                {activeBanner.description || creatorDescription}
                              </p>
                            </div>
                          </div>

                          {/* App Content Placeholder */}
                          <div className="p-3 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              App Content Highlights
                            </span>
                            <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[10px] text-slate-300">
                              <p className="font-semibold text-white truncate">{creatorName}</p>
                              <p className="text-slate-400 mt-0.5 line-clamp-2">{creatorDescription}</p>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Nav Bar */}
                        <div className="flex border-t border-slate-800 bg-slate-950 px-2 py-2">
                          <div className="flex-1 py-1 text-center">
                            <div className="h-3 w-8 mx-auto bg-purple-500 rounded-full" />
                          </div>
                          <div className="flex-1 py-1 text-center">
                            <div className="h-3 w-8 mx-auto bg-slate-800 rounded-full" />
                          </div>
                          <div className="flex-1 py-1 text-center">
                            <div className="h-3 w-8 mx-auto bg-slate-800 rounded-full" />
                          </div>
                        </div>

                      </div>
                    </div>
                  </TabsContent>

                  {/* Desktop Preview Screen */}
                  <TabsContent value="desktop" className="mt-0 focus-visible:outline-none">
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-2xl">
                      {/* Browser Window Header */}
                      <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono ml-2">app.creator.com</span>
                      </div>

                      {/* Desktop App Layout */}
                      <div className="bg-slate-900 min-h-[420px] flex flex-col justify-between text-white">
                        <div>
                          {/* Desktop Top Navbar */}
                          <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                              {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                              ) : (
                                creatorName.slice(0, 2).toUpperCase() || "CA"
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">
                                {creatorName || "Creator Academy"}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {creatorTagline || "Learn from the best creators"}
                              </div>
                            </div>
                          </div>

                          {/* Top Featured Video Banner & Description display */}
                          <div className="p-3">
                            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                              <div className="h-36 relative">
                                <img
                                  src={activeBanner.thumbnailUrl || bannerPreview || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"}
                                  alt="Featured Video Banner"
                                  className="w-full h-full object-cover opacity-85"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                                
                                <span className="absolute top-2 left-2 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Top Showcase
                                </span>

                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="h-11 w-11 rounded-full bg-purple-600 border border-purple-400/50 flex items-center justify-center text-white shadow-xl">
                                    <Play className="h-5 w-5 fill-white ml-0.5" />
                                  </div>
                                </div>
                              </div>

                              {/* Featured Title & Description display */}
                              <div className="p-3 bg-slate-950/90 border-t border-slate-800">
                                <h4 className="text-xs font-bold text-white">
                                  {activeBanner.title}
                                </h4>
                                <p className="text-[10px] text-slate-300 mt-1 leading-relaxed line-clamp-2">
                                  {activeBanner.description || creatorDescription}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="px-3 pb-3">
                            <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[10px] text-slate-300">
                              <p className="font-semibold text-white truncate">{creatorName}</p>
                              <p className="text-slate-400 mt-0.5">{creatorDescription}</p>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
