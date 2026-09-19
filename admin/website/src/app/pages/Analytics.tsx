import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "../components/ui/button";
import { Download, TrendingUp, TrendingDown, Eye, Users, PlayCircle, Loader2, CreditCard, Video, RefreshCw, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  getDashboardStats,
  getDashboardAnalytics,
  getDashboardSubscriptionBreakdown,
  getVideos,
  ApiDashboardStats,
  ApiAnalytics,
  ApiSubscriptionBreakdown,
  ApiVideo,
} from "../services/apiService";

export default function Analytics() {
  const [selectedRange, setSelectedRange] = useState<string>("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ApiDashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<ApiAnalytics | null>(null);
  const [breakdown, setBreakdown] = useState<ApiSubscriptionBreakdown | null>(null);
  const [videos, setVideos] = useState<ApiVideo[]>([]);

  // Map selected range days to API range parameter
  const apiRange = useMemo(() => {
    switch (selectedRange) {
      case "7":
        return "7d";
      case "30":
        return "30d";
      case "90":
        return "90d";
      case "365":
        return "12m";
      default:
        return "30d";
    }
  }, [selectedRange]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, analyticsRes, breakdownRes, videosRes] = await Promise.all([
        getDashboardStats({ range: apiRange }).catch(() => null),
        getDashboardAnalytics({ range: apiRange, interval: selectedRange === "7" || selectedRange === "30" ? "day" : "month" }).catch(() => null),
        getDashboardSubscriptionBreakdown({ range: apiRange }).catch(() => null),
        getVideos({ status: "published", sort: "views", limit: 50 }).catch(() => ({ data: [] })),
      ]);

      setStats(statsRes);
      setAnalytics(analyticsRes);
      setBreakdown(breakdownRes);
      setVideos(videosRes?.data || []);
    } catch (err: any) {
      console.warn("Error fetching analytics data", err);
      setError(err?.message || "Failed to load live audience analytics. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiRange]);

  // Aggregate views and video counts per category from real video catalog
  const categoryData = useMemo(() => {
    const catMap: Record<string, { views: number; count: number }> = {};
    videos.forEach((v) => {
      const cat = v.category || "General";
      if (!catMap[cat]) catMap[cat] = { views: 0, count: 0 };
      const vViews = typeof v.views === "number" ? v.views : parseInt(String(v.views || 0), 10) || 0;
      catMap[cat].views += vViews;
      catMap[cat].count += 1;
    });

    return Object.keys(catMap).map((cat) => ({
      category: cat,
      views: catMap[cat].views,
      videos: catMap[cat].count,
    }));
  }, [videos]);

  // Top performing videos for reach distribution
  const topVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => {
        const va = typeof a.views === "number" ? a.views : parseInt(String(a.views || 0), 10) || 0;
        const vb = typeof b.views === "number" ? b.views : parseInt(String(b.views || 0), 10) || 0;
        return vb - va;
      })
      .slice(0, 5);
  }, [videos]);

  const maxVideoViews = useMemo(() => {
    if (topVideos.length === 0) return 1;
    const topViews = typeof topVideos[0].views === "number" ? topVideos[0].views : parseInt(String(topVideos[0].views || 0), 10) || 0;
    return Math.max(topViews, 1);
  }, [topVideos]);

  // Dynamic KPI metrics computed from live API stats
  const metrics = [
    {
      name: "Total Views",
      value: stats ? stats.totalViews.current.toLocaleString() : "0",
      change: stats
        ? `${stats.totalViews.growth_percentage >= 0 ? "+" : ""}${stats.totalViews.growth_percentage.toFixed(1)}%`
        : "0%",
      trend: stats && stats.totalViews.growth_percentage >= 0 ? "up" : "down",
      icon: Eye,
      iconBg: "bg-slate-100 text-slate-800",
    },
    {
      name: "Total Users",
      value: stats ? stats.totalUsers.current.toLocaleString() : "0",
      change: stats
        ? `${stats.totalUsers.growth_percentage >= 0 ? "+" : ""}${stats.totalUsers.growth_percentage.toFixed(1)}%`
        : "0%",
      trend: stats && stats.totalUsers.growth_percentage >= 0 ? "up" : "down",
      icon: Users,
      iconBg: "bg-blue-50 text-blue-700",
    },
    {
      name: "Active Subscribers",
      value: stats ? stats.totalSubscribers.current.toLocaleString() : "0",
      change: stats
        ? `${stats.totalSubscribers.growth_percentage >= 0 ? "+" : ""}${stats.totalSubscribers.growth_percentage.toFixed(1)}%`
        : "0%",
      trend: stats && stats.totalSubscribers.growth_percentage >= 0 ? "up" : "down",
      icon: CreditCard,
      iconBg: "bg-indigo-50 text-indigo-700",
    },
    {
      name: "Published Content",
      value: stats ? `${stats.totalContent.published} Videos` : "0 Videos",
      change: stats ? `+${stats.totalContent.recently_added} new` : "0 new",
      trend: "up",
      icon: PlayCircle,
      iconBg: "bg-emerald-50 text-emerald-700",
    },
  ];

  const handleExport = () => {
    if (!analytics?.dataPoints || analytics.dataPoints.length === 0) {
      alert("No analytics data available to export.");
      return;
    }
    const headers = ["Date", "Label", "Views", "Active Users", "Subscribers", "Revenue"];
    const rows = analytics.dataPoints.map((p) => [
      p.date,
      p.label,
      p.views,
      p.users,
      p.subscribers,
      p.revenue,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `analytics_${apiRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Track your live content performance and audience insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedRange} onValueChange={(val) => setSelectedRange(val)}>
            <SelectTrigger className="w-40 bg-white border-slate-200 text-slate-800 rounded-xl focus:ring-slate-900 shadow-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-800 rounded-xl shadow-xl">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            disabled={loading}
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-slate-900" : "text-slate-600"}`} />
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl shadow-xs"
            onClick={handleExport}
            disabled={!analytics?.dataPoints || analytics.dataPoints.length === 0}
          >
            <Download className="h-4 w-4 text-slate-600" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Fallback Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-sm">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            className="bg-white border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl shrink-0 text-xs font-semibold"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.name} className="border border-slate-200/80 bg-white rounded-2xl shadow-xs">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${metric.iconBg}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    metric.trend === "up"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {metric.change}
                </div>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-slate-900">
                {loading && !stats ? (
                  <span className="inline-block w-20 h-8 bg-slate-100 animate-pulse rounded-lg" />
                ) : (
                  metric.value
                )}
              </div>
              <div className="text-sm font-semibold text-slate-700 mt-1">{metric.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Views & Audience Activity Chart */}
      <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-xs">
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Views & Active Audience Trends</CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">Timeline performance for selected period</p>
          </div>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-600" />}
        </CardHeader>
        <CardContent className="pt-6">
          {analytics?.dataPoints && analytics.dataPoints.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={analytics.dataPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2E8F0",
                    borderRadius: "12px",
                    color: "#0F172A",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ color: "#64748B", fontSize: "12px", paddingTop: "8px" }} />
                <Area
                  key="views"
                  type="monotone"
                  dataKey="views"
                  stroke="#0F172A"
                  strokeWidth={2.5}
                  fill="#0F172A"
                  fillOpacity={0.05}
                  name="Views"
                />
                <Area
                  key="users"
                  type="monotone"
                  dataKey="users"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="#2563EB"
                  fillOpacity={0.04}
                  name="Active Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[340px] flex flex-col items-center justify-center text-slate-400">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-2" />
              ) : (
                <>
                  <Eye className="h-10 w-10 mb-2 stroke-[1.5] text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">No activity recorded for this period yet.</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Engagement by Category */}
        <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">Content Views by Category</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Aggregated audience reach across categories</p>
          </CardHeader>
          <CardContent className="pt-6">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="category" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E2E8F0",
                      borderRadius: "12px",
                      color: "#0F172A",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#64748B", fontSize: "12px", paddingTop: "8px" }} />
                  <Bar key="views" dataKey="views" fill="#0F172A" radius={[6, 6, 0, 0]} name="Total Views" />
                  <Bar key="videos" dataKey="videos" fill="#94A3B8" radius={[6, 6, 0, 0]} name="Videos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
                <Video className="h-10 w-10 mb-2 stroke-[1.5] text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No category distribution data available.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Tier Distribution */}
        <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">Subscription Tier Distribution</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Subscriber share across membership tiers</p>
          </CardHeader>
          <CardContent className="pt-6">
            {breakdown?.tiers && breakdown.tiers.length > 0 ? (
              <div className="space-y-4">
                {breakdown.tiers.map((tier) => (
                  <div key={tier.planId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{tier.name}</span>
                        {tier.badgeText && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded-full font-medium">
                            {tier.badgeText}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-600 font-medium">
                        {tier.subscribers.toLocaleString()} subscribers ({tier.subscribersPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(Math.max(tier.subscribersPercentage, 0), 100)}%`,
                          backgroundColor: tier.color || "#0F172A",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[180px] flex flex-col items-center justify-center text-slate-400">
                <CreditCard className="h-8 w-8 mb-2 stroke-[1.5] text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No subscription tiers data recorded.</p>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Audience Insights</div>
              <div className="space-y-2 text-xs text-slate-600 font-medium">
                <div className="flex items-center justify-between">
                  <span>Paid subscriber conversion rate:</span>
                  <span className="text-slate-900 font-semibold">
                    {stats && stats.totalUsers.current > 0
                      ? `${((stats.totalSubscribers.current / stats.totalUsers.current) * 100).toFixed(1)}%`
                      : "0.0%"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total active subscribers:</span>
                  <span className="text-slate-900 font-semibold">
                    {breakdown?.totalSubscribers.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Published library reach:</span>
                  <span className="text-slate-900 font-semibold">
                    {stats?.totalContent.published || 0} active videos
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content Distribution */}
      <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-bold text-slate-900">Top Performing Content</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Highest audience reach across published videos</p>
        </CardHeader>
        <CardContent className="pt-6">
          {topVideos.length > 0 ? (
            <div className="space-y-4">
              {topVideos.map((video) => {
                const vViews = typeof video.views === "number" ? video.views : parseInt(String(video.views || 0), 10) || 0;
                const pct = Math.round((vViews / maxVideoViews) * 100);
                return (
                  <div
                    key={video.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        {video.thumbnailUrl || video.mainThumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl || video.mainThumbnailUrl}
                            alt={video.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-400">
                            <Video className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-slate-800 truncate">{video.title}</div>
                        <div className="text-xs text-slate-500 font-normal">{video.category || "General"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 self-end sm:self-center">
                      <div className="text-right">
                        <div className="font-bold text-sm text-slate-900">{vViews.toLocaleString()}</div>
                        <div className="text-[11px] text-slate-500 font-normal">views</div>
                      </div>
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400">
              <Video className="h-10 w-10 mb-2 stroke-[1.5] text-slate-300" />
              <p className="text-sm font-medium text-slate-600">No published videos found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
