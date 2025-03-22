
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { WholesaleOrder } from '@/lib/types';
import { Product, Customer, customers } from '@/lib/data';
import { Plus } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  productId: z.string({ required_error: "Please select a product" }),
  customerId: z.string({ required_error: "Please select a customer" }),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

// New customer form schema
const newCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  company: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type NewCustomerFormValues = z.infer<typeof newCustomerSchema>;

interface WholesaleOrderFormProps {
  products: Product[];
  onOrderPlaced: (order: WholesaleOrder) => void;
}

const WholesaleOrderForm: React.FC<WholesaleOrderFormProps> = ({
  products,
  onOrderPlaced,
}) => {
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [customersList, setCustomersList] = useState<Customer[]>(customers);

  // Main form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  // New customer form
  const newCustomerForm = useForm<NewCustomerFormValues>({
    resolver: zodResolver(newCustomerSchema),
  });

  const handleSubmit = (values: FormValues) => {
    const product = products.find(p => p.id === values.productId);
    
    if (!product) {
      toast.error("Product not found");
      return;
    }

    // In a real app, this would be an API call
    const newOrder: WholesaleOrder = {
      id: `order-${Date.now()}`,
      userId: "wholesale-user-id", // This would come from auth context
      wholesalerId: "wholesale-user-id", // This would come from auth context
      serviceId: values.productId,
      customerId: values.customerId,
      quantity: values.quantity,
      totalPrice: product.wholesalePrice * values.quantity,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    onOrderPlaced(newOrder);
    form.reset();
    toast.success(`Order placed for ${customersList.find(c => c.id === values.customerId)?.name}`);
  };

  const handleAddNewCustomer = (data: NewCustomerFormValues) => {
    // In a real app, this would be an API call
    const newCustomer: Customer = {
      id: `customer-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
    };

    setCustomersList(prev => [...prev, newCustomer]);
    form.setValue('customerId', newCustomer.id);
    setIsNewCustomerDialogOpen(false);
    newCustomerForm.reset();
    toast.success(`New customer ${data.name} added`);
  };

  const selectedProduct = form.watch('productId') 
    ? products.find(p => p.id === form.watch('productId')) 
    : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-medium mb-6">New Wholesale Order</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - ${product.wholesalePrice.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <div className="flex gap-2">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customersList.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.company || "Individual"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                        <DialogDescription>
                          Enter the details of your new customer below.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...newCustomerForm}>
                        <form onSubmit={newCustomerForm.handleSubmit(handleAddNewCustomer)} className="space-y-4">
                          <FormField
                            control={newCustomerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={newCustomerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={newCustomerForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 (555) 123-4567" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={newCustomerForm.control}
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
                            <Button type="button" variant="outline" onClick={() => setIsNewCustomerDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Add Customer</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedProduct && (
            <div className="mt-4 p-4 bg-muted/40 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Price per unit:</span>
                <span className="font-medium">${selectedProduct.wholesalePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total price:</span>
                <span className="text-primary">
                  ${(selectedProduct.wholesalePrice * (form.watch('quantity') || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full mt-2">Place Order</Button>
        </form>
      </Form>
    </div>
  );
};

export default WholesaleOrderForm;
