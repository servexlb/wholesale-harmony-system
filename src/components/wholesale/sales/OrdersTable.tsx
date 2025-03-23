
import React, { memo, useMemo } from 'react';
import { Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { createProductMap } from './utils/productMapUtils';
import DesktopOrdersTable from './DesktopOrdersTable';
import MobileOrdersList from './MobileOrdersList';

interface OrdersTableProps {
  filteredOrders: WholesaleOrder[];
  customers: Customer[];
}

const OrdersTable: React.FC<OrdersTableProps> = ({ filteredOrders, customers }) => {
  const isMobile = useIsMobile();
  
  // Create a memoized product lookup map
  const productMap = useMemo(() => createProductMap(), []);
  
  // Create a memoized customer lookup map
  const customerMap = useMemo(() => {
    const map = new Map();
    customers.forEach(customer => {
      map.set(customer.id, customer);
    });
    return map;
  }, [customers]);
  
  // Limit the number of orders rendered to improve performance
  const displayOrders = useMemo(() => {
    return filteredOrders.slice(0, 20);
  }, [filteredOrders]);
  
  if (isMobile) {
    return <MobileOrdersList 
      displayOrders={displayOrders}
      customerMap={customerMap}
      productMap={productMap}
    />;
  }
  
  return <DesktopOrdersTable 
    displayOrders={displayOrders}
    customerMap={customerMap}
    productMap={productMap}
  />;
};

export default memo(OrdersTable);
