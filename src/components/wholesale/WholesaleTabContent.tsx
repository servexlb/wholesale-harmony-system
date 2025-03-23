
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import CustomerTable from '@/components/CustomerTable';
import { Customer, Product } from '@/lib/data';
import { Subscription, WholesaleOrder } from '@/lib/types';
import ProductsTab from './ProductsTab';
import SalesTab from './SalesTab';
import SettingsTab from './SettingsTab';

interface WholesaleTabContentProps {
  activeTab: string;
  products: Product[];
  customers: Customer[];
  wholesalerCustomers: Customer[];
  orders: WholesaleOrder[];
  subscriptions: Subscription[];
  currentWholesaler: string;
  handleOrderPlaced: (order: WholesaleOrder) => void;
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer?: (customerId: string, updatedCustomer: Partial<Customer>) => void;
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
  onUpdateCustomer
}) => {
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
            products={products} 
            customers={wholesalerCustomers}
            onOrderPlaced={handleOrderPlaced}
          />
        </TabsContent>
        
        <TabsContent value="customers" className="h-full">
          <CustomerTable 
            customers={customers} 
            wholesalerId={currentWholesaler}
            subscriptions={subscriptions}
            onAddCustomer={onAddCustomer}
            onUpdateCustomer={onUpdateCustomer}
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
