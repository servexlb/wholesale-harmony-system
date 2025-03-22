
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Clock } from 'lucide-react';
import { Customer, Product, products } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import SalesCalculator from '@/components/SalesCalculator';

interface SalesTabProps {
  orders?: WholesaleOrder[];
  customers?: Customer[];
}

const SalesTab: React.FC<SalesTabProps> = ({ 
  orders = [], 
  customers = [] 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  
  // Memoize filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const product = products.find(p => p.id === order.serviceId);
      const customer = customers.find(c => c.id === order.customerId);
      
      const matchesSearch = 
        product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesCustomer = filterCustomer === 'all' || order.customerId === filterCustomer;
      
      let matchesPeriod = true;
      const orderDate = new Date(order.createdAt);
      
      if (filterPeriod === 'today') {
        const today = new Date();
        matchesPeriod = orderDate.toDateString() === today.toDateString();
      } else if (filterPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesPeriod = orderDate >= weekAgo;
      } else if (filterPeriod === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesPeriod = orderDate >= monthAgo;
      }
      
      return matchesSearch && matchesCustomer && matchesPeriod;
    });
  }, [orders, customers, searchTerm, filterCustomer, filterPeriod]);
  
  // Calculate total sales amount
  const totalSales = useMemo(() => {
    return filteredOrders.reduce((total, order) => total + order.totalPrice, 0);
  }, [filteredOrders]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col space-y-5"
    >
      <div className="mb-1">
        <h1 className="text-3xl font-bold">Sales Overview</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sales Calculator Component */}
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Sales Calculator</h2>
          <SalesCalculator />
        </div>
        
        {/* Sales Summary */}
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Sales Summary</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-md">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{filteredOrders.length}</p>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-md">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalSales.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Purchase History Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden mt-2">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Purchase History</h2>
        </div>
        
        {/* Filters */}
        <div className="p-4 border-b grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <Select value={filterCustomer} onValueChange={setFilterCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time period" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.slice(0, 20).map((order) => {
                  const product = products.find(p => p.id === order.serviceId);
                  const customer = customers.find(c => c.id === order.customerId);
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.id}</TableCell>
                      <TableCell>{customer?.name || "Unknown"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product?.type === 'subscription' && <Calendar className="h-4 w-4 text-blue-500" />}
                          {product?.name || "Unknown Product"}
                        </div>
                      </TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(SalesTab);
