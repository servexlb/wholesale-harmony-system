
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionTracker from '@/components/dashboard/SubscriptionTracker';
import { useEffect, useState } from 'react';
import { Service } from '@/lib/types';
import { loadServices } from '@/lib/productManager';

const Dashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  
  useEffect(() => {
    // Load services for the subscription tracker
    const loadedServices = loadServices();
    setServices(loadedServices);
    
    const handleServiceUpdate = () => {
      const updatedServices = loadServices();
      setServices(updatedServices);
    };
    
    window.addEventListener('service-updated', handleServiceUpdate);
    window.addEventListener('service-added', handleServiceUpdate);
    window.addEventListener('service-deleted', handleServiceUpdate);
    
    return () => {
      window.removeEventListener('service-updated', handleServiceUpdate);
      window.removeEventListener('service-added', handleServiceUpdate);
      window.removeEventListener('service-deleted', handleServiceUpdate);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      <Tabs defaultValue="subscriptions">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscriptions" className="space-y-8 mt-6">
          <SubscriptionTracker services={services} />
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-8 mt-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
              <p className="text-muted-foreground text-sm">
                Your payment history will appear here.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="support" className="space-y-8 mt-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Support Tickets</h2>
              <p className="text-muted-foreground text-sm">
                Your support tickets will appear here.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
