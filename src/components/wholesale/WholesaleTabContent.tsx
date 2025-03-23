
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Customer, Product } from '@/lib/data';
import { Subscription, WholesaleOrder } from '@/lib/types';
import ProductsTab from './ProductsTab';
import CustomersTab from './CustomersTab';
import SalesTab from './SalesTab';
import StockTab from './StockTab';
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
  onAddCustomer?: (customer: Customer) => void;
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
  onAddCustomer
}) => {
  // Helper function to render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <ProductsTab
            products={products}
            customers={wholesalerCustomers}
            onOrderPlaced={handleOrderPlaced}
          />
        );
      case 'customers':
        return (
          <CustomersTab
            customers={wholesalerCustomers}
            subscriptions={subscriptions}
            wholesalerId={currentWholesaler}
            onPurchaseForCustomer={(customerId) => {
              // Dispatch a custom event to open the purchase dialog
              const event = new CustomEvent('openPurchaseDialog', { detail: { customerId } });
              window.dispatchEvent(event);
            }}
            onAddCustomer={onAddCustomer}
          />
        );
      case 'sales':
        return (
          <SalesTab
            orders={orders}
            customers={wholesalerCustomers}
          />
        );
      case 'stock':
        return <StockTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        {renderTabContent()}
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(WholesaleTabContent);
