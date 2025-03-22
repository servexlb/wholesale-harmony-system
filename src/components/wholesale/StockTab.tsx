
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StockSubscriptions from '@/components/StockSubscriptions';
import { Subscription } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/lib/toast';
import { products } from '@/lib/data';

interface StockTabProps {
  subscriptions: Subscription[];
}

const StockTab: React.FC<StockTabProps> = ({ subscriptions }) => {
  const navigate = useNavigate();
  const [renewedSubscriptions, setRenewedSubscriptions] = useState<string[]>([]);

  // Get current user ID - for wholesale user
  const userId = localStorage.getItem('wholesalerId') || '';
  
  // Get user-specific balance from localStorage
  const userBalanceStr = localStorage.getItem(`userBalance_${userId}`);
  const userBalance = userBalanceStr ? parseFloat(userBalanceStr) : 0;

  const handleRenewal = (subscription: Subscription) => {
    const product = products.find(p => p.id === subscription.serviceId);
    
    if (!product) {
      toast.error("Product not found");
      return;
    }
    
    // Calculate renewal price (use wholesale price)
    const renewalPrice = product.wholesalePrice;
    
    // Check if user has sufficient balance
    if (userBalance < renewalPrice) {
      toast.error("Insufficient balance", {
        description: "You don't have enough funds to renew this subscription"
      });
      // Redirect to payment page
      navigate("/payment");
      return;
    }
    
    // Deduct the price from user balance
    const newBalance = userBalance - renewalPrice;
    localStorage.setItem(`userBalance_${userId}`, newBalance.toString());
    
    // Add subscription to renewed list
    setRenewedSubscriptions([...renewedSubscriptions, subscription.id]);
    
    // Update UI with success message
    toast.success(`Subscription renewed successfully!`, {
      description: `$${renewalPrice.toFixed(2)} has been deducted from your balance.`
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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
