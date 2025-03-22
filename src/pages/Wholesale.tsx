
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import WholesaleLogin from '@/components/WholesaleLogin';
import WholesaleOrderForm from '@/components/WholesaleOrderForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '@/components/ProductCard';
import CustomerTable from '@/components/CustomerTable';
import SalesCalculator from '@/components/SalesCalculator';
import { products } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import { 
  HomeIcon, 
  Users, 
  LineChart, 
  Package, 
  LogOut, 
  Settings,
  ShoppingCart,
  Menu as MenuIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

const Wholesale = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const location = useLocation();

  const handleOrderPlaced = (order: WholesaleOrder) => {
    setOrders(prev => [order, ...prev]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 container mx-auto max-w-7xl px-6 min-h-[80vh] flex items-center justify-center">
          <WholesaleLogin onSuccess={() => setIsAuthenticated(true)} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex pt-16">
        {/* Sidebar */}
        <motion.aside
          initial={{ width: sidebarOpen ? 250 : 0, opacity: sidebarOpen ? 1 : 0 }}
          animate={{ width: sidebarOpen ? 250 : 0, opacity: sidebarOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-16 left-0 z-30 h-[calc(100vh-64px)] bg-white border-r shadow-sm overflow-y-auto overflow-x-hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        >
          <div className="p-4">
            <div className="text-lg font-medium mb-6 px-2">Wholesale Portal</div>
            <nav className="space-y-1">
              <SidebarLink 
                href="#" 
                icon={<HomeIcon className="h-5 w-5" />} 
                label="Dashboard" 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')} 
              />
              <SidebarLink 
                href="#" 
                icon={<Package className="h-5 w-5" />} 
                label="Products" 
                active={activeTab === 'products'} 
                onClick={() => setActiveTab('products')} 
              />
              <SidebarLink 
                href="#" 
                icon={<ShoppingCart className="h-5 w-5" />} 
                label="New Order" 
                active={activeTab === 'new-order'} 
                onClick={() => setActiveTab('new-order')} 
              />
              <SidebarLink 
                href="#" 
                icon={<Users className="h-5 w-5" />} 
                label="Customers" 
                active={activeTab === 'customers'} 
                onClick={() => setActiveTab('customers')} 
              />
              <SidebarLink 
                href="#" 
                icon={<LineChart className="h-5 w-5" />} 
                label="Sales" 
                active={activeTab === 'sales'} 
                onClick={() => setActiveTab('sales')} 
              />
              <SidebarLink 
                href="#" 
                icon={<Settings className="h-5 w-5" />} 
                label="Settings" 
                active={activeTab === 'settings'} 
                onClick={() => setActiveTab('settings')} 
              />
            </nav>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </motion.aside>
        
        {/* Mobile Sidebar Toggle */}
        <div className="fixed bottom-4 right-4 z-40 md:hidden">
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-md"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </div>

        {/* Main Content */}
        <motion.main
          className={`flex-1 p-6 pt-8 transition-all duration-300 ${sidebarOpen ? 'md:ml-[250px]' : ''}`}
        >
          <div className="container mx-auto max-w-6xl">
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold mb-8">Wholesale Dashboard</h1>
                <SalesCalculator />
              </motion.div>
            )}
            
            {activeTab === 'products' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold mb-8">Wholesale Products</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} isWholesale={true} />
                  ))}
                </div>
              </motion.div>
            )}
            
            {activeTab === 'new-order' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold mb-8">New Wholesale Order</h1>
                <WholesaleOrderForm products={products} onOrderPlaced={handleOrderPlaced} />
                
                {orders.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => {
                            const product = products.find(p => p.id === order.serviceId);
                            return (
                              <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product?.name || 'Unknown'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.totalPrice.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'customers' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold mb-8">Manage Customers</h1>
                <CustomerTable />
              </motion.div>
            )}
            
            {activeTab === 'sales' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold mb-8">Sales Overview</h1>
                <SalesCalculator />
              </motion.div>
            )}
            
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
                <div className="bg-white p-8 rounded-lg shadow-sm">
                  <h2 className="text-xl font-medium mb-4">Preferences</h2>
                  <p className="text-muted-foreground mb-6">
                    Settings panel is under development.
                  </p>
                  <Button variant="outline">
                    Save Changes
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon, label, active, onClick }) => {
  return (
    <a
      href={href}
      className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
      }`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </a>
  );
};

export default Wholesale;
