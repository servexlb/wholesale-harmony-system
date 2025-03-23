
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { MenuIcon, X } from 'lucide-react';
import { products, customers as defaultCustomers } from '@/lib/data';
import { WholesaleOrder, Subscription } from '@/lib/types';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

// Import the components
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
  const [customersData, setCustomersData] = useState(defaultCustomers);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('wholesaleOrders');
    const savedSubscriptions = localStorage.getItem('wholesaleSubscriptions');
    const savedCustomers = localStorage.getItem('wholesaleCustomers');
    
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
    
    if (savedSubscriptions) {
      setSubscriptions(JSON.parse(savedSubscriptions));
    }
    
    if (savedCustomers) {
      setCustomersData(JSON.parse(savedCustomers));
    }
  }, []);
  
  // Save orders, subscriptions and customers to localStorage whenever they change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('wholesaleOrders', JSON.stringify(orders));
    }
    
    if (subscriptions.length > 0) {
      localStorage.setItem('wholesaleSubscriptions', JSON.stringify(subscriptions));
    }
    
    if (customersData.length > 0) {
      localStorage.setItem('wholesaleCustomers', JSON.stringify(customersData));
    }
  }, [orders, subscriptions, customersData]);

  const wholesalerCustomers = useMemo(() => {
    if (!currentWholesaler) return [];
    return customersData.filter(customer => customer.wholesalerId === currentWholesaler);
  }, [currentWholesaler, customersData]);
  
  const filteredSubscriptions = useMemo(() => {
    if (!wholesalerCustomers.length) return [];
    return subscriptions.filter(sub => 
      wholesalerCustomers.some(customer => customer.id === sub.userId)
    );
  }, [wholesalerCustomers, subscriptions]);

  useEffect(() => {
    const wholesaleAuth = localStorage.getItem('wholesaleAuthenticated');
    const wholesalerId = localStorage.getItem('wholesalerId');
    
    if (wholesaleAuth === 'true' && wholesalerId) {
      setIsAuthenticated(true);
      setCurrentWholesaler(wholesalerId);
    }
    
    // Close sidebar on mobile by default
    if (isMobile) {
      setSidebarOpen(false);
    }
    
    // Event listener for closing sidebar from child components
    const handleCloseSidebar = () => {
      if (isMobile) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('closeSidebar', handleCloseSidebar);
    
    return () => {
      window.removeEventListener('closeSidebar', handleCloseSidebar);
    };
  }, [isMobile]);

  const handleOrderPlaced = useCallback((order: WholesaleOrder) => {
    setOrders(prev => {
      const updatedOrders = [order, ...prev];
      return updatedOrders.slice(0, 100);
    });
    
    if (order.credentials) {
      const newSubscription: Subscription = {
        id: `sub-${Date.now()}`,
        userId: order.customerId,
        serviceId: order.serviceId,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
        status: 'active',
        credentials: order.credentials
      };
      
      setSubscriptions(prev => {
        const updatedSubscriptions = [...prev, newSubscription];
        return updatedSubscriptions.slice(0, 100);
      });
    }
  }, []);

  const handleAddCustomer = useCallback((newCustomer) => {
    setCustomersData(prev => [...prev, newCustomer]);
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
            {sidebarOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </Button>
        </div>

        <motion.main
          className={`flex-1 p-4 sm:p-6 pt-6 sm:pt-8 transition-all duration-300 ${sidebarOpen && !isMobile ? 'md:ml-[250px]' : ''}`}
          initial={false}
          layout
        >
          <div className="container mx-auto max-w-6xl">
            <WholesaleTabContent 
              activeTab={activeTab}
              products={products}
              customers={customersData}
              wholesalerCustomers={wholesalerCustomers}
              orders={orders}
              subscriptions={filteredSubscriptions}
              currentWholesaler={currentWholesaler}
              handleOrderPlaced={handleOrderPlaced}
              onAddCustomer={handleAddCustomer}
            />
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default React.memo(Wholesale);
