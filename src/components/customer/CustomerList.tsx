
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from '@/components/ui/table';
import { Customer } from '@/lib/data';
import { Subscription } from '@/lib/types';
import CustomerRow from './CustomerRow';
import CustomerTableHeader from './CustomerTableHeader';

interface CustomerListProps {
  customers: Customer[];
  subscriptions: Subscription[];
  searchTerm: string;
  wholesalerId: string;
  onPurchaseForCustomer?: (customerId: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ 
  customers, 
  subscriptions, 
  searchTerm, 
  wholesalerId,
  onPurchaseForCustomer 
}) => {
  const filteredCustomers = customers.filter(customer => 
    (customer.wholesalerId === wholesalerId) && 
    (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm))
  );

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <CustomerTableHeader />
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <CustomerRow 
                  key={customer.id} 
                  customer={customer} 
                  subscriptions={subscriptions.filter(sub => sub.userId === customer.id)}
                  onPurchaseForCustomer={onPurchaseForCustomer}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CustomerList;
