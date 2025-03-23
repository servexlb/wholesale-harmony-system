
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
  wholesalerId?: string;
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
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
    email?: string;
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

// Missing types that are causing errors
export type UserRole = 'admin' | 'customer' | 'wholesale';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  balance: number;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  type: 'profile_fix' | 'payment_issue' | 'password_reset' | 'new_order';
  subscriptionId: string;
  userId: string;
  customerName: string;
  serviceName: string;
  createdAt: string;
  read: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  message: string;
  sentBy: 'user' | 'admin';
  createdAt: string;
}

export interface CustomerNotification {
  id: string;
  userId: string;
  type: 'profile_fixed' | 'payment_resolved' | 'password_reset' | 'order_completed';
  message: string;
  createdAt: string;
  read: boolean;
  subscriptionId?: string;
  serviceName?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerId?: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'credit_card' | 'paypal' | 'bank_transfer' | 'balance';
  status: PaymentStatus;
  createdAt: string;
  transactionId?: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type IssueType = 'profile_fix' | 'payment_issue' | 'password_reset';
export type IssueStatus = 'pending' | 'in-progress' | 'resolved' | 'cancelled';

export interface SubscriptionIssue {
  id: string;
  subscriptionId: string;
  userId: string;
  customerName: string;
  serviceName: string;
  type: IssueType;
  status: IssueStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
  credentials?: {
    email?: string;
    password?: string;
  };
}

export interface SimpleCustomer {
  id: string;
  name: string;
  email: string;
}
