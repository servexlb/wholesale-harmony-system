
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Customer } from '@/lib/data';
import { Subscription } from '@/lib/types';
import CustomerList from '@/components/customer/CustomerList';
import AddCustomerButton from '@/components/customer/AddCustomerButton';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { Search } from 'lucide-react';
import StockSubscriptions from '@/components/StockSubscriptions';

interface CustomersAndStockTabProps {
  customers: Customer[];
  subscriptions: Subscription[];
  wholesalerId: string;
  onAddCustomer?: (customer: Customer) => void;
  onUpdateCustomer?: (customerId: string, updatedCustomer: Partial<Customer>) => void;
  onPurchaseForCustomer?: (customerId: string) => void;
}

const CustomersAndStockTab: React.FC<CustomersAndStockTabProps> = ({
  customers,
  subscriptions,
  wholesalerId,
  onAddCustomer,
  onUpdateCustomer,
  onPurchaseForCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('customers');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Customers & Subscriptions</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <AddCustomerButton onAddCustomer={onAddCustomer} />
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions Stock</TabsTrigger>
          </TabsList>
          <div className="max-w-xs">
            <InputWithIcon
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="search"
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>

        <TabsContent value="customers" className="mt-0">
          <CustomerList
            customers={customers}
            subscriptions={subscriptions}
            searchTerm={searchTerm}
            wholesalerId={wholesalerId}
            onPurchaseForCustomer={onPurchaseForCustomer}
            onUpdateCustomer={onUpdateCustomer}
          />
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-0">
          <StockSubscriptions 
            subscriptions={subscriptions}
            allowRenewal={true}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default CustomersAndStockTab;
