import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "../components/ui/button";
import { Calendar, Download, TrendingUp, TrendingDown, Eye, Clock, Users, PlayCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const viewsData = [
  { date: "Jun 1", views: 12400, watchTime: 8200 },
  { date: "Jun 5", views: 15600, watchTime: 10500 },
  { date: "Jun 10", views: 18900, watchTime: 12800 },
  { date: "Jun 15", views: 21200, watchTime: 14200 },
  { date: "Jun 20", views: 24500, watchTime: 16800 },
  { date: "Jun 21", views: 26100, watchTime: 17500 },
];

const engagementData = [
  { category: "Education", engagement: 85, avgDuration: 42 },
  { category: "Technology", engagement: 78, avgDuration: 38 },
  { category: "Programming", engagement: 92, avgDuration: 48 },
  { category: "Design", engagement: 71, avgDuration: 35 },
  { category: "Business", engagement: 65, avgDuration: 30 },
];

const deviceData = [
  { device: "Mobile", users: 6543, percentage: 52 },
  { device: "Desktop", users: 4231, percentage: 34 },
  { device: "Tablet", users: 1769, percentage: 14 },
];

const topCountries = [
  { country: "United States", users: 4521, flag: "🇺🇸" },
  { country: "United Kingdom", users: 2134, flag: "🇬🇧" },
  { country: "Canada", users: 1876, flag: "🇨🇦" },
  { country: "Australia", users: 1432, flag: "🇦🇺" },
  { country: "Germany", users: 1089, flag: "🇩🇪" },
];

const metrics = [
  {
    name: "Total Views",
    value: "2.4M",
    change: "+18.2%",
    trend: "up",
    icon: Eye,
  },
  {
    name: "Watch Time",
    value: "1.2M hrs",
    change: "+12.5%",
    trend: "up",
    icon: Clock,
  },
  {
    name: "Engagement Rate",
    value: "68.3%",
    change: "-2.3%",
    trend: "down",
    icon: TrendingUp,
  },
  {
    name: "Avg. View Duration",
    value: "28:42",
    change: "+5.1%",
    trend: "up",
    icon: PlayCircle,
  },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your content performance and audience insights</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="h-5 w-5 text-gray-400" />
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {metric.change}
                </div>
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Views and Watch Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Views & Watch Time Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={viewsData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorWatch" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Area
                key="views"
                type="monotone"
                dataKey="views"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorViews)"
                name="Views"
              />
              <Area
                key="watchTime"
                type="monotone"
                dataKey="watchTime"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorWatch)"
                name="Watch Time (mins)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Engagement by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar key="engagement" dataKey="engagement" fill="#8b5cf6" name="Engagement Rate (%)" />
                <Bar key="avgDuration" dataKey="avgDuration" fill="#3b82f6" name="Avg Duration (mins)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceData.map((device, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{device.device}</span>
                    <span className="text-sm text-gray-600">
                      {device.users.toLocaleString()} users ({device.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t">
              <div className="text-sm font-medium mb-3">Device Insights</div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Mobile users have increased by 12% this month</p>
                <p>• Desktop users spend 38% more time per session</p>
                <p>• Tablet users prefer educational content</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Top Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCountries.map((country, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{country.flag}</span>
                  <span className="font-medium">{country.country}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-semibold">{country.users.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">users</div>
                  </div>
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                      style={{ width: `${(country.users / topCountries[0].users) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
