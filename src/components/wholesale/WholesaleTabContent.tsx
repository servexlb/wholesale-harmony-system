
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import CustomerTable from '@/components/CustomerTable';
import { Customer } from '@/lib/data';
import { Subscription, WholesaleOrder, Service, ServiceType } from '@/lib/types';
import ProductsTab from './ProductsTab';
import SalesTab from './SalesTab';
import SettingsTab from './SettingsTab';
import { toast } from '@/lib/toast';
import { getAllServices } from './sales/utils/productMapUtils';
import CustomersAndStockTab from './CustomersAndStockTab';

interface WholesaleTabContentProps {
  activeTab: string;
  products: Service[]; // Changed from any[] to Service[]
  customers: Customer[];
  wholesalerCustomers: Customer[];
  orders: WholesaleOrder[];
  subscriptions: Subscription[];
  currentWholesaler: string;
  handleOrderPlaced: (order: WholesaleOrder) => void;
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer?: (customerId: string, updatedCustomer: Partial<Customer>) => void;
  onPurchaseForCustomer?: (customerId: string) => void;
}

const WholesaleTabContent: React.FC<WholesaleTabContentProps> = ({ 
  activeTab,
  products,
  customers,
  wholesalerCustomers,
  orders,
  subscriptions,
  currentWholesaler,
  handleOrderPlaced,
  onAddCustomer,
  onUpdateCustomer,
  onPurchaseForCustomer
}) => {
  // Get all available services using the utility function
  const allServices = React.useMemo(() => {
    try {
      const servicesList = getAllServices();
      console.log('Services count:', servicesList.length);
      return servicesList;
    } catch (error) {
      console.error('Error processing services:', error);
      toast.error('Error loading services');
      return [] as Service[];
    }
  }, []);

  return (
    <div className="h-full">
      <Tabs value={activeTab} defaultValue={activeTab}>
        <TabsContent value="dashboard" className="h-full">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Dashboard content */}
            <h2>Dashboard content</h2>
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="h-full">
          <ProductsTab 
            services={allServices} 
            customers={wholesalerCustomers}
            onOrderPlaced={handleOrderPlaced}
          />
        </TabsContent>
        
        <TabsContent value="customers" className="h-full">
          <CustomersAndStockTab 
            customers={customers} 
            wholesalerId={currentWholesaler}
            subscriptions={subscriptions}
            onAddCustomer={onAddCustomer}
            onUpdateCustomer={onUpdateCustomer}
            onPurchaseForCustomer={onPurchaseForCustomer}
          />
        </TabsContent>
        
        <TabsContent value="sales" className="h-full">
          <SalesTab 
            orders={orders}
            customers={wholesalerCustomers}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="h-full">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WholesaleTabContent;
