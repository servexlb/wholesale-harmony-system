export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice: number;
  image: string;
  category: string;
  categoryId?: string;
  type?: "subscription" | "recharge" | "giftcard" | "service" | "topup";
  value?: number;
  deliveryTime?: string;
  featured?: boolean;
  availableMonths?: number[];
  apiUrl?: string;
  minQuantity?: number;
  requiresId?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  notes?: string;
  wholesalerId?: string;
  balance: number;
}

export interface Sale {
  id: string;
  customerId: string;
  date: string;
  products: {
    productId: string;
    quantity: number;
    priceAtSale: number;
  }[];
  total: number;
  paid: boolean;
}

export interface Subscription {
  id: string;
  customerId: string;
  productId: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  price: number;
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    [key: string]: any;
  };
}

import { 
  AdminNotification, 
  SubscriptionIssue, 
  IssueType, 
  IssueStatus,
  CustomerNotification,
  ServiceCategory,
  ServiceType
} from '@/lib/types';

export const products: Product[] = [
  {
    id: "p1",
    name: "Premium Ceramic Vase",
    description: "Handcrafted ceramic vase with a modern, minimalist design.",
    price: 89.99,
    wholesalePrice: 49.99,
    image: "https://images.unsplash.com/photo-1602748828300-57c35baaef48?q=80&w=1000&auto=format&fit=crop",
    category: "Home Decor"
  },
  {
    id: "p2",
    name: "Artisanal Coffee Mug",
    description: "Handmade ceramic mug with a unique glazed finish.",
    price: 34.99,
    wholesalePrice: 19.99,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1000&auto=format&fit=crop",
    category: "Kitchenware"
  },
  {
    id: "p3",
    name: "Minimalist Wall Clock",
    description: "Simple yet elegant wall clock with a silent quartz movement.",
    price: 59.99,
    wholesalePrice: 32.99,
    image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=1000&auto=format&fit=crop",
    category: "Home Decor"
  },
  {
    id: "p4",
    name: "Natural Linen Throw Pillow",
    description: "Soft, natural linen pillow cover with a feather insert.",
    price: 49.99,
    wholesalePrice: 28.99,
    image: "https://images.unsplash.com/photo-1592789705501-f9ae4287c4a9?q=80&w=1000&auto=format&fit=crop",
    category: "Textiles"
  },
  {
    id: "p5",
    name: "Handwoven Basket",
    description: "Traditional handwoven basket made from sustainable materials.",
    price: 79.99,
    wholesalePrice: 42.99,
    image: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?q=80&w=1000&auto=format&fit=crop",
    category: "Storage"
  },
  {
    id: "p6",
    name: "Glass Terrarium",
    description: "Geometric glass terrarium for displaying small plants and succulents.",
    price: 69.99,
    wholesalePrice: 38.99,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1000&auto=format&fit=crop",
    category: "Plants"
  },
];

export const customers: Customer[] = [
  {
    id: "c1",
    name: "Jane Smith",
    phone: "+1 (555) 123-4567",
    email: "jane@example.com",
    company: "Smith Home Goods",
    notes: "Prefers delivery on Tuesdays",
    wholesalerId: "wholesaler1",
    balance: 0
  },
  {
    id: "c2",
    name: "Michael Johnson",
    phone: "+1 (555) 987-6543",
    email: "michael@example.com",
    company: "Urban Living Co.",
    notes: "",
    wholesalerId: "admin",
    balance: 0
  },
  {
    id: "c3",
    name: "Emma Williams",
    phone: "+1 (555) 456-7890",
    email: "emma@example.com",
    company: "Williams Decor",
    notes: "New customer as of Jan 2023",
    wholesalerId: "wholesaler1",
    balance: 0
  },
];

