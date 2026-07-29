import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import {
  MessageSquare, Megaphone, Plus, Send, ThumbsUp, Trash2,
  SlidersHorizontal, Search, X, Calendar, ChevronLeft, ChevronRight,
  CornerDownRight, Edit,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";

// ── Data ───────────────────────────────────────────────────────────────────

type Announcement = { id: number; title: string; content: string; date: string; views: number };
type Comment = { id: number; author: string; content: string; video: string; category: string; likes: number; date: string; time: string };

const initialAnnouncements: Announcement[] = [
  { id: 1, title: "New Course Series Coming Next Week!", content: "Excited to announce our new advanced JavaScript series starting Monday. Premium members get early access!", date: "2024-06-20", views: 8234 },
  { id: 2, title: "Platform Maintenance Schedule", content: "We'll be performing routine maintenance on June 25th from 2-4 AM EST. The platform may be briefly unavailable.", date: "2024-06-18", views: 5621 },
  { id: 3, title: "Thank You for 10K Subscribers!", content: "We've reached an incredible milestone! To celebrate, all subscribers get 20% off annual plans this week.", date: "2024-06-15", views: 12543 },
];

const allComments: Comment[] = [
  { id: 1, author: "John Anderson", content: "This tutorial on React hooks was incredibly helpful! Clear explanations and great examples.", video: "Complete React Tutorial 2024", category: "Education", likes: 24, date: "2024-06-21", time: "10:30 AM" },
  { id: 2, author: "Sarah Miller", content: "Could you make a video about state management with Redux Toolkit?", video: "Advanced JavaScript Patterns", category: "Programming", likes: 12, date: "2024-06-21", time: "07:15 AM" },
  { id: 3, author: "Mike Johnson", content: "The audio quality could be better in this one, but great content overall!", video: "Building Scalable Apps", category: "Technology", likes: 8, date: "2024-06-20", time: "03:45 PM" },
  { id: 4, author: "Emma Davis", content: "Could we get a downloadable cheat sheet for this?", video: "Design System Fundamentals", category: "Design", likes: 6, date: "2024-06-20", time: "11:00 AM" },
  { id: 5, author: "Alex Torres", content: "Amazing breakdown of design tokens! Would love a follow-up on theming.", video: "Design System Fundamentals", category: "Design", likes: 31, date: "2024-06-19", time: "09:20 AM" },
  { id: 6, author: "Priya Sharma", content: "When will the next module drop? This series is outstanding.", video: "Complete React Tutorial 2024", category: "Education", likes: 17, date: "2024-06-19", time: "06:50 PM" },
  { id: 7, author: "Carlos Mendez", content: "Best React content on the internet, no debate.", video: "Complete React Tutorial 2024", category: "Education", likes: 45, date: "2024-06-18", time: "02:10 PM" },
  { id: 8, author: "Nina Patel", content: "I had trouble with the useEffect cleanup section — could you do a short follow-up?", video: "Advanced JavaScript Patterns", category: "Programming", likes: 9, date: "2024-06-18", time: "08:45 AM" },
  { id: 9, author: "James Liu", content: "This really helped me land my first dev job. Thank you!", video: "Building Scalable Apps", category: "Technology", likes: 19, date: "2024-06-17", time: "05:30 PM" },
  { id: 10, author: "Fatima Hassan", content: "Subscribed just for this series. Worth every penny!", video: "Design System Fundamentals", category: "Design", likes: 22, date: "2024-06-17", time: "11:20 AM" },
  { id: 11, author: "Marco Silva", content: "Chapter 4 is pure gold. Rewatched it three times.", video: "Complete React Tutorial 2024", category: "Education", likes: 38, date: "2024-06-16", time: "09:00 AM" },
  { id: 12, author: "Sophie Kim", content: "Please add subtitles — watching with sound off at work!", video: "Advanced JavaScript Patterns", category: "Programming", likes: 14, date: "2024-06-16", time: "03:15 PM" },
];

const categories = ["Education", "Programming", "Technology", "Design"];
const videosByCategory: Record<string, string[]> = {
  Education: ["Complete React Tutorial 2024"],
  Programming: ["Advanced JavaScript Patterns", "State Management Deep Dive"],
  Technology: ["Building Scalable Apps"],
  Design: ["Design System Fundamentals"],
};

const engagementStats = [
  { name: "Total Comments", value: "3,245", icon: MessageSquare, color: "text-blue-600", bgColor: "bg-blue-50" },
  { name: "Announcements", value: "12", icon: Megaphone, color: "text-purple-600", bgColor: "bg-purple-50" },
  { name: "Engagement Rate", value: "68.3%", icon: ThumbsUp, color: "text-green-600", bgColor: "bg-green-50" },
];

const PAGE_SIZE = 5;

// ── Date picker dialog ─────────────────────────────────────────────────────
function DatePickerDialog({ open, onClose, value, onChange }: {
  open: boolean; onClose: () => void; value: string; onChange: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Filter by Date</DialogTitle>
          <DialogDescription>Show comments posted on a specific date</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Input type="date" value={local} onChange={(e) => setLocal(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onChange(""); setLocal(""); onClose(); }}>Clear</Button>
          <Button onClick={() => { onChange(local); onClose(); }}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Video picker dialog (category → videos list with search) ───────────────
function VideoPickerDialog({ open, onClose, category, onSelect }: {
  open: boolean; onClose: () => void; category: string; onSelect: (v: string) => void;
}) {
  const [videoSearch, setVideoSearch] = useState("");
  const videos = videosByCategory[category] ?? [];
  const filtered = videos.filter((v) => v.toLowerCase().includes(videoSearch.toLowerCase()));
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Select Video — {category}</DialogTitle>
          <DialogDescription>Pick a video to filter comments by</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search videos..." className="pl-9" value={videoSearch} onChange={(e) => setVideoSearch(e.target.value)} />
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No videos found</p>
            ) : (
              filtered.map((v) => (
                <button
                  key={v}
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm hover:bg-purple-50 hover:text-purple-700 transition-colors border border-transparent hover:border-purple-200"
                  onClick={() => { onSelect(v); onClose(); setVideoSearch(""); }}
                >
                  {v}
                </button>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Announcement edit dialog ───────────────────────────────────────────────
function AnnouncementEditDialog({ open, onClose, announcement }: {
  open: boolean; onClose: () => void; announcement: Announcement | null;
}) {
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [content, setContent] = useState(announcement?.content ?? "");
  if (!announcement) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
          <DialogDescription>Update your announcement details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} />
          </div>
          <div>
            <Label>Target Audience</Label>
            <Select defaultValue="all">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscribers</SelectItem>
                <SelectItem value="premium">Premium Only</SelectItem>
                <SelectItem value="basic">Basic Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Community() {
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVideo, setFilterVideo] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [filterMinLikes, setFilterMinLikes] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  // Dialog states
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);
  const [replyOpenId, setReplyOpenId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const activeFilterCount =
    (filterCategory !== "all" ? 1 : 0) +
    (filterVideo !== "all" ? 1 : 0) +
    (filterDate ? 1 : 0) +
    (filterMinLikes ? 1 : 0);

  const resetFilters = () => {
    setFilterCategory("all"); setFilterVideo("all"); setFilterDate("");
    setFilterMinLikes(""); setSortBy("newest"); setSearch(""); setPage(1);
  };

  const handleCategoryChange = (v: string) => {
    setFilterCategory(v);
    setFilterVideo("all"); // reset video when category changes
    setPage(1);
  };

  const filtered = allComments
    .filter((c) => {
      if (filterCategory !== "all" && c.category !== filterCategory) return false;
      if (filterVideo !== "all" && c.video !== filterVideo) return false;
      if (filterDate && c.date !== filterDate) return false;
      if (filterMinLikes && c.likes < parseInt(filterMinLikes)) return false;
      if (search && !c.author.toLowerCase().includes(search.toLowerCase()) && !c.content.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
      if (sortBy === "oldest") return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
      if (sortBy === "most-liked") return b.likes - a.likes;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Controlled dialogs */}
      <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>Share important updates with your subscribers</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input placeholder="Enter announcement title" /></div>
            <div><Label>Content</Label><Textarea placeholder="Write your announcement here..." rows={6} /></div>
            <div>
              <Label>Target Audience</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscribers</SelectItem>
                  <SelectItem value="premium">Premium Only</SelectItem>
                  <SelectItem value="basic">Basic Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnouncementOpen(false)}>Cancel</Button>
            <Button className="gap-2" onClick={() => setAnnouncementOpen(false)}><Send className="h-4 w-4" />Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnnouncementEditDialog
        open={!!editAnnouncement}
        onClose={() => setEditAnnouncement(null)}
        announcement={editAnnouncement}
      />

      <DatePickerDialog
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        value={filterDate}
        onChange={(v) => { setFilterDate(v); setPage(1); }}
      />

      <VideoPickerDialog
        open={videoPickerOpen}
        onClose={() => setVideoPickerOpen(false)}
        category={filterCategory === "all" ? "" : filterCategory}
        onSelect={(v) => { setFilterVideo(v); setPage(1); }}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-gray-600 mt-1">Engage with your audience and manage discussions</p>
        </div>
        <Button className="gap-2" onClick={() => setAnnouncementOpen(true)}>
          <Plus className="h-4 w-4" />New Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {engagementStats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.name}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader className="border-b"><CardTitle>Recent Announcements</CardTitle></CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {initialAnnouncements.map((a) => (
              <div key={a.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{a.title}</h3>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                </div>
                <p className="text-gray-600 mb-3">{a.content}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">{a.date}</span>
                    <span className="text-gray-500">{a.views.toLocaleString()} views</span>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditAnnouncement(a)}>
                    <Edit className="h-3.5 w-3.5" />Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comments with filters + pagination */}
      <Card>
        <CardHeader className="border-b">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle>Comments</CardTitle>
                <span className="text-sm text-gray-500">{filtered.length} of {allComments.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input placeholder="Search comments..." className="pl-9 w-56"
                    value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <Button variant={showFilters ? "default" : "outline"} className="gap-2"
                  onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 bg-white text-purple-700 rounded-full text-xs font-bold px-1.5">{activeFilterCount}</span>
                  )}
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                {/* Row 1: Category + Video + Date + Likes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Category */}
                  <div>
                    <Label className="text-xs mb-1 block text-gray-500">Category</Label>
                    <Select value={filterCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Video — click opens dialog, requires category */}
                  <div>
                    <Label className="text-xs mb-1 block text-gray-500">Video</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-sm w-full justify-start gap-1.5"
                      disabled={filterCategory === "all"}
                      onClick={() => setVideoPickerOpen(true)}
                      title={filterCategory === "all" ? "Select a category first" : ""}
                    >
                      <span className="truncate flex-1 text-left">
                        {filterVideo !== "all" ? filterVideo : filterCategory === "all" ? "Select category first" : "All Videos"}
                      </span>
                      {filterVideo !== "all" && (
                        <X className="h-3 w-3 flex-shrink-0 text-gray-400 hover:text-red-500"
                          onClick={(e) => { e.stopPropagation(); setFilterVideo("all"); setPage(1); }} />
                      )}
                    </Button>
                  </div>

                  {/* Date */}
                  <div>
                    <Label className="text-xs mb-1 block text-gray-500">Date</Label>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm w-full justify-start"
                      onClick={() => setDatePickerOpen(true)}>
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate flex-1 text-left">{filterDate || "Pick date"}</span>
                      {filterDate && (
                        <X className="h-3 w-3 flex-shrink-0 text-gray-400 hover:text-red-500"
                          onClick={(e) => { e.stopPropagation(); setFilterDate(""); setPage(1); }} />
                      )}
                    </Button>
                  </div>

                  {/* Min likes — input */}
                  <div>
                    <Label className="text-xs mb-1 block text-gray-500">Min Likes</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="e.g. 10"
                      className="h-8 text-sm"
                      value={filterMinLikes}
                      onChange={(e) => { setFilterMinLikes(e.target.value); setPage(1); }}
                    />
                  </div>
                </div>

                {/* Sort + clear */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500">Sort by:</Label>
                    <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                      <SelectTrigger className="h-8 text-sm w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest first</SelectItem>
                        <SelectItem value="oldest">Oldest first</SelectItem>
                        <SelectItem value="most-liked">Most liked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-gray-500 h-8" onClick={resetFilters}>
                      <X className="h-3 w-3" />Clear filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No comments match your filters</p>
              <Button variant="link" className="text-purple-600 mt-1" onClick={resetFilters}>Clear all filters</Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginated.map((comment) => (
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {comment.author.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{comment.author}</span>
                          <Badge variant="outline" className="text-xs">{comment.category}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          on "{comment.video}" · {comment.date} at {comment.time}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 ml-13">{comment.content}</p>

                    <div className="flex items-center justify-between ml-13">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <ThumbsUp className="h-4 w-4" />{comment.likes}
                      </div>
                      <Button
                        variant="ghost" size="sm"
                        className="gap-1.5"
                        onClick={() => { setReplyOpenId(replyOpenId === comment.id ? null : comment.id); setReplyText(""); }}
                      >
                        <CornerDownRight className="h-4 w-4" />Reply
                      </Button>
                    </div>

                    {/* Inline reply box */}
                    {replyOpenId === comment.id && (
                      <div className="mt-3 ml-13 flex gap-2">
                        <Input
                          placeholder={`Reply to ${comment.author}…`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 h-9"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          disabled={!replyText.trim()}
                          onClick={() => { setReplyOpenId(null); setReplyText(""); }}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setReplyOpenId(null); setReplyText(""); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} comments
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8"
                      disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={p === safePage ? "default" : "outline"}
                        size="icon" className="h-8 w-8 text-xs"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                    <Button variant="outline" size="icon" className="h-8 w-8"
                      disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
