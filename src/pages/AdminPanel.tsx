
import React from "react";
import { motion } from "framer-motion";
import { useNavigate, Routes, Route } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/MainLayout";
import AdminSupportTickets from "@/components/AdminSupportTickets";
import AdminBalanceManagement from "@/components/AdminBalanceManagement";
import AdminDigitalInventory from "@/components/AdminDigitalInventory";
import AdminNotifications from "@/components/AdminNotifications";
import AdminCustomersPage from "@/components/admin/AdminCustomersPage";
import { 
  Users, Package, ShoppingCart, TicketCheck, 
  BarChart3, Settings, AlertCircle, PlusCircle,
  Server, LogOut, CreditCard, LayoutDashboard
} from "lucide-react";
import { toast } from "@/lib/toast";

// Import the AdminDashboard component
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminServices from "@/components/admin/AdminServices";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminCustomization from "@/components/admin/AdminCustomization";

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    toast.success("You have been logged out of the admin panel");
    navigate("/");
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container py-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <AdminNotifications />
            <Button variant="destructive" size="sm" onClick={handleLogout} className="flex gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        
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
                    onClick={() => navigate("/admin/inventory")}
                  >
                    <Server className="mr-2 h-4 w-4" />
                    Digital Inventory
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/balance")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    User Balance
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/customization")}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Customization
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
              <Route path="/customers" element={<AdminCustomersPage />} />
              <Route path="/services" element={<AdminServices />} />
              <Route path="/orders" element={<AdminOrders />} />
              <Route path="/inventory" element={<AdminDigitalInventory />} />
              <Route path="/balance" element={<AdminBalanceManagement />} />
              <Route path="/customization" element={<AdminCustomization />} />
              <Route path="/support" element={<AdminSupportTickets />} />
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
