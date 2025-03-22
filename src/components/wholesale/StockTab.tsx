
import React, { useState, useCallback } from 'react';
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

  // Get current wholesaler ID
  const wholesalerId = localStorage.getItem('wholesalerId') || '';
  
  // Get wholesaler balance from localStorage
  const getUserBalance = useCallback(() => {
    const userBalanceStr = localStorage.getItem(`userBalance_${wholesalerId}`);
    return userBalanceStr ? parseFloat(userBalanceStr) : 0;
  }, [wholesalerId]);

  const handleRenewal = useCallback((subscription: Subscription) => {
    const product = products.find(p => p.id === subscription.serviceId);
    
    if (!product) {
      toast.error("Product not found");
      return;
    }
    
    // Calculate renewal price (use wholesale price)
    const renewalPrice = product.wholesalePrice;
    
    // Check if user has sufficient balance
    const currentBalance = getUserBalance();
    if (currentBalance < renewalPrice) {
      toast.error("Insufficient balance", {
        description: "You don't have enough funds to renew this subscription"
      });
      // Redirect to payment page
      navigate("/payment");
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
  }, [getUserBalance, wholesalerId, navigate]);

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

      <StockSubscriptions 
        subscriptions={subscriptions}
        allowRenewal={true}
        onRenew={handleRenewal}
        renewedSubscriptions={renewedSubscriptions}
      />
    </motion.div>
  );
};

export default StockTab;
