
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sales, customers, products, getCustomerById, getProductById } from '@/lib/data';

// Import our components
import SalesSummaryStats from './sales/SalesSummaryStats';
import MonthlySalesChart from './sales/charts/MonthlySalesChart';
import SalesDistributionChart from './sales/charts/SalesDistributionChart';

const SalesCalculator = () => {
  // Initialize state with zeros
  const [totalSales, setTotalSales] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [salesByCustomer, setSalesByCustomer] = useState<{ name: string, value: number }[]>([]);
  const [salesByProduct, setSalesByProduct] = useState<{ name: string, value: number }[]>([]);
  const [monthlySalesData, setMonthlySalesData] = useState<{ month: string, total: number }[]>([]);

  // Calculate data using useEffect to only include real data
  useEffect(() => {
    // Initialize monthly data with zeros
    const months: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(0, i).toLocaleString('default', { month: 'short' });
      months[monthName] = 0;
    }
    
    // Create the monthly data array from the months object
    const monthlyData = Object.entries(months).map(([month, total]) => ({
      month,
      total
    }));
    
    setMonthlySalesData(monthlyData);
    
    // Start with empty data
    setTotalSales(0);
    setTotalCustomers(0);
    setTotalProducts(0);
    setAverageOrderValue(0);
    setSalesByCustomer([]);
    setSalesByProduct([]);
    
    // Calculate using real data only
    if (sales && sales.length > 0) {
      // Only use real sales data
      const newTotalSales = sales.reduce((total, sale) => total + sale.total, 0);
      setTotalSales(newTotalSales);
      
      // Only use real customers data
      if (customers && customers.length > 0) {
        setTotalCustomers(customers.length);
      }
      
      // Only use real products data
      if (products && products.length > 0) {
        setTotalProducts(products.length);
      }
      
      // Calculate average order value only if there are real sales
      if (sales.length > 0) {
        setAverageOrderValue(newTotalSales / sales.length);
      }
      
      // Generate sales by customer data only if there are real sales
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
      
      const customerData = Array.from(salesMap.entries())
        .map(([customerId, total]) => {
          const customer = getCustomerById(customerId);
          return {
            name: customer?.name || 'Unknown',
            value: total as number
          };
        })
        .sort((a, b) => b.value - a.value);
      
      // Only set if we have real data
      if (customerData.length > 0) {
        setSalesByCustomer(customerData);
      }
      
      // Generate sales by product data only if there are real sales
      const productMap = new Map();
      sales.forEach(sale => {
        sale.products.forEach(item => {
          productMap.set(
            item.productId, 
            (productMap.get(item.productId) || 0) + (item.quantity * item.priceAtSale)
          );
        });
      });
      
      const productData = Array.from(productMap.entries())
        .map(([productId, total]) => {
          const product = getProductById(productId);
          return {
            name: product?.name || 'Unknown',
            value: total as number
          };
        })
        .sort((a, b) => b.value - a.value);
      
      // Only set if we have real data
      if (productData.length > 0) {
        setSalesByProduct(productData);
      }
      
      // Generate monthly sales data only if there are real sales
      const monthlyTotals = { ...months };
      sales.forEach(sale => {
        const date = new Date(sale.date);
        const monthName = date.toLocaleString('default', { month: 'short' });
        monthlyTotals[monthName] += sale.total;
      });
      
      // Only set the real data
      const newMonthlyData = Object.entries(monthlyTotals).map(([month, total]) => ({
        month,
        total
      }));
      
      setMonthlySalesData(newMonthlyData);
    }
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
