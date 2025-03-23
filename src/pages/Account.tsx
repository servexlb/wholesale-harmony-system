import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationPreferences from "@/components/account/NotificationPreferences";
import SecuritySettings from "@/components/account/SecuritySettings";
import ProfileEditForm from "@/components/account/ProfileEditForm";
import { toast } from "@/lib/toast";
import {
  User,
  Package,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Shield,
  History
} from "lucide-react";

const getUserId = () => {
  let userId = localStorage.getItem('currentUserId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('currentUserId', userId);
  }
  return userId;
};

const Account: React.FC = () => {
  const userId = getUserId();
  const navigate = useNavigate();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    const savedProfile = localStorage.getItem(`userProfile_${userId}`);
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileData(parsedProfile);
      } catch (error) {
        console.error("Error parsing saved profile:", error);
      }
    }
    
    const savedBalance = localStorage.getItem(`userBalance_${userId}`);
    if (savedBalance) {
      const balance = parseFloat(savedBalance);
      setUserBalance(balance);
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('currentUserId');
    
    toast.success("Logged out successfully");
    
    navigate('/');
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="bg-primary/10 text-primary p-3 rounded-full">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Account</h1>
              <p className="text-muted-foreground">Manage your profile and preferences</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <Package className="mr-2 h-4 w-4" />
              Go to Full Dashboard
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p>{profileData.name || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <p>{profileData.email || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p>{profileData.phone || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Balance</label>
                    <p>${userBalance.toFixed(2)}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NotificationPreferences userId={userId} />
              <SecuritySettings userId={userId} />
            </div>
            
            <ProfileEditForm 
              isOpen={isEditProfileOpen}
              onClose={() => setIsEditProfileOpen(false)}
              initialData={profileData}
              userId={userId}
            />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <div>
                      <h3 className="font-medium">Order #12345</h3>
                      <p className="text-sm text-muted-foreground">May 15, 2023</p>
                      <div className="inline-block bg-green-500/10 text-green-600 text-xs px-2 py-1 rounded-full mt-1">
                        Completed
                      </div>
                    </div>
                    <div className="flex flex-col mt-3 sm:mt-0 sm:text-right">
                      <span className="text-sm font-medium">$29.99</span>
                      <Button size="sm" variant="ghost" className="mt-2">View Details</Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <div>
                      <h3 className="font-medium">Order #12344</h3>
                      <p className="text-sm text-muted-foreground">May 10, 2023</p>
                      <div className="inline-block bg-green-500/10 text-green-600 text-xs px-2 py-1 rounded-full mt-1">
                        Completed
                      </div>
                    </div>
                    <div className="flex flex-col mt-3 sm:mt-0 sm:text-right">
                      <span className="text-sm font-medium">$19.99</span>
                      <Button size="sm" variant="ghost" className="mt-2">View Details</Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <Button asChild>
                    <Link to="/dashboard/transaction-history">
                      <History className="mr-2 h-4 w-4" />
                      View All Orders
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Netflix Premium</h3>
                        <p className="text-sm text-muted-foreground">Expires in 24 days</p>
                      </div>
                    </div>
                    <div className="flex flex-col mt-3 sm:mt-0 sm:text-right">
                      <span className="text-sm font-medium">$15.99/month</span>
                      <Button size="sm" variant="outline" className="mt-2">Manage</Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Spotify Family Plan</h3>
                        <p className="text-sm text-muted-foreground">Expires in 17 days</p>
                      </div>
                    </div>
                    <div className="flex flex-col mt-3 sm:mt-0 sm:text-right">
                      <span className="text-sm font-medium">$14.99/month</span>
                      <Button size="sm" variant="outline" className="mt-2">Manage</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Visa ending in 4242</h3>
                      <p className="text-sm text-muted-foreground">Expires 04/25</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                
                <Button className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <div>
                      <h3 className="font-medium">Invoice #INV-001</h3>
                      <p className="text-sm text-muted-foreground">May 15, 2023</p>
                    </div>
                    <div className="flex flex-col mt-3 sm:mt-0 sm:text-right">
                      <span className="text-sm font-medium">$29.99</span>
                      <Button size="sm" variant="ghost" className="mt-2">Download</Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <div>
                      <h3 className="font-medium">Invoice #INV-002</h3>
                      <p className="text-sm text-muted-foreground">April 15, 2023</p>
                    </div>
                    <div className="flex flex-col mt-3 sm:mt-0 sm:text-right">
                      <span className="text-sm font-medium">$29.99</span>
                      <Button size="sm" variant="ghost" className="mt-2">Download</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <div>
                      <h3 className="font-medium">Language</h3>
                      <p className="text-sm text-muted-foreground">Change your preferred language</p>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2 sm:mt-0">English (US)</Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                    <div>
                      <h3 className="font-medium">Timezone</h3>
                      <p className="text-sm text-muted-foreground">Set your local timezone</p>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2 sm:mt-0">(UTC-05:00) Eastern Time</Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4">
                    <div>
                      <h3 className="font-medium">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button size="sm" variant="destructive" className="mt-2 sm:mt-0">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button variant="outline" className="mr-2">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default Account;
