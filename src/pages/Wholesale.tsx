import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { MenuIcon } from 'lucide-react';
import { products, customers } from '@/lib/data';
import { WholesaleOrder, Subscription } from '@/lib/types';
import { useLocation } from 'react-router-dom';

// Import the new components
import WholesaleAuth from '@/components/wholesale/WholesaleAuth';
import WholesaleSidebar from '@/components/wholesale/WholesaleSidebar';
import WholesaleTabContent from '@/components/wholesale/WholesaleTabContent';

const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-1',
    userId: customers[0].id,
    serviceId: products[0].id,
    startDate: '2023-08-01T00:00:00Z',
    endDate: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
    status: 'active',
    credentials: {
      email: 'customer1@example.com',
      password: 'password123'
    }
  },
  {
    id: 'sub-2',
    userId: customers[0].id,
    serviceId: products[1].id,
    startDate: '2023-09-15T00:00:00Z',
    endDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    status: 'active',
    credentials: {
      email: 'service2@example.com',
      password: 'password456'
    }
  },
  {
    id: 'sub-3',
    userId: customers[1].id,
    serviceId: products[2].id,
    startDate: '2023-10-10T00:00:00Z',
    endDate: new Date().toISOString(), // Today
    status: 'active',
    credentials: {
      email: 'service3@example.com',
      password: 'password789'
    }
  },
  {
    id: 'sub-4',
    userId: customers[2].id,
    serviceId: products[0].id,
    startDate: '2023-07-20T00:00:00Z',
    endDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    status: 'expired',
    credentials: {
      email: 'expired@example.com',
      password: 'password999'
    }
  }
];

const Wholesale = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [currentWholesaler, setCurrentWholesaler] = useState<string>('');
  const [wholesalerCustomers, setWholesalerCustomers] = useState<typeof customers>([]);
  const location = useLocation();

  const wholesalerCustomers = useMemo(() => {
    if (!currentWholesaler) return [];
    return customers.filter(customer => customer.wholesalerId === currentWholesaler);
  }, [currentWholesaler]);
  
  const filteredSubscriptions = useMemo(() => {
    return mockSubscriptions.filter(sub => 
      wholesalerCustomers.some(customer => customer.id === sub.userId)
    );
  }, [wholesalerCustomers]);

  useEffect(() => {
    const wholesaleAuth = localStorage.getItem('wholesaleAuthenticated');
    const wholesalerId = localStorage.getItem('wholesalerId');
    
    if (wholesaleAuth === 'true' && wholesalerId) {
      setIsAuthenticated(true);
      setCurrentWholesaler(wholesalerId);
    }
  }, []);

  const handleOrderPlaced = useCallback((order: WholesaleOrder) => {
    setOrders(prev => [order, ...prev]);
    
    if (order.credentials) {
      const newSubscription: Subscription = {
        id: `sub-${Date.now()}`,
        userId: order.customerId,
        serviceId: order.serviceId,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
        status: 'active',
        credentials: order.credentials
      };
      
      setSubscriptions(prev => [...prev, newSubscription]);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('wholesaleAuthenticated');
    localStorage.removeItem('wholesalerId');
  }, []);

  const handleLoginSuccess = useCallback((username: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('wholesaleAuthenticated', 'true');
    localStorage.setItem('wholesalerId', username);
    setCurrentWholesaler(username);
  }, []);

  if (!isAuthenticated) {
    return <WholesaleAuth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex pt-16">
        <WholesaleSidebar 
          sidebarOpen={sidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
        />
        
        <div className="fixed bottom-4 right-4 z-40 md:hidden">
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-md"
            onClick={toggleSidebar}
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </div>

        <motion.main
          className={`flex-1 p-6 pt-8 transition-all duration-300 ${sidebarOpen ? 'md:ml-[250px]' : ''}`}
          initial={false}
        >
          <div className="container mx-auto max-w-6xl">
            <WholesaleTabContent 
              activeTab={activeTab}
              products={products}
              customers={customers}
              wholesalerCustomers={wholesalerCustomers}
              orders={orders}
              subscriptions={filteredSubscriptions}
              currentWholesaler={currentWholesaler}
              handleOrderPlaced={handleOrderPlaced}
            />
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default Wholesale;
