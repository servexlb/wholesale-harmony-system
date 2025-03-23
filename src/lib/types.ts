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
  userId?: string;
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    [key: string]: any;
  };
}

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

export type ServiceType = 'subscription' | 'giftcard' | 'topup' | 'recharge' | 'service';

export interface MonthlyPricing {
  months: number;
  price: number;
  wholesalePrice: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice: number;
  image?: string;
  category: string;
  categoryId?: string;
  featured?: boolean;
  type?: ServiceType;
  deliveryTime?: string;
  requiresId?: boolean;
  availableMonths?: number[];
  monthlyPricing?: MonthlyPricing[];
  features?: string[];
  availableForCustomers?: boolean;
  value?: number;
  minQuantity?: number;
  apiUrl?: string;
  stockAvailable?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice: number;
  image: string;
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
  features?: string[];
  availableForCustomers?: boolean;
}

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
  type: 'profile_fix' | 'payment_issue' | 'password_reset' | 'new_order' | 'payment_request';
  subscriptionId: string;
  userId: string;
  customerName: string;
  serviceName: string;
  createdAt: string;
  read: boolean;
  orderId?: string;
  paymentId?: string;
  amount?: number;
  paymentMethod?: string;
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
  userId?: string;
}

export interface CustomerNotification {
  id: string;
  userId: string;
  type: 'profile_fixed' | 'payment_resolved' | 'password_reset' | 'order_completed' | 'payment_approved' | 'payment_rejected';
  message: string;
  createdAt: string;
  read: boolean;
  subscriptionId?: string;
  serviceName?: string;
  paymentId?: string;
  amount?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  image?: string;
  icon: string;
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
  serviceId?: string;
  quantity?: number;
  totalPrice?: number;
  completedAt?: string;
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    [key: string]: any;
  };
  credentialStatus?: 'available' | 'pending' | 'assigned';
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'credit_card' | 'paypal' | 'bank_transfer' | 'balance' | 'usdt' | 'wish_money';
  status: PaymentStatus;
  createdAt: string;
  transactionId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  receiptUrl?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'approved' | 'rejected';

export type IssueType = 'profile_fix' | 'payment_issue' | 'password_reset';
export type IssueStatus = 'pending' | 'in_progress' | 'resolved' | 'cancelled';

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
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    [key: string]: any;
  };
}

export interface SimpleCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

// Gift Card specific types
export interface GiftCard {
  id: string;
  code: string;
  value: number;
  balance: number;
  expiryDate?: string;
  createdAt: string;
  status: 'active' | 'redeemed' | 'expired';
  purchaserId?: string;
  recipientEmail?: string;
  message?: string;
}

// Recharge specific types
export interface RechargePackage {
  id: string;
  name: string;
  description?: string;
  value: number;
  price: number;
  wholesalePrice?: number;
  category: string;
  image?: string;
  featured?: boolean;
  validityDays?: number;
}

export interface Recharge {
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  accountNumber?: string;
  operator?: string;
  receiptId?: string;
}

export interface CredentialStock {
  id: string;
  serviceId: string;
  credentials: {
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    [key: string]: any;
  };
  status: 'available' | 'assigned';
  assignedToOrderId?: string;
  createdAt: string;
}
