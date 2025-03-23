
import React, { useState, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// Customer form schema
const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [customersList, setCustomersList] = useState<Customer[]>(customers);
  
  // Update customers list when the customers prop changes
  useEffect(() => {
    setCustomersList(customers);
  }, [customers]);
  
  // Setup form
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      company: '',
    },
  });

  const handleAddCustomer = (data: CustomerFormValues) => {
    // Create a new customer with the form data
    const newCustomer: Customer = {
      id: `customer-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      company: data.company || '',
      wholesalerId: wholesalerId,
      balance: 0
    };
    
    // Add to the customers list
    setCustomersList(prev => [...prev, newCustomer]);
    
    // Pass the new customer to the parent component if onAddCustomer is provided
    if (onAddCustomer) {
      onAddCustomer(newCustomer);
    }
    
    // Reset form and close dialog
    form.reset();
    setIsAddDialogOpen(false);
    toast.success(`Customer ${data.name} added successfully`);
  };
  
  const filteredCustomers = customersList.filter(customer => 
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <Button className="subtle-focus-ring" onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddCustomer)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Customer</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
