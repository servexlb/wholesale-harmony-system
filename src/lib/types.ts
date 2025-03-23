
export type UserRole = "customer" | "wholesale" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  balance: number;
  createdAt: string;
}

export type ServiceType = "subscription" | "topup" | "giftcard" | "recharge" | "service";

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

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
  categoryId: string;
  image: string;
  deliveryTime: string;
  featured: boolean;
  type: ServiceType;
  availableMonths?: number[];
  requiresId?: boolean;
  minQuantity?: number;
  value?: number;
  apiUrl?: string;
  features?: string[];
  category?: string; // Make category optional in Service interface
  monthlyPricing?: MonthlyPricing[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice: number;
  image: string;
  category: string;
  categoryId?: string; // Make categoryId optional in Product
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

export interface Subscription {
  id: string;
  userId: string;
  serviceId: string;
  startDate: string;
  endDate: string;
  credentials?: {
    email: string;
    password: string;
  };
  status: "active" | "expired" | "canceled";
  paymentStatus?: "paid" | "pending" | "failed";
  profileStatus?: "active" | "needs_fixing";
  durationMonths?: number;
}

export interface Order {
  id: string;
  userId: string;
  serviceId: string;
  quantity: number;
  totalPrice: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  notes?: string;
  customerId?: string;
  credentials?: {
    email: string;
    password: string;
  };
  durationMonths?: number;
  paymentStatus?: "paid" | "pending" | "insufficient_balance";
  accountId?: string;
}

export interface WholesaleOrder extends Order {
  customerId: string;
  wholesalerId: string;
  credentials?: {
    email: string;
    password: string;
  };
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  createdAt: string;
}

export interface SimpleCustomer {
  id: string;
  name: string;
  phone: string;
}

export interface AdminNotification {
  id: string;
  type: "profile_fix" | "payment_issue" | "password_reset" | "new_order";
  subscriptionId?: string;
  orderId?: string;
  userId: string;
  customerName: string;
  serviceName: string;
  createdAt: string;
  read: boolean;
}

// New customer notification type
export interface CustomerNotification {
  id: string;
  userId: string;
  type: "profile_fixed" | "payment_resolved" | "password_reset" | "order_completed";
  message: string;
  createdAt: string;
  read: boolean;
  subscriptionId?: string;
  serviceName?: string;
}

// New types for subscription issues
export type IssueStatus = "pending" | "in_progress" | "resolved";
export type IssueType = "profile_fix" | "payment_issue" | "password_reset";

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
    email: string;
    password: string;
  };
}

// New payment related interfaces
export type PaymentStatus = "pending" | "approved" | "rejected";

export interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  method: "credit_card" | "bank_transfer" | "paypal" | "other";
  status: PaymentStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  receiptUrl?: string;
  transactionId?: string;
}
