
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WholesaleOrder, Customer, Service } from '@/lib/types';
import { User, DollarSign } from 'lucide-react';

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
  service?: Service;
  duration?: number;
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
  service,
  duration = 1,
  customers = [],
  onCustomerChange,
  selectedCustomerId = ''
}) => {
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(duration.toString());

  useEffect(() => {
    if (!open) {
      setNotes('');
      setQuantity(1);
      setSelectedCustomer('');
      setSelectedDuration(duration.toString());
    } else {
      setNotes(customerNotes || '');
      setSelectedDuration(duration.toString());
      
      if (selectedCustomerId) {
        setSelectedCustomer(selectedCustomerId);
      }
    }
  }, [open, customerName, customerNotes, selectedCustomerId, duration]);

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

  const calculateTotalPrice = () => {
    if (!service) return 0;
    const basePrice = service.wholesalePrice || service.price || 0;
    const durationAdjustedPrice = isSubscription 
      ? basePrice * parseInt(selectedDuration) 
      : basePrice;
    return durationAdjustedPrice;
  };

  const isSubscription = service?.type === 'subscription';

  const handleSubmit = () => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);

    const order: WholesaleOrder = {
      id: `order-${Date.now()}`,
      customerId: selectedCustomer,
      serviceId: serviceId || '',
      quantity: 1,
      totalPrice: calculateTotalPrice(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: notes,
      customerName: customer?.name || 'Unknown',
      customerEmail: customer?.email,
      customerPhone: customer?.phone,
      customerCompany: customer?.company,
      durationMonths: parseInt(selectedDuration)
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
          <div className="bg-muted/30 p-4 rounded-lg flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="font-medium">Base Price:</span>
              </div>
              <span className="text-lg font-bold">
                ${service?.wholesalePrice?.toFixed(2) || service?.price?.toFixed(2) || '0.00'}
              </span>
            </div>
            
            {isSubscription && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>For {selectedDuration} {parseInt(selectedDuration) === 1 ? 'month' : 'months'}</span>
                <span>${calculateTotalPrice().toFixed(2)}</span>
              </div>
            )}
          </div>

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

          {isSubscription && (
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Select 
                value={selectedDuration} 
                onValueChange={setSelectedDuration}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 3, 6, 12].map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month} {month === 1 ? 'month' : 'months'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional instructions or notes"
            />
          </div>

          <div className="bg-primary/10 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="font-medium">Total Price:</span>
            </div>
            <span className="text-xl font-bold text-primary">
              ${calculateTotalPrice().toFixed(2)}
            </span>
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
