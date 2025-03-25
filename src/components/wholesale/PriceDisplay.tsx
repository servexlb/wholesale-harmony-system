
import React from 'react';
import { DollarSign } from 'lucide-react';
import { Service } from '@/lib/types';

interface PriceDisplayProps {
  service?: Service;
  selectedDuration: string;
  isSubscription: boolean;
  calculateTotalPrice: () => number;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  service,
  selectedDuration,
  isSubscription,
  calculateTotalPrice
}) => {
  return (
    <div className="bg-muted/30 p-4 rounded-lg flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <span className="font-medium">Base Price:</span>
        </div>
        <span className="text-lg font-bold">
          ${service?.wholesalePrice?.toFixed(2) || service?.price?.toFixed(2) || '0.00'}
        </span>
      </div>
      
      {isSubscription && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>For {selectedDuration} {parseInt(selectedDuration) === 1 ? 'month' : 'months'}</span>
          <span>${calculateTotalPrice().toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;
