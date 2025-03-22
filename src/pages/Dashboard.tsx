import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Routes, Route } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import SupportTicketForm from "@/components/SupportTicketForm";
import { 
  CreditCard, 
  Package, 
  Bell, 
  MessageSquare, 
  Settings, 
  Home as HomeIcon,
  Clock, 
  List, 
  Calendar,
  CreditCard as CreditCardIcon,
  User, 
  HelpCircle,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { services } from "@/lib/mockData";
import { Link } from "react-router-dom";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  href, 
  active = false,
  onClick
}) => {
  return (
    <li>
      <a 
        href={href} 
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          active 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
        onClick={onClick}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </a>
    </li>
  );
};

const ProductsView = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold mb-6">Available Products</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <Card key={service.id} className="overflow-hidden flex flex-col h-full">
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={service.image} 
              alt={service.name} 
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
          <CardContent className="p-6 flex-grow flex flex-col">
            <div className="mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {service.categoryId}
              </span>
            </div>
            <h3 className="text-lg font-medium">{service.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {service.description}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-lg font-semibold">${service.price.toFixed(2)}</div>
              <Button asChild>
                <Link to={`/services/${service.id}`}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const DashboardHome = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Package className="h-10 w-10 text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Active Subscriptions</h3>
              <p className="text-muted-foreground">2 active services</p>
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
              <p className="text-muted-foreground">$120.00 available</p>
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
              <p className="text-muted-foreground">3 orders this month</p>
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
              <p className="text-muted-foreground">1 open ticket</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">Contact Support</Button>
        </CardContent>
      </Card>
    </div>

    <h2 className="text-xl font-semibold mt-8 mb-4">Active Subscriptions</h2>
    <Card>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Netflix Premium</h3>
              <p className="text-sm text-muted-foreground">Expires in 24 days</p>
            </div>
          </div>
          <div className="flex flex-col mt-3 sm:mt-0 sm:text-right">
            <span className="text-sm font-medium">$15.99/month</span>
            <Button size="sm" variant="outline" className="mt-2">Fix Password</Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Spotify Family Plan</h3>
              <p className="text-sm text-muted-foreground">Expires in 17 days</p>
            </div>
          </div>
          <div className="flex flex-col mt-3 sm:mt-0 sm:text-right">
            <span className="text-sm font-medium">$14.99/month</span>
            <Button size="sm" variant="outline" className="mt-2">Fix Password</Button>
          </div>
        </div>
      </div>
    </Card>
    
    <h2 className="text-xl font-semibold mt-8 mb-4">Recent Orders</h2>
    <Card>
      <div className="divide-y">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="font-medium">Order #12345</h3>
            <p className="text-sm text-muted-foreground">Purchased on May 15, 2023</p>
            <div className="bg-green-500/10 text-green-600 text-xs px-2 py-1 rounded-full inline-block mt-1">
              Completed
            </div>
          </div>
          <div className="mt-3 sm:mt-0">
            <span className="text-sm font-medium">$29.99</span>
          </div>
        </div>
        
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="font-medium">Order #12344</h3>
            <p className="text-sm text-muted-foreground">Purchased on May 10, 2023</p>
            <div className="bg-green-500/10 text-green-600 text-xs px-2 py-1 rounded-full inline-block mt-1">
              Completed
            </div>
          </div>
          <div className="mt-3 sm:mt-0">
            <span className="text-sm font-medium">$19.99</span>
          </div>
        </div>
        
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="font-medium">Order #12343</h3>
            <p className="text-sm text-muted-foreground">Purchased on May 5, 2023</p>
            <div className="bg-green-500/10 text-green-600 text-xs px-2 py-1 rounded-full inline-block mt-1">
              Completed
            </div>
          </div>
          <div className="mt-3 sm:mt-0">
            <span className="text-sm font-medium">$14.99</span>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('products');

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    navigate(`/dashboard${value !== 'products' ? `/${value}` : ''}`);
  };

  return (
    <MainLayout showFooter={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 bg-card border rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Dashboard</h2>
              </div>
              <nav className="p-2">
                <ul className="space-y-1">
                  <SidebarItem 
                    icon={Package} 
                    label="Products" 
                    href="/dashboard"
                    active={currentTab === 'products'} 
                    onClick={() => handleTabChange('products')}
                  />
                  <SidebarItem 
                    icon={HomeIcon} 
                    label="Overview" 
                    href="/dashboard/overview"
                    active={currentTab === 'overview'} 
                    onClick={() => handleTabChange('overview')}
                  />
                  <SidebarItem 
                    icon={List} 
                    label="My Orders" 
                    href="/dashboard/orders"
                    active={currentTab === 'orders'} 
                    onClick={() => handleTabChange('orders')}
                  />
                  <SidebarItem 
                    icon={Calendar} 
                    label="Subscriptions" 
                    href="/dashboard/subscriptions"
                    active={currentTab === 'subscriptions'} 
                    onClick={() => handleTabChange('subscriptions')}
                  />
                  <SidebarItem 
                    icon={CreditCardIcon} 
                    label="Balance & Payments" 
                    href="/dashboard/payments"
                    active={currentTab === 'payments'} 
                    onClick={() => handleTabChange('payments')}
                  />
                  <SidebarItem 
                    icon={HelpCircle} 
                    label="Report an Issue" 
                    href="/dashboard/support"
                    active={currentTab === 'support'} 
                    onClick={() => handleTabChange('support')}
                  />
                  <SidebarItem 
                    icon={User} 
                    label="Profile Settings" 
                    href="/dashboard/settings"
                    active={currentTab === 'settings'} 
                    onClick={() => handleTabChange('settings')}
                  />
                </ul>
              </nav>
            </div>
          </aside>
          
          <main className="flex-1">
            <div className="md:hidden mb-6">
              <Tabs 
                defaultValue={currentTab} 
                className="w-full"
                onValueChange={handleTabChange}
              >
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Routes>
              <Route path="/" element={<ProductsView />} />
              <Route path="/overview" element={<DashboardHome />} />
              <Route path="/subscriptions" element={<div className="p-4">Subscriptions content</div>} />
              <Route path="/orders" element={<div className="p-4">Orders content</div>} />
              <Route path="/payments" element={<div className="p-4">Payments content</div>} />
              <Route path="/support" element={<SupportTicketForm />} />
              <Route path="/settings" element={<div className="p-4">Settings content</div>} />
            </Routes>
          </main>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Dashboard;
