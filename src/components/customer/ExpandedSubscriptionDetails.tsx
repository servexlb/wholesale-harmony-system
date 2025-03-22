
import React from 'react';
import { Calendar, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Subscription } from '@/lib/types';
import { products } from '@/lib/data';
import SubscriptionActions from './SubscriptionActions';
import { getSubscriptionStatusColor, getStatusLabel } from './SubscriptionStatusBadge';

interface ExpandedSubscriptionDetailsProps {
  subscriptions: Subscription[];
  customerId: string;
}

const ExpandedSubscriptionDetails: React.FC<ExpandedSubscriptionDetailsProps> = ({
  subscriptions,
  customerId
}) => {
  return (
    <div className="p-4">
      <h4 className="font-medium mb-2">Subscription Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {subscriptions.map((sub) => {
          const product = products.find(p => p.id === sub.serviceId);
          const statusColor = getSubscriptionStatusColor(sub.endDate);
          const today = new Date();
          const end = new Date(sub.endDate);
          const daysLeft = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={sub.id} className="bg-white p-3 rounded-md border shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium">{product?.name || 'Unknown Service'}</h5>
                  <p className="text-sm text-muted-foreground">
                    Expires: {new Date(sub.endDate).toLocaleDateString()}
                  </p>
                  {sub.durationMonths && (
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {sub.durationMonths} month{sub.durationMonths > 1 ? 's' : ''} subscription
                    </p>
                  )}
                </div>
                <Badge 
                  variant={
                    statusColor === "green" ? "default" : 
                    statusColor === "orange" ? "outline" : 
                    "destructive"
                  }
                  className={
                    statusColor === "orange" 
                      ? "border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-100" 
                      : ""
                  }
                >
                  {getStatusLabel(statusColor, daysLeft > 0 ? daysLeft : undefined)}
                </Badge>
              </div>
              
              {sub.credentials && (
                <div className="mt-2 pt-2 border-t">
                  <div className="flex items-center gap-1 mb-1">
                    <Key className="h-3 w-3 text-primary" />
                    <span className="text-sm font-medium">Credentials</span>
                  </div>
                  <div className="bg-muted/30 p-2 rounded text-sm">
                    <div><span className="font-medium">Email:</span> {sub.credentials.email}</div>
                    <div><span className="font-medium">Password:</span> {sub.credentials.password}</div>
                  </div>
                </div>
              )}

              <div className="mt-3 pt-2 border-t">
                <SubscriptionActions 
                  subscriptionId={sub.id}
                  serviceId={sub.serviceId}
                  customerId={customerId}
                  hasCredentials={!!sub.credentials}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpandedSubscriptionDetails;
