
import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, HomeIcon, Users, LineChart, Package, Settings, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SidebarLink from './SidebarLink';

interface WholesaleSidebarProps {
  sidebarOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
}

const WholesaleSidebar: React.FC<WholesaleSidebarProps> = ({ 
  sidebarOpen, 
  activeTab, 
  setActiveTab,
  handleLogout
}) => {
  return (
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
            icon={<Package className="h-5 w-5" />} 
            label="Products" 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
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
            icon={<Layers className="h-5 w-5" />} 
            label="Stock" 
            active={activeTab === 'stock'} 
            onClick={() => setActiveTab('stock')} 
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
  );
};

export default WholesaleSidebar;
