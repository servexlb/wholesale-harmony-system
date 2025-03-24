
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
import { Loader2 } from "lucide-react";
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
  quantity,
  duration,
  open,
  onOpenChange,
  onPurchase,
}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');

  const totalPrice = service.type === 'subscription'
    ? service.price * duration
    : service.price * quantity;

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
            
            {service.type === 'subscription' ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span>{duration} {duration === 1 ? 'month' : 'months'}</span>
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity:</span>
                <span>{quantity}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price:</span>
              <span>${service.price.toFixed(2)} {service.type === 'subscription' ? '/month' : 'each'}</span>
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
