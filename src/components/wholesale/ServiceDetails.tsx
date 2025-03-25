
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Service } from '@/lib/types';
import { CheckCircle, Calendar, Clock, Tag, ShoppingCart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface ServiceDetailsProps {
  service: Service;
  onClose: () => void;
  onPurchase: (duration?: number) => void;
  isOpen?: boolean;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ 
  service, 
  onClose,
  onPurchase,
  isOpen = true
}) => {
  const [selectedDuration, setSelectedDuration] = useState<string>("1");
  const isSubscription = service.type === 'subscription';
  
  // Define available durations - either from service or default options
  const availableDurations = service.availableMonths || [1, 3, 6, 12];
  
  const handlePurchase = () => {
    onPurchase(isSubscription ? parseInt(selectedDuration) : undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
          <DialogDescription>
            Service details and purchasing options
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {service.image && (
            <div className="aspect-video w-full overflow-hidden rounded-md">
              <img 
                src={service.image} 
                alt={service.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium">Description</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {service.description || 'No description available'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Price
              </h4>
              <p className="text-sm font-semibold">${service.wholesalePrice.toFixed(2)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Type
              </h4>
              <p className="text-sm">{service.type || 'N/A'}</p>
            </div>
            
            {service.deliveryTime && (
              <div>
                <h4 className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Delivery Time
                </h4>
                <p className="text-sm">{service.deliveryTime}</p>
              </div>
            )}
          </div>
          
          {/* Add duration selection for subscription services */}
          {isSubscription && (
            <div className="mt-2">
              <Label htmlFor="duration" className="text-sm font-medium">Duration</Label>
              <Select
                value={selectedDuration}
                onValueChange={setSelectedDuration}
              >
                <SelectTrigger id="duration" className="mt-1">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {availableDurations.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month} {month === 1 ? 'month' : 'months'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Select how many months of service to purchase
              </p>
            </div>
          )}
          
          {service.features && service.features.length > 0 && (
            <div>
              <h3 className="text-lg font-medium">Features</h3>
              <ul className="mt-2 space-y-1">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            {isSubscription ? `Purchase for Customer (${selectedDuration} ${parseInt(selectedDuration) === 1 ? 'month' : 'months'})` : 'Purchase for Customer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetails;
