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
import { WholesaleOrder, Service, ServiceType } from '@/lib/types';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';

interface PurchaseDialogProps {
  customerName?: string;
  customerNotes?: string;
  onPurchase: (order: WholesaleOrder) => void;
  isSubmitting: boolean;
  isMobile: boolean;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const PurchaseDialog: React.FC<PurchaseDialogProps> = ({
  customerName: initialCustomerName = '',
  customerNotes: initialCustomerNotes = '',
  onPurchase,
  isSubmitting,
  isMobile,
  children,
  open: externalOpen,
  onOpenChange: externalOnOpenChange
}) => {
  const [open, setOpen] = useState(externalOpen || false);

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerNotes, setCustomerNotes] = useState(initialCustomerNotes);
  
  const [availableDurations, setAvailableDurations] = useState<number[]>([1]);
  const [pricingData, setPricingData] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [productTypeOptions, setProductTypeOptions] = useState<{[key in ServiceType]: boolean}>({
    subscription: false,
    topup: false,
    'one-time': false,
    lifetime: false,
    recharge: false,
    giftcard: false,
    service: false
  });

  useEffect(() => {
    const storedServices = localStorage.getItem('services');
    if (storedServices) {
      try {
        const parsedServices = JSON.parse(storedServices);
        setServices(parsedServices);
        
        // Determine which product types are available
        const availableTypes: {[key in ServiceType]: boolean} = {
          subscription: false,
          topup: false,
          'one-time': false,
          lifetime: false,
          recharge: false,
          giftcard: false,
          service: false
        };
        
        parsedServices.forEach((service: Service) => {
          if (service.type) {
            availableTypes[service.type as ServiceType] = true;
          }
        });
        
        setProductTypeOptions(availableTypes);
      } catch (error) {
        console.error('Error parsing services:', error);
      }
    }
    
    const handleServiceUpdated = () => {
      const updatedServices = localStorage.getItem('services');
      if (updatedServices) {
        try {
          const parsedServices = JSON.parse(updatedServices);
          setServices(parsedServices);
          
          // Update available product types
          const availableTypes: {[key in ServiceType]: boolean} = {
            subscription: false,
            topup: false,
            'one-time': false,
            lifetime: false,
            recharge: false,
            giftcard: false,
            service: false
          };
          
          parsedServices.forEach((service: Service) => {
            if (service.type) {
              availableTypes[service.type as ServiceType] = true;
            }
          });
          
          setProductTypeOptions(availableTypes);
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
  
  useEffect(() => {
    if (externalOpen !== undefined) {
      setOpen(externalOpen);
    }
  }, [externalOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (externalOnOpenChange) {
      externalOnOpenChange(newOpen);
    }
  };

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
        
        if (customEvent.detail?.customerName) {
          setCustomerName(customEvent.detail.customerName);
        }
        
        handleOpenChange(true);
      } catch (error) {
        console.error('Error opening purchase dialog:', error);
      }
    };

    window.addEventListener('openPurchaseDialog', handleOpenPurchaseDialog);

    return () => {
      window.removeEventListener('openPurchaseDialog', handleOpenPurchaseDialog);
    };
  }, []);

  useEffect(() => {
    if (!serviceId) {
      setPricingData([]);
      setAvailableDurations([1]);
      return;
    }
    
    const fetchPricing = async () => {
      try {
        const { data, error } = await supabase
          .from('service_pricing')
          .select('*')
          .eq('service_id', serviceId);
          
        if (error) {
          console.error('Error fetching pricing data:', error);
          fallbackToLocalPricing();
          return;
        }
        
        if (data && data.length > 0) {
          setPricingData(data);
          
          const durations = data.map(item => item.duration_months);
          setAvailableDurations(durations.length > 0 ? durations : [1]);
          
          if (durations.length > 0) {
            setDuration(durations[0]);
          }
        } else {
          fallbackToLocalPricing();
        }
      } catch (error) {
        console.error('Error loading pricing data:', error);
        fallbackToLocalPricing();
      }
    };
    
    const fallbackToLocalPricing = () => {
      const selectedService = services.find(s => s.id === serviceId);
      
      if (selectedService) {
        if (selectedService.monthlyPricing && selectedService.monthlyPricing.length > 0) {
          const durations = selectedService.monthlyPricing.map(item => item.months);
          setAvailableDurations(durations);
          
          if (durations.length > 0) {
            setDuration(durations[0]);
          }
        } else if (selectedService.availableMonths && selectedService.availableMonths.length > 0) {
          setAvailableDurations(selectedService.availableMonths);
          if (selectedService.availableMonths.length > 0) {
            setDuration(selectedService.availableMonths[0]);
          }
        } else {
          setAvailableDurations([1]);
          setDuration(1);
        }
      }
    };
    
    fetchPricing();
  }, [serviceId, services]);

  useEffect(() => {
    if (!serviceId) {
      setTotalPrice(0);
      return;
    }
    
    const calculatePrice = () => {
      if (pricingData.length > 0) {
        const pricingItem = pricingData.find(item => item.duration_months === duration);
        if (pricingItem) {
          return pricingItem.wholesale_price * quantity;
        }
      }
      
      const selectedService = services.find(s => s.id === serviceId);
      if (!selectedService) {
        return 0;
      }
      
      if (selectedService.monthlyPricing && selectedService.monthlyPricing.length > 0) {
        const pricingItem = selectedService.monthlyPricing.find(item => item.months === duration);
        if (pricingItem && pricingItem.wholesalePrice !== undefined) {
          return pricingItem.wholesalePrice * quantity;
        }
      }
      
      return (selectedService.wholesalePrice || 0) * quantity * duration;
    };
    
    setTotalPrice(calculatePrice());
  }, [serviceId, quantity, duration, services, pricingData]);
  
  const handleSubmit = async () => {
    if (!serviceId) {
      toast.error('Please select a service');
      return;
    }
    
    const selectedService = services.find(s => s.id === serviceId);
    if (!selectedService) {
      toast.error('Service not found');
      return;
    }
    
    const order: WholesaleOrder = {
      id: `order-${Date.now()}`,
      customerId: customerId,
      serviceId: serviceId,
      quantity: quantity,
      totalPrice: totalPrice,
      status: "completed",
      createdAt: new Date().toISOString(),
      durationMonths: selectedService.type === 'subscription' ? duration : undefined,
      customerName: customerName,
      notes: customerNotes
    };
    
    // Different handling based on product type
    if (selectedService.type === 'subscription' || selectedService.type === 'service') {
      order.credentials = {
        email: '',
        password: '',
        username: '',
        notes: ''
      };
      order.durationMonths = duration;
    } else if (selectedService.type === 'topup' || selectedService.type === 'recharge') {
      // For topups and recharges, we primarily care about the quantity
      order.quantity = quantity;
      order.durationMonths = undefined;
    } else if (selectedService.type === 'giftcard') {
      // For gift cards, include additional notes for redemption
      order.notes = `${customerNotes ? customerNotes + '\n' : ''}Gift card will be delivered to ${customerName}.`;
    }
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        order.wholesalerId = session.session.user.id;
      }
      
      onPurchase(order);
      
      setServiceId('');
      setQuantity(1);
      setDuration(1);
      setTotalPrice(0);
      setCustomerName('');
      setCustomerNotes('');
      
      setOpen(false);
    } catch (error) {
      console.error('Error submitting purchase:', error);
      toast.error('Error processing purchase');
    }
  };

