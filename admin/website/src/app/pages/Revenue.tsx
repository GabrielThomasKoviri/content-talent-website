import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { DollarSign, TrendingUp, CreditCard, Download, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

const revenueStats = [
  {
    name: "Total Revenue",
    value: "$342,567",
    change: "+23.1%",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    name: "This Month",
    value: "$45,231",
    change: "+18.2%",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    name: "Active Subscriptions",
    value: "12,543",
    change: "+12.5%",
    icon: CreditCard,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    name: "Avg. Revenue/User",
    value: "$3.60",
    change: "+8.3%",
    icon: DollarSign,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

const monthlyRevenue = [
  { month: "Jan", subscriptions: 28400 },
  { month: "Feb", subscriptions: 32100 },
  { month: "Mar", subscriptions: 36800 },
  { month: "Apr", subscriptions: 41200 },
  { month: "May", subscriptions: 38900 },
  { month: "Jun", subscriptions: 42100 },
];

const recentTransactions = [
  {
    id: "TXN-2024-001234",
    customer: "John Anderson",
    plan: "Premium Annual",
    amount: "$299.00",
    status: "Completed",
    date: "2024-06-21",
  },
  {
    id: "TXN-2024-001233",
    customer: "Sarah Miller",
    plan: "Basic Monthly",
    amount: "$9.99",
    status: "Completed",
    date: "2024-06-21",
  },
  {
    id: "TXN-2024-001232",
    customer: "Mike Johnson",
    plan: "Premium Monthly",
    amount: "$29.99",
    status: "Completed",
    date: "2024-06-20",
  },
  {
    id: "TXN-2024-001230",
    customer: "Tom Wilson",
    plan: "Premium Monthly",
    amount: "$29.99",
    status: "Pending",
    date: "2024-06-20",
  },
  {
    id: "TXN-2024-001229",
    customer: "Lisa Brown",
    plan: "Premium Annual",
    amount: "$299.00",
    status: "Failed",
    date: "2024-06-19",
  },
];

const planRevenue = [
  { plan: "Premium Monthly", revenue: 246898, subscribers: 8234, percentage: 73 },
  { plan: "Basic Monthly", revenue: 43049, subscribers: 4309, percentage: 13 },
  { plan: "Annual Plans", revenue: 42567, subscribers: 1423, percentage: 14 },
];

export default function Revenue() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue & Monetization</h1>
          <p className="text-gray-600 mt-1">Track your earnings and financial performance</p>
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
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {revenueStats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium text-green-600">{stat.change}</div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.name}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="subscriptions" fill="#8b5cf6" name="Subscriptions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planRevenue.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{item.plan}</div>
                      <div className="text-sm text-gray-500">
                        {item.subscribers.toLocaleString()} subscribers
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ${item.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">{item.percentage}%</div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payout Information */}
        <Card>
          <CardHeader>
            <CardTitle>Next Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Pending Amount</span>
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-700 mb-1">$12,543.00</div>
                <div className="text-sm text-gray-600">Expected on July 1, 2024</div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Net Payout</span>
                  <span className="text-green-600">$12,543.00</span>
                </div>
              </div>

              <Button className="w-full mt-4">View Payout History</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                  <TableCell>{transaction.customer}</TableCell>
                  <TableCell>{transaction.plan}</TableCell>
                  <TableCell className="font-semibold">{transaction.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.status === "Completed"
                          ? "default"
                          : transaction.status === "Pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{transaction.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
