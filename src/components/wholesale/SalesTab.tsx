
import React from 'react';
import { motion } from 'framer-motion';
import SalesCalculator from '@/components/SalesCalculator';

const SalesTab: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8">Sales Overview</h1>
      <SalesCalculator />
    </motion.div>
  );
};

export default SalesTab;