export const sales: Sale[] = [
  {
    id: "s1",
    customerId: "c1",
    date: "2023-05-15",
    products: [
      { productId: "p1", quantity: 5, priceAtSale: 49.99 },
      { productId: "p3", quantity: 3, priceAtSale: 32.99 }
    ],
    total: 348.92,
    paid: true
  },
  {
    id: "s2",
    customerId: "c2",
    date: "2023-05-20",
    products: [
      { productId: "p2", quantity: 10, priceAtSale: 19.99 },
      { productId: "p4", quantity: 8, priceAtSale: 28.99 }
    ],
    total: 431.82,
    paid: true
  },
  {
    id: "s3",
    customerId: "c3",
    date: "2023-06-01",
    products: [
      { productId: "p5", quantity: 4, priceAtSale: 42.99 },
      { productId: "p6", quantity: 6, priceAtSale: 38.99 }
    ],
    total: 405.90,
    paid: false
  },
];

export const subscriptions: Subscription[] = [];

export const adminNotifications: AdminNotification[] = [
  {
    id: "n1",
    type: "profile_fix",
    customerName: "Jane Smith",
    serviceName: "Premium Ceramic Vase",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    subscriptionId: "sub-1"
  },
  {
    id: "n2",
    type: "payment_issue",
    customerName: "Michael Johnson",
    serviceName: "Minimalist Wall Clock",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    subscriptionId: "sub-3"
  },
  {
    id: "n3",
    type: "password_reset",
    customerName: "Jane Smith",
    serviceName: "Artisanal Coffee Mug",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    read: false,
    subscriptionId: "sub-2"
  }
];

export const subscriptionIssues: SubscriptionIssue[] = [];
export const customerNotifications: CustomerNotification[] = [];

const wholesaleUsers = [
  { username: 'wholesaler1', password: 'password123' },
  { username: 'admin', password: 'admin123' }
];

export const checkWholesalePassword = (password: string): boolean => {
  return password === 'wholesale2023';
};

export const checkWholesaleCredentials = (username: string, password: string): boolean => {
  return wholesaleUsers.some(
    user => user.username === username && user.password === password
  );
};

export const calculateTotalSales = (): number => {
  return sales.reduce((total, sale) => total + (sale.paid ? sale.total : 0), 0);
};

export const getCustomerById = (id: string): Customer | undefined => {
  return customers.find(customer => customer.id === id);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getSalesByCustomerId = (customerId: string): Sale[] => {
  return sales.filter(sale => sale.customerId === customerId);
};

export const getSubscriptionsByCustomerId = (customerId: string): Subscription[] => {
  return subscriptions.filter(subscription => subscription.customerId === customerId);
};

export const getSubscriptionById = (id: string): Subscription | undefined => {
  return subscriptions.find(subscription => subscription.id === id);
};

export const addCustomerBalance = (customerId: string, amount: number): boolean => {
  const customer = customers.find(c => c.id === customerId);
  if (customer) {
    customer.balance += amount;
    return true;
  }
  return false;
};

export const deductCustomerBalance = (customerId: string, amount: number): boolean => {
  const customer = customers.find(c => c.id === customerId);
  if (customer && customer.balance >= amount) {
    customer.balance -= amount;
    return true;
  }
  return false;
};

export const addSubscription = (subscription: Subscription): void => {
  subscriptions.push(subscription);
};

export const createSubscriptionIssue = (issueData: {
  subscriptionId: string;
  userId: string;
  customerName: string;
  serviceName: string;
  type: IssueType;
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    [key: string]: any;
  };
}): Promise<boolean> => {
  const newIssue: SubscriptionIssue = {
    id: `issue-${Date.now()}`,
    subscriptionId: issueData.subscriptionId,
    userId: issueData.userId,
    customerName: issueData.customerName,
    serviceName: issueData.serviceName,
    type: issueData.type,
    status: "pending" as IssueStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    credentials: issueData.credentials
  };
  
  subscriptionIssues.unshift(newIssue);
  
  const newNotification: AdminNotification = {
    id: `n${adminNotifications.length + 1}`,
    type: issueData.type,
    customerName: issueData.customerName,
    serviceName: issueData.serviceName,
    createdAt: new Date().toISOString(),
    read: false,
    subscriptionId: issueData.subscriptionId
  };
  
  adminNotifications.unshift(newNotification);
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000);
  });
};

