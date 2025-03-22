
import React from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Users } from 'lucide-react';
import StatsCard from './StatsCard';

interface SalesSummaryStatsProps {
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
}

const SalesSummaryStats: React.FC<SalesSummaryStatsProps> = ({
  totalSales,
  totalCustomers,
  totalProducts,
  averageOrderValue
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Revenue"
        value={`$${totalSales.toFixed(2)}`}
        description="Lifetime sales amount"
        icon={<DollarSign className="h-5 w-5" />}
        trend="+12.5%"
        trendUp={true}
      />
      <StatsCard
        title="Average Order"
        value={`$${averageOrderValue.toFixed(2)}`}
        description="Per transaction"
        icon={<TrendingUp className="h-5 w-5" />}
        trend="+3.2%"
        trendUp={true}
      />
      <StatsCard
        title="Products Sold"
        value={totalProducts.toString()}
        description="Unique products"
        icon={<ShoppingBag className="h-5 w-5" />}
        trend="0%"
        trendUp={false}
      />
      <StatsCard
        title="Customers"
        value={totalCustomers.toString()}
        description="Total customers"
        icon={<Users className="h-5 w-5" />}
        trend="+5.3%"
        trendUp={true}
      />
    </div>
  );
};

export default SalesSummaryStats;
