
import React from "react";
import { motion } from "framer-motion";
import { useNavigate, Routes, Route } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Clock, CreditCard, Package, Bell, MessageSquare, Settings } from "lucide-react";

const DashboardHome = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Package className="h-10 w-10 text-primary" />
          <div>
            <h3 className="text-xl font-semibold">Active Subscriptions</h3>
            <p className="text-gray-500">2 active services</p>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4">Manage Subscriptions</Button>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <CreditCard className="h-10 w-10 text-primary" />
          <div>
            <h3 className="text-xl font-semibold">Account Balance</h3>
            <p className="text-gray-500">$120.00 available</p>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4">Add Funds</Button>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Clock className="h-10 w-10 text-primary" />
          <div>
            <h3 className="text-xl font-semibold">Recent Orders</h3>
            <p className="text-gray-500">3 orders this month</p>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4">View Order History</Button>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <MessageSquare className="h-10 w-10 text-primary" />
          <div>
            <h3 className="text-xl font-semibold">Support Tickets</h3>
            <p className="text-gray-500">1 open ticket</p>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4">Contact Support</Button>
      </CardContent>
    </Card>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="py-8"
      >
        <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="overview" onClick={() => navigate("/dashboard")}>Overview</TabsTrigger>
            <TabsTrigger value="subscriptions" onClick={() => navigate("/dashboard/subscriptions")}>Subscriptions</TabsTrigger>
            <TabsTrigger value="orders" onClick={() => navigate("/dashboard/orders")}>Order History</TabsTrigger>
            <TabsTrigger value="support" onClick={() => navigate("/dashboard/support")}>Support</TabsTrigger>
            <TabsTrigger value="settings" onClick={() => navigate("/dashboard/settings")}>Settings</TabsTrigger>
          </TabsList>
          
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/subscriptions" element={<div>Subscriptions content</div>} />
            <Route path="/orders" element={<div>Orders content</div>} />
            <Route path="/support" element={<div>Support content</div>} />
            <Route path="/settings" element={<div>Settings content</div>} />
          </Routes>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default Dashboard;
