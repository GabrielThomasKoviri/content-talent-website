import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Video, Users, CreditCard, BarChart3, DollarSign,
  MessageSquare, Palette, FolderTree, Settings, Menu, Bell,
  Search, User, LogOut, Camera, Mail, Phone, MapPin,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "./ui/dialog";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Content", path: "/content", icon: Video },
  { name: "Subscribers", path: "/subscribers", icon: Users },
  { name: "Plans", path: "/plans", icon: CreditCard },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Revenue", path: "/revenue", icon: DollarSign },
  { name: "Community", path: "/community", icon: MessageSquare },
  { name: "Branding", path: "/branding", icon: Palette },
  { name: "Categories", path: "/categories", icon: FolderTree },
  { name: "Settings", path: "/settings", icon: Settings },
];

function ProfileDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("Creator Name");
  const [email, setEmail] = useState("creator@example.com");
  const [phone, setPhone] = useState("+1 (555) 000-0000");
  const [location, setLocation] = useState("New York, USA");
  const [bio, setBio] = useState("Content creator passionate about education and technology.");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
          <DialogDescription>Manage your personal information and public profile</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {name.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shadow">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{name}</p>
              <p className="text-sm text-gray-500">Content Creator</p>
              <Button variant="link" className="p-0 h-auto text-xs text-purple-600 mt-0.5">Change photo</Button>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5 mb-1"><User className="h-3.5 w-3.5" />Display Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1"><Mail className="h-3.5 w-3.5" />Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1"><Phone className="h-3.5 w-3.5" />Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1"><MapPin className="h-3.5 w-3.5" />Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-1 block">Bio</Label>
            <textarea
              className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 resize-none outline-none focus:ring-2 focus:ring-purple-600/20"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3 text-center">
            {[
              { label: "Videos", value: "5" },
              { label: "Subscribers", value: "12.5K" },
              { label: "Total Views", value: "2.4M" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-bold text-purple-700">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className={saved ? "bg-green-600 hover:bg-green-600" : ""}>
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <nav className="space-y-1 p-4">
      {navigation.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path !== "/" && location.pathname.startsWith(item.path));
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-purple-50 text-purple-700" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white hidden lg:block">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600" />
            <span className="font-semibold text-lg">Creator Admin</span>
          </div>
        </div>
        <NavLinks />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}>
          <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex h-16 items-center border-b border-gray-200 px-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600" />
                <span className="font-semibold text-lg">Creator Admin</span>
              </div>
            </div>
            <NavLinks onLinkClick={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 items-center gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input type="search" placeholder="Search..." className="pl-9 bg-white text-slate-900 border border-slate-200" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white text-sm font-bold">CR</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">Creator Name</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-semibold">Creator Name</p>
                    <p className="text-xs text-gray-500 font-normal">creator@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" />Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
