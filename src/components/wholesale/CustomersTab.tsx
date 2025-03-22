
import React from 'react';
import { motion } from 'framer-motion';
import CustomerTable from '@/components/CustomerTable';
import { Customer } from '@/lib/data';
import { Subscription } from '@/lib/types';
import ExportData from './ExportData';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  // Prepare export data
  const exportData = customers.map(customer => {
    const customerSubscriptions = subscriptions.filter(sub => sub.userId === customer.id);
    return {
      ID: customer.id,
      Name: customer.name,
      Email: customer.email,
      Phone: customer.phone || 'N/A',
      CompanyName: customer.company || 'N/A',
      Notes: customer.notes || 'N/A',
      SubscriptionsCount: customerSubscriptions.length,
      TotalSpent: customerSubscriptions.reduce((total, sub) => {
        // Since the Subscription type doesn't have a direct price property,
        // we need to use a property that does exist or default to 0
        return total + 0; // For now, we'll just use 0 as we can't accurately calculate spent amount
      }, 0)
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Customers</h1>
        <div className="flex gap-2">
          <ExportData 
            data={exportData} 
            filename="wholesale-customers" 
            disabled={customers.length === 0}
          />
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
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
