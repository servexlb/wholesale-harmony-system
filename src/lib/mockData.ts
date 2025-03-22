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
    name: "Streaming Services",
    description: "Premium streaming platforms for movies, TV shows, and music",
    icon: "tv",
  },
  {
    id: "category2",
    name: "Gaming",
    description: "Gaming subscriptions, gift cards, and in-game currencies",
    icon: "gamepad-2",
  },
  {
    id: "category3",
    name: "Gift Cards",
    description: "Digital gift cards for various platforms and services",
    icon: "gift",
  },
  {
    id: "category4",
    name: "VPN & Security",
    description: "Virtual Private Networks and security services",
    icon: "shield",
  },
  {
    id: "category5",
    name: "Productivity",
    description: "Software subscriptions for productivity and creativity",
    icon: "briefcase",
  },
];

// Mock data for services - Rename products to services
export const services: Service[] = [
  {
    id: "service1",
    name: "Netflix Premium",
    description: "Access to all Netflix content in 4K UHD quality with the ability to stream on multiple devices simultaneously.",
    price: 19.99,
    wholesalePrice: 15.99,
    categoryId: "category1",
    image: "/images/netflix.jpg",
    deliveryTime: "Instant",
    featured: true,
  },
  {
    id: "service2",
    name: "Amazon Prime Video",
    description: "Stream thousands of movies and TV shows, including Amazon Originals.",
    price: 14.99,
    wholesalePrice: 11.99,
    categoryId: "category1",
    image: "/images/prime-video.jpg",
    deliveryTime: "Instant",
    featured: true,
  },
  {
    id: "service3",
    name: "Disney+",
    description: "Stream movies, shows, and originals from Disney, Pixar, Marvel, Star Wars, National Geographic, and more.",
    price: 12.99,
    wholesalePrice: 9.99,
    categoryId: "category1",
    image: "/images/disney-plus.jpg",
    deliveryTime: "Instant",
    featured: true,
  },
  {
    id: "service4",
    name: "Spotify Premium",
    description: "Ad-free music streaming with offline listening and high-quality audio.",
    price: 10.99,
    wholesalePrice: 8.99,
    categoryId: "category1",
    image: "/images/spotify.jpg",
    deliveryTime: "Instant",
    featured: false,
  },
  {
    id: "service5",
    name: "YouTube Premium",
    description: "Ad-free videos, background playback, and YouTube Music Premium.",
    price: 11.99,
    wholesalePrice: 9.99,
    categoryId: "category1",
    image: "/images/youtube.jpg",
    deliveryTime: "Instant",
    featured: false,
  },
  {
    id: "service6",
    name: "HBO Max",
    description: "Stream HBO original series, blockbuster movies, and exclusive content.",
    price: 15.99,
    wholesalePrice: 12.99,
    categoryId: "category1",
    image: "/images/hbo-max.jpg",
    deliveryTime: "Instant",
    featured: false,
  },
  {
    id: "service7",
    name: "PlayStation Plus (12 Months)",
    description: "Access to online multiplayer, free monthly games, and exclusive discounts.",
    price: 59.99,
    wholesalePrice: 49.99,
    categoryId: "category2",
    image: "/images/ps-plus.jpg",
    deliveryTime: "Instant",
    featured: true,
  },
  {
    id: "service8",
    name: "Xbox Game Pass Ultimate",
    description: "Access to over 100 high-quality games on Xbox and PC, plus Xbox Live Gold.",
    price: 14.99,
    wholesalePrice: 12.99,
    categoryId: "category2",
    image: "/images/xbox-gamepass.jpg",
    deliveryTime: "Instant",
    featured: true,
  },
  {
    id: "service9",
    name: "Google Play Gift Card",
    description: "Digital gift card for apps, games, movies, and more on Google Play.",
    price: 25.00,
    wholesalePrice: 22.50,
    categoryId: "category3",
    image: "/images/google-play.jpg",
    deliveryTime: "Instant",
    featured: true,
  },
  {
    id: "service10",
    name: "iTunes Gift Card",
    description: "Digital gift card for apps, games, music, movies, and more on Apple App Store.",
    price: 25.00,
    wholesalePrice: 22.50,
    categoryId: "category3",
    image: "/images/itunes.jpg",
    deliveryTime: "Instant",
    featured: false,
  },
  {
    id: "service11",
    name: "Steam Wallet Code",
    description: "Digital gift card for games, software, and hardware on Steam.",
    price: 25.00,
    wholesalePrice: 22.50,
    categoryId: "category3",
    image: "/images/steam.jpg",
    deliveryTime: "Instant",
    featured: false,
  },
  {
    id: "service12",
    name: "NordVPN (2 Years)",
    description: "Secure VPN service with high-speed connections and no logs policy.",
    price: 89.99,
    wholesalePrice: 79.99,
    categoryId: "category4",
    image: "/images/nordvpn.jpg",
    deliveryTime: "Instant",
    featured: true,
  },
  {
    id: "service13",
    name: "ExpressVPN (1 Year)",
    description: "Fast and secure VPN service with servers in 94 countries.",
    price: 99.99,
    wholesalePrice: 89.99,
    categoryId: "category4",
    image: "/images/expressvpn.jpg",
    deliveryTime: "Instant",
    featured: false,
  },
  {
    id: "service14",
    name: "Microsoft 365 (1 Year)",
    description: "Productivity suite with Word, Excel, PowerPoint, and more.",
    price: 69.99,
    wholesalePrice: 59.99,
    categoryId: "category5",
    image: "/images/microsoft-365.jpg",
    deliveryTime: "Instant",
    featured: true,
  },
  {
    id: "service15",
    name: "Adobe Creative Cloud (1 Year)",
    description: "Creative suite with Photoshop, Illustrator, Premiere Pro, and more.",
    price: 239.99,
    wholesalePrice: 219.99,
    categoryId: "category5",
    image: "/images/adobe-cc.jpg",
    deliveryTime: "Instant",
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

