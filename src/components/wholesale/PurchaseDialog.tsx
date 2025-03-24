
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WholesaleOrder, Service } from '@/lib/types';
import { Customer } from '@/lib/data';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';

interface PurchaseDialogProps {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCompany?: string;
  customerNotes?: string;
  onPurchase: (order: WholesaleOrder) => void;
  isSubmitting: boolean;
  isMobile: boolean;
  children: React.ReactNode;
}

const PurchaseDialog: React.FC<PurchaseDialogProps> = ({
  customerName: initialCustomerName = '',
  customerEmail: initialCustomerEmail = '',
  customerPhone: initialCustomerPhone = '',
  customerAddress: initialCustomerAddress = '',
  customerCompany: initialCustomerCompany = '',
  customerNotes: initialCustomerNotes = '',
  onPurchase,
  isSubmitting,
  isMobile,
  children
}) => {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerEmail, setCustomerEmail] = useState(initialCustomerEmail);
  const [customerPhone, setCustomerPhone] = useState(initialCustomerPhone);
  const [customerAddress, setCustomerAddress] = useState(initialCustomerAddress);
  const [customerCompany, setCustomerCompany] = useState(initialCustomerCompany);
  const [customerNotes, setCustomerNotes] = useState(initialCustomerNotes);
  
  const [availableDurations, setAvailableDurations] = useState<number[]>([1]);
  const [pricingData, setPricingData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customerId, setCustomerId] = useState('');

  // Initialize services
  useEffect(() => {
    const storedServices = localStorage.getItem('services');
    if (storedServices) {
      try {
        const parsedServices = JSON.parse(storedServices);
        setServices(parsedServices);
      } catch (error) {
        console.error('Error parsing services:', error);
      }
    }
    
    // Listen for custom events that might update service list
    const handleServiceUpdated = () => {
      const updatedServices = localStorage.getItem('services');
      if (updatedServices) {
        try {
          const parsedServices = JSON.parse(updatedServices);
          setServices(parsedServices);
        } catch (error) {
          console.error('Error parsing updated services:', error);
        }
      }
    };
    
    window.addEventListener('service-updated', handleServiceUpdated);
    window.addEventListener('service-added', handleServiceUpdated);
    window.addEventListener('service-deleted', handleServiceUpdated);
    
    return () => {
      window.removeEventListener('service-updated', handleServiceUpdated);
      window.removeEventListener('service-added', handleServiceUpdated);
      window.removeEventListener('service-deleted', handleServiceUpdated);
    };
  }, []);
  
  // Listen for purchase dialog events
  useEffect(() => {
    const handleOpenPurchaseDialog = (event: Event) => {
      try {
        const customEvent = event as CustomEvent;
        if (customEvent.detail?.customerId) {
          setCustomerId(customEvent.detail.customerId);
        }
        
        if (customEvent.detail?.serviceId) {
          setServiceId(customEvent.detail.serviceId);
        }
        
        // Check for customer details
        if (customEvent.detail?.customerName) {
          setCustomerName(customEvent.detail.customerName);
        }
        
        if (customEvent.detail?.customerEmail) {
          setCustomerEmail(customEvent.detail.customerEmail);
        }
        
        if (customEvent.detail?.customerPhone) {
          setCustomerPhone(customEvent.detail.customerPhone);
        }
        
        setOpen(true);
      } catch (error) {
        console.error('Error opening purchase dialog:', error);
      }
    };

    window.addEventListener('openPurchaseDialog', handleOpenPurchaseDialog);

    return () => {
      window.removeEventListener('openPurchaseDialog', handleOpenPurchaseDialog);
    };
  }, []);

  // Load service pricing
  useEffect(() => {
    if (!serviceId) {
      setPricingData([]);
      setAvailableDurations([1]);
      return;
    }
    
    const fetchPricing = async () => {
      try {
        // Try to get pricing from service_pricing table
        const { data, error } = await supabase
          .from('service_pricing')
          .select('*')
          .eq('service_id', serviceId);
          
        if (error) {
          console.error('Error fetching pricing data:', error);
          // Fallback to local storage
          fallbackToLocalPricing();
          return;
        }
        
        if (data && data.length > 0) {
          // Use the data from the database
          setPricingData(data);
          
          // Extract available durations
          const durations = data.map(item => item.duration_months);
          setAvailableDurations(durations.length > 0 ? durations : [1]);
          
          // Set default duration to the first available
          if (durations.length > 0) {
            setDuration(durations[0]);
          }
        } else {
          // Fallback to local storage
          fallbackToLocalPricing();
        }
      } catch (error) {
        console.error('Error loading pricing data:', error);
        fallbackToLocalPricing();
      }
    };
    
    const fallbackToLocalPricing = () => {
      // Get the selected service
      const selectedService = services.find(s => s.id === serviceId);
      
      if (selectedService) {
        // If service has monthly pricing information
        if (selectedService.monthlyPricing && selectedService.monthlyPricing.length > 0) {
          const durations = selectedService.monthlyPricing.map(item => item.months);
          setAvailableDurations(durations);
          
          // Set default duration to the first available
          if (durations.length > 0) {
            setDuration(durations[0]);
          }
        } else if (selectedService.availableMonths && selectedService.availableMonths.length > 0) {
          // Legacy format
          setAvailableDurations(selectedService.availableMonths);
          if (selectedService.availableMonths.length > 0) {
            setDuration(selectedService.availableMonths[0]);
          }
        } else {
          // Default to 1 month
          setAvailableDurations([1]);
          setDuration(1);
        }
      }
    };
    
    fetchPricing();
  }, [serviceId, services]);

  // Calculate total price
  useEffect(() => {
    if (!serviceId) {
      setTotalPrice(0);
      return;
    }
    
    const calculatePrice = () => {
      // First try to get price from pricing data (from DB)
      if (pricingData.length > 0) {
        const pricingItem = pricingData.find(item => item.duration_months === duration);
        if (pricingItem) {
          return pricingItem.wholesale_price * quantity;
        }
      }
      
      // Fallback to service object
      const selectedService = services.find(s => s.id === serviceId);
      if (!selectedService) {
        return 0;
      }
      
      // First try monthly pricing array
      if (selectedService.monthlyPricing && selectedService.monthlyPricing.length > 0) {
        const pricingItem = selectedService.monthlyPricing.find(item => item.months === duration);
        if (pricingItem && pricingItem.wholesalePrice !== undefined) {
          return pricingItem.wholesalePrice * quantity;
        }
      }
      
      // Fallback to default wholesale price
      return (selectedService.wholesalePrice || 0) * quantity * duration;
    };
    
    setTotalPrice(calculatePrice());
  }, [serviceId, quantity, duration, services, pricingData]);
  
  const handleSubmit = async () => {
    if (!serviceId) {
      toast.error('Please select a service');
      return;
    }
    
    if (!customerName) {
      toast.error('Please enter a customer name');
      return;
    }
    
    // Create order object
    const order: WholesaleOrder = {
      id: `order-${Date.now()}`,
      customerId: customerId,
      serviceId: serviceId,
      quantity: quantity,
      totalPrice: totalPrice,
      status: "completed",
      createdAt: new Date().toISOString(),
      durationMonths: duration,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      customerCompany: customerCompany,
      notes: customerNotes
    };
    
    // Check for credentials if duration > 0
    if (duration > 0) {
      const service = services.find(s => s.id === serviceId);
      if (service?.type === 'subscription' || service?.type === 'service') {
        // In a real implementation, we might want to add credential fields
        // For now, we'll just create an empty credentials object
        order.credentials = {
          email: '',
          password: '',
          username: '',
          notes: ''
        };
      }
    }
    
    try {
      // Save to Supabase
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        order.wholesalerId = session.session.user.id;
      }
      
      // Process the order through the parent component's handler
      onPurchase(order);
      
      // Reset the form
      setServiceId('');
      setQuantity(1);
      setDuration(1);
      setTotalPrice(0);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerAddress('');
      setCustomerCompany('');
      setCustomerNotes('');
      
      // Close the dialog
      setOpen(false);
    } catch (error) {
      console.error('Error submitting purchase:', error);
      toast.error('Error processing purchase');
    }
  };

  const selectedService = services.find(s => s.id === serviceId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className={isMobile ? "p-4 w-[95vw]" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle>Purchase for Customer</DialogTitle>
          <DialogDescription>
            Create a new purchase order for this customer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="mt-1"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone"
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="customerAddress">Address</Label>
            <Input
              id="customerAddress"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Address"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="customerCompany">Company</Label>
            <Input
              id="customerCompany"
              value={customerCompany}
              onChange={(e) => setCustomerCompany(e.target.value)}
              placeholder="Company"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="service">Service</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger id="service" className="mt-1">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - ${service.wholesalePrice?.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedService?.type === 'subscription' && (
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                <SelectTrigger id="duration" className="mt-1">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {availableDurations.map((months) => (
                    <SelectItem key={months} value={months.toString()}>
                      {months} {months === 1 ? 'month' : 'months'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Any additional notes"
              className="mt-1"
            />
          </div>
          
          <div className="bg-muted p-3 rounded-md mt-4">
            <div className="flex justify-between text-sm">
              <span>Service:</span>
              <span>{selectedService?.name || 'None selected'}</span>
            </div>
            
            {selectedService?.type === 'subscription' && (
              <div className="flex justify-between text-sm">
                <span>Duration:</span>
                <span>{duration} {duration === 1 ? 'month' : 'months'}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span>Quantity:</span>
              <span>{quantity}</span>
            </div>
            
            <div className="flex justify-between font-medium border-t pt-2 mt-2">
              <span>Total Price:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !serviceId || !customerName}>
            {isSubmitting ? 'Processing...' : 'Complete Purchase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;
