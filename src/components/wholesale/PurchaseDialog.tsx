
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WholesaleOrder, Customer, Service } from '@/lib/types';
import CustomerSelector from './CustomerSelector';
import DurationSelector from './DurationSelector';
import NotesInput from './NotesInput';
import PriceDisplay from './PriceDisplay';
import ServiceDisplay from './ServiceDisplay';
import TotalPriceDisplay from './TotalPriceDisplay';

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
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(duration.toString());

  useEffect(() => {
    if (!open) {
      setNotes('');
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
    
    // Always use the wholesalePrice for this component since it's for wholesale purchases
    const basePrice = service.wholesalePrice || 0;
    
    // Calculate adjusted price based on service type and duration
    const durationAdjustedPrice = service.type === 'subscription' 
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

  // Log price details for debugging
  console.log('Service wholesale price:', service?.wholesalePrice);
  console.log('Calculated total price:', calculateTotalPrice());

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
          <PriceDisplay 
            service={service}
            selectedDuration={selectedDuration}
            isSubscription={isSubscription}
            calculateTotalPrice={calculateTotalPrice}
          />

          <CustomerSelector 
            customers={customers}
            selectedCustomer={selectedCustomer}
            onCustomerChange={handleCustomerChange}
          />

          <ServiceDisplay serviceName={serviceName} />

          <DurationSelector 
            selectedDuration={selectedDuration}
            onDurationChange={setSelectedDuration}
            isSubscription={isSubscription}
          />

          <NotesInput 
            notes={notes}
            onChange={setNotes}
          />

          <TotalPriceDisplay totalPrice={calculateTotalPrice()} />
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
