
import React from 'react';
import { Customer } from '@/lib/data';
import CustomerRow from './CustomerRow';
import CustomerTableHeader from './CustomerTableHeader';
import { Subscription } from '@/lib/types';

interface CustomerListProps {
  customers: Customer[];
  subscriptions?: Subscription[];
  searchTerm: string;
  wholesalerId?: string;
  onPurchaseForCustomer?: (customerId: string) => void;
  onUpdateCustomer?: (customerId: string, updatedCustomer: Partial<Customer>) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  subscriptions = [],
  searchTerm,
  wholesalerId,
  onPurchaseForCustomer,
  onUpdateCustomer
}) => {
  // Filter customers based on search term and wholesalerId
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === '' || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesWholesaler = !wholesalerId || customer.wholesalerId === wholesalerId;
    
    return matchesSearch && matchesWholesaler;
  });

  return (
    <div className="border rounded-md overflow-hidden">
      <CustomerTableHeader />
      <div className="divide-y">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map(customer => (
            <CustomerRow
              key={customer.id}
              customer={customer}
              subscriptions={subscriptions.filter(s => s.userId === customer.id)}
              onPurchaseForCustomer={onPurchaseForCustomer}
              onUpdateCustomer={onUpdateCustomer}
            />
          ))
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            No customers found
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
