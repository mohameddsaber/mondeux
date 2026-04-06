import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, Users, Package, Clock,FolderTree } from 'lucide-react';
import { useAdminDashboardQueries } from '@/hooks/useStoreData';

interface Order {
  _id: string;
  user: { name: string; email: string };
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

const formatCurrency = (amount: number) =>
  `LE ${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getStatusBadge = (status: Order['status']) => {
  switch (status) {
    case 'delivered':
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          Delivered
        </Badge>
      );
    case 'shipped':
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          Shipped
        </Badge>
      );
    case 'processing':
      return <Badge variant="secondary">Processing</Badge>;
    case 'pending':
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          Pending
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function AdminDashboardPage() {
const {
  summaryQuery,
  salesByDateQuery,
  ordersQuery,
  usersQuery,
  productsQuery,
  categoriesQuery,
} = useAdminDashboardQueries();

  const loading = [
    summaryQuery,
    salesByDateQuery,
    ordersQuery,
    usersQuery,
    productsQuery,
    categoriesQuery,
  ].some((query) => query.isPending);
  const summary = summaryQuery.data || { totalRevenue: 0, totalUnitsSold: 0 };
  const salesData = salesByDateQuery.data || [];
  const recentOrders = (ordersQuery.data?.data as Order[]) || [];
  const totalUsers = usersQuery.data?.data?.length || 0;
  const totalProducts = productsQuery.data?.data?.length || 0;
  const totalCategories = categoriesQuery.data?.data?.length || 0;

  const totalRevenue = summary?.totalRevenue || 0;
  const totalUnitsSold = summary?.totalUnitsSold || 0;
  const growthRate = 0.15;
  const chartData = salesData.map((d) => ({
    date: new Date(d._id).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    Revenue: d.totalRevenue,
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gray-800 mb-4"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 ">
      <main className="flex flex-1 flex-col gap-8 p-3 md:p-10">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">
            A summary of store performance, users, and recent orders.
          </p>
        </header>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Total Revenue',
              value: formatCurrency(totalRevenue),
              icon: <DollarSign className="h-5 w-5 text-gray-500" />,
              footer: (
                <p className="text-xs text-green-600">
                  +{(growthRate * 100).toFixed(0)}% from last month
                </p>
              ),
            },
            {
              title: 'Units Sold',
              value: totalUnitsSold.toLocaleString(),
              icon: <Package className="h-5 w-5 text-gray-500" />,
              footer: (
                <p className="text-xs text-muted-foreground">
                  Total products sold
                </p>
              ),
            },
            {
              title: 'Total Users',
              value: totalUsers.toLocaleString(),
              icon: <Users className="h-5 w-5 text-gray-500" />,
              footer: (
                <p className="text-xs text-muted-foreground">
                  Registered customers
                </p>
              ),
            },
            {
              title: 'New Orders',
              value: '12',
              icon: <Clock className="h-5 w-5 text-gray-500" />,
              footer: (
                <p className="text-xs text-muted-foreground">
                  In the last 24 hours
                </p>
              ),
            },
          ].map((metric, i) => (
            <Card
              key={i}
              className="shadow-sm hover:shadow-md transition-shadow border-gray-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                {metric.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{metric.value}</div>
                <div className="pt-1">{metric.footer}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart + Recent Orders */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          
          {/* Sales Over Time Chart */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-4 shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">
                Sales Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    // Use a smaller formatter for better mobile display, or reduce the number of ticks
                    tickFormatter={(v) => `LE ${v / 1000}k`} 
                  />
                  <Tooltip
                    formatter={(v) => [formatCurrency(Number(v)), 'Revenue']}
                    labelFormatter={(l) => `Date: ${l}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="Revenue"
                    stroke="#111827"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Orders Table */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      {/* Optional: Add a small screen class to TableHead to reduce padding/size */}
                      <TableHead className="min-w-[120px]">Customer</TableHead> 
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          {/* CRITICAL FIXES: Added max-w-xs and truncate to manage long text */}
                          <div className="max-w-[120px] sm:max-w-[150px]"> 
                              <div className="font-medium text-gray-800 truncate"> 
                                {order.user.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {order.user.email}
                              </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-gray-700">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {getStatusBadge(order.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid gap-6 lg:grid-cols-4">
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Manage Products
                </CardTitle>
                <Package className="h-5 w-5 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {totalProducts}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                Total products in store
              </p>
              <a
                href="/admin/products"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Manage Products →
              </a>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Manage Categories
                </CardTitle>
                <FolderTree className="h-5 w-5 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {totalCategories}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                Product categories
              </p>
              <a
                href="/admin/categories"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Manage Categories →
              </a>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Manage Orders
                </CardTitle>
                <Clock className="h-5 w-5 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {recentOrders.length}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                Recent orders to process
              </p>
              <a
                href="/admin/orders"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                View All Orders →
              </a>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Manage Users
                </CardTitle>
                <Users className="h-5 w-5 text-gray-500" /> {/* 👈 Add icon like others */}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {totalUsers || 0} {/* 👈 Replace with dynamic count if available */}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                Registered customers and admins
              </p>
              <a
                href="/admin/users"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Manage Users →
              </a>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}



