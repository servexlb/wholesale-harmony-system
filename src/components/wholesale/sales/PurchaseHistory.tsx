
import React from 'react';
import { Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import SalesFilters from './SalesFilters';
import OrdersTable from './OrdersTable';

interface PurchaseHistoryProps {
  filteredOrders: WholesaleOrder[];
  customers: Customer[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterCustomer: string;
  setFilterCustomer: (value: string) => void;
  filterPeriod: string;
  setFilterPeriod: (value: string) => void;
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({
  filteredOrders,
  customers,
  searchTerm,
  setSearchTerm,
  filterCustomer,
  setFilterCustomer,
  filterPeriod,
  setFilterPeriod
}) => {
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden mt-2">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Purchase History</h2>
      </div>
      
      <SalesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCustomer={filterCustomer}
        setFilterCustomer={setFilterCustomer}
        filterPeriod={filterPeriod}
        setFilterPeriod={setFilterPeriod}
        customers={customers}
      />
      
      <OrdersTable 
        filteredOrders={filteredOrders} 
        customers={customers} 
      />
    </div>
  );
};

export default PurchaseHistory;
