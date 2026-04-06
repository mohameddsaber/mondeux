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
import {
  DollarSign,
  Users,
  Package,
  Clock,
  FolderTree,
  ShoppingCart,
} from 'lucide-react';
import { useAdminDashboardQueries } from '@/hooks/useStoreData';

interface Order {
  _id: string;
  user: { name: string; email: string } | string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

const formatCurrency = (amount: number) =>
  `LE ${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatPercent = (value: number | null | undefined) =>
  `${Number(value || 0).toFixed(1)}%`;

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

const getOrderUser = (user: Order['user']) => {
  if (typeof user === 'string' || !user) {
    return {
      name: 'Unknown user',
      email: '',
    };
  }

  return user;
};

export default function AdminDashboardPage() {
  const {
    summaryQuery,
    salesByDateQuery,
    ordersQuery,
    usersQuery,
    productsQuery,
    categoriesQuery,
    funnelQuery,
    topProductsQuery,
    repeatCustomersQuery,
    lowConversionPagesQuery,
  } = useAdminDashboardQueries();

  const loading = [
    summaryQuery,
    salesByDateQuery,
    ordersQuery,
    usersQuery,
    productsQuery,
    categoriesQuery,
    funnelQuery,
    topProductsQuery,
    repeatCustomersQuery,
    lowConversionPagesQuery,
  ].some((query) => query.isPending);

  const summary = summaryQuery.data || { totalRevenue: 0, totalUnitsSold: 0 };
  const salesData = salesByDateQuery.data || [];
  const recentOrders = (ordersQuery.data?.data as Order[]) || [];
  const totalUsers = usersQuery.data?.pagination?.total || usersQuery.data?.data?.length || 0;
  const totalProducts =
    productsQuery.data?.pagination?.total || productsQuery.data?.data?.length || 0;
  const totalCategories = categoriesQuery.data?.data?.length || 0;
  const funnel = funnelQuery.data?.data;
  const funnelStages = funnel?.stages || [];
  const topProducts = topProductsQuery.data?.data.items || [];
  const repeatCustomers = repeatCustomersQuery.data?.data.items || [];
  const lowConversionPages = lowConversionPagesQuery.data?.data.items || [];

  const totalRevenue = summary?.totalRevenue || 0;
  const totalUnitsSold = summary?.totalUnitsSold || 0;
  const funnelWindow = funnel?.days || 30;
  const overallConversionRate = funnel?.overallConversionRate || 0;
  const productViews =
    funnelStages.find((stage) => stage.key === 'product_view')?.actors || 0;
  const addToCartActors =
    funnelStages.find((stage) => stage.key === 'add_to_cart')?.actors || 0;
  const chartData = salesData.map((entry) => ({
    date: new Date(entry._id).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    Revenue: entry.totalRevenue,
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
    <div className="flex min-h-screen w-full flex-col bg-gray-100">
      <main className="flex flex-1 flex-col gap-8 p-3 md:p-10">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-gray-500">
            Revenue, activity, and conversion signals for the last {funnelWindow}{' '}
            days.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Total Revenue',
              value: formatCurrency(totalRevenue),
              icon: <DollarSign className="h-5 w-5 text-gray-500" />,
              footer: 'All tracked sales revenue',
            },
            {
              title: 'Units Sold',
              value: totalUnitsSold.toLocaleString(),
              icon: <Package className="h-5 w-5 text-gray-500" />,
              footer: 'Units sold across all orders',
            },
            {
              title: 'Product Views',
              value: productViews.toLocaleString(),
              icon: <Users className="h-5 w-5 text-gray-500" />,
              footer: `${addToCartActors.toLocaleString()} visitors added items to cart`,
            },
            {
              title: 'Checkout Conversion',
              value: formatPercent(overallConversionRate),
              icon: <ShoppingCart className="h-5 w-5 text-gray-500" />,
              footer: `View to completed checkout in ${funnelWindow} days`,
            },
          ].map((metric) => (
            <Card
              key={metric.title}
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
                <p className="pt-1 text-xs text-muted-foreground">
                  {metric.footer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
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
                    tickFormatter={(value) => `LE ${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      'Revenue',
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
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
                      <TableHead className="min-w-[120px]">Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => {
                      const user = getOrderUser(order.user);

                      return (
                        <TableRow key={order._id}>
                          <TableCell>
                            <div className="max-w-[120px] sm:max-w-[150px]">
                              <div className="font-medium text-gray-800 truncate">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {user.email}
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2 shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">
                Funnel
              </CardTitle>
              <p className="text-sm text-gray-500">
                Distinct visitors from product view to completed checkout.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {funnelStages.map((stage, index) => {
                const baseActors = funnelStages[0]?.actors || 0;
                const width = baseActors
                  ? Math.max((stage.actors / baseActors) * 100, 8)
                  : 0;

                return (
                  <div key={stage.key} className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900">{stage.label}</p>
                        <p className="text-xs text-gray-500">
                          {stage.actors.toLocaleString()} visitors
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPercent(stage.conversionFromFirst)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {index === 0
                            ? 'Entry point'
                            : `${formatPercent(stage.conversionFromPrevious)} from previous`}
                        </p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gray-900"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">
                Top Products
              </CardTitle>
              <p className="text-sm text-gray-500">
                Ranked by revenue, with view and cart context.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead className="text-right">View → Cart</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell>
                          <div className="max-w-[220px]">
                            <div className="font-medium text-gray-800 truncate">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              /product/{product.slug || product.productId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(product.revenue)}</TableCell>
                        <TableCell>{product.unitsSold.toLocaleString()}</TableCell>
                        <TableCell>{product.views.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          {formatPercent(product.viewToCartRate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">
                Repeat Customers
              </CardTitle>
              <p className="text-sm text-gray-500">
                Customers with more than one order in the current analytics
                window.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead className="text-right">Last Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repeatCustomers.map((customer) => (
                      <TableRow key={customer.userId}>
                        <TableCell>
                          <div className="max-w-[220px]">
                            <div className="font-medium text-gray-800 truncate">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {customer.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{customer.orderCount}</TableCell>
                        <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                        <TableCell className="text-right text-sm text-gray-500">
                          {new Date(customer.lastOrderAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">
                Low-Conversion Pages
              </CardTitle>
              <p className="text-sm text-gray-500">
                Product pages with traffic but weak add-to-cart conversion.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Visitors</TableHead>
                      <TableHead>Cart Adds</TableHead>
                      <TableHead className="text-right">Conversion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowConversionPages.map((page) => (
                      <TableRow key={page.productId}>
                        <TableCell>
                          <div className="max-w-[240px]">
                            <div className="font-medium text-gray-800 truncate">
                              {page.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {page.pagePath || `/product/${page.slug || page.productId}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{page.uniqueVisitors.toLocaleString()}</TableCell>
                        <TableCell>{page.addToCartActors.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">
                            {formatPercent(page.conversionRate)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

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
              <p className="mb-2 text-2xl font-bold text-gray-900">
                {totalProducts}
              </p>
              <p className="mb-3 text-sm text-gray-500">
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
              <p className="mb-2 text-2xl font-bold text-gray-900">
                {totalCategories}
              </p>
              <p className="mb-3 text-sm text-gray-500">Product categories</p>
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
              <p className="mb-2 text-2xl font-bold text-gray-900">
                {recentOrders.length}
              </p>
              <p className="mb-3 text-sm text-gray-500">
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
                <Users className="h-5 w-5 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-2xl font-bold text-gray-900">
                {totalUsers || 0}
              </p>
              <p className="mb-3 text-sm text-gray-500">
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
