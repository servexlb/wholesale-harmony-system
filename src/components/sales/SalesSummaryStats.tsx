
import React from 'react';
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
  totalSales,
  totalCustomers,
  totalProducts,
  averageOrderValue,
  totalServices
}) => {
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
