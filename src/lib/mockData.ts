import {
  User,
  ServiceCategory,
  Service,
  Subscription,
  Order,
  SupportTicket,
  TicketResponse,
  SimpleCustomer,
  AdminNotification,
} from "./types";

// Mock data for users
export const users: User[] = [
  {
    id: "user1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "customer",
    balance: 150,
    createdAt: new Date().toISOString(),
  },
  {
    id: "user2",
    name: "Alice Smith",
    email: "alice.smith@example.com",
    role: "wholesale",
    phone: "123-456-7890",
    balance: 500,
    createdAt: new Date().toISOString(),
  },
  {
    id: "user3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "admin",
    balance: 9000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "user4",
    name: "Emily White",
    email: "emily.white@example.com",
    role: "customer",
    balance: 200,
    createdAt: new Date().toISOString(),
  },
  {
    id: "user5",
    name: "David Brown",
    email: "david.brown@example.com",
    role: "wholesale",
    phone: "987-654-3210",
    balance: 750,
    createdAt: new Date().toISOString(),
  },
];

// Mock data for service categories
export const serviceCategories: ServiceCategory[] = [
  {
    id: "category1",
    name: "Web Services",
    description: "Services related to web development and hosting",
    icon: "globe",
  },
  {
    id: "category2",
    name: "Marketing",
    description: "Marketing and advertising services",
    icon: "megaphone",
  },
  {
    id: "category3",
    name: "Design",
    description: "Graphic design and UI/UX services",
    icon: "paint-brush",
  },
];

// Mock data for services - Rename products to services
export const services: Service[] = [
  {
    id: "service1",
    name: "Basic Web Hosting",
    description: "Basic web hosting package with limited resources",
    price: 9.99,
    wholesalePrice: 7.99,
    categoryId: "category1",
    image: "/images/hosting.jpg",
    deliveryTime: "24 hours",
    featured: true,
  },
  {
    id: "service2",
    name: "Social Media Marketing",
    description: "Management of social media accounts",
    price: 49.99,
    wholesalePrice: 39.99,
    categoryId: "category2",
    image: "/images/social-media.jpg",
    deliveryTime: "48 hours",
    featured: true,
  },
  {
    id: "service3",
    name: "Logo Design",
    description: "Custom logo design service",
    price: 79.99,
    wholesalePrice: 63.99,
    categoryId: "category3",
    image: "/images/logo-design.jpg",
    deliveryTime: "72 hours",
    featured: true,
  },
  {
    id: "service4",
    name: "Advanced Web Hosting",
    description: "Advanced web hosting package with more resources",
    price: 19.99,
    wholesalePrice: 15.99,
    categoryId: "category1",
    image: "/images/hosting2.jpg",
    deliveryTime: "24 hours",
    featured: false,
  },
  {
    id: "service5",
    name: "Email Marketing",
    description: "Email marketing campaign management",
    price: 59.99,
    wholesalePrice: 47.99,
    categoryId: "category2",
    image: "/images/email-marketing.jpg",
    deliveryTime: "48 hours",
    featured: false,
  },
  {
    id: "service6",
    name: "UI/UX Design",
    description: "User interface and user experience design",
    price: 99.99,
    wholesalePrice: 79.99,
    categoryId: "category3",
    image: "/images/ui-ux.jpg",
    deliveryTime: "72 hours",
    featured: false,
  },
];

// Mock data for subscriptions
export const subscriptions: Subscription[] = [
  {
    id: "sub1",
    userId: "user1",
    serviceId: "service1",
    startDate: new Date().toISOString(),
    endDate: new Date(
      new Date().setDate(new Date().getDate() + 30)
    ).toISOString(),
    status: "active",
    credentials: {
      email: "john.doe@example.com",
      password: "password123",
    },
  },
  {
    id: "sub2",
    userId: "user2",
    serviceId: "service2",
    startDate: new Date().toISOString(),
    endDate: new Date(
      new Date().setDate(new Date().getDate() + 60)
    ).toISOString(),
    status: "active",
    credentials: {
      email: "alice.smith@example.com",
      password: "password456",
    },
  },
  {
    id: "sub3",
    userId: "user4",
    serviceId: "service3",
    startDate: new Date().toISOString(),
    endDate: new Date(
      new Date().setDate(new Date().getDate() + 90)
    ).toISOString(),
    status: "active",
  },
];

// Mock data for orders
export const orders: Order[] = [
  {
    id: "order1",
    userId: "user1",
    serviceId: "service1",
    quantity: 1,
    totalPrice: 9.99,
    status: "completed",
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: "order2",
    userId: "user2",
    serviceId: "service2",
    quantity: 1,
    totalPrice: 49.99,
    status: "processing",
    createdAt: new Date().toISOString(),
  },
  {
    id: "order3",
    userId: "user4",
    serviceId: "service3",
    quantity: 1,
    totalPrice: 79.99,
    status: "pending",
    createdAt: new Date().toISOString(),
  },
];

