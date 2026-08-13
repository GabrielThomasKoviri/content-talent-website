import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowUpRight, ArrowDownRight, Users, Video, DollarSign, Eye, UserCheck, Loader2 } from "lucide-react";
import { ComposedChart, Line, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getSubscribers, getVideos, ApiSubscriber } from "../services/apiService";

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

const topContent = [
  { title: "Complete React Tutorial 2024", views: "124K", revenue: "$3,245" },
  { title: "Advanced JavaScript Patterns", views: "98K", revenue: "$2,890" },
  { title: "Building Scalable Apps", views: "87K", revenue: "$2,567" },
  { title: "Design System Fundamentals", views: "76K", revenue: "$2,123" },
];

export default function Dashboard() {
  const [subscribers, setSubscribers] = useState<ApiSubscriber[]>([]);
  const [totalVideosCount, setTotalVideosCount] = useState<number>(324);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSubscribers().catch(() => []),
      getVideos().catch(() => ({ data: [], pagination: { total: 0 } })),
    ]).then(([subData, videoRes]) => {
      if (Array.isArray(subData) && subData.length > 0) {
        setSubscribers(subData);
      }
      const count = (videoRes as any)?.pagination?.total ?? (videoRes as any)?.total ?? videoRes?.data?.length;
      if (count !== undefined) {
        setTotalVideosCount(count);
      }
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const stats = [
    {
      name: "Total Users",
      value: subscribers.length > 0 ? (18920 + subscribers.length - 5).toLocaleString() : "18,920",
      change: "+9.4%",
      trend: "up",
      icon: UserCheck,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      name: "Total Subscribers",
      value: subscribers.length > 0 ? (12543 + subscribers.length - 5).toLocaleString() : "12,543",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Total Content",
      value: totalVideosCount.toString(),
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Studio Dashboard
            <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full font-mono font-medium">
              LIVE API
            </span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Real-time performance metrics, subscriber growth, and stream telemetry.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-slate-900/60 backdrop-blur-xl border-slate-800/80 hover:border-purple-500/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/5 group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`${stat.bgColor} p-3 rounded-xl border border-white/5 group-hover:scale-105 transition-transform duration-200`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
                  stat.trend === "up" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                }`}>
                  {stat.trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
                <div className="text-xs font-medium text-slate-400 mt-1">{stat.name}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-slate-900/60 backdrop-blur-xl border-slate-800/80 shadow-xl">
          <CardHeader className="border-b border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
              Revenue & Subscriber Analytics
              <span className="text-xs font-normal text-slate-400">Past 6 Months</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={revenueData}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis key="x" dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis key="y" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip key="tooltip" contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                <Legend key="legend" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar key="bar-subscribers" dataKey="subscribers" fill="#3b82f6" name="Subscribers" radius={[6, 6, 0, 0]} opacity={0.8} />
                <Line key="line-revenue" type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={3} name="Revenue ($)" dot={{ fill: '#a855f7', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-slate-900/60 backdrop-blur-xl border-slate-800/80 shadow-xl">
          <CardHeader className="border-b border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold text-white">Viewers by Platform</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2.5">
              {deviceData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-300 font-medium">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 w-36">
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                    </div>
                    <span className="text-slate-400 font-mono w-8 text-right">{d.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800/80 shadow-xl">
          <CardHeader className="border-b border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
              Recent Mobile Users & Subscribers
              <span className="text-xs bg-slate-800 text-purple-300 border border-slate-700 px-2.5 py-0.5 rounded-full font-normal">
                {subscribers.length} total
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-purple-400" /> Loading active subscribers...
              </div>
            ) : (
              <div className="space-y-3.5">
                {subscribers.slice(0, 5).map((subscriber, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-800 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {subscriber.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-100">{subscriber.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{subscriber.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {subscriber.plan}
                      </span>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{subscriber.joinDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800/80 shadow-xl">
          <CardHeader className="border-b border-slate-800/60 pb-4">
            <CardTitle className="text-lg font-semibold text-white">Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3.5">
              {topContent.map((content, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-800 transition-all">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-11 w-16 rounded-lg bg-gradient-to-br from-purple-900/80 to-slate-900 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Video className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-200 truncate">{content.title}</div>
                      <div className="text-xs text-emerald-400 font-mono mt-0.5">{content.revenue} revenue</div>
                    </div>
                  </div>
                  <div className="text-right pl-3">
                    <div className="font-bold text-sm text-purple-300 font-mono">{content.views}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">views</div>
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

