
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import SalesSummaryStats from './sales/SalesSummaryStats';
import MonthlySalesChart from './sales/charts/MonthlySalesChart';
import SalesDistributionChart from './sales/charts/SalesDistributionChart';
import { Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';

interface SalesCalculatorProps {
  orders?: WholesaleOrder[];
  customers?: Customer[];
}

const SalesCalculator: React.FC<SalesCalculatorProps> = ({
  orders = [],
  customers = []
}) => {
  // Calculate real stats from the orders data
  const {
    totalSales,
    totalCustomers,
    totalProducts,
    averageOrderValue,
    salesByCustomer,
    salesByProduct,
    monthlySalesData
  } = useMemo(() => {
    // Initialize default values
    const result = {
      totalSales: 0,
      totalCustomers: 0,
      totalProducts: 0,
      averageOrderValue: 0,
      salesByCustomer: [] as { name: string; value: number }[],
      salesByProduct: [] as { name: string; value: number }[],
      monthlySalesData: [] as { month: string; total: number }[]
    };

    if (!orders.length) {
      // Initialize monthly data with all zeros when no orders exist
      const months: Record<string, number> = {};
      for (let i = 0; i < 12; i++) {
        const monthName = new Date(0, i).toLocaleString('default', { month: 'short' });
        months[monthName] = 0;
      }
      
      result.monthlySalesData = Object.entries(months).map(([month, total]) => ({
        month,
        total
      }));
      
      return result;
    }

    // Calculate total sales
    result.totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Calculate unique customers count
    const uniqueCustomers = new Set(orders.map(order => order.customerId).filter(Boolean));
    result.totalCustomers = uniqueCustomers.size;

    // Calculate unique products count
    const uniqueProducts = new Set(orders.map(order => order.serviceId).filter(Boolean));
    result.totalProducts = uniqueProducts.size;

    // Calculate average order value
    result.averageOrderValue = result.totalSales / orders.length;

    // Calculate sales by customer
    const customerSales = new Map<string, number>();
    orders.forEach(order => {
      if (order.customerId) {
        const currentTotal = customerSales.get(order.customerId) || 0;
        customerSales.set(order.customerId, currentTotal + order.totalPrice);
      }
    });

    // Convert map to array and add customer names
    const customerSalesArray: { name: string; value: number }[] = [];
    customerSales.forEach((value, customerId) => {
      const customer = customers?.find(c => c.id === customerId);
      if (customer) {
        customerSalesArray.push({
          name: customer.name,
          value
        });
      }
    });

    // Sort by value and take top 5
    result.salesByCustomer = customerSalesArray
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Calculate sales by product
    const productSales = new Map<string, number>();
    orders.forEach(order => {
      if (order.serviceId) {
        const currentTotal = productSales.get(order.serviceId) || 0;
        productSales.set(order.serviceId, currentTotal + order.totalPrice);
      }
    });

    // Convert map to array and use product IDs as names for now
    const productSalesArray: { name: string; value: number }[] = [];
    productSales.forEach((value, productId) => {
      productSalesArray.push({
        name: productId,
        value
      });
    });

    // Sort by value and take top 5
    result.salesByProduct = productSalesArray
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Calculate monthly sales data
    const monthlySales: Record<string, number> = {};
    // Initialize all months with zero
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(0, i).toLocaleString('default', { month: 'short' });
      monthlySales[monthName] = 0;
    }

    // Add actual sales data
    orders.forEach(order => {
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        const monthName = date.toLocaleString('default', { month: 'short' });
        monthlySales[monthName] = (monthlySales[monthName] || 0) + order.totalPrice;
      }
    });

    // Convert to array format for chart
    result.monthlySalesData = Object.entries(monthlySales).map(([month, total]) => ({
      month,
      total
    }));

    return result;
  }, [orders, customers]);

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
