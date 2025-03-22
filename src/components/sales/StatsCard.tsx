
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon,
  trend,
  trendUp 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
          {trend && trend !== '0%' && (
            <span className={`text-xs ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
