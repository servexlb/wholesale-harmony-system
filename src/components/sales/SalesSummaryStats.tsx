
import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Users } from 'lucide-react';
import StatsCard from './StatsCard';

interface SalesSummaryStatsProps {
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  totalServices?: number; // Added for backward compatibility
}

const SalesSummaryStats: React.FC<SalesSummaryStatsProps> = ({
  totalSales: initialTotalSales,
  totalCustomers: initialTotalCustomers,
  totalProducts: initialTotalProducts,
  averageOrderValue: initialAverageOrderValue,
  totalServices: initialTotalServices
}) => {
  const [totalSales, setTotalSales] = useState(initialTotalSales);
  const [totalCustomers, setTotalCustomers] = useState(initialTotalCustomers);
  const [totalProducts, setTotalProducts] = useState(initialTotalProducts);
  const [averageOrderValue, setAverageOrderValue] = useState(initialAverageOrderValue);
  const [totalServices, setTotalServices] = useState(initialTotalServices);

  useEffect(() => {
    setTotalSales(initialTotalSales);
    setTotalCustomers(initialTotalCustomers);
    setTotalProducts(initialTotalProducts);
    setAverageOrderValue(initialAverageOrderValue);
    setTotalServices(initialTotalServices);
  }, [initialTotalSales, initialTotalCustomers, initialTotalProducts, initialAverageOrderValue, initialTotalServices]);
  
  useEffect(() => {
    const handleOrderPlaced = () => {
      setTotalSales(prev => prev + 1); // Simple increment for UI responsiveness
    };
    
    const handleCustomerAdded = () => {
      setTotalCustomers(prev => prev + 1);
    };
    
    window.addEventListener('orderPlaced', handleOrderPlaced);
    window.addEventListener('customerAdded', handleCustomerAdded);
    
    return () => {
      window.removeEventListener('orderPlaced', handleOrderPlaced);
      window.removeEventListener('customerAdded', handleCustomerAdded);
    };
  }, []);

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
      />
      <StatsCard
        title="Average Order"
        value={`$${averageOrderValue.toFixed(2)}`}
        description="Per transaction"
        icon={<TrendingUp className="h-5 w-5" />}
        trend=""
        trendUp={false}
      />
      <StatsCard
        title="Products Sold"
        value={displayTotal.toString()}
        description="Unique products"
        icon={<ShoppingBag className="h-5 w-5" />}
        trend=""
        trendUp={false}
      />
      <StatsCard
        title="Customers"
        value={totalCustomers.toString()}
        description="Total customers"
        icon={<Users className="h-5 w-5" />}
        trend=""
        trendUp={false}
      />
    </div>
  );
};

export default SalesSummaryStats;