export const getSubscriptionIssues = (): SubscriptionIssue[] => {
  return subscriptionIssues;
};

export const resolveSubscriptionIssue = (
  issueId: string, 
  resolvedBy: string, 
  notes?: string
): Promise<boolean> => {
  const issue = subscriptionIssues.find(i => i.id === issueId);
  if (issue) {
    issue.status = "resolved";
    issue.resolvedAt = new Date().toISOString();
    issue.resolvedBy = resolvedBy;
    if (notes) {
      issue.notes = notes;
    }
  }
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000);
  });
};

export const sendCustomerNotification = (notificationData: {
  userId: string;
  type: "profile_fixed" | "payment_resolved" | "password_reset" | "order_completed";
  message: string;
  subscriptionId?: string;
  serviceName?: string;
}): Promise<boolean> => {
  const newNotification: CustomerNotification = {
    id: `cn-${Date.now()}`,
    userId: notificationData.userId,
    type: notificationData.type,
    message: notificationData.message,
    createdAt: new Date().toISOString(),
    read: false,
    subscriptionId: notificationData.subscriptionId,
    serviceName: notificationData.serviceName
  };
  
  customerNotifications.unshift(newNotification);
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 500);
  });
};

export const getCustomerNotifications = (userId: string): CustomerNotification[] => {
  return customerNotifications.filter(notification => notification.userId === userId);
};

export const markCustomerNotificationAsRead = (notificationId: string): void => {
  const notification = customerNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
};

export const markAllCustomerNotificationsAsRead = (userId: string): void => {
  customerNotifications.forEach(notification => {
    if (notification.userId === userId) {
      notification.read = true;
    }
  });
};

export const fixSubscriptionProfile = (subscriptionId: string, userId: string, customerName: string, serviceName: string): Promise<boolean> => {
  const subscription = getSubscriptionById(subscriptionId);
  return createSubscriptionIssue({
    subscriptionId,
    userId,
    customerName,
    serviceName,
    type: "profile_fix" as IssueType,
    credentials: subscription?.credentials
  });
};

export const reportPaymentIssue = (subscriptionId: string, userId: string, customerName: string, serviceName: string): Promise<boolean> => {
  const subscription = getSubscriptionById(subscriptionId);
  return createSubscriptionIssue({
    subscriptionId,
    userId,
    customerName,
    serviceName,
    type: "payment_issue" as IssueType,
    credentials: subscription?.credentials
  });
};

export const reportPasswordIssue = (subscriptionId: string, userId: string, customerName: string, serviceName: string): Promise<boolean> => {
  const subscription = getSubscriptionById(subscriptionId);
  return createSubscriptionIssue({
    subscriptionId,
    userId,
    customerName,
    serviceName,
    type: "password_reset" as IssueType,
    credentials: subscription?.credentials
  });
};

export const getAdminNotifications = (): AdminNotification[] => {
  return adminNotifications;
};

export const markNotificationAsRead = (notificationId: string): void => {
  const notification = adminNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
};

export const markAllNotificationsAsRead = (): void => {
  adminNotifications.forEach(notification => {
    notification.read = true;
  });
};

export const serviceCategories: ServiceCategory[] = [
  { id: "streaming", name: "Streaming Services", description: "Video and music streaming subscriptions", order: 1, icon: "home" },
  { id: "gaming", name: "Gaming Credits", description: "In-game currency and subscriptions", order: 2, icon: "gamepad" },
  { id: "social", name: "Social Media", description: "Social media boosting and services", order: 3, icon: "users" },
  { id: "recharge", name: "Recharge Services", description: "Mobile and utility recharge options", order: 4, icon: "phone" },
  { id: "giftcard", name: "Gift Cards", description: "Digital gift cards for various platforms", order: 5, icon: "gift" },
  { id: "vpn", name: "VPN Services", description: "Virtual Private Network subscriptions", order: 6, icon: "shield" },
  { id: "other", name: "Other Services", description: "Miscellaneous digital services", order: 7, icon: "box" }
];

