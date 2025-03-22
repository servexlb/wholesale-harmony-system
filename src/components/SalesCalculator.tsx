
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { sales, customers, products, getCustomerById, getProductById } from '@/lib/data';

// Import our new components
import SalesSummaryStats from './sales/SalesSummaryStats';
import MonthlySalesChart from './sales/charts/MonthlySalesChart';
import SalesDistributionChart from './sales/charts/SalesDistributionChart';

const SalesCalculator = () => {
  const [period, setPeriod] = useState('all');
  
  // Calculate totals
  const totalSales = useMemo(() => {
    return sales.reduce((total, sale) => total + sale.total, 0);
  }, []);
  
  const totalCustomers = customers.length;
  const totalProducts = products.length;
  
  const averageOrderValue = useMemo(() => {
    return totalSales / sales.length;
  }, [totalSales]);

  // Generate chart data
  const salesByCustomer = useMemo(() => {
    const salesMap = new Map();
    
    sales.forEach(sale => {
      const customer = getCustomerById(sale.customerId);
      if (customer) {
        salesMap.set(
          customer.id, 
          (salesMap.get(customer.id) || 0) + sale.total
        );
      }
    });
    
    return Array.from(salesMap.entries()).map(([customerId, total]) => {
      const customer = getCustomerById(customerId);
      return {
        name: customer?.name || 'Unknown',
        value: total
      };
    }).sort((a, b) => b.value - a.value);
  }, []);

  const salesByProduct = useMemo(() => {
    const productMap = new Map();
    
    sales.forEach(sale => {
      sale.products.forEach(item => {
        productMap.set(
          item.productId, 
          (productMap.get(item.productId) || 0) + (item.quantity * item.priceAtSale)
        );
      });
    });
    
    return Array.from(productMap.entries()).map(([productId, total]) => {
      const product = getProductById(productId);
      return {
        name: product?.name || 'Unknown',
        value: total
      };
    }).sort((a, b) => b.value - a.value);
  }, []);

  // Generate monthly data for bar chart
  const monthlySalesData = useMemo(() => {
    const months = {};
    
    // Initialize all months
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(0, i).toLocaleString('default', { month: 'short' });
      months[monthName] = 0;
    }
    
    sales.forEach(sale => {
      const date = new Date(sale.date);
      const monthName = date.toLocaleString('default', { month: 'short' });
      months[monthName] += sale.total;
    });
    
    return Object.entries(months).map(([month, total]) => ({
      month,
      total
    }));
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
