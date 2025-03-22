
import React, { useState } from 'react';
import { Product, Customer } from '@/lib/data';
import { WholesaleOrder, Subscription } from '@/lib/types';
import ProductsTab from './ProductsTab';
import CustomersTab from './CustomersTab';
import StockTab from './StockTab';
import SalesTab from './SalesTab';
import SettingsTab from './SettingsTab';
import PurchaseDialog from './PurchaseDialog';

interface WholesaleTabContentProps {
  activeTab: string;
  products: Product[];
  customers: Customer[];
  wholesalerCustomers: Customer[];
  orders: WholesaleOrder[];
  subscriptions: Subscription[];
  currentWholesaler: string;
  handleOrderPlaced: (order: WholesaleOrder) => void;
}

const WholesaleTabContent: React.FC<WholesaleTabContentProps> = ({
  activeTab,
  products,
  customers,
  wholesalerCustomers,
  orders,
  subscriptions,
  currentWholesaler,
  handleOrderPlaced
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  
  const handlePurchaseForCustomer = (customerId: string) => {
    setSelectedCustomer(customerId);
    setIsPurchaseDialogOpen(true);
  };
  
  return (
    <>      
      {activeTab === 'products' && (
        <ProductsTab 
          products={products} 
          onOpenPurchaseDialog={() => setIsPurchaseDialogOpen(true)} 
        />
      )}
      
      {activeTab === 'customers' && (
        <CustomersTab 
          customers={wholesalerCustomers} 
          subscriptions={subscriptions} 
          wholesalerId={currentWholesaler} 
          onPurchaseForCustomer={handlePurchaseForCustomer} 
        />
      )}
      
      {activeTab === 'stock' && (
        <StockTab subscriptions={subscriptions} />
      )}
      
      {activeTab === 'sales' && (
        <SalesTab 
          orders={orders}
          customers={wholesalerCustomers}
        />
      )}
      
      {activeTab === 'settings' && (
        <SettingsTab />
      )}
      
      <PurchaseDialog 
        open={isPurchaseDialogOpen}
        onOpenChange={setIsPurchaseDialogOpen}
        customers={wholesalerCustomers}
        products={products}
        selectedCustomer={selectedCustomer}
        currentWholesaler={currentWholesaler}
        onOrderPlaced={handleOrderPlaced}
      />
    </>
  );
};

export default WholesaleTabContent;
