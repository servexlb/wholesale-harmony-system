
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
import { Service, ServiceType } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import PurchaseSuccessDialog from '@/components/PurchaseSuccessDialog';
import { externalApi } from '@/lib/externalApi';

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
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [credentials, setCredentials] = useState<{email?: string, password?: string, username?: string, notes?: string} | undefined>();
  const [orderStatus, setOrderStatus] = useState<'pending' | 'processing' | 'completed'>('pending');
  const [orderId, setOrderId] = useState<string | undefined>(undefined);
  const [stockAvailable, setStockAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (open) {
      setQuantity(initialQuantity);
      setDuration(initialDuration.toString());
      setAccountId('');
      setNotes('');
      setStockAvailable(true);
    }
  }, [open, initialQuantity, initialDuration]);

  const calculateTotalPrice = () => {
    if (service.type === 'subscription') {
      return service.price * parseInt(duration);
    } else {
      return service.price * quantity;
    }
  };

  const totalPrice = calculateTotalPrice();
  
  const checkStockAvailability = async (serviceId: string) => {
    // For external API services, we don't need to check stock
    if ((service.type === 'topup' || service.type === 'recharge') && service.useExternalApi) {
      return true;
    }
    
    // For other services, check stock in the database
    try {
      // Import from credentialService
      const { checkStockAvailability } = await import('@/lib/credentialService');
      return await checkStockAvailability(serviceId);
    } catch (error) {
      console.error('Error checking stock availability:', error);
      // Default to true if there's an error checking
      return true;
    }
  };

  const savePurchaseToDatabase = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.log('No authenticated session, saving to localStorage instead');
        return false;
      }
      
      const userId = session.session.user.id;
      const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setOrderId(orderId);
      
      // Check stock availability for subscription services
      if (service.type === 'subscription') {
        const isStockAvailable = await checkStockAvailability(service.id);
        setStockAvailable(isStockAvailable);
        
        if (!isStockAvailable) {
          // Create a stock request if no stock is available
          const { createStockRequest } = await import('@/lib/credentialService');
          await createStockRequest(
            userId,
            service.id,
            service.name,
            orderId,
            user?.name,
            notes
          );
        
          // Set order status to 'pending' when there's no stock
          const { error: orderError } = await supabase
            .from('orders')
            .insert({
              id: orderId,
              user_id: userId,
              service_id: service.id,
              service_name: service.name,
              quantity: quantity,
              total_price: totalPrice,
              status: 'pending', // Important: mark as pending
              credential_status: 'pending',
              duration_months: service.type === 'subscription' ? parseInt(duration) : null,
              account_id: accountId || null,
              notes: notes || null,
              created_at: new Date().toISOString()
            });
            
          if (orderError) {
            console.error('Error saving order:', orderError);
            return false;
          }
        } else {
          // Stock is available, assign credential directly
          const { assignCredentialsToCustomer } = await import('@/lib/credentialUtils');
          const result = await assignCredentialsToCustomer(userId, service.id, orderId);
          
          if (result.success && result.credentials) {
            setCredentials(result.credentials);
            
            // Create completed order
            const { error: orderError } = await supabase
              .from('orders')
              .insert({
                id: orderId,
                user_id: userId,
                service_id: service.id,
                service_name: service.name,
                quantity: quantity,
                total_price: totalPrice,
                status: 'completed',
                credential_status: 'assigned',
                credentials: result.credentials,
                duration_months: service.type === 'subscription' ? parseInt(duration) : null,
                account_id: accountId || null,
                notes: notes || null,
                created_at: new Date().toISOString(),
                completed_at: new Date().toISOString()
              });
              
            if (orderError) {
              console.error('Error saving order:', orderError);
              return false;
            }
          } else {
            // If credential assignment fails, create pending order
            const { error: orderError } = await supabase
              .from('orders')
              .insert({
                id: orderId,
                user_id: userId,
                service_id: service.id,
                service_name: service.name,
                quantity: quantity,
                total_price: totalPrice,
                status: 'pending',
                credential_status: 'pending',
                duration_months: service.type === 'subscription' ? parseInt(duration) : null,
                account_id: accountId || null,
                notes: notes || null,
                created_at: new Date().toISOString()
              });
              
            if (orderError) {
              console.error('Error saving order:', orderError);
              return false;
            }
          }
        }
      } else {
        // For non-subscription services, just create a regular order
        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            id: orderId,
            user_id: userId,
            service_id: service.id,
            service_name: service.name,
            quantity: quantity,
            total_price: totalPrice,
            status: 'completed',
            duration_months: service.type === 'subscription' ? parseInt(duration) : null,
            account_id: accountId || null,
            notes: notes || null,
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          });
          
        if (orderError) {
          console.error('Error saving order:', orderError);
          return false;
        }
      }
      
      // Create a payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          amount: totalPrice,
          status: 'completed',
          method: 'account_balance',
          description: `Purchase of ${service.name}`,
          order_id: orderId
        });
        
      if (paymentError) {
        console.error('Error saving payment:', paymentError);
      }
      
      // Update user balance if available
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
        
      if (!userError && userData) {
        const newBalance = (userData.balance || 0) - totalPrice;
        
        const { error: updateBalanceError } = await supabase
          .from('profiles')
          .update({ balance: newBalance >= 0 ? newBalance : 0 })
          .eq('id', userId);
          
        if (updateBalanceError) {
          console.error('Error updating balance:', updateBalanceError);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in savePurchaseToDatabase:', error);
      return false;
    }
  };

  const handlePurchase = async () => {
    if (service.requiresId && !accountId.trim()) {
      toast.error('Account ID Required', {
        description: 'Please provide your account ID to proceed with the purchase'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Process through external API if this is a top-up or recharge service configured to use the API
      if ((service.type === 'topup' || service.type === 'recharge') && service.useExternalApi) {
        // Set order status to processing initially
        setOrderStatus('processing');
        
        // Use the external API to process the top-up
        const topUpData = {
          serviceId: service.id,
          accountId: accountId,
          amount: quantity,
          notes: notes
        };
        
        try {
          const result = await externalApi.processTopUp(topUpData);
          
          if (result.success) {
            setOrderId(result.orderId);
            
            // Check status (this would typically be done via webhook in production)
            const statusCheck = await externalApi.checkTopUpStatus(result.orderId);
            if (statusCheck.status === 'completed') {
              setOrderStatus('completed');
            } else {
              setOrderStatus('processing');
            }
            
            // Show success dialog
            onPurchase();
            setShowSuccessDialog(true);
          } else {
            throw new Error('Top-up processing failed');
          }
        } catch (error) {
          console.error('Error with external API:', error);
          toast.error('Purchase Failed', {
            description: 'There was an error processing your top-up request. Please try again.',
          });
          setIsProcessing(false);
          return;
        }
      } else {
        // For regular products that don't use the external API, use the existing flow
        // Save to database
        const saveSuccess = await savePurchaseToDatabase();
        
        if (!saveSuccess) {
          // If saving to database fails, store in localStorage as fallback
          const orders = JSON.parse(localStorage.getItem('orders') || '[]');
          
          // Generate mock credentials for the purchased service
          const mockCredentials = service.type === 'subscription' ? {
            email: `user${Math.floor(Math.random() * 10000)}@${service.name.toLowerCase().replace(/\s+/g, '')}.com`,
            password: `pass${Math.random().toString(36).substring(2, 10)}`,
            username: `user${Math.floor(Math.random() * 10000)}`,
            notes: "These are demo credentials. In a real application, these would be fetched from a credential stock."
          } : undefined;
          
          // Set credentials for the success dialog
          setCredentials(mockCredentials);
          
          const newOrder = {
            id: `order-${Date.now()}`,
            serviceId: service.id,
            serviceName: service.name,
            quantity: quantity,
            totalPrice: totalPrice,
            status: 'completed',
            durationMonths: service.type === 'subscription' ? parseInt(duration) : null,
            accountId: accountId,
            notes: notes,
            createdAt: new Date().toISOString(),
            credentials: mockCredentials
          };
          
          orders.push(newOrder);
          localStorage.setItem('orders', JSON.stringify(orders));
        }
        
        // Set order status based on stock availability for subscriptions
        if (service.type === 'subscription') {
          setOrderStatus(stockAvailable ? 'completed' : 'processing');
        } else {
          // For non-subscription products, always set to completed
          setOrderStatus('completed');
        }
        
        // Notify parent component 
        onPurchase();
        
        // Show success dialog instead of closing this dialog
        setShowSuccessDialog(true);
      }
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing purchase:', error);
      setIsProcessing(false);
      
      toast.error('Purchase Failed', {
        description: 'There was an error processing your purchase. Please try again.',
      });
    }
  };

  const isSubscription = service.type === 'subscription';

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => {
        // Only allow closing if we're not showing the success dialog
        if (!showSuccessDialog) {
          onOpenChange(newOpen);
        }
      }}>
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

      {/* Success Dialog */}
      <PurchaseSuccessDialog 
        open={showSuccessDialog}
        onOpenChange={(open) => {
          setShowSuccessDialog(open);
          if (!open) {
            // When success dialog is closed, also close the purchase dialog
            onOpenChange(false);
          }
        }}
        service={service}
        credentials={credentials}
        stockAvailable={stockAvailable}
        orderStatus={orderStatus}
        orderId={orderId}
      />
    </>
  );
};

export default PurchaseDialog;
