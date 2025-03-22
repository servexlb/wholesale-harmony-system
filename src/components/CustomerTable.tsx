
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus } from 'lucide-react';
import { Customer, customers as allCustomers } from '@/lib/data';
import { Subscription } from '@/lib/types';
import CustomerRow from './customer/CustomerRow';

interface CustomerTableProps {
  subscriptions?: Subscription[];
  customers?: Customer[];
  wholesalerId?: string;
  onPurchaseForCustomer?: (customerId: string) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ 
  subscriptions = [], 
  customers = allCustomers,
  wholesalerId = '',
  onPurchaseForCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCustomers = customers.filter(customer => 
    (customer.wholesalerId === wholesalerId) && 
    (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm))
  );

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="subtle-focus-ring">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Active Subscriptions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
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
    </div>
  );
};

export default CustomerTable;
