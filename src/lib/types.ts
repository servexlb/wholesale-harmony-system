
// Add serviceName to Order type:
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
  paymentStatus?: string;
}
