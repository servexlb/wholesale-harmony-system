
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Service, WholesaleOrder } from '@/lib/types';
import { toast } from 'sonner';
import { loadServices, loadPricingFromSupabase } from '@/lib/productManager';
import { supabase } from "@/integrations/supabase/client";

interface PurchaseDialogProps {
  children: React.ReactNode;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCompany?: string;
  customerNotes?: string;
  onPurchase: (order: WholesaleOrder) => void;
  isSubmitting: boolean;
  isMobile: boolean;
  selectedServiceId?: string;
  selectedCustomerId?: string;
}

const PurchaseDialog: React.FC<PurchaseDialogProps> = ({
  children,
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  customerAddress = '',
  customerCompany = '',
  customerNotes = '',
  onPurchase,
  isSubmitting,
  isMobile,
  selectedServiceId,
  selectedCustomerId,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(customerName);
  const [email, setEmail] = useState(customerEmail);
  const [phone, setPhone] = useState(customerPhone);
  const [address, setAddress] = useState(customerAddress);
  const [company, setCompany] = useState(customerCompany);
  const [notes, setNotes] = useState(customerNotes);
  const [serviceId, setServiceId] = useState(selectedServiceId || '');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [duration, setDuration] = useState<number>(1);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [availableDurations, setAvailableDurations] = useState<number[]>([1]);
  const [pricingData, setPricingData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize services
  useEffect(() => {
    const loadServicesData = async () => {
      try {
        const servicesData = loadServices();
        setServices(servicesData);
        
        if (selectedServiceId) {
          const service = servicesData.find(s => s.id === selectedServiceId);
          if (service) {
            setSelectedService(service);
            setServiceId(selectedServiceId);
            
            // Load pricing data from Supabase
            const pricing = await loadPricingFromSupabase(selectedServiceId);
            if (pricing && pricing.length > 0) {
              setPricingData(pricing);
              setAvailableDurations(pricing.map(p => p.months));
              setDuration(pricing[0].months);
              
              // Set initial price
              const initialPricing = pricing.find(p => p.months === pricing[0].months);
              if (initialPricing) {
                setTotalPrice(initialPricing.wholesalePrice * quantity);
              } else {
                setTotalPrice((service.wholesalePrice || 0) * quantity);
              }
            } else if (service.availableMonths && service.availableMonths.length > 0) {
              setAvailableDurations(service.availableMonths);
              setDuration(service.availableMonths[0]);
              
              // Calculate price based on service data
              if (service.monthlyPricing && service.monthlyPricing.length > 0) {
                const initialPricing = service.monthlyPricing.find(p => p.months === service.availableMonths[0]);
                if (initialPricing) {
                  setTotalPrice(initialPricing.wholesalePrice * quantity);
                } else {
                  setTotalPrice((service.wholesalePrice || 0) * duration * quantity);
                }
              } else {
                setTotalPrice((service.wholesalePrice || 0) * duration * quantity);
              }
            } else {
              setAvailableDurations([1, 3, 6, 12]);
              setDuration(1);
              setTotalPrice((service.wholesalePrice || 0) * quantity);
            }
          }
        }
      } catch (error) {
        console.error('Error loading services:', error);
        toast.error('Failed to load service data');
      }
    };
    
    loadServicesData();
  }, [selectedServiceId]);

  // Listen for the openPurchaseDialog event
  useEffect(() => {
    const handleOpenDialog = (event: Event) => {
      try {
        const customEvent = event as CustomEvent;
        if (customEvent.detail?.customerId) {
          setSelectedCustomerId(customEvent.detail.customerId);
        }
        
        if (customEvent.detail?.serviceId) {
          const serviceId = customEvent.detail.serviceId;
          setServiceId(serviceId);
          
          const service = services.find(s => s.id === serviceId);
          if (service) {
            setSelectedService(service);
            
            // Load pricing from Supabase
            loadPricingFromSupabase(serviceId).then(pricing => {
              if (pricing && pricing.length > 0) {
                setPricingData(pricing);
                setAvailableDurations(pricing.map(p => p.months));
                setDuration(pricing[0].months);
                
                // Set initial price
                const initialPricing = pricing.find(p => p.months === pricing[0].months);
                if (initialPricing) {
                  setTotalPrice(initialPricing.wholesalePrice * quantity);
                } else {
                  setTotalPrice((service.wholesalePrice || 0) * quantity);
                }
              } else if (service.availableMonths && service.availableMonths.length > 0) {
                setAvailableDurations(service.availableMonths);
                setDuration(service.availableMonths[0]);
                
                // Calculate price
                if (service.monthlyPricing && service.monthlyPricing.length > 0) {
                  const initialPricing = service.monthlyPricing.find(p => p.months === service.availableMonths[0]);
                  if (initialPricing) {
                    setTotalPrice(initialPricing.wholesalePrice * quantity);
                  } else {
                    setTotalPrice((service.wholesalePrice || 0) * duration * quantity);
                  }
                } else {
                  setTotalPrice((service.wholesalePrice || 0) * duration * quantity);
                }
              } else {
                setAvailableDurations([1, 3, 6, 12]);
                setDuration(1);
                setTotalPrice((service.wholesalePrice || 0) * quantity);
              }
            }).catch(error => {
              console.error('Error loading pricing data:', error);
            });
          }
        }
        
        setOpen(true);
      } catch (error) {
        console.error('Error opening purchase dialog:', error);
      }
    };

    window.addEventListener('openPurchaseDialog', handleOpenDialog);
    return () => window.removeEventListener('openPurchaseDialog', handleOpenDialog);
  }, [services]);

  // Effect for price calculation when service, duration, or quantity changes
  useEffect(() => {
    if (selectedService) {
      // First try to get price from Supabase pricing data
      const pricingItem = pricingData.find(p => p.months === duration);
      if (pricingItem) {
        setTotalPrice(pricingItem.wholesalePrice * quantity);
        return;
      }
      
      // If not found in Supabase data, try from local service data
      if (selectedService.monthlyPricing && selectedService.monthlyPricing.length > 0) {
        const pricing = selectedService.monthlyPricing.find(p => p.months === duration);
        if (pricing) {
          setTotalPrice(pricing.wholesalePrice * quantity);
          return;
        }
      }
      
      // Default calculation
      setTotalPrice((selectedService.wholesalePrice || 0) * duration * quantity);
    }
  }, [selectedService, duration, quantity, pricingData]);

  // Handle service selection change
  const handleServiceChange = async (value: string) => {
    setServiceId(value);
    
    const service = services.find(s => s.id === value);
    if (service) {
      setSelectedService(service);
      
      // Load pricing from Supabase
      setIsLoading(true);
      try {
        const pricing = await loadPricingFromSupabase(value);
        if (pricing && pricing.length > 0) {
          setPricingData(pricing);
          setAvailableDurations(pricing.map(p => p.months));
          setDuration(pricing[0].months);
        } else if (service.availableMonths && service.availableMonths.length > 0) {
          setAvailableDurations(service.availableMonths);
          setDuration(service.availableMonths[0]);
        } else {
          setAvailableDurations([1, 3, 6, 12]);
          setDuration(1);
        }
      } catch (error) {
        console.error('Error loading pricing data:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSelectedService(null);
      setAvailableDurations([1, 3, 6, 12]);
      setDuration(1);
      setTotalPrice(0);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceId) {
      toast.error('Please select a service');
      return;
    }
    
    // Create order object
    const order: WholesaleOrder = {
      id: `order-${Date.now()}`,
      customerId: selectedCustomerId,
      serviceId: serviceId,
      quantity: quantity,
      totalPrice: totalPrice,
      status: 'completed',
      createdAt: new Date().toISOString(),
      durationMonths: duration,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      customerAddress: address,
      customerCompany: company,
      notes: notes
    };
    
    // Save order to Supabase
    saveOrderToSupabase(order);
    
    // Call the onPurchase callback
    onPurchase(order);
    resetForm();
  };

  // Save order to Supabase
  const saveOrderToSupabase = async (order: WholesaleOrder) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) return;
      
      // Save to Supabase orders table
      const { error } = await supabase
        .from('wholesale_orders')
        .insert({
          service_id: order.serviceId,
          customer_id: order.customerId,
          quantity: order.quantity,
          total_price: order.totalPrice,
          status: order.status,
          duration_months: order.durationMonths,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          customer_phone: order.customerPhone,
          customer_address: order.customerAddress,
          customer_company: order.customerCompany,
          notes: order.notes
        });
        
      if (error) {
        console.error('Error saving order to Supabase:', error);
      }
    } catch (error) {
      console.error('Error in Supabase operation:', error);
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setName(customerName);
    setEmail(customerEmail);
    setPhone(customerPhone);
    setAddress(customerAddress);
    setCompany(customerCompany);
    setNotes(customerNotes);
    setServiceId('');
    setSelectedService(null);
    setDuration(1);
    setQuantity(1);
    setTotalPrice(0);
    setOpen(false);
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`${isMobile ? 'w-[90%]' : 'max-w-2xl'} overflow-y-auto max-h-[90vh]`}>
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Customer Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Customer name" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="customer@example.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Phone number" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)} 
                    placeholder="Company name" 
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="Address" 
                  />
                </div>
              </div>
            </div>
            
            {/* Product Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Product Information</h3>
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Select 
                  value={serviceId} 
                  onValueChange={handleServiceChange}
                  disabled={isLoading}
                >
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} (${service.wholesalePrice?.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Only show these fields if a service is selected */}
              {selectedService && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Select 
                        value={duration.toString()} 
                        onValueChange={(value) => setDuration(parseInt(value))}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDurations.map(months => (
                            <SelectItem key={months} value={months.toString()}>
                              {months} {months === 1 ? 'Month' : 'Months'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input 
                        id="quantity" 
                        type="number" 
                        min="1" 
                        value={quantity} 
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Total Price</Label>
                    <div className="flex items-center">
                      <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
                      {isLoading && <span className="ml-2 text-sm text-muted-foreground">Loading pricing...</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedService.name} x {quantity} unit(s) for {duration} month(s)
                    </p>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Additional information or special instructions" 
                  rows={3} 
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !serviceId || isLoading}>
                {isSubmitting ? 'Processing...' : 'Complete Purchase'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PurchaseDialog;
