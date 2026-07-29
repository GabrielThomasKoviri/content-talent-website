import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { Search, MoreVertical, Mail, UserX, Crown, Users, TrendingUp, DollarSign, SlidersHorizontal, X, Calendar } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const subscriberStats = [
  { name: "Total Subscribers", value: "12,543", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
  { name: "Growth Rate", value: "+12.5%", icon: TrendingUp, color: "text-green-600", bgColor: "bg-green-50" },
  { name: "Avg. Revenue/User", value: "$3.60", icon: DollarSign, color: "text-orange-600", bgColor: "bg-orange-50" },
];

const planChartData = [
  { name: "Premium", value: 8234, color: "#8b5cf6" },
  { name: "Basic", value: 3064, color: "#3b82f6" },
  { name: "Trial", value: 1245, color: "#10b981" },
];

const subscribers = [
  { id: 1, name: "John Anderson", email: "john.anderson@example.com", plan: "Premium", status: "Active", joinDate: "2024-01-15", revenue: "$29.99" },
  { id: 2, name: "Sarah Miller", email: "sarah.miller@example.com", plan: "Basic", status: "Active", joinDate: "2024-02-20", revenue: "$9.99" },
  { id: 3, name: "Mike Johnson", email: "mike.johnson@example.com", plan: "Premium", status: "Active", joinDate: "2024-01-08", revenue: "$29.99" },
  { id: 4, name: "Emma Davis", email: "emma.davis@example.com", plan: "Premium", status: "Cancelled", joinDate: "2023-11-12", revenue: "$0.00" },
  { id: 5, name: "Tom Wilson", email: "tom.wilson@example.com", plan: "Basic", status: "Active", joinDate: "2024-03-05", revenue: "$9.99" },
  { id: 6, name: "Lisa Brown", email: "lisa.brown@example.com", plan: "Premium", status: "Active", joinDate: "2024-02-14", revenue: "$29.99" },
  { id: 7, name: "David Martinez", email: "david.martinez@example.com", plan: "Basic", status: "Trial", joinDate: "2024-06-18", revenue: "$0.00" },
  { id: 8, name: "Rachel Green", email: "rachel.green@example.com", plan: "Premium", status: "Active", joinDate: "2023-12-20", revenue: "$29.99" },
];

const uniqueDates = [...new Set(subscribers.map((s) => s.joinDate))].sort((a, b) => b.localeCompare(a));

function DatePickerDialog({ open, onClose, value, onChange }: {
  open: boolean; onClose: () => void; value: string; onChange: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Filter by Date</DialogTitle>
          <DialogDescription>Show subscribers who joined on this date</DialogDescription>
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

export default function Subscribers() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const activeCount = [filterPlan, filterStatus].filter((v) => v !== "all").length + (filterDate ? 1 : 0);

  const resetFilters = () => { setFilterPlan("all"); setFilterStatus("all"); setFilterDate(""); setSearch(""); };

  const filtered = subscribers.filter((s) => {
    if (filterPlan !== "all" && s.plan !== filterPlan) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (filterDate && s.joinDate !== filterDate) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <DatePickerDialog open={datePickerOpen} onClose={() => setDatePickerOpen(false)} value={filterDate} onChange={setFilterDate} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscribers</h1>
          <p className="text-gray-600 mt-1">Manage your subscriber base and memberships</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {subscriberStats.map((stat) => (
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

      {/* Pie chart by plan */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribers by Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height={220} className="max-w-xs">
              <PieChart>
                <Pie data={planChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value">
                  {planChartData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3 w-full">
              {planChartData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-sm font-medium">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.round((d.value / 12543) * 100)}%`, backgroundColor: d.color }} />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">{d.value.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 w-10 text-right">{Math.round((d.value / 12543) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriber table with working filters */}
      <Card>
        <CardHeader className="border-b">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle>All Subscribers</CardTitle>
                <span className="text-sm text-gray-500">{filtered.length} of {subscribers.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input type="search" placeholder="Search subscribers..." className="pl-9 w-56"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Button variant={showFilters ? "default" : "outline"} className="gap-2"
                  onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeCount > 0 && (
                    <span className="ml-1 bg-white text-purple-700 rounded-full text-xs font-bold px-1.5">{activeCount}</span>
                  )}
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <Label className="text-xs mb-1 block text-gray-500">Plan</Label>
                    <Select value={filterPlan} onValueChange={setFilterPlan}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Basic">Basic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block text-gray-500">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Trial">Trial</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block text-gray-500">Join Date</Label>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm w-full justify-start"
                      onClick={() => setDatePickerOpen(true)}>
                      <Calendar className="h-3.5 w-3.5" />
                      {filterDate || "Pick date"}
                      {filterDate && (
                        <X className="h-3 w-3 ml-auto text-gray-400 hover:text-red-500"
                          onClick={(e) => { e.stopPropagation(); setFilterDate(""); }} />
                      )}
                    </Button>
                  </div>
                </div>
                {activeCount > 0 && (
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-gray-500 h-8" onClick={resetFilters}>
                    <X className="h-3 w-3" />Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No subscribers match your filters</p>
              <Button variant="link" className="text-purple-600 mt-1" onClick={resetFilters}>Clear all filters</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscriber</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Monthly Revenue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {subscriber.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{subscriber.name}</div>
                          <div className="text-sm text-gray-500">{subscriber.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subscriber.plan === "Premium" ? "default" : "secondary"} className="gap-1">
                        {subscriber.plan === "Premium" && <Crown className="h-3 w-3" />}
                        {subscriber.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subscriber.status === "Active" ? "default" : subscriber.status === "Trial" ? "outline" : "secondary"}>
                        {subscriber.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{subscriber.joinDate}</TableCell>
                    <TableCell className="font-semibold text-green-600">{subscriber.revenue}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Send Email</DropdownMenuItem>
                          <DropdownMenuItem><Crown className="mr-2 h-4 w-4" />Change Plan</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600"><UserX className="mr-2 h-4 w-4" />Suspend</DropdownMenuItem>
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
    </div>
  );
}
