
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

  // Calculate data using useEffect to simulate real-time updates
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
    
    // Simulate data loading after a short delay
    const timer = setTimeout(() => {
      // Calculate new values based on any real data if it exists
      if (sales && sales.length > 0) {
        // We would normally fetch this data from an API
        const newTotalSales = sales.reduce((total, sale) => total + sale.total, 0);
        setTotalSales(newTotalSales);
        
        if (customers && customers.length > 0) {
          setTotalCustomers(customers.length);
        }
        
        if (products && products.length > 0) {
          setTotalProducts(products.length);
        }
        
        if (sales.length > 0) {
          setAverageOrderValue(newTotalSales / sales.length);
        }
        
        // Generate sales by customer data
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
        
        setSalesByCustomer(customerData);
        
        // Generate sales by product data
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
        
        setSalesByProduct(productData);
        
        // Generate monthly sales data
        const monthlyTotals = { ...months };
        sales.forEach(sale => {
          const date = new Date(sale.date);
          const monthName = date.toLocaleString('default', { month: 'short' });
          monthlyTotals[monthName] += sale.total;
        });
        
        const newMonthlyData = Object.entries(monthlyTotals).map(([month, total]) => ({
          month,
          total
        }));
        
        setMonthlySalesData(newMonthlyData);
      }
    }, 1000); // 1 second delay to simulate loading real-time data
    
    return () => clearTimeout(timer);
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
