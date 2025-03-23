export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  wholesalerId?: string;
  notes?: string;
  [key: string]: any;
}

export interface WholesaleOrder {
  id: string;
  customerId: string;
  serviceId: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  durationMonths?: number;
  credentials?: {
    username?: string;
    password?: string;
    notes?: string;
    [key: string]: any;
  };
}

// Update the Subscription interface to include credentials
export interface Subscription {
  id: string;
  userId: string;
  serviceId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  durationMonths?: number;
  credentials?: {
    username?: string;
    password?: string;
    notes?: string;
    [key: string]: any;
  };
}

// Make sure Service and Product are compatible
export type ServiceType = 'subscription' | 'giftcard' | 'topup' | 'recharge' | 'service';

export interface MonthlyPricing {
  months: number;
  price: number;
  wholesalePrice: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  wholesalePrice?: number;
  image?: string;
  categoryId?: string;
  category?: string;
  featured?: boolean;
  type?: ServiceType;
  value?: number;
  deliveryTime?: string;
  availableMonths?: number[];
  apiUrl?: string;
  minQuantity?: number;
  requiresId?: boolean;
  monthlyPricing?: MonthlyPricing[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  wholesalePrice?: number;
  image?: string;
  category: string;
  categoryId?: string;
  featured?: boolean;
  type?: ServiceType;
  value?: number;
  deliveryTime?: string;
  availableMonths?: number[];
  apiUrl?: string;
  minQuantity?: number;
  requiresId?: boolean;
  monthlyPricing?: MonthlyPricing[];
}
