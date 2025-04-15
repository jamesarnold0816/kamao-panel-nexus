import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency } from "@/lib/utils";

// Helper function to get month name
const getMonthName = (date) => {
  return new Date(date).toLocaleString('default', { month: 'short' });
};

// Helper to group orders by month
const groupOrdersByMonth = (orders) => {
  const groupedData = {};
  
  // Get a range of the last 6 months
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 5);
  
  // Initialize all months with zero values
  for (let i = 0; i < 6; i++) {
    const monthDate = new Date(sixMonthsAgo);
    monthDate.setMonth(sixMonthsAgo.getMonth() + i);
    const monthName = monthDate.toLocaleString('default', { month: 'short' });
    groupedData[monthName] = { orders: 0, sales: 0, profit: 0 };
  }
  
  // Add actual order data
  orders.forEach(order => {
    const orderDate = new Date(order.created_at);
    // Only include orders from the last 6 months
    if (orderDate >= sixMonthsAgo) {
      const month = getMonthName(orderDate);
      if (groupedData[month]) {
        groupedData[month].orders += 1;
        groupedData[month].sales += order.total;
        // Calculate approximate profit (25% of sales for this example)
        groupedData[month].profit += order.total * 0.25;
      }
    }
  });
  
  // Convert to array format for the chart
  return Object.keys(groupedData).map(month => ({
    month,
    orders: groupedData[month].orders,
    sales: groupedData[month].sales,
    profit: groupedData[month].profit
  }));
};

const formatTooltipValue = (value, name) => {
  if (name === 'sales' || name === 'profit') {
    return formatCurrency(value);
  }
  return value;
};

const AdminDashboard = () => {
  const { products } = useProducts();
  const { orders } = useCart();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalResellers: 0,
    totalSales: 0,
    totalProfit: 0,
  });
  
  // State for chart data
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Calculate dashboard statistics
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    
    setStats({
      totalProducts: products.length,
      totalOrders: orders.length,
      totalResellers: new Set(orders.map(order => order.reseller_id)).size,
      totalSales: totalSales,
      totalProfit: totalSales * 0.25, // Assuming 25% profit margin
    });

    // Generate real chart data based on orders
    setChartData(groupOrdersByMonth(orders));
  }, [products, orders]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <p className="text-3xl font-bold">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-kamao-purple-light rounded-full">
              <Package className="h-6 w-6 text-kamao-purple" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <p className="text-3xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Resellers</p>
              <p className="text-3xl font-bold">{stats.totalResellers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalSales)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="sales">Sales & Profit</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Statistics</CardTitle>
              <CardDescription>
                Number of orders received over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={formatTooltipValue} />
                    <Bar dataKey="orders" fill="#9b87f5" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales & Profit Statistics</CardTitle>
              <CardDescription>
                Total sales and profit over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={formatTooltipValue} />
                    <Legend />
                    <Bar dataKey="sales" fill="#7E69AB" name="Sales" />
                    <Bar dataKey="profit" fill="#4CAF50" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Latest orders received from resellers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Order ID</th>
                    <th className="text-left py-3 px-4">Reseller</th>
                    <th className="text-left py-3 px-4">Items</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="py-3 px-4">{order.id.substring(0, 8)}</td>
                      <td className="py-3 px-4">{order.reseller_name}</td>
                      <td className="py-3 px-4">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </td>
                      <td className="py-3 px-4">{formatCurrency(order.total)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
