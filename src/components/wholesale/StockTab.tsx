
import React from 'react';
import { motion } from 'framer-motion';
import StockSubscriptions from '@/components/StockSubscriptions';
import { Subscription } from '@/lib/types';

interface StockTabProps {
  subscriptions: Subscription[];
}

const StockTab: React.FC<StockTabProps> = ({ subscriptions }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <StockSubscriptions 
        subscriptions={subscriptions}
        allowRenewal={true} 
      />
    </motion.div>
  );
};

export default StockTab;
