
import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import StockSubscriptions from '@/components/StockSubscriptions';
import { Subscription } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/lib/toast';
import { products } from '@/lib/data';
import { Button } from '@/components/ui/button';

interface StockTabProps {
  subscriptions: Subscription[];
}

const StockTab: React.FC<StockTabProps> = ({ subscriptions }) => {
  const navigate = useNavigate();
  const [renewedSubscriptions, setRenewedSubscriptions] = useState<string[]>([]);
  const [safeSubscriptions, setSafeSubscriptions] = useState<Subscription[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get current wholesaler ID
  const wholesalerId = localStorage.getItem('wholesalerId') || '';
  
  useEffect(() => {
    try {
      if (!Array.isArray(subscriptions)) {
        console.error('Subscriptions is not an array:', subscriptions);
        setSafeSubscriptions([]);
        return;
      }
      
      // Filter out any potentially problematic subscriptions
      const validSubs = subscriptions.filter(sub => {
        // Ensure subscription has all required properties
        return (
          sub && 
          typeof sub === 'object' &&
          sub.id && 
          sub.userId && 
          sub.serviceId && 
          sub.startDate && 
          sub.endDate
        );
      });
      
      setSafeSubscriptions(validSubs);
    } catch (error) {
      console.error('Error processing subscriptions:', error);
      setSafeSubscriptions([]);
    }
  }, [subscriptions]);
  
  // Get wholesaler balance from localStorage
  const getUserBalance = useCallback(() => {
    try {
      const userBalanceStr = localStorage.getItem(`userBalance_${wholesalerId}`);
      return userBalanceStr ? parseFloat(userBalanceStr) : 0;
    } catch (error) {
      console.error('Error getting user balance:', error);
      return 0;
    }
  }, [wholesalerId]);

  const handleRenewal = useCallback((subscription: Subscription) => {
    // Prevent multiple simultaneous renewals
    if (isProcessing) {
      toast.info("Please wait while processing the current request");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      if (!subscription || !subscription.id || !subscription.serviceId) {
        toast.error("Invalid subscription data");
        setIsProcessing(false);
        return;
      }
      
      const product = products.find(p => p.id === subscription.serviceId);
      
      if (!product) {
        toast.error("Product not found");
        setIsProcessing(false);
        return;
      }
      
      // Calculate renewal price (use wholesale price)
      const renewalPrice = product.wholesalePrice || 0;
      
      // Check if user has sufficient balance
      const currentBalance = getUserBalance();
      if (currentBalance < renewalPrice) {
        toast.error("Insufficient balance", {
          description: "You don't have enough funds to renew this subscription"
        });
        // Redirect to payment page
        navigate("/payment");
        setIsProcessing(false);
        return;
      }
      
      // Deduct the price from user balance
      const newBalance = currentBalance - renewalPrice;
      localStorage.setItem(`userBalance_${wholesalerId}`, newBalance.toString());
      
      // Add subscription to renewed list
      setRenewedSubscriptions(prev => [...prev, subscription.id]);
      
      // Update UI with success message
      toast.success(`Subscription renewed successfully!`, {
        description: `$${renewalPrice.toFixed(2)} has been deducted from your balance.`
      });
      
      // Release the lock
      setIsProcessing(false);
    } catch (error) {
      console.error('Error renewing subscription:', error);
      toast.error('Failed to renew subscription');
      setIsProcessing(false);
    }
  }, [getUserBalance, wholesalerId, navigate, isProcessing]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Your Balance:</span>
          <span className="text-xl font-bold">${getUserBalance().toFixed(2)}</span>
        </div>
        {getUserBalance() < 50 && (
          <div className="mt-2">
            <Button 
              size="sm" 
              onClick={() => navigate("/payment")}
              className="w-full"
            >
              Add Funds
            </Button>
          </div>
        )}
      </div>

      {safeSubscriptions.length > 0 ? (
        <StockSubscriptions 
          subscriptions={safeSubscriptions}
          allowRenewal={true}
          onRenew={handleRenewal}
          renewedSubscriptions={renewedSubscriptions}
        />
      ) : (
        <div className="text-center p-6 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No active subscriptions found</p>
        </div>
      )}
    </motion.div>
  );
};

export default StockTab;
