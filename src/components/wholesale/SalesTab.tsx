
import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import SalesCalculator from '@/components/SalesCalculator';
import SalesHeader from './sales/SalesHeader';
import SalesSummary from './sales/SalesSummary';
import PurchaseHistory from './sales/PurchaseHistory';
import ExportData from './ExportData';

interface SalesTabProps {
  orders?: WholesaleOrder[];
  customers?: Customer[];
}

const SalesTab: React.FC<SalesTabProps> = ({ 
  orders = [], 
  customers = [] 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  
  // Memoize filtered orders with useCallback for better performance
  const filteredOrders = useMemo(() => {
    if (!orders.length) return [];
    
    return orders.filter(order => {
      // Skip expensive filtering if no filters are applied
      if (searchTerm === '' && filterCustomer === 'all' && filterPeriod === 'all') {
        return true;
      }
      
      let matchesSearch = true;
      let matchesCustomer = true;
      let matchesPeriod = true;
      
      // Only perform search if there's a search term
      if (searchTerm !== '') {
        matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Only check customer name if search doesn't match order ID
        if (!matchesSearch && order.customerId) {
          const customer = customers.find(c => c.id === order.customerId);
          if (customer) {
            matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase());
          }
        }
      }
      
      if (filterCustomer !== 'all') {
        matchesCustomer = order.customerId === filterCustomer;
      }
      
      if (filterPeriod !== 'all') {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        
        if (filterPeriod === 'today') {
          matchesPeriod = orderDate.toDateString() === now.toDateString();
        } else if (filterPeriod === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesPeriod = orderDate >= weekAgo;
        } else if (filterPeriod === 'month') {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesPeriod = orderDate >= monthAgo;
        }
      }
      
      return matchesSearch && matchesCustomer && matchesPeriod;
    });
  }, [orders, customers, searchTerm, filterCustomer, filterPeriod]);
  
  // Calculate total sales amount
  const totalSales = useMemo(() => {
    if (!filteredOrders.length) return 0;
    return filteredOrders.reduce((total, order) => total + order.totalPrice, 0);
  }, [filteredOrders]);

  // Prepare export data with more readable format
  const exportData = useMemo(() => {
    if (!filteredOrders.length) return [];
    
    return filteredOrders.map(order => {
      const customer = customers.find(c => c.id === order.customerId);
      
      return {
        OrderID: order.id,
        Date: new Date(order.createdAt).toLocaleString(),
        Customer: customer?.name || 'Unknown',
        Product: order.serviceId || 'Unknown',
        Quantity: order.quantity || 1,
        Price: `$${order.totalPrice.toFixed(2)}`,
        Status: order.status || 'Completed'
      };
    });
  }, [filteredOrders, customers]);
  
  // Memoize handler functions to prevent unnecessary rerenders
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);
  
  const handleCustomerFilterChange = useCallback((value: string) => {
    setFilterCustomer(value);
  }, []);
  
  const handlePeriodFilterChange = useCallback((value: string) => {
    setFilterPeriod(value);
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col space-y-5"
    >
      <div className="flex justify-between items-center">
        <SalesHeader />
        <ExportData 
          data={exportData} 
          filename="wholesale-sales" 
          disabled={filteredOrders.length === 0}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sales Calculator Component - Wrap in React.memo */}
        <div className="bg-white p-5 rounded-lg shadow-sm md:col-span-2">
          <h2 className="text-lg font-medium mb-4">Sales Analytics</h2>
          <SalesCalculator />
        </div>
        
        {/* Sales Summary */}
        <SalesSummary 
          totalOrders={filteredOrders.length} 
          totalSales={totalSales} 
        />
      </div>
      
      {/* Purchase History Table */}
      <PurchaseHistory 
        filteredOrders={filteredOrders}
        customers={customers}
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
        filterCustomer={filterCustomer}
        setFilterCustomer={handleCustomerFilterChange}
        filterPeriod={filterPeriod}
        setFilterPeriod={handlePeriodFilterChange}
      />
    </motion.div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(SalesTab);
