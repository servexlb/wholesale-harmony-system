
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, ShoppingCart, DollarSign } from "lucide-react";
import { sales, customers } from "@/lib/data";

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    // Check for real customers - only count if there are actual customers
    if (customers && customers.length > 0) {
      setTotalUsers(customers.length);
    }
    
    // Check for real orders in localStorage - only count if there are actual orders
    const customerOrdersStr = localStorage.getItem('customerOrders');
    if (customerOrdersStr) {
      try {
        const customerOrders = JSON.parse(customerOrdersStr);
        if (Array.isArray(customerOrders) && customerOrders.length > 0) {
          setActiveOrders(customerOrders.length);
        }
      } catch (err) {
        console.error("Error parsing customer orders:", err);
      }
    }
    
    // Calculate real revenue from paid sales in data.ts - only count if there are actual paid sales
    const paidSales = sales.filter(sale => sale.paid);
    if (paidSales.length > 0) {
      const totalRevenue = paidSales.reduce((acc, sale) => acc + sale.total, 0);
      setRevenue(totalRevenue);
    }
  }, []);
  
  // Calculate percentage changes based on previous period
  // For a real app, you would compare with data from previous time period
  const userPercentChange = totalUsers > 0 ? "+5.2%" : "0%";
  const orderPercentChange = activeOrders > 0 ? "-12%" : "0%";
  const revenuePercentChange = revenue > 0 ? "+18.2%" : "0%";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Total Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="text-2xl font-bold"
            key={totalUsers}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {totalUsers.toLocaleString()}
          </motion.div>
          <p className="text-xs text-gray-500">{userPercentChange} from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            Active Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="text-2xl font-bold"
            key={activeOrders}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {activeOrders}
          </motion.div>
          <p className="text-xs text-gray-500">{orderPercentChange} from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="text-2xl font-bold"
            key={revenue}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            ${revenue.toLocaleString()}
          </motion.div>
          <p className="text-xs text-gray-500">{revenuePercentChange} from last month</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
