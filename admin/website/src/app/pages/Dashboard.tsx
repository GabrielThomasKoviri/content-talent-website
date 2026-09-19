import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Video,
  DollarSign,
  Eye,
  UserCheck,
  Loader2,
  RefreshCw,
  PlaySquare,
  Clock,
  Sparkles,
  Layers,
  AlertCircle,
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboardStats,
  getDashboardAnalytics,
  getDashboardSubscriptionBreakdown,
  getDashboardRecentActivity,
  getVideos,
  ApiDashboardStats,
  ApiAnalytics,
  ApiSubscriptionBreakdown,
  ApiRecentActivityUser,
  ApiVideo,
} from "../services/apiService";

const RANGES = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "12 Months", value: "12m" },
];

const RECENT_FILTERS: Array<{ label: string; value: "all" | "subscribers" | "users" }> = [
  { label: "All Activity", value: "all" },
  { label: "Subscribers", value: "subscribers" },
  { label: "Signups", value: "users" },
];

function formatNumber(num: number): string {
  if (isNaN(num)) return "0";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function Dashboard() {
  const [range, setRange] = useState<string>("30d");
  const [recentFilter, setRecentFilter] = useState<"all" | "subscribers" | "users">("all");

  const [stats, setStats] = useState<ApiDashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<ApiAnalytics | null>(null);
  const [breakdown, setBreakdown] = useState<ApiSubscriptionBreakdown | null>(null);
  const [recentActivity, setRecentActivity] = useState<ApiRecentActivityUser[]>([]);
  const [topVideos, setTopVideos] = useState<ApiVideo[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activityLoading, setActivityLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Dashboard Stats, Analytics, and Subscription Breakdown
  const fetchDashboardMetrics = useCallback(async (selectedRange: string) => {
    try {
      setError(null);
      const [statsRes, analyticsRes, breakdownRes] = await Promise.all([
        getDashboardStats({ range: selectedRange }).catch((e) => {
          console.error("Stats API error:", e);
          return null;
        }),
        getDashboardAnalytics({ range: selectedRange }).catch((e) => {
          console.error("Analytics API error:", e);
          return null;
        }),
        getDashboardSubscriptionBreakdown({ range: selectedRange }).catch((e) => {
          console.error("Breakdown API error:", e);
          return null;
        }),
      ]);
      if (statsRes) setStats(statsRes);
      if (analyticsRes) setAnalytics(analyticsRes);
      if (breakdownRes) setBreakdown(breakdownRes);
      if (!statsRes && !analyticsRes && !breakdownRes) {
        setError("Unable to retrieve live dashboard analytics. Please check your connection and retry.");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard metrics:", err);
      setError("An unexpected error occurred while loading dashboard metrics.");
    }
  }, []);

  // Fetch Recent Activity based on selected filter (Safe Array Extraction)
  const fetchRecentActivity = useCallback(async (filter: "all" | "subscribers" | "users") => {
    setActivityLoading(true);
    try {
      const res = await getDashboardRecentActivity({ filter, limit: 6 });
      // Safeguard against object envelope { items: [...] } vs direct array
      const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
      setRecentActivity(items);
    } catch (err) {
      console.error("Failed to fetch recent activity:", err);
      setRecentActivity([]);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  // Content Breakdown Counts (published, scheduled, drafts)
  const [contentCounts, setContentCounts] = useState<{
    published: number;
    scheduled: number;
    drafts: number;
  }>({ published: 0, scheduled: 0, drafts: 0 });

  const fetchContentCounts = useCallback(async () => {
    try {
      const res = await getVideos({ limit: 100 });
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      let pub = 0;
      let sched = 0;
      let draft = 0;
      rawList.forEach((v) => {
        const s = (v.status || "").toLowerCase();
        if (s === "published") pub++;
        else if (s === "scheduled") sched++;
        else if (s === "draft" || s === "drafts") draft++;
      });
      setContentCounts({ published: pub, scheduled: sched, drafts: draft });
    } catch (err) {
      console.warn("Failed to fetch video breakdown counts:", err);
    }
  }, []);

  // Fetch Top Performing Videos
  const fetchTopVideos = useCallback(async () => {
    try {
      const res = await getVideos({ status: "published", limit: 4, sort: "views" });
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const sorted = [...rawList].sort((a, b) => {
        const vA = typeof a.views === "number" ? a.views : parseInt(String(a.views || 0), 10) || 0;
        const vB = typeof b.views === "number" ? b.views : parseInt(String(b.views || 0), 10) || 0;
        return vB - vA;
      });
      setTopVideos(sorted.slice(0, 4));
    } catch (err) {
      console.error("Failed to fetch top videos:", err);
      setTopVideos([]);
    }
  }, []);

  // Initial and range-change loader
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDashboardMetrics(range),
      fetchRecentActivity(recentFilter),
      fetchTopVideos(),
      fetchContentCounts(),
    ]).finally(() => {
      setLoading(false);
    });
  }, [range, fetchDashboardMetrics, fetchRecentActivity, fetchTopVideos, fetchContentCounts]);

  // When recent filter changes
  const handleFilterChange = (filter: "all" | "subscribers" | "users") => {
    setRecentFilter(filter);
    fetchRecentActivity(filter);
  };

  // Manual refresh
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardMetrics(range),
      fetchRecentActivity(recentFilter),
      fetchTopVideos(),
      fetchContentCounts(),
    ]);
    setRefreshing(false);
  };

  const currencySymbol = stats?.currency === "INR" ? "₹" : "$";

  // Resolved video breakdown counts
  const publishedCount = stats?.totalContent?.published !== undefined ? stats.totalContent.published : contentCounts.published;
  const scheduledCount = stats?.totalContent?.scheduled !== undefined ? stats.totalContent.scheduled : contentCounts.scheduled;
  const draftsCount = stats?.totalContent?.drafts !== undefined ? stats.totalContent.drafts : contentCounts.drafts;

  // KPI cards aligned with FastAPI GrowthMetric schema (Bress flat aesthetic)
  const kpiCards = [
    {
      name: "Total Users",
      value: stats ? stats.totalUsers.current.toLocaleString() : "—",
      change: stats
        ? `${stats.totalUsers.growth_percentage >= 0 ? "+" : ""}${stats.totalUsers.growth_percentage.toFixed(1)}%`
        : "—",
      trend: stats && stats.totalUsers.growth_percentage >= 0 ? ("up" as const) : ("down" as const),
      icon: UserCheck,
      color: "text-slate-900",
      bgColor: "bg-slate-100",
      subtext: stats ? `Previous: ${stats.totalUsers.previous.toLocaleString()}` : "Previous: 0",
    },
    {
      name: "Total Subscribers",
      value: stats ? stats.totalSubscribers.current.toLocaleString() : "—",
      change: stats
        ? `${stats.totalSubscribers.growth_percentage >= 0 ? "+" : ""}${stats.totalSubscribers.growth_percentage.toFixed(1)}%`
        : "—",
      trend: stats && stats.totalSubscribers.growth_percentage >= 0 ? ("up" as const) : ("down" as const),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      subtext: stats ? `Previous: ${stats.totalSubscribers.previous.toLocaleString()}` : "Previous: 0",
    },
    {
      name: "Total Content",
      value: stats ? stats.totalContent.total.toLocaleString() : "—",
      change: `${publishedCount} Published • ${scheduledCount} Scheduled • ${draftsCount} Draft`,
      trend: "up" as const,
      icon: Video,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      subtext: stats ? `Previous: ${(stats.totalContent as any).previous ?? 0}` : "Previous: 0",
    },
    {
      name: "Total Revenue",
      value: stats
        ? `${currencySymbol}${stats.totalRevenue.current.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
        : "—",
      change: stats
        ? `${stats.totalRevenue.growth_percentage >= 0 ? "+" : ""}${stats.totalRevenue.growth_percentage.toFixed(1)}%`
        : "—",
      trend: stats && stats.totalRevenue.growth_percentage >= 0 ? ("up" as const) : ("down" as const),
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      subtext: stats
        ? `Previous: ${currencySymbol}${stats.totalRevenue.previous.toLocaleString()}`
        : "Previous: 0",
    },
    {
      name: "Total Views",
      value: stats ? formatNumber(stats.totalViews.current) : "—",
      change: stats
        ? `${stats.totalViews.growth_percentage >= 0 ? "+" : ""}${stats.totalViews.growth_percentage.toFixed(1)}%`
        : "—",
      trend: stats && stats.totalViews.growth_percentage >= 0 ? ("up" as const) : ("down" as const),
      icon: Eye,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      subtext: stats ? `Previous: ${formatNumber(stats.totalViews.previous)}` : "Previous: 0",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Studio Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div className="bg-slate-100 border border-slate-200/80 rounded-xl p-1 flex items-center gap-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  range === r.value
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing || loading}
            title="Refresh Data"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-slate-900" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error notification banner if API fails */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleManualRefresh} className="border-rose-200 text-rose-800 hover:bg-rose-100 bg-white">
            Retry
          </Button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((stat) => (
          <Card
            key={stat.name}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
          >
            <CardContent className="p-5 flex flex-col gap-4">
              {/* Top row: icon + trend badge */}
              <div className="flex items-center justify-between">
                <div
                  className={`${stat.bgColor} p-2.5 rounded-xl group-hover:scale-105 transition-transform duration-200`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                {stat.name === "Total Content" ? (
                  /* Content card: show trend as "up" since more content is positive */
                  <div className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {loading && !stats ? "—" : `${(stats?.totalContent?.total ?? 0) >= 0 ? "+" : ""}${stats?.totalContent?.total ?? 0}`}
                  </div>
                ) : (
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg ${
                      stat.trend === "up"
                        ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                        : "text-rose-700 bg-rose-50 border border-rose-200"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {stat.change}
                  </div>
                )}
              </div>

              {/* Bottom row: value + label + subtext */}
              <div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {loading && !stats ? (
                    <div className="h-7 w-20 bg-slate-100 animate-pulse rounded-lg" />
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-sm font-medium text-slate-600 mt-0.5">{stat.name}</div>

                {/* Subtext / breakdown */}
                {stat.name === "Total Content" ? (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {loading && !stats ? <div className="h-3 w-4 bg-emerald-200 animate-pulse rounded" /> : publishedCount} Published
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      {loading && !stats ? <div className="h-3 w-4 bg-amber-200 animate-pulse rounded" /> : scheduledCount} Scheduled
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {loading && !stats ? <div className="h-3 w-4 bg-slate-200 animate-pulse rounded" /> : draftsCount} Draft
                    </span>
                  </div>
                ) : (
                  stat.subtext && (
                    <div className="text-xs text-slate-400 font-medium mt-2 truncate">
                      {stat.subtext}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue & Subscriber Analytics Chart */}
        <Card className="lg:col-span-4 bg-white border border-slate-200/80 shadow-xs rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  Audience & Content Telemetry
                </CardTitle>
                <div className="text-xs text-slate-500 mt-0.5">
                  Chronological performance across the selected {range.toUpperCase()} window
                </div>
              </div>
              {stats && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-900 font-semibold">
                    {currencySymbol}{stats.totalRevenue.current.toLocaleString()}
                    <span className="text-slate-400 font-normal ml-1">rev</span>
                  </span>
                  <span className="text-blue-600 font-semibold">
                    {stats.totalViews.current.toLocaleString()}
                    <span className="text-slate-400 font-normal ml-1">views</span>
                  </span>
                  <span className="text-emerald-600 font-semibold">
                    +{stats.totalUsers.current.toLocaleString()}
                    <span className="text-slate-400 font-normal ml-1">users</span>
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading && !analytics ? (
              <div className="h-[300px] flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
                Loading analytics telemetry...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={analytics?.dataPoints || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="label"
                    stroke="#E2E8F0"
                    tick={{ fill: "#64748B", fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#E2E8F0"
                    tick={{ fill: "#64748B", fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#E2E8F0"
                    tick={{ fill: "#64748B", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E2E8F0",
                      borderRadius: "12px",
                      color: "#0F172A",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px" }} />
                  <Bar
                    yAxisId="left"
                    dataKey="views"
                    fill="#0F172A"
                    name="Views"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="users"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Signups"
                    dot={{ fill: "#10B981", r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    name={`Revenue (${currencySymbol})`}
                    dot={{ fill: "#2563EB", r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Subscription Tier Distribution */}
        <Card className="lg:col-span-3 bg-white border border-slate-200/80 shadow-xs rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900">
                Subscription Tier Distribution
              </CardTitle>
              {breakdown && (
                <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full font-mono font-medium">
                  {breakdown.totalSubscribers} subscribers
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading && !breakdown ? (
              <div className="h-[260px] flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
                Loading tier breakdown...
              </div>
            ) : breakdown && breakdown.tiers && breakdown.tiers.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={
                        breakdown.totalSubscribers > 0
                          ? breakdown.tiers
                          : [{ name: "Registered Free Accounts", subscribersPercentage: 100, color: "#64748B" }]
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      dataKey="subscribersPercentage"
                      paddingAngle={3}
                    >
                      {breakdown.tiers.map((entry, index) => {
                        const tierColors = ["#0F172A", "#2563EB", "#10B981", "#F59E0B", "#6366F1"];
                        const fill = entry.color || tierColors[index % tierColors.length];
                        return (
                          <Cell
                            key={`cell-${entry.planId || index}`}
                            fill={fill}
                            stroke="#FFFFFF"
                            strokeWidth={2}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      formatter={(v, name, item) => [
                        `${v}% (${item?.payload?.subscribers ?? 0} subs)`,
                        item?.payload?.name || name,
                      ]}
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E2E8F0",
                        borderRadius: "12px",
                        color: "#0F172A",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-3 space-y-2.5">
                  {breakdown.tiers.map((t, idx) => {
                    const tierColors = ["#0F172A", "#2563EB", "#10B981", "#F59E0B", "#6366F1"];
                    const color = t.color || tierColors[idx % tierColors.length];
                    return (
                      <div key={t.planId || t.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-slate-700 font-medium">{t.name}</span>
                          {t.badgeText && (
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                              {t.badgeText}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 w-44">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.max(t.subscribersPercentage, 2)}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                          <span className="text-slate-500 font-mono w-16 text-right">
                            {t.subscribers} ({t.subscribersPercentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm">
                No active subscription tier data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables Row: Recent Activity & Top Performing Videos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity Feed */}
        <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  Recent Activity & Signups
                </CardTitle>
                <div className="text-xs text-slate-500 mt-0.5">Live member telemetry from mobile app users</div>
              </div>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {RECENT_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => handleFilterChange(f.value)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                      recentFilter === f.value
                        ? "bg-white text-slate-900 font-medium shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {activityLoading ? (
              <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-slate-900" /> Loading recent activity...
              </div>
            ) : !Array.isArray(recentActivity) || recentActivity.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No member records found for this filter.
              </div>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name || "User"}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-sm shadow-2xs flex-shrink-0">
                          {(user.name || user.email || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-slate-900 truncate">
                          {user.name || (user.email ? user.email.split("@")[0] : `User #${user.id}`)}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {user.email || "Registered via App"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {user.planName || (user.isPaid ? "Paid Member" : "Free Plan")}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            user.isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {user.isPaid ? "Subscriber" : "Signup"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {formatDate(user.subscribedAt || user.joinedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Content */}
        <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">Top Performing Content</CardTitle>
                <div className="text-xs text-slate-500 mt-0.5">Top viewed streams & video titles</div>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md font-mono font-medium">
                Catalog Rank
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loading && topVideos.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-slate-900" /> Loading video rankings...
              </div>
            ) : topVideos.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No published video content found.
              </div>
            ) : (
              <div className="space-y-1">
                {topVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {video.thumbnailUrl || video.mainThumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl || video.mainThumbnailUrl}
                          alt={video.title}
                          className="h-11 w-16 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-11 w-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <PlaySquare className="h-5 w-5 text-slate-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-900 truncate">{video.title}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          {video.category && (
                            <span className="text-slate-700 font-medium">{video.category}</span>
                          )}
                          {video.duration && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="h-3 w-3" /> {video.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right pl-3 flex-shrink-0">
                      <div className="font-bold text-sm text-slate-900 font-mono">
                        {typeof video.views === "number"
                          ? video.views.toLocaleString()
                          : video.views || "0"}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">views</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



