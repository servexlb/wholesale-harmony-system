import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Service, ServiceType } from '@/lib/types';
import { 
  Clock, 
  Calendar, 
  Wallet, 
  Tag, 
  RotateCw, 
  Zap, 
  Gift,
  Loader2
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { fulfillOrderWithCredentials, checkCredentialAvailability } from '@/lib/credentialUtils';
import PurchaseSuccessDialog from '@/components/PurchaseSuccessDialog';

interface ServiceCardProps {
  service: Service;
  onAddToCart?: (service: Service) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onAddToCart }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAvailableCredentials, setHasAvailableCredentials] = useState(false);
  
  useEffect(() => {
    const checkAvailability = async () => {
      if (service.type === 'subscription') {
        const available = checkCredentialAvailability(service.id);
        setHasAvailableCredentials(available);
      }
    };
    
    checkAvailability();
  }, [service.id, service.type]);

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart(service);
    } else {
      toast.info("This feature is under development.");
    }
  };

  const handlePurchaseClick = () => {
    if (service.type === 'subscription' && !hasAvailableCredentials) {
      toast.error("This service is currently out of stock. Please try again later.");
      return;
    }
    
    navigate(`/checkout`, { state: { service, quantity, duration } });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleDurationChange = (value: string) => {
    setDuration(parseInt(value));
  };

  const getServiceIcon = (type: ServiceType) => {
    switch (type) {
      case 'subscription':
        return <Calendar className="h-4 w-4 mr-2" />;
      case 'topup':
        return <Wallet className="h-4 w-4 mr-2" />;
      case 'one-time':
        return <Tag className="h-4 w-4 mr-2" />;
      case 'lifetime':
        return <Gift className="h-4 w-4 mr-2" />;
      default:
        return <Zap className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="rounded-full overflow-hidden h-10 w-10 bg-gray-100 flex items-center justify-center">
            <img 
              src={service.image || '/placeholder.svg'} 
              alt={service.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
          <h3 className="text-lg font-semibold">{service.name}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-gray-600">{service.description}</p>
        <div className="flex items-center mt-3">
          {getServiceIcon(service.type)}
          <Badge variant="secondary">{service.type}</Badge>
        </div>
        {service.deliveryTime && (
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            Delivery: {service.deliveryTime}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 bg-gray-50">
        <div className="text-lg font-bold">${service.price.toFixed(2)}</div>
        <div>
          {service.type === 'subscription' ? (
            <div className="flex items-center space-x-2">
              <Select 
                value={duration.toString()} 
                onValueChange={handleDurationChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {(service.availableMonths || [1, 3, 6, 12]).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month} {month === 1 ? 'month' : 'months'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handlePurchaseClick} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    Purchase
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
              <Button size="sm" onClick={handlePurchaseClick} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    Purchase
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
