import { useState, useEffect, useMemo } from 'react';
import { WholesaleOrder, Subscription, Service, Credential } from '@/lib/types';
import { Customer } from '@/lib/data';
import { loadServices } from '@/lib/productManager';
import { addCredentialToStock, convertSubscriptionToStock } from '@/lib/credentialUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

export function useWholesaleData(currentWholesaler: string) {
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!currentWholesaler) return;
    
    setIsLoading(true);
    
    const fetchData = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          console.log('No authenticated session, loading from localStorage');
          loadFromLocalStorage();
          setIsLoading(false);
          return;
        }

        const { data: customers, error: customersError } = await supabase
          .from('wholesale_customers')
          .select('*')
          .eq('wholesaler_id', session.session.user.id);
          
        if (customersError) {
          console.error('Error fetching customers:', customersError);
          toast.error('Error loading customer data');
        } else if (customers) {
          console.log('Fetched customers from Supabase:', customers);
          const formattedCustomers = customers.map(customer => ({
            id: customer.id,
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            company: customer.company || '',
            wholesalerId: customer.wholesaler_id,
            address: customer.address || '',
            notes: customer.notes || '',
            balance: customer.balance || 0,
            createdAt: customer.created_at
          }));
          setCustomersData(formattedCustomers);
        }

        const { data: subs, error: subsError } = await supabase
          .from('wholesale_subscriptions')
          .select('*')
          .eq('wholesaler_id', session.session.user.id);
          
        if (subsError) {
          console.error('Error fetching subscriptions:', subsError);
          toast.error('Error loading subscription data');
        } else if (subs) {
          const formattedSubs = subs.map(sub => {
            let credentialsObj = undefined;
            
            if (sub.credentials) {
              const creds = sub.credentials as any;
              credentialsObj = {
                username: typeof creds === 'object' ? creds.username || '' : '',
                password: typeof creds === 'object' ? creds.password || '' : '',
                email: typeof creds === 'object' ? creds.email || '' : '',
                notes: typeof creds === 'object' ? creds.notes || '' : ''
              };
            }
            
            return {
              id: sub.id,
              userId: sub.customer_id,
              serviceId: sub.service_id,
              startDate: sub.start_date,
              endDate: sub.end_date,
              status: sub.status as 'active' | 'expired' | 'cancelled',
              durationMonths: sub.duration_months,
              credentials: credentialsObj
            };
          });
          setSubscriptions(formattedSubs);
        }

        const { data: orderData, error: ordersError } = await supabase
          .from('wholesale_orders')
          .select('*')
          .eq('wholesaler_id', session.session.user.id)
          .order('created_at', { ascending: false });
          
        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          toast.error('Error loading order data');
        } else if (orderData) {
          const formattedOrders = orderData.map(order => ({
            id: order.id,
            userId: order.wholesaler_id,
            wholesalerId: order.wholesaler_id,
            customerId: order.customer_id,
            serviceId: order.service_id,
            quantity: order.quantity || 1,
            totalPrice: order.total_price,
            status: order.status,
            createdAt: order.created_at,
            durationMonths: order.duration_months,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            customerPhone: order.customer_phone,
            customerAddress: order.customer_address,
            customerCompany: order.customer_company,
            notes: order.notes
          }));
          setOrders(formattedOrders);
        }
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        toast.error('Error connecting to database');
        
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentWholesaler]);

  const loadFromLocalStorage = () => {
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
  };
  
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

  const handleOrderPlaced = async (order: WholesaleOrder) => {
    try {
      setOrders(prev => {
        const updatedOrders = [order, ...prev];
        return updatedOrders.slice(0, 100);
      });
      
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        const { error } = await supabase
          .from('wholesale_orders')
          .insert({
            id: order.id,
            wholesaler_id: session.session.user.id,
            customer_id: order.customerId,
            service_id: order.serviceId,
            quantity: order.quantity || 1,
            total_price: order.totalPrice,
            status: order.status,
            duration_months: order.durationMonths,
            customer_name: order.customerName,
            customer_email: order.customerEmail,
            customer_phone: order.customerPhone,
            customer_address: order.customerAddress,
            customer_company: order.customerCompany,
            notes: order.notes
          });
          
        if (error) {
          console.error('Error saving order to Supabase:', error);
          toast.error('Error saving order to database');
          return;
        }
        
        const totalPrice = order.totalPrice || 0;
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', session.session.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching user balance:', profileError);
          toast.error('Error updating balance');
          return;
        }
        
        const currentBalance = profileData?.balance || 0;
        const newBalance = currentBalance - totalPrice;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', session.session.user.id);
          
        if (updateError) {
          console.error('Error updating user balance:', updateError);
          toast.error('Error updating balance');
          return;
        }
        
        localStorage.setItem(`userBalance_${session.session.user.id}`, newBalance.toString());
        
        const paymentId = `pmt-${Date.now()}`;
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            id: paymentId,
            user_id: session.session.user.id,
            amount: totalPrice,
            method: 'account_balance',
            status: 'completed',
            description: `Wholesale order for ${order.customerName || 'customer'}`,
            order_id: order.id,
            user_name: order.customerName
          });
          
        if (paymentError) {
          console.error('Error creating payment record:', paymentError);
        }
      }
      
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
            password: "", 
            username: "",
            pinCode: ""
          }
        };
        
        setSubscriptions(prev => {
          const updatedSubscriptions = [...prev, newSubscription];
          return updatedSubscriptions.slice(0, 100);
        });
        
        if (session?.session) {
          const { error } = await supabase
            .from('wholesale_subscriptions')
            .insert({
              id: newSubscription.id,
              wholesaler_id: session.session.user.id,
              customer_id: newSubscription.userId,
              service_id: newSubscription.serviceId,
              start_date: newSubscription.startDate,
              end_date: newSubscription.endDate,
              status: newSubscription.status,
              duration_months: newSubscription.durationMonths,
              credentials: newSubscription.credentials
            });
            
          if (error) {
            console.error('Error saving subscription to Supabase:', error);
            toast.error('Error saving subscription to database');
          }
        }
        
        if (order.serviceId) {
          try {
            if (order.credentials) {
              const stockCredentials = convertSubscriptionToStock({
                credentials: order.credentials
              });
              addCredentialToStock(order.serviceId, stockCredentials);
            } 
            else {
              const credentials: Credential = {
                email: "",
                password: "", 
                username: "",
                pinCode: ""
              };
              
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
    } catch (error) {
      console.error('Error in handleOrderPlaced:', error);
      toast.error('Error processing order');
    }
  };

  const handleAddCustomer = async (newCustomer: Customer) => {
    try {
      setCustomersData(prev => [...prev, newCustomer]);
      
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        console.log('Saving customer to Supabase:', newCustomer);
        
        const customerData = {
          id: newCustomer.id,
          wholesaler_id: session.session.user.id,
          name: newCustomer.name,
          email: newCustomer.email || null,
          phone: newCustomer.phone || null,
          company: newCustomer.company || null,
          address: newCustomer.address || null,
          notes: newCustomer.notes || null,
          balance: newCustomer.balance || 0
        };
        
        const { data, error } = await supabase
          .from('wholesale_customers')
          .insert(customerData)
          .select();
          
        if (error) {
          console.error('Error saving customer to Supabase:', error);
          if (error.code === '23505') {
            toast.error('A customer with this ID already exists');
          } else {
            toast.error('Error saving customer to database');
          }
          
          const currentCustomers = localStorage.getItem('wholesaleCustomers');
          const customers = currentCustomers ? JSON.parse(currentCustomers) : [];
          localStorage.setItem('wholesaleCustomers', JSON.stringify([...customers, newCustomer]));
        } else {
          console.log('Customer saved to Supabase successfully:', data);
          toast.success('Customer added successfully');
        }
      } else {
        const currentCustomers = localStorage.getItem('wholesaleCustomers');
        const customers = currentCustomers ? JSON.parse(currentCustomers) : [];
        localStorage.setItem('wholesaleCustomers', JSON.stringify([...customers, newCustomer]));
      }
    } catch (error) {
      console.error('Error in handleAddCustomer:', error);
      toast.error('Error adding customer');
      
      const currentCustomers = localStorage.getItem('wholesaleCustomers');
      const customers = currentCustomers ? JSON.parse(currentCustomers) : [];
      localStorage.setItem('wholesaleCustomers', JSON.stringify([...customers, newCustomer]));
    }
  };

  const handleUpdateCustomer = async (customerId: string, updatedCustomer: Partial<Customer>) => {
    try {
      setCustomersData(prev => 
        prev.map(customer => 
          customer.id === customerId 
            ? { ...customer, ...updatedCustomer } 
            : customer
        )
      );
      
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        const supabaseUpdateData: any = {};
        if (updatedCustomer.name) supabaseUpdateData.name = updatedCustomer.name;
        if (updatedCustomer.email !== undefined) supabaseUpdateData.email = updatedCustomer.email || null;
        if (updatedCustomer.phone !== undefined) supabaseUpdateData.phone = updatedCustomer.phone || null;
        if (updatedCustomer.company !== undefined) supabaseUpdateData.company = updatedCustomer.company || null;
        if (updatedCustomer.address !== undefined) supabaseUpdateData.address = updatedCustomer.address || null;
        if (updatedCustomer.notes !== undefined) supabaseUpdateData.notes = updatedCustomer.notes || null;
        if (updatedCustomer.balance !== undefined) supabaseUpdateData.balance = updatedCustomer.balance;
        
        supabaseUpdateData.updated_at = new Date().toISOString();
        
        const { error } = await supabase
          .from('wholesale_customers')
          .update(supabaseUpdateData)
          .eq('id', customerId)
          .eq('wholesaler_id', session.session.user.id);
          
        if (error) {
          console.error('Error updating customer in Supabase:', error);
          toast.error('Error updating customer in database');
        }
      }
    } catch (error) {
      console.error('Error in handleUpdateCustomer:', error);
      toast.error('Error updating customer');
    }
  };

  return {
    orders,
    subscriptions: filteredSubscriptions,
    customersData,
    wholesalerCustomers,
    isLoading,
    handleOrderPlaced,
    handleAddCustomer,
    handleUpdateCustomer
  };
}
