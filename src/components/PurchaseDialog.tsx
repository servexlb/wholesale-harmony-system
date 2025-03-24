
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Clock } from "lucide-react";
import { Service } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PurchaseDialogProps {
  service: Service;
  quantity: number;
  duration: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: () => void;
}

export const PurchaseDialog: React.FC<PurchaseDialogProps> = ({
  service,
  quantity: initialQuantity,
  duration: initialDuration,
  open,
  onOpenChange,
  onPurchase,
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(initialQuantity);
  const [duration, setDuration] = useState(initialDuration.toString());
  const [availableDurations, setAvailableDurations] = useState<string[]>(['1', '3', '6', '12']);

  // Reset values when dialog opens
  useEffect(() => {
    if (open) {
      setQuantity(initialQuantity);
      setDuration(initialDuration.toString());
      setAccountId('');
      setNotes('');
    }
  }, [open, initialQuantity, initialDuration]);

  // Calculate total price based on service type and duration
  const calculateTotalPrice = () => {
    if (service.type === 'subscription') {
      return service.price * parseInt(duration);
    } else {
      return service.price * quantity;
    }
  };

  const totalPrice = calculateTotalPrice();

  const handlePurchase = () => {
    if (service.requiresId && !accountId.trim()) {
      toast.error('Account ID Required', {
        description: 'Please provide your account ID to proceed with the purchase'
      });
      return;
    }

    setIsProcessing(true);

    // Simulate purchase process
    setTimeout(() => {
      onPurchase();
      setIsProcessing(false);
      onOpenChange(false);
      
      toast.success('Purchase Successful', {
        description: `Your ${service.name} order has been processed successfully`,
      });
    }, 1500);
  };

  const isSubscription = service.type === 'subscription';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            Please review your order details before proceeding
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Order Summary</h4>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service:</span>
              <span>{service.name}</span>
            </div>
            
            {isSubscription && (
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm">Subscription Duration</Label>
                <Select 
                  value={duration} 
                  onValueChange={setDuration}
                >
                  <SelectTrigger id="duration" className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDurations.map((months) => (
                      <SelectItem key={months} value={months}>
                        {months} {parseInt(months) === 1 ? 'month' : 'months'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Subscription will renew every {duration} {parseInt(duration) === 1 ? 'month' : 'months'}</span>
                </div>
              </div>
            )}
            
            {!isSubscription && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity:</span>
                <span>{quantity}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price:</span>
              <span>${service.price.toFixed(2)} {isSubscription ? '/month' : 'each'}</span>
            </div>
            
            <div className="flex justify-between font-medium border-t pt-2 mt-2">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          {service.requiresId && (
            <div className="space-y-2">
              <label htmlFor="accountId" className="text-sm font-medium block">
                Your Account ID <span className="text-red-500">*</span>
              </label>
              <Input
                id="accountId"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Enter your account ID for this service"
                required
              />
              <p className="text-xs text-muted-foreground">
                Required for service authentication
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium block">
              Order Notes (Optional)
            </label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for this order"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePurchase}
            disabled={isProcessing || (service.requiresId && !accountId.trim())}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Confirm Purchase</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;
