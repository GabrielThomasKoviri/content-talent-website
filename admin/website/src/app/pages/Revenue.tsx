import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, Download, Calendar, Loader2,
  RefreshCw, AlertCircle, Building2, Tv, ShieldCheck, FileText, CheckCircle2,
  Clock, ExternalLink
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  getDashboardStats,
  getDashboardAnalytics,
  getDashboardSubscriptionBreakdown,
  getDashboardRecentActivity,
  getMonetizationSummary,
  getMonetizationAnalytics,
  getMonetizationSettlements,
  ApiDashboardStats,
  ApiAnalytics,
  ApiSubscriptionBreakdown,
  ApiRecentActivityUser,
  ApiMonetizationSummary,
  ApiMonetizationAnalytics,
  ApiSettlementsResponse,
} from "../services/apiService";

export default function Revenue() {
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState<string>("30");
  const [activeChartTab, setActiveChartTab] = useState<string>("subscriptions");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ApiDashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<ApiAnalytics | null>(null);
  const [breakdown, setBreakdown] = useState<ApiSubscriptionBreakdown | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<ApiRecentActivityUser[]>([]);
  const [monetizationSummary, setMonetizationSummary] = useState<ApiMonetizationSummary | null>(null);
  const [monetizationAnalytics, setMonetizationAnalytics] = useState<ApiMonetizationAnalytics | null>(null);
  const [settlements, setSettlements] = useState<ApiSettlementsResponse | null>(null);

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

  const currencyCode = monetizationSummary?.currency || stats?.currency || "INR";

  const currencySymbol = useMemo(() => {
    if (currencyCode.toUpperCase() === "USD") return "$";
    if (currencyCode.toUpperCase() === "EUR") return "€";
    if (currencyCode.toUpperCase() === "GBP") return "£";
    return "₹";
  }, [currencyCode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        analyticsRes,
        breakdownRes,
        activityRes,
        monSummaryRes,
        monAnalyticsRes,
        settlementsRes,
      ] = await Promise.all([
        getDashboardStats({ range: apiRange }).catch(() => null),
        getDashboardAnalytics({ range: apiRange, interval: selectedRange === "365" ? "month" : "week" }).catch(() => null),
        getDashboardSubscriptionBreakdown({ range: apiRange }).catch(() => null),
        getDashboardRecentActivity({ filter: "subscribers", limit: 10 }).catch(() => ({ items: [] })),
        getMonetizationSummary().catch(() => null),
        getMonetizationAnalytics({ range: apiRange }).catch(() => null),
        getMonetizationSettlements({ page: 1, limit: 12 }).catch(() => null),
      ]);

      setStats(statsRes);
      setAnalytics(analyticsRes);
      setBreakdown(breakdownRes);
      setRecentTransactions(activityRes?.items || []);
      setMonetizationSummary(monSummaryRes);
      setMonetizationAnalytics(monAnalyticsRes);
      setSettlements(settlementsRes);
    } catch (err) {
      console.warn("Failed to load revenue data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiRange]);

  const revenueStats = useMemo(() => {
    const totalRev = (stats?.totalRevenue.current || 0) + (monetizationSummary?.lifetime_earnings || 0);

    return [
      {
        name: "Total Platform Revenue",
        value: stats ? `${currencySymbol}${totalRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${currencySymbol}0.00`,
        change: stats
          ? `${stats.totalRevenue.growth_percentage >= 0 ? "+" : ""}${stats.totalRevenue.growth_percentage.toFixed(1)}% period`
          : "0%",
        trend: stats && stats.totalRevenue.growth_percentage >= 0 ? ("up" as const) : ("down" as const),
        icon: DollarSign,
        color: "text-slate-900",
        bgColor: "bg-slate-100",
        subtext: "Subscriptions & Ad Revenue",
      },
      {
        name: "Active Month Ad Earnings",
        value: monetizationSummary?.current_period.estimated_earnings != null
          ? `${currencySymbol}${monetizationSummary.current_period.estimated_earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : "Accruing",
        change: monetizationSummary
          ? `${monetizationSummary.current_period.impressions.toLocaleString()} ad impressions`
          : "0 impressions",
        trend: "up" as const,
        icon: Tv,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        subtext: monetizationSummary?.current_period.ecpm != null
          ? `Net eCPM: ${currencySymbol}${monetizationSummary.current_period.ecpm.toFixed(2)}`
          : "Audited on month-end",
      },
      {
        name: "Pending Payout (Net-30)",
        value: monetizationSummary?.pending_payout
          ? `${currencySymbol}${monetizationSummary.pending_payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : "No pending payout",
        change: monetizationSummary?.pending_payout
          ? `Disbursement on ${monetizationSummary.pending_payout.payout_date}`
          : "Net-30 cycle active",
        trend: "up" as const,
        icon: Calendar,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        subtext: monetizationSummary?.pending_payout?.status === "pending_bank_details"
          ? "Action required: Bank details"
          : "Reconciled & locked for 28th",
      },
      {
        name: "Active Subscriptions",
        value: stats ? stats.totalSubscribers.current.toLocaleString() : "0",
        change: stats
          ? `${stats.totalSubscribers.growth_percentage >= 0 ? "+" : ""}${stats.totalSubscribers.growth_percentage.toFixed(1)}%`
          : "0%",
        trend: stats && stats.totalSubscribers.growth_percentage >= 0 ? ("up" as const) : ("down" as const),
        icon: CreditCard,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        subtext: `${stats?.totalUsers.current.toLocaleString() || 0} registered members`,
      },
      {
        name: "Lifetime Settled Earnings",
        value: monetizationSummary
          ? `${currencySymbol}${monetizationSummary.lifetime_earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `${currencySymbol}0.00`,
        change: monetizationSummary?.last_payout
          ? `Last UTR: ${monetizationSummary.last_payout.utr || "Verified"}`
          : "Bank disbursement record",
        trend: "up" as const,
        icon: ShieldCheck,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        subtext: monetizationSummary?.last_payout
          ? `Paid ${currencySymbol}${monetizationSummary.last_payout.amount.toLocaleString()} on ${monetizationSummary.last_payout.payout_date}`
          : "No prior disbursements",
      },
    ];
  }, [stats, monetizationSummary, currencySymbol]);

  const handleExport = () => {
    if (activeChartTab === "monetization") {
      if (!monetizationAnalytics?.data_points || monetizationAnalytics.data_points.length === 0) {
        alert("No ad monetization data points available to export.");
        return;
      }
      const headers = ["Date", "Impressions", "eCPM", "Estimated Earnings"];
      const rows = monetizationAnalytics.data_points.map((p) => [
        p.date,
        p.impressions,
        p.ecpm != null ? p.ecpm : "N/A",
        p.estimated_earnings != null ? p.estimated_earnings : "N/A",
      ]);
      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ad_monetization_${apiRange}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (!analytics?.dataPoints || analytics.dataPoints.length === 0) {
      alert("No revenue data points available to export.");
      return;
    }
    const headers = ["Date", "Period", "Revenue", "Subscribers", "Active Users"];
    const rows = analytics.dataPoints.map((p) => [
      p.date,
      p.label,
      p.revenue,
      p.subscribers,
      p.users,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `revenue_${apiRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">Paid</Badge>;
      case "reconciled":
        return <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-medium">Reconciled</Badge>;
      case "pending_bank_details":
        return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-medium">Missing Bank</Badge>;
      case "accruing":
      default:
        return <Badge className="bg-slate-100 text-slate-700 border border-slate-200 font-medium">Accruing</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Revenue & Monetization</h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Track subscription revenue, programmatic ad earnings, and monthly bank settlements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedRange} onValueChange={(v) => setSelectedRange(v)}>
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
            disabled={loading}
          >
            <Download className="h-4 w-4 text-slate-600" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Missing Bank Profile Warning Banner */}
      {monetizationSummary && !monetizationSummary.payout_profile_configured && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 text-sm">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Bank Payout Profile Not Configured</p>
              <p className="text-xs text-amber-800 mt-0.5">
                You have active ad earnings and upcoming monthly settlements. Please register your bank details in Settings to receive scheduled disbursements on the 28th.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate("/settings")}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium shrink-0 rounded-xl shadow-xs transition-all gap-1.5"
          >
            <Building2 className="h-3.5 w-3.5" />
            Configure Bank Account
          </Button>
        </div>
      )}

      {/* Revenue Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {revenueStats.map((stat) => (
          <Card key={stat.name} className="border border-slate-200/80 bg-white rounded-2xl shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`${stat.bgColor} ${stat.color} p-2.5 rounded-xl`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    stat.trend === "up"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 truncate">
                  {loading && !stats ? (
                    <span className="inline-block w-20 h-7 bg-slate-100 animate-pulse rounded-lg" />
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-700 mt-1">{stat.name}</div>
                {stat.subtext && <div className="text-xs text-slate-500 font-medium mt-1">{stat.subtext}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Chart Section with Tabs */}
      <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-xs">
        <CardHeader className="border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Performance & Earnings Analytics</CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">Time-series telemetry for subscriptions and ad impressions</p>
          </div>
          <Tabs value={activeChartTab} onValueChange={setActiveChartTab} className="w-auto">
            <TabsList className="bg-slate-100 border border-slate-200/80 rounded-xl p-1">
              <TabsTrigger value="subscriptions" className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs text-slate-600 font-medium">
                Subscriptions Revenue
              </TabsTrigger>
              <TabsTrigger value="monetization" className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs text-slate-600 font-medium">
                Ad Monetization (IMA VAST)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-6">
          {activeChartTab === "subscriptions" ? (
            analytics?.dataPoints && analytics.dataPoints.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analytics.dataPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === "Revenue" ? `${currencySymbol}${Number(value).toLocaleString()}` : value,
                      name,
                    ]}
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
                  <Bar dataKey="revenue" fill="#0F172A" radius={[6, 6, 0, 0]} name="Revenue" />
                  <Bar dataKey="subscribers" fill="#2563EB" radius={[6, 6, 0, 0]} name="Subscribers" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex flex-col items-center justify-center text-slate-400">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-2" />
                ) : (
                  <>
                    <DollarSign className="h-10 w-10 mb-2 stroke-[1.5] text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No subscription revenue data recorded for this period yet.</p>
                  </>
                )}
              </div>
            )
          ) : (
            monetizationAnalytics?.data_points && monetizationAnalytics.data_points.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={monetizationAnalytics.data_points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name.includes("Earnings") ? `${currencySymbol}${Number(value).toFixed(2)}` : Number(value).toLocaleString(),
                      name,
                    ]}
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
                  <Bar yAxisId="left" dataKey="impressions" fill="#0F172A" radius={[6, 6, 0, 0]} name="Ad Impressions" />
                  <Bar yAxisId="right" dataKey="estimated_earnings" fill="#2563EB" radius={[6, 6, 0, 0]} name="Est. Earnings" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex flex-col items-center justify-center text-slate-400">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-2" />
                ) : (
                  <>
                    <Tv className="h-10 w-10 mb-2 stroke-[1.5] text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No video ad impressions recorded for this period yet.</p>
                  </>
                )}
              </div>
            )
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Plan */}
        <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">Revenue by Plan Type</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Tier distribution and monetary contribution</p>
          </CardHeader>
          <CardContent className="pt-6">
            {breakdown?.tiers && breakdown.tiers.length > 0 ? (
              <div className="space-y-4">
                {breakdown.tiers.map((item) => (
                  <div key={item.planId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <div className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                          {item.name}
                          {item.badgeText && (
                            <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded-full font-medium">
                              {item.badgeText}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-normal">
                          {item.subscribers.toLocaleString()} subscribers
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-sm">
                          {currencySymbol}{item.revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 font-normal">
                          {item.revenuePercentage.toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(Math.max(item.revenuePercentage, 0), 100)}%`,
                          backgroundColor: item.color || "#0F172A",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-slate-400">
                <CreditCard className="h-8 w-8 mb-2 stroke-[1.5] text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No subscription tiers data recorded.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payout & Net-30 Settlement Information */}
        <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-xs">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Earnings & Settlement (Net-30)</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Disbursement cycle and bank transfer schedule</p>
            </div>
            <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
              28th Monthly Payout
            </Badge>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Active Month Accrual */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Active Month ({monetizationSummary?.current_period.period || "Current"})
                </span>
                <Calendar className="h-4 w-4 text-slate-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {monetizationSummary?.current_period.estimated_earnings != null
                  ? `${currencySymbol}${monetizationSummary.current_period.estimated_earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "Accruing"}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                <span>{monetizationSummary?.current_period.impressions.toLocaleString() || 0} verified ad impressions</span>
                <span>Expected payout: {monetizationSummary?.current_period.expected_payout_date || "28th of next month"}</span>
              </div>
            </div>

            {/* Pending Payout Block */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Pending Payout ({monetizationSummary?.pending_payout?.period || "Previous Month"})</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {monetizationSummary?.pending_payout
                    ? `${currencySymbol}${monetizationSummary.pending_payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "None pending"}
                </p>
              </div>
              <div className="text-right">
                {monetizationSummary?.pending_payout?.status ? (
                  getStatusBadge(monetizationSummary.pending_payout.status)
                ) : (
                  <Badge variant="outline" className="text-slate-500 border-slate-200 bg-white">All Cleared</Badge>
                )}
                {monetizationSummary?.pending_payout?.payout_date && (
                  <p className="text-[11px] text-slate-500 mt-1">Disbursement on {monetizationSummary.pending_payout.payout_date}</p>
                )}
              </div>
            </div>

            {/* Last Payout Block */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Last Completed Payout</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {monetizationSummary?.last_payout
                    ? `${currencySymbol}${monetizationSummary.last_payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "No completed payouts yet"}
                </p>
              </div>
              <div className="text-right">
                {monetizationSummary?.last_payout?.utr ? (
                  <div className="font-mono text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                    UTR: {monetizationSummary.last_payout.utr}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
                {monetizationSummary?.last_payout?.payout_date && (
                  <p className="text-[11px] text-slate-500 mt-1">Settled on {monetizationSummary.last_payout.payout_date}</p>
                )}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
              <p>• <strong>Net-30 Settlement Schedule:</strong> Google ad impressions are audited monthly; disbursements are executed on the 28th.</p>
              <p>• <strong>Minimum Payout Threshold:</strong> ₹500.00 (balances below threshold automatically roll over to the next cycle).</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Official Monthly Statements & Bank UTR Ledger Table */}
      <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Monthly Payout Statements & UTR Ledger</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Itemized monthly reconciliation statements and bank transfer references</p>
          </div>
          {settlements?.total ? (
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 text-xs">
              {settlements.total} Total Statements
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="p-0">
          {settlements?.items && settlements.items.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Statement ID</TableHead>
                  <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Billing Month</TableHead>
                  <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider text-right">Ad Impressions</TableHead>
                  <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider text-right">Net eCPM</TableHead>
                  <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider text-right">Net Payout</TableHead>
                  <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Bank UTR / Date</TableHead>
                  <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider text-right">Statement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.items.map((stmt) => (
                  <TableRow key={stmt.statement_id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                        {stmt.statement_id}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {stmt.month}
                    </TableCell>
                    <TableCell className="text-right text-slate-600 font-mono text-xs">
                      {stmt.impressions_count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-slate-600 font-mono text-xs">
                      {currencySymbol}{stmt.ecpm.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900 font-mono text-sm">
                      {currencySymbol}{stmt.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(stmt.status)}
                    </TableCell>
                    <TableCell>
                      {stmt.transaction_reference ? (
                        <div>
                          <div className="font-mono text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded inline-block">
                            {stmt.transaction_reference}
                          </div>
                          {stmt.settled_at && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(stmt.settled_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Scheduled on 28th</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {stmt.invoice_url ? (
                        <a
                          href={stmt.invoice_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-900 hover:text-slate-700 transition-colors underline font-medium"
                        >
                          PDF <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-2" />
              ) : (
                <>
                  <FileText className="h-10 w-10 mb-2 stroke-[1.5] text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">No monthly settlement statements archived yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Statements are generated automatically on the 20th of each calendar month.</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border border-slate-200/80 bg-white rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-bold text-slate-900">Recent Subscriber Conversions</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Live subscription activations from mobile users</p>
        </CardHeader>
        <CardContent className="p-0">
          {recentTransactions.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Account ID</TableHead>
                  <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Subscriber</TableHead>
                  <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Plan</TableHead>
                  <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Subscribed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-700 font-medium">
                      SUB-{transaction.id.toString().padStart(5, "0")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800">
                        {transaction.name || "Subscriber"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {transaction.email || "Registered Account"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 font-normal text-xs">
                        {transaction.planName || "Active Plan"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={transaction.isPaid ? "default" : "secondary"}
                        className={
                          transaction.isPaid
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium"
                            : "bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                        }
                      >
                        {transaction.isPaid ? "Active Paid" : "Free Member"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">
                      {transaction.subscribedAt
                        ? new Date(transaction.subscribedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : new Date(transaction.joinedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-2" />
              ) : (
                <>
                  <CreditCard className="h-10 w-10 mb-2 stroke-[1.5] text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">No subscriber conversions recorded yet.</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
