
import { Subscription } from '@/lib/types';
import { Alert, Clock, CheckCircle } from 'lucide-react';
import React from 'react';

export const getSubscriptionStatus = (subscription: Subscription) => {
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (subscription.status === 'expired' || endDate < now) {
    return { 
      label: 'Expired', 
      variant: 'destructive', 
      icon: React.createElement(Alert, { className: "h-3 w-3 mr-1" })
    };
  }
  
  if (daysLeft <= 7) {
    return { 
      label: `${daysLeft} days left`, 
      variant: 'warning', 
      icon: React.createElement(Clock, { className: "h-3 w-3 mr-1" })
    };
  }
  
  return { 
    label: 'Active', 
    variant: 'success', 
    icon: React.createElement(CheckCircle, { className: "h-3 w-3 mr-1" })
  };
};
