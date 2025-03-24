import { useState, useEffect, useMemo } from 'react';
import { WholesaleOrder, Subscription, Service } from '@/lib/types';
import { Customer } from '@/lib/data';
import { loadServices } from '@/lib/productManager';
import { addCredentialToStock, convertSubscriptionToStock, generateRandomPassword } from '@/lib/credentialUtils';

export function useWholesaleData(currentWholesaler: string) {
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);

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
    
    const service = services.find(s => s.id === order.serviceId);
    
    if (service?.type === 'subscription' || order.credentials) {
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
        credentials: order.credentials || {
          email: "",
          password: generateRandomPassword(),
          username: "",
          pinCode: ""
        }
      };
      
      setSubscriptions(prev => {
        const updatedSubscriptions = [...prev, newSubscription];
        return updatedSubscriptions.slice(0, 100);
      });
      
      if (order.serviceId) {
        try {
          const credentials = order.credentials || {
            email: "",
            password: generateRandomPassword(),
            username: "",
            pinCode: ""
          };
          
          if (order.credentials) {
            const stockCredentials = convertSubscriptionToStock({
              credentials: order.credentials
            });
            addCredentialToStock(order.serviceId, stockCredentials);
          } 
          else {
            addCredentialToStock(order.serviceId, credentials);
          }
          
          window.dispatchEvent(new CustomEvent('subscription-added', { 
            detail: { serviceId: order.serviceId }
          }));
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
