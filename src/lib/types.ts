// Add serviceName to Order type:
export interface Order {
  id: string;
  userId: string;
  customerId?: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
    name?: string; // Add name property to fix error in AdminOrders
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  serviceId?: string;
  serviceName?: string; // Add this line
  quantity?: number;
  totalPrice?: number;
  completedAt?: string;
  durationMonths?: number;
  accountId?: string;
  customerName?: string;
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    [key: string]: any;
  };
  credentialStatus?: 'available' | 'pending' | 'assigned';
  paymentMethod?: string; // Add this for Checkout.tsx
  notes?: string;
}

// Add Credential and CredentialStock types
export interface Credential {
  email: string;
  password: string;
  username?: string;
  pinCode?: string;
  [key: string]: any;
}

export interface CredentialStock {
  id: string;
  serviceId: string;
  credentials: Credential;
  status: 'available' | 'assigned';
  createdAt: string;
  orderId?: string;
  userId?: string;
}

// Add the missing User and UserRole types
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

// Add Product and Service types
export type ServiceType = 'subscription' | 'topup' | 'one-time' | 'lifetime' | 'recharge' | 'giftcard' | 'service';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  wholesalePrice: number;
  type: ServiceType;
  image?: string;
  categoryId?: string;
  category?: string; // For backward compatibility
  featured?: boolean;
  deliveryTime?: string;
  apiUrl?: string;
  availableMonths?: number[];
  value?: number;
  minQuantity?: number;
  requiresId?: boolean;
  monthlyPricing?: MonthlyPricing[];
  features?: string[];
  availableForCustomers?: boolean;
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
  deliveryTime?: string;
  apiUrl?: string;
  availableMonths?: number[];
  value?: number;
  minQuantity?: number;
  requiresId?: boolean;
  monthlyPricing?: MonthlyPricing[];
  features?: string[];
  availableForCustomers?: boolean;
}

// Add ServiceCategory type
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  order?: number;
  icon?: string;
}

// Add MonthlyPricing type
export interface MonthlyPricing {
  months: number;
  price: number;
  savings?: number;
}

// Add Subscription type
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

// Add WholesaleOrder type
export interface WholesaleOrder {
  id: string;
  userId?: string;
  wholesalerId?: string;
  customerId?: string;
  serviceId?: string;
  quantity?: number;
  totalPrice?: number;
  status: string;
  createdAt: string;
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    [key: string]: any;
  };
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCompany?: string;
  notes?: string;
  durationMonths?: number;
  services?: string[];
}

// Add SupportTicket type
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  serviceId?: string;
  imageUrl?: string;
}

// Add TicketResponse type
export interface TicketResponse {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  createdAt: string;
  isStaff: boolean;
  sentBy?: string;
}

// Add SimpleCustomer type
export interface SimpleCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

// Add AdminNotification type
export interface AdminNotification {
  id: string;
  type: 'profile_fix' | 'payment_issue' | 'password_reset' | 'new_order' | 'payment_request';
  customerName?: string;
  serviceName?: string;
  amount?: number;
  paymentMethod?: string;
  read: boolean;
  createdAt: string;
  customerId?: string;
  serviceId?: string;
  subscriptionId?: string;
  userId?: string;
}

// Add CustomerNotification type
export interface CustomerNotification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  serviceId?: string;
  subscriptionId?: string;
  userId?: string;
  paymentId?: string;
  amount?: number;
}

// Add SubscriptionIssue types
export type IssueType = 'login_problem' | 'password_reset' | 'account_locked' | 'service_unavailable' | 'other' | 'profile_fix' | 'payment_issue';


