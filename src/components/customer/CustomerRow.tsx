
import React, { useState } from 'react';
import { Customer } from '@/lib/data';
import { Subscription } from '@/lib/types';
import ExpandedSubscriptionDetails from './ExpandedSubscriptionDetails';
import CustomerActionsMenu from './CustomerActionsMenu';

interface CustomerRowProps {
  customer: Customer;
  subscriptions?: Subscription[];
  onPurchaseForCustomer?: (customerId: string) => void;
  onUpdateCustomer?: (customerId: string, updatedCustomer: Partial<Customer>) => void;
}

const CustomerRow: React.FC<CustomerRowProps> = ({ 
  customer, 
  subscriptions = [],
  onPurchaseForCustomer,
  onUpdateCustomer
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="group">
      <div 
        className={`grid grid-cols-12 items-center p-4 hover:bg-gray-50 cursor-pointer relative`}
        onClick={toggleExpanded}
      >
        <div className="col-span-4 md:col-span-3">
          <p className="font-medium truncate">{customer.name}</p>
        </div>
        <div className="col-span-4 md:col-span-3 truncate">
          {customer.email || '-'}
        </div>
        <div className="hidden md:block md:col-span-2 truncate">
          {customer.phone || '-'}
        </div>
        <div className="col-span-3 md:col-span-3 truncate">
          {customer.company || '-'}
        </div>
        <div className="col-span-1 text-right">
          <CustomerActionsMenu 
            customerId={customer.id} 
            onPurchaseForCustomer={onPurchaseForCustomer} 
            customer={customer}
            onUpdateCustomer={onUpdateCustomer}
          />
        </div>
      </div>
      
      {expanded && subscriptions.length > 0 && (
        <ExpandedSubscriptionDetails 
          subscriptions={subscriptions} 
          customerId={customer.id}
        />
      )}
    </div>
  );
};

export default CustomerRow;
