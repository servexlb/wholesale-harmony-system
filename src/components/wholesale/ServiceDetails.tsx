
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Service } from '@/lib/types';
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServiceDetailsProps {
  service: Service;
  isWholesale?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({
  service,
  isWholesale = false,
  isOpen,
  onClose,
  onPurchase
}) => {
  const isMobile = window.innerWidth < 768;
  
  const formatPrice = (price: number) => {
    return isWholesale
      ? `$${service.wholesalePrice?.toFixed(2) || '0.00'}`
      : `$${service.price?.toFixed(2) || '0.00'}`;
  };

  const getServiceTypeLabel = (type: string | undefined) => {
    switch (type) {
      case 'subscription':
        return 'Subscription';
      case 'one-time':
        return 'One-Time Purchase';
      case 'recharge':
        return 'Recharge';
      case 'topup':
        return 'Top-up';
      case 'lifetime':
        return 'Lifetime';
      case 'giftcard':
        return 'Gift Card';
      default:
        return 'Service';
    }
  };

  const renderDeliveryEstimate = () => {
    if (!service.deliveryTime) return null;
    
    return (
      <div className="my-3 p-3 bg-muted rounded-md">
        <p className="text-sm font-medium">
          Estimated delivery: {service.deliveryTime}
        </p>
      </div>
    );
  };

  const renderFeatures = () => {
    if (!service.features || service.features.length === 0) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Features:</h3>
        <ul className="space-y-1">
          {service.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 mr-2 shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const content = (
    <div className="space-y-4">
      {service.image && (
        <div className="aspect-video w-full overflow-hidden rounded-md mb-4">
          <img 
            src={service.image} 
            alt={service.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <Badge>{getServiceTypeLabel(service.type)}</Badge>
          {service.categoryId && (
            <Badge variant="outline" className="ml-2">{service.category}</Badge>
          )}
        </div>
        <div className="text-lg font-bold">
          {formatPrice(isWholesale ? (service.wholesalePrice || 0) : service.price)}
        </div>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <p>{service.description || 'No description available'}</p>
      </div>
      
      {renderDeliveryEstimate()}
      {renderFeatures()}
      
      <div className="pt-4">
        <Button className="w-full" onClick={onPurchase}>
          Purchase Now
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md overflow-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>{service.name}</SheetTitle>
            <SheetDescription>
              {getServiceTypeLabel(service.type)}
            </SheetDescription>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
          <DialogDescription>
            {getServiceTypeLabel(service.type)}
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetails;
