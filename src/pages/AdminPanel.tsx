
import React from "react";
import { motion } from "framer-motion";
import { useNavigate, Routes, Route } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/MainLayout";
import { 
  Users, Package, ShoppingCart, TicketCheck, 
  BarChart3, Settings, AlertCircle, PlusCircle 
} from "lucide-react";

const AdminDashboard = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">1,294</div>
        <p className="text-xs text-gray-500">+5.2% from last month</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">42</div>
        <p className="text-xs text-gray-500">-12% from last month</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">$12,345</div>
        <p className="text-xs text-gray-500">+18.2% from last month</p>
      </CardContent>
    </Card>
  </div>
);

const AdminCustomers = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Customer Management</h2>
      <Button>
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Customer
      </Button>
    </div>
    <Card>
      <CardContent className="p-6">
        <p>Customer list will appear here...</p>
      </CardContent>
    </Card>
  </div>
);

const AdminServices = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Service Management</h2>
      <Button>
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Service
      </Button>
    </div>
    <Card>
      <CardContent className="p-6">
        <p>Service list will appear here...</p>
      </CardContent>
    </Card>
  </div>
);

const AdminOrders = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Order Management</h2>
    <Card>
      <CardContent className="p-6">
        <p>Order list will appear here...</p>
      </CardContent>
    </Card>
  </div>
);

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container py-8"
      >
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin")}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/customers")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Customers
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/services")}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Services
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/orders")}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Orders
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/support")}
                  >
                    <TicketCheck className="mr-2 h-4 w-4" />
                    Support
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/reports")}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Reports
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-4">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/customers" element={<AdminCustomers />} />
              <Route path="/services" element={<AdminServices />} />
              <Route path="/orders" element={<AdminOrders />} />
              <Route path="/support" element={<div>Support Tickets</div>} />
              <Route path="/reports" element={<div>Reports and Analytics</div>} />
              <Route path="/settings" element={<div>Admin Settings</div>} />
            </Routes>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default AdminPanel;