export const mockServices = [
  {
    id: "s1",
    name: "Netflix Premium",
    description: "Stream unlimited movies and TV shows in 4K.",
    price: 15.99,
    wholesalePrice: 12.99,
    type: "subscription" as ServiceType,
    image: "https://example.com/netflix.jpg",
    categoryId: "streaming",
    category: "Streaming Services",
    featured: true,
    deliveryTime: "Instant",
    availableMonths: [1, 3, 6, 12]
  },
  {
    id: "s2",
    name: "Spotify Premium",
    description: "Ad-free music streaming with offline playback.",
    price: 9.99,
    wholesalePrice: 7.99,
    type: "subscription" as ServiceType,
    image: "https://example.com/spotify.jpg",
    categoryId: "streaming",
    category: "Streaming Services",
    featured: true,
    deliveryTime: "Instant",
    availableMonths: [1, 3, 6, 12]
  },
  {
    id: "s3",
    name: "Xbox Game Pass",
    description: "Access to a library of games on Xbox and PC.",
    price: 9.99,
    wholesalePrice: 7.99,
    type: "subscription" as ServiceType,
    image: "https://example.com/xbox.jpg",
    categoryId: "gaming",
    category: "Gaming Credits",
    featured: true,
    deliveryTime: "Instant",
    availableMonths: [1, 3, 6, 12]
  },
  {
    id: "s4",
    name: "PlayStation Plus",
    description: "Online multiplayer access and free monthly games.",
    price: 9.99,
    wholesalePrice: 7.99,
    type: "subscription" as ServiceType,
    image: "https://example.com/playstation.jpg",
    categoryId: "gaming",
    category: "Gaming Credits",
    featured: true,
    deliveryTime: "Instant",
    availableMonths: [1, 3, 6, 12]
  },
  {
    id: "s5",
    name: "Facebook Ads Credit",
    description: "Credit for running ads on Facebook and Instagram.",
    price: 25.00,
    wholesalePrice: 20.00,
    type: "recharge" as ServiceType,
    image: "https://example.com/facebook.jpg",
    categoryId: "social",
    category: "Social Media",
    featured: true,
    deliveryTime: "Instant"
  },
  {
    id: "s6",
    name: "Instagram Followers",
    description: "Increase your follower count on Instagram.",
    price: 10.00,
    wholesalePrice: 8.00,
    type: "service" as ServiceType,
    image: "https://example.com/instagram.jpg",
    categoryId: "social",
    category: "Social Media",
    featured: true,
    deliveryTime: "24 hours"
  },
  {
    id: "s7",
    name: "Amazon Gift Card",
    description: "Digital gift card for shopping on Amazon.",
    price: 50.00,
    wholesalePrice: 45.00,
    type: "giftcard" as ServiceType,
    image: "https://example.com/amazon.jpg",
    categoryId: "giftcard",
    category: "Gift Cards",
    featured: true,
    deliveryTime: "Instant"
  },
  {
    id: "s8",
    name: "Steam Gift Card",
    description: "Digital gift card for purchasing games on Steam.",
    price: 20.00,
    wholesalePrice: 18.00,
    type: "giftcard" as ServiceType,
    image: "https://example.com/steam.jpg",
    categoryId: "giftcard",
    category: "Gift Cards",
    featured: true,
    deliveryTime: "Instant"
  },
  {
    id: "s9",
    name: "NordVPN",
    description: "Secure and private internet access with NordVPN.",
    price: 11.99,
    wholesalePrice: 9.99,
    type: "subscription" as ServiceType,
    image: "https://example.com/nordvpn.jpg",
    categoryId: "vpn",
    category: "VPN Services",
    featured: true,
    deliveryTime: "Instant",
    availableMonths: [1, 3, 6, 12]
  },
  {
    id: "s10",
    name: "ExpressVPN",
    description: "High-speed VPN service for secure browsing.",
    price: 12.95,
    wholesalePrice: 10.95,
    type: "subscription" as ServiceType,
    image: "https://example.com/expressvpn.jpg",
    categoryId: "vpn",
    category: "VPN Services",
    featured: true,
    deliveryTime: "Instant",
    availableMonths: [1, 3, 6, 12]
  },
  {
    id: "s11",
    name: "Hulu",
    description: "Stream TV shows, movies, and original content.",
    price: 7.99,
    wholesalePrice: 6.99,
    type: "subscription" as ServiceType,
    image: "https://example.com/hulu.jpg",
    categoryId: "streaming",
    category: "Streaming Services",
    featured: false,
    deliveryTime: "Instant",
    availableMonths: [1, 3, 6, 12]
  },
  {
    id: "s12",
    name: "Disney+",
    description: "Stream movies and TV shows from Disney, Pixar, Marvel, Star Wars, and National Geographic.",
    price: 7.99,
    wholesalePrice: 6.99,
    type: "subscription" as ServiceType,
    image: "https://example.com/disneyplus.jpg",
    categoryId: "streaming",
    category: "Streaming Services",
    featured: false,
    deliveryTime: "Instant",
    availableMonths: [1, 3, 6, 12]
  },
  {
    id: "s13",
    name: "Call of Duty Points",
    description: "In-game currency for Call of Duty.",
    price: 9.99,
    wholesalePrice: 7.99,
    type: "recharge" as ServiceType,
    image: "https://example.com/codpoints.jpg",
    categoryId: "gaming",
    category: "Gaming Credits",
    featured: false,
    deliveryTime: "Instant"
  },
  {
    id: "s14",
    name: "Robux",
    description: "In-game currency for Roblox.",
    price: 10.00,
    wholesalePrice: 8.00,
    type: "recharge" as ServiceType,
    image: "https://example.com/robux.jpg",
    categoryId: "gaming",
    category: "Gaming Credits",
    featured: false,
    deliveryTime: "Instant"
  },
  {
    id: "s15",
    name: "YouTube Premium",
    description: "Ad-free access to YouTube videos and music.",
    price: 11.99,
    wholesalePrice: 9.99,
    type: "subscription" as ServiceType,
    image: "https://example.com/youtubepremium.jpg",
    categoryId: "streaming",
    category: "Streaming Services",
    featured: false,
    deliveryTime: "Instant",
    availableMonths: [1, 3, 6, 12]
  },
  {
    id: "s16",
    name: "Twitch Bits",
    description: "Support your favorite streamers with Twitch Bits.",
    price: 5.00,
    wholesalePrice: 4.00,
    type: "recharge" as ServiceType,
    image: "https://example.com/twitchbits.jpg",
    categoryId: "social",
    category: "Social Media",
    featured: false,
    deliveryTime: "Instant"
  },
  {
    id: "s17",
    name: "Uber Gift Card",
    description: "Digital gift card for Uber rides and Uber Eats.",
    price: 25.00,
    wholesalePrice: 22.00,
    type: "giftcard" as ServiceType,
    image: "https://example.com/ubergiftcard.jpg",
    categoryId: "giftcard",
    category: "Gift Cards",
    featured: false,
    deliveryTime: "Instant"
  },
  {
    id: "s18",
    name: "Lyft Gift Card",
    description: "Digital gift card for Lyft rides.",
    price: 20.00,
    wholesalePrice: 18.00,
    type: "giftcard" as ServiceType,
    image: "https://example.com/lyftgiftcard.jpg",
    categoryId: "giftcard",
    category: "Gift Cards",
    featured: false,
    deliveryTime: "Instant"
  },
  {
    id: "s19",
    name: "Surfshark VPN",
    description: "Secure your online activity with Surfshark VPN.",
    price: 2.49,
    wholesalePrice: 1.99,
    type: "subscription" as ServiceType,
    image: "https://example.com/surfsharkvpn.jpg",
    categoryId: "vpn",
    category: "VPN Services",
    featured: false,
    deliveryTime: "Instant",
    availableMonths: [1, 3, 6, 12]
  },
  {
    id: "s20",
    name: "CyberGhost VPN",
    description: "Protect your privacy with CyberGhost VPN.",
    price: 2.29,
    wholesalePrice: 1.79,
    type: "subscription" as ServiceType,
    image: "https://example.com/cyberghostvpn.jpg",
    categoryId: "vpn",
    category: "VPN Services",
    featured: false,
    deliveryTime: "Instant",
    availableMonths: [1, 3, 6, 12]
  }
];

