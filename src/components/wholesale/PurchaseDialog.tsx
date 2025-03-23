import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useCart } from '@/hooks/use-cart';
import { Product, Service } from '@/lib/types';
import { getAllServices } from '@/lib/productManager';
import { services as mockServices } from '@/lib/mockData';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface PurchaseDialogProps {
  children: React.ReactNode;
  customerName: string;
  setCustomerName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  customerAddress: string;
  setCustomerAddress: (value: string) => void;
  customerCompany: string;
  setCustomerCompany: (value: string) => void;
  customerNotes: string;
  setCustomerNotes: (value: string) => void;
  onPurchase: () => void;
  isSubmitting: boolean;
  isMobile: boolean;
}

const PurchaseDialog: React.FC<PurchaseDialogProps> = ({
  children,
  customerName,
  setCustomerName,
  customerEmail,
  customerPhone,
  customerAddress,
  customerCompany,
  customerNotes,
  onPurchase,
  isSubmitting,
  isMobile
}) => {
  const { items, totalPrice, clearCart } = useCart();
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerError, setCustomerError] = useState('');
  
  useEffect(() => {
    // Load services from product manager
    const loadedServices = getAllServices();
    
    // If no services from product manager, fall back to mockData
    const servicesToUse = loadedServices.length > 0 ? loadedServices : mockServices;
    
    // Set services
    setServices(servicesToUse);
  }, []);
  
  const handlePurchase = () => {
    if (!customerName) {
      setCustomerError('Customer name is required');
      return;
    }
    
    setCustomerError('');
    onPurchase();
    setOpen(false);
    clearCart();
  };
  
  const toggleCustomerForm = () => {
    setShowCustomerForm(!showCustomerForm);
  };

  const filteredServices = services.filter(
    service => service.availableForCustomers !== false
  ) as unknown as Product[];
  
  const hasUnavailableServices = items.some(item => {
    return !filteredServices.find(service => service.id === item.id);
  });
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            {isMobile ? (
              <>
                You are about to purchase the selected items. Please confirm your
                details and proceed.
              </>
            ) : (
              <>
                You are about to purchase the following items:
                <ul>
                  {items.map((item) => (
                    <li key={item.id}>
                      {item.quantity} x {item.name}
                    </li>
                  ))}
                </ul>
                Total: ${totalPrice.toFixed(2)}
                <br />
                Please confirm your details and proceed.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {hasUnavailableServices && (
          <div className="mb-4 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-700 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Some items in your cart are no longer available for purchase and will not be included in the order.
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="name">Customer Information</Label>
            <Button variant="link" size="sm" onClick={toggleCustomerForm}>
              {showCustomerForm ? 'Hide Form' : 'Edit'}
            </Button>
          </div>
          
          {customerError && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {customerError}
            </div>
          )}
          
          {showCustomerForm ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={customerCompany}
                    onChange={(e) => setCustomerCompany(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Name: {customerName || 'N/A'}
              <br />
              Email: {customerEmail || 'N/A'}
              <br />
              Phone: {customerPhone || 'N/A'}
              <br />
              Address: {customerAddress || 'N/A'}
              <br />
              Company: {customerCompany || 'N/A'}
              <br />
              Notes: {customerNotes || 'N/A'}
            </div>
          )}
        </div>
        
        <Button type="submit" onClick={handlePurchase} disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              Purchasing...
              <span className="ml-2 animate-spin">
                <CheckCircle className="h-5 w-5" />
              </span>
            </>
          ) : (
            "Purchase"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;
