
import React from 'react';
import { Subscription } from '@/lib/types';
import { CheckCircle, AlertTriangle, Clock, Ban } from 'lucide-react';

export const getSubscriptionStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'expired':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'cancelled':
      return <Ban className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

export const isSubscriptionActive = (subscription: Subscription) => {
  return subscription.status === 'active';
};

export const isSubscriptionExpired = (subscription: Subscription) => {
  return subscription.status === 'expired';
};

export const isSubscriptionCancelled = (subscription: Subscription) => {
  return subscription.status === 'cancelled'; // Fixed from 'canceled' to 'cancelled'
};

export const getRemainingDays = (endDate: string) => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