  const selectedService = services.find(s => s.id === serviceId);
  const productType = selectedService?.type || 'service';

  const isSubscription = productType === 'subscription';

  // Group services by type for better organization
  const servicesByType = services.reduce((acc: {[key: string]: Service[]}, service) => {
    const type = service.type || 'service';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(service);
    return acc;
  }, {});

  // Determine if the current service requires an account ID
  const requiresAccountId = selectedService?.requiresId || false;
  const [accountId, setAccountId] = useState('');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] w-full sm:max-w-[450px] p-4 sm:p-6" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Purchase for {customerName}</DialogTitle>
          <DialogDescription>
            Create a new purchase order for this customer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="service">Service</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger id="service" className="mt-1">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(servicesByType).map(([type, servicesOfType]) => (
                  <div key={type} className="py-1">
                    <div className="px-2 text-xs text-muted-foreground font-semibold uppercase">
                      {type === 'one-time' ? 'One-Time Purchase' : 
                       type === 'subscription' ? 'Subscription' :
                       type === 'topup' ? 'Top-up' :
                       type === 'recharge' ? 'Recharge' :
                       type === 'lifetime' ? 'Lifetime' :
                       type === 'giftcard' ? 'Gift Card' : 'Service'}
                    </div>
                    {servicesOfType.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${service.wholesalePrice?.toFixed(2)}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedService && (
            <>
              {(productType === 'subscription' || availableDurations.length > 1) && (
                <div>
                  <Label htmlFor="duration">
                    {productType === 'subscription' ? 'Subscription Duration' : 'Duration'}
                  </Label>
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
                <Label htmlFor="quantity">
                  {productType === 'topup' || productType === 'recharge' ? 'Credits/Units' : 'Quantity'}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={selectedService.minQuantity || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
                {selectedService.minQuantity && selectedService.minQuantity > 1 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum quantity: {selectedService.minQuantity}
                  </p>
                )}
              </div>

              {requiresAccountId && (
                <div>
                  <Label htmlFor="accountId">Account ID / Username <span className="text-red-500">*</span></Label>
                  <Input
                    id="accountId"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="Customer's account ID for this service"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required for service authentication
                  </p>
                </div>
              )}
            </>
          )}
          
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
            
            {productType === 'subscription' && (
              <div className="flex justify-between text-sm">
                <span>Duration:</span>
                <span>{duration} {duration === 1 ? 'month' : 'months'}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span>
                {productType === 'topup' || productType === 'recharge' ? 'Credits/Units:' : 'Quantity:'}
              </span>
              <span>{quantity}</span>
            </div>
            
            <div className="flex justify-between font-medium border-t pt-2 mt-2">
              <span>Total Price:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !serviceId || (requiresAccountId && !accountId.trim())}
          >
            {isSubmitting ? 'Processing...' : 'Complete Purchase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;
