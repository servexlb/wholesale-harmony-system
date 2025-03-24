
import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Users } from 'lucide-react';
import StatsCard from './StatsCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

interface SalesSummaryStatsProps {
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  totalServices?: number;
  wholesalerId?: string;
}

const SalesSummaryStats: React.FC<SalesSummaryStatsProps> = ({
  totalSales: initialTotalSales,
  totalCustomers: initialTotalCustomers,
  totalProducts: initialTotalProducts,
  averageOrderValue: initialAverageOrderValue,
  totalServices: initialTotalServices,
  wholesalerId
}) => {
  const [totalSales, setTotalSales] = useState(initialTotalSales);
  const [totalCustomers, setTotalCustomers] = useState(initialTotalCustomers);
  const [totalProducts, setTotalProducts] = useState(initialTotalProducts);
  const [averageOrderValue, setAverageOrderValue] = useState(initialAverageOrderValue);
  const [totalServices, setTotalServices] = useState(initialTotalServices);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch metrics from Supabase on component mount if wholesalerId is available
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!wholesalerId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('wholesale_metrics')
          .select('*')
          .eq('wholesaler_id', wholesalerId)
          .single();
          
        if (error) {
          console.error('Error fetching metrics:', error);
          // Don't show toast for not found error as it might be first time user
          if (error.code !== 'PGRST116') {
            toast.error('Error loading metrics');
          }
        } else if (data) {
          console.log('Metrics loaded from Supabase:', data);
          setTotalSales(data.total_sales);
          setTotalCustomers(data.total_customers);
          setTotalProducts(data.total_services);
          setTotalServices(data.total_services);
          setAverageOrderValue(data.average_order_value);
        }
      } catch (error) {
        console.error('Error in fetchMetrics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMetrics();
  }, [wholesalerId]);

  // Update the component state with props
  useEffect(() => {
    setTotalSales(initialTotalSales);
    setTotalCustomers(initialTotalCustomers);
    setTotalProducts(initialTotalProducts);
    setAverageOrderValue(initialAverageOrderValue);
    setTotalServices(initialTotalServices);
  }, [initialTotalSales, initialTotalCustomers, initialTotalProducts, initialAverageOrderValue, initialTotalServices]);
  
  // Listen for order and customer events to update metrics in real-time
  useEffect(() => {
    const handleOrderPlaced = async () => {
      if (wholesalerId) {
        try {
          const { data, error } = await supabase
            .from('wholesale_metrics')
            .select('*')
            .eq('wholesaler_id', wholesalerId)
            .single();
            
          if (error) {
            console.error('Error fetching updated metrics after order:', error);
          } else if (data) {
            setTotalSales(data.total_sales);
            setAverageOrderValue(data.average_order_value);
            setTotalProducts(data.total_services);
            setTotalServices(data.total_services);
          }
        } catch (error) {
          console.error('Error updating metrics after order:', error);
        }
      } else {
        setTotalSales(prev => prev + 1); // Simple increment for UI responsiveness
      }
    };
    
    const handleCustomerAdded = async () => {
      if (wholesalerId) {
        try {
          const { data, error } = await supabase
            .from('wholesale_metrics')
            .select('*')
            .eq('wholesaler_id', wholesalerId)
            .single();
            
          if (error) {
            console.error('Error fetching updated metrics after customer added:', error);
          } else if (data) {
            setTotalCustomers(data.total_customers);
          }
        } catch (error) {
          console.error('Error updating metrics after customer added:', error);
        }
      } else {
        setTotalCustomers(prev => prev + 1);
      }
    };
    
    window.addEventListener('orderPlaced', handleOrderPlaced);
    window.addEventListener('customerAdded', handleCustomerAdded);
    
    return () => {
      window.removeEventListener('orderPlaced', handleOrderPlaced);
      window.removeEventListener('customerAdded', handleCustomerAdded);
    };
  }, [wholesalerId]);

  // Use totalServices if provided, otherwise fall back to totalProducts
  const displayTotal = totalServices !== undefined ? totalServices : totalProducts;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatsCard
        title="Total Revenue"
        value={`$${totalSales.toFixed(2)}`}
        description="Lifetime sales amount"
        icon={<DollarSign className="h-5 w-5" />}
        trend=""
        trendUp={false}
        isLoading={isLoading}
      />
      <StatsCard
        title="Average Order"
        value={`$${averageOrderValue.toFixed(2)}`}
        description="Per transaction"
        icon={<TrendingUp className="h-5 w-5" />}
        trend=""
        trendUp={false}
        isLoading={isLoading}
      />
      <StatsCard
        title="Products Sold"
        value={displayTotal.toString()}
        description="Unique products"
        icon={<ShoppingBag className="h-5 w-5" />}
        trend=""
        trendUp={false}
        isLoading={isLoading}
      />
      <StatsCard
        title="Customers"
        value={totalCustomers.toString()}
        description="Total customers"
        icon={<Users className="h-5 w-5" />}
        trend=""
        trendUp={false}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SalesSummaryStats;
