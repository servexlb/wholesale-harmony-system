
import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CreditCard, ShoppingCart, Eye, KeyRound } from 'lucide-react';
import CustomerActionsMenu from './CustomerActionsMenu';
import { toast } from '@/lib/toast';
import { Customer } from '@/lib/data';
import UserSubscriptionsView from '../wholesale/UserSubscriptionsView';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CustomerRowProps {
  customer: Customer;
  onPurchaseForCustomer?: (customerId: string) => void;
  onUpdateCustomer?: (customerId: string, updatedCustomer: Partial<Customer>) => void;
  activeSubscriptions?: number;
}

const CustomerRow: React.FC<CustomerRowProps> = ({
  customer,
  onPurchaseForCustomer,
  onUpdateCustomer,
  activeSubscriptions = 0
}) => {
  const [showSubscriptions, setShowSubscriptions] = useState(false);

  const handlePurchaseClick = () => {
    if (onPurchaseForCustomer) {
      onPurchaseForCustomer(customer.id);
    } else {
      // If no callback is provided, dispatch a custom event
      window.dispatchEvent(new CustomEvent('openPurchaseDialog', { 
        detail: { 
          customerId: customer.id,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone
        }
      }));
    }
  };

  const copyContact = () => {
    const contactInfo = `${customer.name}\n${customer.email || ''}\n${customer.phone || ''}`;
    navigator.clipboard.writeText(contactInfo);
    toast.success('Contact info copied to clipboard');
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <div>
            <div className="font-medium">{customer.name}</div>
            {customer.company && <div className="text-sm text-muted-foreground">{customer.company}</div>}
          </div>
        </TableCell>
        <TableCell>
          {customer.email || '-'}
        </TableCell>
        <TableCell>
          {customer.phone || '-'}
        </TableCell>
        <TableCell className="text-center">
          {activeSubscriptions}
        </TableCell>
        <TableCell>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePurchaseClick}
              title="New purchase"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Purchase</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubscriptions(true)}
              title="View subscriptions"
            >
              <KeyRound className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Subscriptions</span>
            </Button>
            
            <CustomerActionsMenu 
              customer={customer} 
              onUpdateCustomer={onUpdateCustomer}
              onCopyContact={copyContact}
            />
          </div>
        </TableCell>
      </TableRow>
      
      <Dialog open={showSubscriptions} onOpenChange={setShowSubscriptions}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Subscriptions for {customer.name}</DialogTitle>
          </DialogHeader>
          <UserSubscriptionsView 
            userId={customer.id} 
            userName={customer.name}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerRow;
