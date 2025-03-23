
import React, { useState } from 'react';
import { Customer } from '@/lib/data';
import { Subscription } from '@/lib/types';
import ExpandedSubscriptionDetails from './ExpandedSubscriptionDetails';
import CustomerActionsMenu from './CustomerActionsMenu';
import { isSubscriptionEndingSoon } from '../wholesale/stock/utils';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

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

  // Check if any subscription is ending soon
  const hasEndingSoonSubscriptions = subscriptions.some(sub => 
    isSubscriptionEndingSoon(sub, 5)
  );

  // Count how many subscriptions are ending soon
  const endingSoonCount = subscriptions.filter(sub => 
    isSubscriptionEndingSoon(sub, 5)
  ).length;

  return (
    <div className="group">
      <div 
        className={`grid grid-cols-12 items-center p-4 hover:bg-gray-50 cursor-pointer relative ${hasEndingSoonSubscriptions ? 'bg-amber-50' : ''}`}
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
        <div className="col-span-3 md:col-span-3 truncate flex items-center gap-2">
          {customer.company || '-'}
          {hasEndingSoonSubscriptions && (
            <Badge variant="outline" className="border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-100">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {endingSoonCount} ending soon
            </Badge>
          )}
        </div>
        <div className="col-span-1 text-right">
          <CustomerActionsMenu 
            customer={customer} 
            onPurchaseForCustomer={onPurchaseForCustomer} 
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
