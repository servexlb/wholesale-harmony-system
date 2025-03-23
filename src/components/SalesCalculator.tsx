
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SalesSummaryStats from './sales/SalesSummaryStats';
import MonthlySalesChart from './sales/charts/MonthlySalesChart';
import SalesDistributionChart from './sales/charts/SalesDistributionChart';

const SalesCalculator = () => {
  // Initialize all state values with zeros
  const [totalSales, setTotalSales] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [salesByCustomer, setSalesByCustomer] = useState<{ name: string, value: number }[]>([]);
  const [salesByProduct, setSalesByProduct] = useState<{ name: string, value: number }[]>([]);
  const [monthlySalesData, setMonthlySalesData] = useState<{ month: string, total: number }[]>([]);

  // Initialize monthly data with all zeros
  useEffect(() => {
    const months: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(0, i).toLocaleString('default', { month: 'short' });
      months[monthName] = 0;
    }
    
    const monthlyData = Object.entries(months).map(([month, total]) => ({
      month,
      total
    }));
    
    setMonthlySalesData(monthlyData);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <SalesSummaryStats 
        totalSales={totalSales}
        totalCustomers={totalCustomers}
        totalProducts={totalProducts}
        averageOrderValue={averageOrderValue}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MonthlySalesChart monthlySalesData={monthlySalesData} />
        <SalesDistributionChart 
          salesByCustomer={salesByCustomer} 
          salesByProduct={salesByProduct} 
        />
      </div>
    </motion.div>
  );
};

export default SalesCalculator;
