
import React from 'react';
import { motion } from 'framer-motion';
import CustomerTable from '@/components/CustomerTable';
import { Customer } from '@/lib/data';
import { Subscription } from '@/lib/types';

interface CustomersTabProps {
  customers: Customer[];
  subscriptions: Subscription[];
  wholesalerId: string;
  onPurchaseForCustomer: (customerId: string) => void;
}

const CustomersTab: React.FC<CustomersTabProps> = ({ 
  customers, 
  subscriptions, 
  wholesalerId, 
  onPurchaseForCustomer 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Customers</h1>
      </div>
      <CustomerTable 
        subscriptions={subscriptions} 
        customers={customers} 
        wholesalerId={wholesalerId}
        onPurchaseForCustomer={onPurchaseForCustomer}
      />
    </motion.div>
  );
};

export default CustomersTab;
