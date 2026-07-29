import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowUpRight, ArrowDownRight, Users, Video, DollarSign, Eye, UserCheck } from "lucide-react";
import { ComposedChart, Line, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const stats = [
  {
    name: "Total Users",
    value: "18,920",
    change: "+9.4%",
    trend: "up",
    icon: UserCheck,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    name: "Total Subscribers",
    value: "12,543",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    name: "Total Content",
    value: "324",
    change: "+8.2%",
    trend: "up",
    icon: Video,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    name: "Monthly Revenue",
    value: "$45,231",
    change: "+23.1%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    name: "Total Views",
    value: "2.4M",
    change: "-3.2%",
    trend: "down",
    icon: Eye,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

const revenueData = [
  { month: "Jan", revenue: 12000, subscribers: 450 },
  { month: "Feb", revenue: 18000, subscribers: 680 },
  { month: "Mar", revenue: 24000, subscribers: 820 },
  { month: "Apr", revenue: 32000, subscribers: 1100 },
  { month: "May", revenue: 38000, subscribers: 1350 },
  { month: "Jun", revenue: 45231, subscribers: 1543 },
];

const deviceData = [
  { name: "Android", value: 38, color: "#3ddc84" },
  { name: "iOS", value: 28, color: "#555555" },
  { name: "Windows", value: 18, color: "#0078d4" },
  { name: "macOS", value: 10, color: "#a2aaad" },
  { name: "Smart TV", value: 4, color: "#f59e0b" },
  { name: "Other", value: 2, color: "#e5e7eb" },
];

const recentSubscribers = [
  { name: "John Anderson", email: "john@example.com", plan: "Premium", date: "2 hours ago" },
  { name: "Sarah Miller", email: "sarah@example.com", plan: "Basic", date: "5 hours ago" },
  { name: "Mike Johnson", email: "mike@example.com", plan: "Premium", date: "1 day ago" },
  { name: "Emma Davis", email: "emma@example.com", plan: "Premium", date: "1 day ago" },
  { name: "Tom Wilson", email: "tom@example.com", plan: "Basic", date: "2 days ago" },
];

const topContent = [
  { title: "Complete React Tutorial 2024", views: "124K", revenue: "$3,245" },
  { title: "Advanced JavaScript Patterns", views: "98K", revenue: "$2,890" },
  { title: "Building Scalable Apps", views: "87K", revenue: "$2,567" },
  { title: "Design System Fundamentals", views: "76K", revenue: "$2,123" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.name}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue & Subscriber Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={revenueData}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis key="x" dataKey="month" stroke="#6b7280" />
                <YAxis key="y" stroke="#6b7280" />
                <Tooltip key="tooltip" />
                <Legend key="legend" />
                <Bar key="bar-subscribers" dataKey="subscribers" fill="#3b82f6" name="Subscribers" opacity={0.7} />
                <Line key="line-revenue" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Revenue ($)" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Viewers by Device</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-2">
              {deviceData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-700">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2 w-36">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                    </div>
                    <span className="text-gray-500 w-8 text-right">{d.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubscribers.map((subscriber, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {subscriber.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{subscriber.name}</div>
                      <div className="text-sm text-gray-500">{subscriber.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-purple-600">{subscriber.plan}</div>
                    <div className="text-xs text-gray-500">{subscriber.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topContent.map((content, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-12 w-20 rounded bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center">
                      <Video className="h-6 w-6 text-purple-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{content.title}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-purple-700">{content.views}</div>
                    <div className="text-xs text-gray-400">views</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
