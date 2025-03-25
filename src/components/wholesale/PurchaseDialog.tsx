
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WholesaleOrder, Customer } from '@/lib/types';

interface PurchaseDialogProps {
  onPurchase: (order: WholesaleOrder) => void;
  isSubmitting: boolean;
  isMobile: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  // Add the missing props that were referenced in Wholesale.tsx
  customerName?: string;
  customerNotes?: string;
}

const PurchaseDialog: React.FC<PurchaseDialogProps> = ({ 
  onPurchase, 
  isSubmitting, 
  isMobile,
  open,
  onOpenChange,
  children,
  customerName = '', // Provide default value
  customerNotes = ''  // Provide default value
}) => {
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState('');

  // Get available customers from localStorage
  const customersFromStorage = localStorage.getItem('wholesale_customers');
  const customers: Customer[] = customersFromStorage ? JSON.parse(customersFromStorage) : [];

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setNotes('');
      setQuantity(1);
      setSelectedCustomer('');
    } else if (customerName) {
      // Use the provided customer name for notes if available
      setNotes(customerNotes || '');
    }
  }, [open, customerName, customerNotes]);

  // Set selected customer based on customerName prop if available
  useEffect(() => {
    if (customerName && customers.length > 0) {
      const customer = customers.find(c => c.name === customerName);
      if (customer) {
        setSelectedCustomer(customer.id);
      }
    }
  }, [customerName, customers]);

  const handleSubmit = () => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    // Create mock order
    const order: WholesaleOrder = {
      id: `order-${Date.now()}`,
      customerId: selectedCustomer,
      quantity: quantity,
      totalPrice: 19.99 * quantity, // Mock price
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: notes,
      customerName: customers.find(c => c.id === selectedCustomer)?.name || 'Unknown',
    };

    onPurchase(order);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Enter the details to process your order
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="customer">Customer</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.length === 0 ? (
                  <SelectItem value="none" disabled>No customers available</SelectItem>
                ) : (
                  customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

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
