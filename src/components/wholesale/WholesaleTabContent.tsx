
import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import CustomerTable from '@/components/CustomerTable';
import SalesCalculator from '@/components/SalesCalculator';
import StockSubscriptions from '@/components/StockSubscriptions';
import WholesaleOrderForm from '@/components/WholesaleOrderForm';
import RecentOrdersTable from './RecentOrdersTable';
import { WholesaleOrder, Subscription } from '@/lib/types';
import { Product, Customer } from '@/lib/data';
import { Button } from '@/components/ui/button';

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
  return (
    <>
      {activeTab === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Wholesale Dashboard</h1>
          <SalesCalculator />
        </motion.div>
      )}
      
      {activeTab === 'products' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Wholesale Products</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} isWholesale={true} />
            ))}
          </div>
        </motion.div>
      )}
      
      {activeTab === 'new-order' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">New Wholesale Order</h1>
          <WholesaleOrderForm 
            products={products} 
            onOrderPlaced={handleOrderPlaced}
            subscriptions={subscriptions}
            wholesalerId={currentWholesaler}
            customers={wholesalerCustomers}
          />
          
          <RecentOrdersTable 
            orders={orders} 
            products={products} 
            wholesalerCustomers={wholesalerCustomers} 
          />
        </motion.div>
      )}
      
      {activeTab === 'customers' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Manage Customers</h1>
          <CustomerTable 
            subscriptions={subscriptions} 
            customers={wholesalerCustomers} 
            wholesalerId={currentWholesaler}
          />
        </motion.div>
      )}
      
      {activeTab === 'stock' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <StockSubscriptions subscriptions={subscriptions} />
        </motion.div>
      )}
      
      {activeTab === 'sales' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Sales Overview</h1>
          <SalesCalculator />
        </motion.div>
      )}
      
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium mb-4">Preferences</h2>
            <p className="text-muted-foreground mb-6">
              Settings panel is under development.
            </p>
            <Button variant="outline">
              Save Changes
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default WholesaleTabContent;