export const mockCustomers = [
  {
    id: "cust-1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "+15551234567"
  },
  {
    id: "cust-2",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    phone: "+15559876543"
  },
  {
    id: "cust-3",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    phone: "+15554567890"
  }
];

export const mockSupportTickets = [
  {
    id: "ticket-1",
    userId: "user-1",
    subject: "Login Issue",
    description: "I can't log in to my account.",
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "ticket-2",
    userId: "user-2",
    subject: "Payment Failed",
    description: "My payment failed during checkout.",
    status: "in-progress",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "ticket-3",
    userId: "user-3",
    subject: "Subscription Issue",
    description: "My subscription is not active.",
    status: "resolved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockTicketResponses = [
  {
    id: "response-1",
    ticketId: "ticket-1",
    userId: "admin-1",
    message: "We are looking into your login issue.",
    createdAt: new Date().toISOString(),
    isStaff: true,
    sentBy: "admin"
  },
  {
    id: "response-2",
    ticketId: "ticket-2",
    userId: "admin-2",
    message: "Please check your payment details and try again.",
    createdAt: new Date().toISOString(),
    isStaff: true,
    sentBy: "admin"
  },
  {
    id: "response-3",
    ticketId: "ticket-3",
    userId: "admin-3",
    message: "Your subscription is now active.",
    createdAt: new Date().toISOString(),
    isStaff: true,
    sentBy: "admin"
  }
];

export const mockSimpleCustomers = [
  {
    id: "simple-cust-1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "+15551234567"
  },
  {
    id: "simple-cust-2",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    phone: "+15559876543"
  }
];

export const mockAdminNotifications: AdminNotification[] = [
  {
    id: "admin-notif-1",
    type: "profile_fix",
    customerName: "Alice Johnson",
    serviceName: "Netflix Premium",
    createdAt: new Date().toISOString(),
    read: false,
    subscriptionId: "sub-1"
  },
  {
    id: "admin-notif-2",
    type: "payment_issue",
    customerName: "Bob Smith",
    serviceName: "Spotify Premium",
    createdAt: new Date().toISOString(),
    read: false,
    subscriptionId: "sub-2"
  },
  {
    id: "admin-notif-3",
    type: "password_reset",
    customerName: "Charlie Brown",
    serviceName: "Xbox Game Pass",
    createdAt: new Date().toISOString(),
    read: false,
    subscriptionId: "sub-3"
  },
  {
    id: "admin-notif-4",
    type: "new_order",
    customerName: "David Lee",
    serviceName: "PlayStation Plus",
    createdAt: new Date().toISOString(),
    read: false,
    subscriptionId: "sub-4"
  },
  {
    id: "admin-notif-5",
    type: "payment_request",
    customerName: "Eve White",
    serviceName: "Facebook Ads Credit",
    amount: 25.00,
    paymentMethod: "Credit Card",
    createdAt: new Date().toISOString(),
    read: false,
    subscriptionId: "sub-5"
  },
  {
    id: "admin-notif-6",
    type: "profile_fix",
    customerName: "Frank Green",
    serviceName: "Instagram Followers",
    createdAt: new Date().toISOString(),
    read: false,
    subscriptionId: "sub-6"
  }
];

export const mockCustomerNotifications: CustomerNotification[] = [
  {
    id: "cust-notif-1",
    userId: "user-1",
    type: "profile_fixed",
    message: "Your profile has been fixed.",
    createdAt: new Date().toISOString(),
    read: false
  },
  {
    id: "cust-notif-2",
    userId: "user-2",
    type: "payment_resolved",
    message: "Your payment issue has been resolved.",
    createdAt: new Date().toISOString(),
    read: false
  },
  {
    id: "cust-notif-3",
    userId: "user-3",
    type: "password_reset",
    message: "Your password has been reset.",
    createdAt: new Date().toISOString(),
    read: false
  }
];