// Mock data for support tickets
export const supportTickets: SupportTicket[] = [
  {
    id: "ticket1",
    userId: "user1",
    subject: "Issue with web hosting",
    description: "My website is down",
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ticket2",
    userId: "user2",
    subject: "Social media marketing question",
    description: "How to improve engagement?",
    status: "in-progress",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ticket3",
    userId: "user4",
    subject: "Logo design feedback",
    description: "Need revisions on the logo",
    status: "resolved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock data for ticket responses
export const ticketResponses: TicketResponse[] = [
  {
    id: "response1",
    ticketId: "ticket1",
    userId: "user3",
    message: "We are looking into your hosting issue.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "response2",
    ticketId: "ticket2",
    userId: "user3",
    message: "Here are some tips to improve engagement.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "response3",
    ticketId: "ticket3",
    userId: "user3",
    message: "Please provide specific feedback for revisions.",
    createdAt: new Date().toISOString(),
  },
];

// Mock function to simulate user login
export const loginUser = (email: string, password: string): User | null => {
  const user = users.find((u) => u.email === email);
  if (user) {
    // Basic password check (in a real app, use proper authentication)
    return user;
  }
  return null;
};

// Mock function to get service by ID
export const getServiceById = (id: string): Service | undefined => {
  return services.find((service) => service.id === id);
};

// Mock function to get services by category
export const getServicesByCategory = (categoryId: string): Service[] => {
  return services.filter(service => service.categoryId === categoryId);
};

// Mock function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return users.find((user) => user.id === id);
};

// Mock customers for wholesale
export const simpleCustomers: SimpleCustomer[] = [
  {
    id: "customer1",
    name: "Acme Corp",
    phone: "555-123-4567",
  },
  {
    id: "customer2",
    name: "Beta Industries",
    phone: "555-987-6543",
  },
];

// Mock function to get customer by ID
export const getCustomerById = (id: string): SimpleCustomer | undefined => {
  return simpleCustomers.find((customer) => customer.id === id);
};

// Mock function to get product by ID - Keep this for backwards compatibility
export const getProductById = (id: string): Service | undefined => {
  return services.find((product) => product.id === id);
};

// Mock function to simulate fixing a subscription profile
export const fixSubscriptionProfile = async (
  subscriptionId: string,
  userId: string,
  customerName: string,
  serviceName: string
): Promise<void> => {
  // Simulate an API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Create a new admin notification
  const newNotification: AdminNotification = {
    id: `notification-${Date.now()}`,
    type: "profile_fix",
    subscriptionId: subscriptionId,
    userId: userId,
    customerName: customerName,
    serviceName: serviceName,
    createdAt: new Date().toISOString(),
    read: false,
  };

  adminNotifications.push(newNotification);
  console.log("Profile fix requested", subscriptionId);
};

// Mock function to simulate reporting a payment issue
export const reportPaymentIssue = async (
  subscriptionId: string,
  userId: string,
  customerName: string,
  serviceName: string
): Promise<void> => {
  // Simulate an API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Create a new admin notification
  const newNotification: AdminNotification = {
    id: `notification-${Date.now()}`,
    type: "payment_issue",
    subscriptionId: subscriptionId,
    userId: userId,
    customerName: customerName,
    serviceName: serviceName,
    createdAt: new Date().toISOString(),
    read: false,
  };

  adminNotifications.push(newNotification);
  console.log("Payment issue reported", subscriptionId);
};

// Mock function to simulate reporting a password issue
export const reportPasswordIssue = async (
  subscriptionId: string,
  userId: string,
  customerName: string,
  serviceName: string
): Promise<void> => {
  // Simulate an API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Create a new admin notification
  const newNotification: AdminNotification = {
    id: `notification-${Date.now()}`,
    type: "password_reset",
    subscriptionId: subscriptionId,
    userId: userId,
    customerName: customerName,
    serviceName: serviceName,
    createdAt: new Date().toISOString(),
    read: false,
  };

  adminNotifications.push(newNotification);
  console.log("Password reset requested", subscriptionId);
};

// Mock admin notifications
let adminNotifications: AdminNotification[] = [
  {
    id: "notification1",
    type: "profile_fix",
    subscriptionId: "sub1",
    userId: "user1",
    customerName: "John Doe",
    serviceName: "Basic Web Hosting",
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: "notification2",
    type: "payment_issue",
    orderId: "order2",
    userId: "user2",
    customerName: "Alice Smith",
    serviceName: "Social Media Marketing",
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: "notification3",
    type: "password_reset",
    subscriptionId: "sub2",
    userId: "user2",
    customerName: "Alice Smith",
    serviceName: "Social Media Marketing",
    createdAt: new Date().toISOString(),
    read: true,
  },
  {
    id: "notification4",
    type: "new_order",
    orderId: "order1",
    userId: "user1",
    customerName: "John Doe",
    serviceName: "Basic Web Hosting",
    createdAt: new Date().toISOString(),
    read: false,
  },
];

// Mock function to get admin notifications
export const getAdminNotifications = (): AdminNotification[] => {
  return adminNotifications;
};

// Mock function to mark a notification as read
export const markNotificationAsRead = (id: string): void => {
  const notification = adminNotifications.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
  }
};

// Mock function to mark all notifications as read
export const markAllNotificationsAsRead = (): void => {
  adminNotifications = adminNotifications.map((n) => ({ ...n, read: true }));
};

// Export mock user subscriptions for testing the alert
(window as any).mockUserSubscriptions = [
  {
    id: "sub-expired-1",
    userId: "user1", // Make sure this matches a valid user ID in your login function
    serviceId: "service1",
    startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days ago
    endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    status: "expired",
    credentials: {
      email: "user@streamingservice.com",
      password: "expired123",
    },
  },
];
