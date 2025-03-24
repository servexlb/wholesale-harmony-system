import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { loadServices } from "@/lib/productManager";
import { toast } from "sonner";
import { Customer, WholesaleOrder } from "@/lib/types";

interface PurchaseDialogProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCompany: string;
  customerNotes: string;
  onPurchase: (order: WholesaleOrder) => void;
  isSubmitting: boolean;
  children?: React.ReactNode;
  isMobile?: boolean;
}

const PurchaseDialog: React.FC<PurchaseDialogProps> = ({
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  customerCompany,
  customerNotes,
  onPurchase,
  isSubmitting,
  children,
  isMobile = false
}) => {
  const [localCustomerName, setLocalCustomerName] = useState(customerName);
  const [localCustomerEmail, setLocalCustomerEmail] = useState(customerEmail);
  const [localCustomerPhone, setLocalCustomerPhone] = useState(customerPhone);
  const [localCustomerAddress, setLocalCustomerAddress] = useState(customerAddress);
  const [localCustomerCompany, setLocalCustomerCompany] = useState(customerCompany);
  const [localCustomerNotes, setLocalCustomerNotes] = useState(customerNotes);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const services = loadServices();

  const handleSelectService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!localCustomerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    // Process the order
    const order: WholesaleOrder = {
      id: `order-${Date.now()}`,
      customerId: `customer-${Date.now()}`,
      status: "processing",
      serviceId: selectedServices[0], // Use first service ID if multiple
      quantity: 1,
      totalPrice: selectedServices.reduce((total, serviceId) => {
        const service = services.find(s => s.id === serviceId);
        return total + (service?.wholesalePrice || 0);
      }, 0),
      customerName: localCustomerName,
      customerEmail: localCustomerEmail,
      customerPhone: localCustomerPhone,
      customerAddress: localCustomerAddress,
      customerCompany: localCustomerCompany,
      notes: localCustomerNotes,
      createdAt: new Date().toISOString()
    };

    onPurchase(order);
    setOpen(false);
    setSelectedServices([]);
    // Reset form fields to initial values
    setLocalCustomerName(customerName);
    setLocalCustomerEmail(customerEmail);
    setLocalCustomerPhone(customerPhone);
    setLocalCustomerAddress(customerAddress);
    setLocalCustomerCompany(customerCompany);
    setLocalCustomerNotes(customerNotes);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`sm:max-w-[600px] ${isMobile ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
          <DialogHeader>
            <DialogTitle>Customer Purchase</DialogTitle>
            <DialogDescription>
              Create an order for this customer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Name</Label>
                <Input
                  id="customerName"
                  value={localCustomerName}
                  onChange={(e) => setLocalCustomerName(e.target.value)}
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={localCustomerEmail}
                  onChange={(e) => setLocalCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  value={localCustomerPhone}
                  onChange={(e) => setLocalCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerCompany">Company</Label>
                <Input
                  id="customerCompany"
                  value={localCustomerCompany}
                  onChange={(e) => setLocalCustomerCompany(e.target.value)}
                  placeholder="Company name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address</Label>
              <Input
                id="customerAddress"
                value={localCustomerAddress}
                onChange={(e) => setLocalCustomerAddress(e.target.value)}
                placeholder="Customer address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerNotes">Notes</Label>
              <Textarea
                id="customerNotes"
                value={localCustomerNotes}
                onChange={(e) => setLocalCustomerNotes(e.target.value)}
                placeholder="Additional notes"
                rows={3}
              />
            </div>
            
            {/* Service selection */}
            <div className="space-y-2">
              <Label>Select Services</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-2 border rounded-lg cursor-pointer ${
                      selectedServices.includes(service.id) ? "border-primary bg-primary/10" : "border-border"
                    }`}
                    onClick={() => handleSelectService(service.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{service.name}</span>
                      <Badge variant="outline">${service.wholesalePrice}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order summary */}
            {selectedServices.length > 0 && (
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="space-y-1">
                  {selectedServices.map((serviceId) => {
                    const service = services.find((s) => s.id === serviceId);
                    return (
                      <div key={serviceId} className="flex justify-between text-sm">
                        <span>{service?.name}</span>
                        <span>${service?.wholesalePrice.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  <div className="border-t mt-2 pt-2 font-medium flex justify-between">
                    <span>Total</span>
                    <span>
                      $
                      {selectedServices
                        .reduce((total, serviceId) => {
                          const service = services.find((s) => s.id === serviceId);
                          return total + (service?.wholesalePrice || 0);
                        }, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !localCustomerName || selectedServices.length === 0}
            >
              {isSubmitting ? "Processing..." : "Create Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {React.cloneElement(children as React.ReactElement, {
        onClick: () => setOpen(true)
      })}
    </>
  );
};

export default PurchaseDialog;
