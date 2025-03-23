
import React, { useState, useEffect } from 'react';
import { Customer, customers as allCustomers } from '@/lib/data';
import { Subscription } from '@/lib/types';
import CustomerSearchBar from './customer/CustomerSearchBar';
import CustomerList from './customer/CustomerList';
import AddCustomerButton from './customer/AddCustomerButton';

interface CustomerTableProps {
  subscriptions?: Subscription[];
  customers?: Customer[];
  wholesalerId?: string;
  onPurchaseForCustomer?: (customerId: string) => void;
  onAddCustomer?: (customer: Customer) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ 
  subscriptions = [], 
  customers = allCustomers,
  wholesalerId = '',
  onPurchaseForCustomer,
  onAddCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customersList, setCustomersList] = useState<Customer[]>(customers);
  
  // Update customers list when the customers prop changes
  useEffect(() => {
    setCustomersList(customers);
  }, [customers]);

  const handleAddCustomer = (newCustomer: Customer) => {
    // Add to the customers list
    setCustomersList(prev => [...prev, newCustomer]);
    
    // Pass the new customer to the parent component if onAddCustomer is provided
    if (onAddCustomer) {
      onAddCustomer(newCustomer);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CustomerSearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
        <AddCustomerButton 
          onAddCustomer={handleAddCustomer} 
          wholesalerId={wholesalerId} 
        />
      </div>

      <CustomerList 
        customers={customersList}
        subscriptions={subscriptions}
        searchTerm={searchTerm}
        wholesalerId={wholesalerId}
        onPurchaseForCustomer={onPurchaseForCustomer}
      />
    </div>
  );
};

export default CustomerTable;
