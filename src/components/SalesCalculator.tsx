
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  BarChart, 
  PieChart, 
  Bar, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { sales, customers, products, getCustomerById, getProductById } from '@/lib/data';
import { DollarSign, TrendingUp, ShoppingBag, Users } from 'lucide-react';

const SalesCalculator = () => {
  const [period, setPeriod] = useState('all');
  
  // Calculate totals
  const totalSales = useMemo(() => {
    return sales.reduce((total, sale) => total + sale.total, 0);
  }, []);
  
  const totalCustomers = customers.length;
  const totalProducts = products.length;
  
  const averageOrderValue = useMemo(() => {
    return totalSales / sales.length;
  }, [totalSales]);

  // Generate chart data
  const salesByCustomer = useMemo(() => {
    const salesMap = new Map();
    
    sales.forEach(sale => {
      const customer = getCustomerById(sale.customerId);
      if (customer) {
        salesMap.set(
          customer.id, 
          (salesMap.get(customer.id) || 0) + sale.total
        );
      }
    });
    
    return Array.from(salesMap.entries()).map(([customerId, total]) => {
      const customer = getCustomerById(customerId);
      return {
        name: customer?.name || 'Unknown',
        value: total
      };
    }).sort((a, b) => b.value - a.value);
  }, []);

  const salesByProduct = useMemo(() => {
    const productMap = new Map();
    
    sales.forEach(sale => {
      sale.products.forEach(item => {
        productMap.set(
          item.productId, 
          (productMap.get(item.productId) || 0) + (item.quantity * item.priceAtSale)
        );
      });
    });
    
    return Array.from(productMap.entries()).map(([productId, total]) => {
      const product = getProductById(productId);
      return {
        name: product?.name || 'Unknown',
        value: total
      };
    }).sort((a, b) => b.value - a.value);
  }, []);

  // Generate monthly data for bar chart
  const monthlySalesData = useMemo(() => {
    const months = {};
    
    // Initialize all months
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(0, i).toLocaleString('default', { month: 'short' });
      months[monthName] = 0;
    }
    
    sales.forEach(sale => {
      const date = new Date(sale.date);
      const monthName = date.toLocaleString('default', { month: 'short' });
      months[monthName] += sale.total;
    });
    
    return Object.entries(months).map(([month, total]) => ({
      month,
      total
    }));
  }, []);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${totalSales.toFixed(2)}`}
          description="Lifetime sales amount"
          icon={<DollarSign className="h-5 w-5" />}
          trend="+12.5%"
          trendUp={true}
        />
        <StatsCard
          title="Average Order"
          value={`$${averageOrderValue.toFixed(2)}`}
          description="Per transaction"
          icon={<TrendingUp className="h-5 w-5" />}
          trend="+3.2%"
          trendUp={true}
        />
        <StatsCard
          title="Products Sold"
          value={totalProducts.toString()}
          description="Unique products"
          icon={<ShoppingBag className="h-5 w-5" />}
          trend="0%"
          trendUp={false}
        />
        <StatsCard
          title="Customers"
          value={totalCustomers.toString()}
          description="Total customers"
          icon={<Users className="h-5 w-5" />}
          trend="+5.3%"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <CardDescription>
              Revenue per month across all customers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlySalesData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '6px',
                      border: '1px solid #eaeaea',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Distribution</CardTitle>
            <CardDescription>
              By customers and products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customers">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customers">By Customer</TabsTrigger>
                <TabsTrigger value="products">By Product</TabsTrigger>
              </TabsList>
              <TabsContent value="customers" className="space-y-4 mt-4">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByCustomer.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {salesByCustomer.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="products" className="space-y-4 mt-4">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByProduct.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {salesByProduct.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon,
  trend,
  trendUp 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2">
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
          <span className={`text-xs ${trendUp ? 'text-green-500' : trend === '0%' ? 'text-muted-foreground' : 'text-red-500'}`}>
            {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesCalculator;
