
import React from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { Subscription } from '@/lib/types';
import { customers, products } from '@/lib/data';
import { Clock, CircleAlert, CircleX } from 'lucide-react';

export const getSubscriptionStatus = (subscription: Subscription): { 
  label: string; 
  variant: "default" | "secondary" | "destructive"; 
  icon: React.ReactNode 
} => {
  try {
    const expiryDate = parseISO(subscription.endDate);
    const daysUntilExpiry = differenceInDays(expiryDate, new Date());

    if (subscription.status === "canceled") {
      return { label: "Canceled", variant: "destructive", icon: <CircleX className="h-3 w-3 mr-1" /> };
    } else if (daysUntilExpiry <= 0) {
      return { label: "Expired", variant: "destructive", icon: <CircleX className="h-3 w-3 mr-1" /> };
    } else if (daysUntilExpiry <= 7) {
      return { label: "Expiring Soon", variant: "secondary", icon: <CircleAlert className="h-3 w-3 mr-1" /> };
    } else {
      return { label: "Active", variant: "default", icon: <Clock className="h-3 w-3 mr-1" /> };
    }
  } catch (error) {
    console.error('Error calculating subscription status:', error);
    return { label: "Unknown", variant: "destructive", icon: <CircleX className="h-3 w-3 mr-1" /> };
  }
};

export const filterSubscriptions = (subscriptions: Subscription[], searchTerm: string): Subscription[] => {
  try {
    if (!searchTerm.trim()) return subscriptions;
    
    return subscriptions.filter(subscription => {
      const customer = customers.find(c => c.id === subscription.userId);
      const product = products.find(p => p.id === subscription.serviceId);

      if (!customer || !product) return false;

      const searchStr = `${customer.name} ${customer.phone} ${customer.email} ${product.name}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  } catch (error) {
    console.error('Error filtering subscriptions:', error);
    return [];
  }
};
