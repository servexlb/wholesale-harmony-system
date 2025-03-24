
import React from 'react';
import SalesCalculator from '@/components/SalesCalculator';
import { Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

interface SalesTabProps {
  orders: WholesaleOrder[];
  customers: Customer[];
  wholesalerId?: string;
}

const SalesTab: React.FC<SalesTabProps> = ({ 
  orders, 
  customers,
  wholesalerId 
}) => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold tracking-tight">Sales Dashboard</h2>
      
      <SalesCalculator 
        orders={orders} 
        customers={customers}
        wholesalerId={wholesalerId}
      />
    </div>
  );
};

export default SalesTab;
