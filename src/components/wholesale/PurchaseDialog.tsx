
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WholesaleOrder, Customer } from '@/lib/types';
import { User } from 'lucide-react';

interface PurchaseDialogProps {
  onPurchase: (order: WholesaleOrder) => void;
  isSubmitting: boolean;
  isMobile: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  customerName?: string;
  customerNotes?: string;
  serviceName?: string;
  serviceId?: string;
  customers?: Customer[];
  onCustomerChange?: (customerId: string) => void;
  selectedCustomerId?: string;
}

const PurchaseDialog: React.FC<PurchaseDialogProps> = ({ 
  onPurchase, 
  isSubmitting, 
  isMobile,
  open,
  onOpenChange,
  children,
  customerName = '',
  customerNotes = '',
  serviceName = '',
  serviceId = '',
  customers = [],
  onCustomerChange,
  selectedCustomerId = ''
}) => {
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setNotes('');
      setQuantity(1);
      setSelectedCustomer('');
    } else {
      // Use the provided customer name for notes if available
      setNotes(customerNotes || '');
      
      // If we have a selected customer ID from props, use it
      if (selectedCustomerId) {
        setSelectedCustomer(selectedCustomerId);
      }
    }
  }, [open, customerName, customerNotes, selectedCustomerId]);

  // Set selected customer based on customerName prop if available
  useEffect(() => {
    if (customerName && customers.length > 0 && !selectedCustomer) {
      const customer = customers.find(c => c.name === customerName);
      if (customer) {
        setSelectedCustomer(customer.id);
        if (onCustomerChange) onCustomerChange(customer.id);
      }
    }
  }, [customerName, customers, selectedCustomer, onCustomerChange]);

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId);
    if (onCustomerChange) {
      onCustomerChange(customerId);
    }
  };

  const handleSubmit = () => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);

    // Create order
    const order: WholesaleOrder = {
      id: `order-${Date.now()}`,
      customerId: selectedCustomer,
      serviceId: serviceId || '',
      quantity: quantity,
      totalPrice: 19.99 * quantity, // This would be calculated based on the selected service
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: notes,
      customerName: customer?.name || 'Unknown',
      customerEmail: customer?.email,
      customerPhone: customer?.phone,
      customerCompany: customer?.company
    };

    onPurchase(order);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            {serviceName ? `Purchase ${serviceName} for your customer` : 'Enter the details to process your order'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="customer">Customer</Label>
            <Select value={selectedCustomer} onValueChange={handleCustomerChange}>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.length === 0 ? (
                  <SelectItem value="none" disabled>No customers available</SelectItem>
                ) : (
                  customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.name}</span>
                        {customer.company && (
                          <span className="text-xs text-muted-foreground">({customer.company})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {serviceName && (
            <div className="grid gap-2">
              <Label>Service</Label>
              <div className="p-2 bg-muted rounded-md">
                {serviceName}
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional instructions or notes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Complete Purchase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;
