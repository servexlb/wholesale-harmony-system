
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, ShoppingCart, DollarSign } from "lucide-react";

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [revenue, setRevenue] = useState(0);
  
  // Target values (what the counters will increment towards)
  const targetUsers = 1294;
  const targetOrders = 42;
  const targetRevenue = 12345;
  
  useEffect(() => {
    // Simulate users coming in by incremental updates
    const userInterval = setInterval(() => {
      setTotalUsers(prev => {
        if (prev < targetUsers) {
          return Math.min(prev + Math.floor(Math.random() * 5) + 1, targetUsers);
        }
        return prev;
      });
    }, 2000);
    
    // Simulate new orders being created
    const orderInterval = setInterval(() => {
      setActiveOrders(prev => {
        if (prev < targetOrders) {
          return Math.min(prev + Math.floor(Math.random() * 2) + 1, targetOrders);
        }
        return prev;
      });
    }, 3000);
    
    // Simulate revenue increasing
    const revenueInterval = setInterval(() => {
      setRevenue(prev => {
        if (prev < targetRevenue) {
          return Math.min(prev + Math.floor(Math.random() * 100) + 50, targetRevenue);
        }
        return prev;
      });
    }, 1500);
    
    // Clean up intervals on component unmount
    return () => {
      clearInterval(userInterval);
      clearInterval(orderInterval);
      clearInterval(revenueInterval);
    };
  }, []);
  
  // Calculate percentage changes - start with 0% since we're starting from 0
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
