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

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
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
  type?: "subscription" | "recharge";  // Added type property
  availableMonths?: number[];  // Added availableMonths property
  apiUrl?: string;  // Added API URL for recharge services
}

// Product interface with explicit properties to match the actual data structure
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice: number;
  category: string;  // Note: this is 'category' rather than 'categoryId'
  image: string;
  deliveryTime: string;
  featured: boolean;
  type?: "subscription" | "recharge";
  availableMonths?: number[];
  apiUrl?: string;  // Added API URL for recharge products
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
  durationMonths?: number; // Number of months the subscription is valid for
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
  customerId?: string; // The customer this order is for (for wholesale orders)
  credentials?: {
    email: string;
    password: string;
  };
  durationMonths?: number; // Duration of subscription in months
  paymentStatus?: "paid" | "pending" | "insufficient_balance"; // Added payment status
}

export interface WholesaleOrder extends Order {
  customerId: string; // Required for wholesale orders
  wholesalerId: string; // ID of the wholesaler who placed the order
  credentials?: {
    email: string;
    password: string;
  }; // Added credentials for wholesale orders
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

// Simple customer interface for wholesale
export interface SimpleCustomer {
  id: string;
  name: string;
  phone: string;
}

// Admin notification system
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
