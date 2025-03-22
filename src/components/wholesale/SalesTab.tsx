
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Customer, Product, products } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import SalesCalculator from '@/components/SalesCalculator';
import SalesHeader from './sales/SalesHeader';
import SalesSummary from './sales/SalesSummary';
import PurchaseHistory from './sales/PurchaseHistory';

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
  
  // Memoize filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const product = products.find(p => p.id === order.serviceId);
      const customer = customers.find(c => c.id === order.customerId);
      
      const matchesSearch = 
        product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesCustomer = filterCustomer === 'all' || order.customerId === filterCustomer;
      
      let matchesPeriod = true;
      const orderDate = new Date(order.createdAt);
      
      if (filterPeriod === 'today') {
        const today = new Date();
        matchesPeriod = orderDate.toDateString() === today.toDateString();
      } else if (filterPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesPeriod = orderDate >= weekAgo;
      } else if (filterPeriod === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesPeriod = orderDate >= monthAgo;
      }
      
      return matchesSearch && matchesCustomer && matchesPeriod;
    });
  }, [orders, customers, searchTerm, filterCustomer, filterPeriod]);
  
  // Calculate total sales amount
  const totalSales = useMemo(() => {
    return filteredOrders.reduce((total, order) => total + order.totalPrice, 0);
  }, [filteredOrders]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col space-y-5"
    >
      <SalesHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sales Calculator Component */}
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Sales Calculator</h2>
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
        setSearchTerm={setSearchTerm}
        filterCustomer={filterCustomer}
        setFilterCustomer={setFilterCustomer}
        filterPeriod={filterPeriod}
        setFilterPeriod={setFilterPeriod}
      />
    </motion.div>
  );
};

export default React.memo(SalesTab);
