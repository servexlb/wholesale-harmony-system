
import React, { useState, useCallback, memo } from 'react';
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

// Create memoized tab components to prevent unnecessary re-renders
const MemoizedProductsTab = memo(ProductsTab);
const MemoizedCustomersTab = memo(CustomersTab);
const MemoizedStockTab = memo(StockTab);
const MemoizedSalesTab = memo(SalesTab);
const MemoizedSettingsTab = memo(SettingsTab);

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
  
  const handlePurchaseForCustomer = useCallback((customerId: string) => {
    console.log('WholesaleTabContent: Purchase for customer:', customerId);
    setSelectedCustomer(customerId);
    setIsPurchaseDialogOpen(true);
  }, []);
  
  const handleOpenPurchaseDialog = useCallback(() => {
    console.log('Opening purchase dialog from Products tab');
    setSelectedCustomer(''); // Reset customer when opening from products tab
    setIsPurchaseDialogOpen(true);
  }, []);
  
  // Only render the active tab to reduce DOM size and improve performance
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'products':
        return <MemoizedProductsTab products={products} onOpenPurchaseDialog={handleOpenPurchaseDialog} />;
      case 'customers':
        return (
          <MemoizedCustomersTab 
            customers={wholesalerCustomers} 
            subscriptions={subscriptions} 
            wholesalerId={currentWholesaler} 
            onPurchaseForCustomer={handlePurchaseForCustomer} 
          />
        );
      case 'stock':
        return <MemoizedStockTab subscriptions={subscriptions} />;
      case 'sales':
        return <MemoizedSalesTab orders={orders} customers={wholesalerCustomers} />;
      case 'settings':
        return <MemoizedSettingsTab />;
      default:
        return null;
    }
  };
  
  return (
    <>
      {renderActiveTab()}
      
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

export default memo(WholesaleTabContent);
