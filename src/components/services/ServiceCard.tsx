
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Service, ServiceType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Info, Check, Clock, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';

interface ServiceCardProps {
  service: Service;
  isWholesale?: boolean;
  onClick?: () => void;
  onViewDetails?: (e: React.MouseEvent) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  isWholesale = false,
  onClick,
  onViewDetails
}) => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    
    setTimeout(() => {
      try {
        addItem(service);
        toast.success('Added to cart', {
          description: `${service.name} added to your cart`,
        });
      } catch (error) {
        toast.error('Error adding to cart', {
          description: 'There was a problem adding this item to your cart',
        });
      } finally {
        setIsLoading(false);
      }
    }, 600); // Simulating network delay
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    if (onViewDetails) {
      onViewDetails(e);
    }
  };

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col"
      onClick={handleCardClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1">{service.name}</CardTitle>
          {service.featured && (
            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
              <Star className="h-3 w-3 mr-1" /> Featured
            </Badge>
          )}
        </div>
        {service.type && (
          <Badge variant="outline" className="mt-1">
            {service.type === 'subscription' ? 'Subscription' : 
             service.type === 'one-time' ? 'One-time' : 
             service.type === 'lifetime' ? 'Lifetime' : 
             service.type}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="px-4 py-2 flex-grow">
        <div className="relative aspect-video w-full mb-3 bg-gray-100 rounded-md overflow-hidden">
          <img 
            src={service.image || '/placeholder.svg'} 
            alt={service.name} 
            className="object-cover w-full h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {service.description || 'No description available'}
        </p>
        
        {service.deliveryTime && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Clock className="h-3 w-3 mr-1" />
            <span>Delivery: {service.deliveryTime}</span>
          </div>
        )}
        
        <div className="mt-auto">
          <div className="flex justify-between items-baseline">
            <div className="font-semibold text-lg">
              {isWholesale 
                ? formatCurrency(service.wholesalePrice || service.price)
                : formatCurrency(service.price)
              }
            </div>
            {isWholesale && (
              <div className="text-xs text-muted-foreground">
                Retail: {formatCurrency(service.price)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 pt-0 flex gap-2">
        <Button 
          className="flex-1"
          size="sm"
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </span>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
            </>
          )}
        </Button>
        
        {onViewDetails && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewDetailsClick}
          >
            <Info className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
