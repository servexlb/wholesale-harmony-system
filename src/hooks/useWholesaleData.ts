
import { useState, useEffect, useMemo } from 'react';
import { WholesaleOrder, Subscription, Service } from '@/lib/types';
import { Customer } from '@/lib/data';
import { loadServices } from '@/lib/productManager';
import { addCredentialToStock } from '@/lib/credentialUtils';

export function useWholesaleData(currentWholesaler: string) {
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Load services from product manager
  useEffect(() => {
    setServices(loadServices());
    
    const handleServiceUpdated = () => {
      setServices(loadServices());
    };
    
    window.addEventListener('service-updated', handleServiceUpdated);
    window.addEventListener('service-added', handleServiceUpdated);
    window.addEventListener('service-deleted', handleServiceUpdated);
    
    return () => {
      window.removeEventListener('service-updated', handleServiceUpdated);
      window.removeEventListener('service-added', handleServiceUpdated);
      window.removeEventListener('service-deleted', handleServiceUpdated);
    };
  }, []);

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

  const handleOrderPlaced = (order: WholesaleOrder) => {
    setOrders(prev => {
      const updatedOrders = [order, ...prev];
      return updatedOrders.slice(0, 100);
    });
    
    // Find the service to check if it's a subscription
    const service = services.find(s => s.id === order.serviceId);
    
    // If it's a subscription product or has credentials, create a subscription
    if (service?.type === 'subscription' || order.credentials) {
      // Calculate end date based on the duration months or default to 30 days
      const durationMonths = order.durationMonths || 1;
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationMonths);
      
      const newSubscription: Subscription = {
        id: `sub-${Date.now()}`,
        userId: order.customerId,
        serviceId: order.serviceId,
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
        durationMonths: durationMonths,
        credentials: order.credentials
      };
      
      setSubscriptions(prev => {
        const updatedSubscriptions = [...prev, newSubscription];
        return updatedSubscriptions.slice(0, 100);
      });
      
      // Automatically add to credential stock if credentials exist
      if (order.credentials && order.serviceId) {
        try {
          addCredentialToStock(order.serviceId, {
            email: order.credentials.email || '',
            password: order.credentials.password || '',
            username: order.credentials.username || '',
            pinCode: order.credentials.pinCode || ''
          });
        } catch (error) {
          console.error('Error adding subscription to credential stock:', error);
        }
      }
    }
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomersData(prev => [...prev, newCustomer]);
  };

  const handleUpdateCustomer = (customerId: string, updatedCustomer: Partial<Customer>) => {
    setCustomersData(prev => 
      prev.map(customer => 
        customer.id === customerId 
          ? { ...customer, ...updatedCustomer } 
          : customer
      )
    );
  };

  return {
    orders,
    subscriptions: filteredSubscriptions,
    customersData,
    wholesalerCustomers,
    handleOrderPlaced,
    handleAddCustomer,
    handleUpdateCustomer
  };
}
