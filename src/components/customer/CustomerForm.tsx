
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Customer } from '@/lib/data';
import { toast } from 'sonner';

// Customer form schema - making email truly optional
const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  company: z.string().optional().or(z.literal('')),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onAddCustomer: (customer: Customer) => void;
  wholesalerId: string;
  onClose: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ 
  onAddCustomer, 
  wholesalerId,
  onClose 
}) => {
  // Setup form
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      company: '',
    },
  });

  const handleAddCustomer = (data: CustomerFormValues) => {
    // Create a new customer with the form data
    const newCustomer: Customer = {
      id: `customer-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: '', // Set email to empty string by default
      company: data.company || '',
      wholesalerId: wholesalerId,
      balance: 0,
      createdAt: new Date().toISOString() // Add required createdAt field
    };
    
    // Pass the new customer to the parent component
    onAddCustomer(newCustomer);
    
    // Reset form and close dialog
    form.reset();
    onClose();
    toast.success(`Customer ${data.name} added successfully`);
  };

  return (
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
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Customer</Button>
        </div>
      </form>
    </Form>
  );
};

export default CustomerForm;
