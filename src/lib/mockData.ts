
import { Service, ServiceCategory, User, Subscription, Order, SupportTicket } from "./types";

// Service Categories
export const serviceCategories: ServiceCategory[] = [
  {
    id: "cat1",
    name: "Streaming Services",
    description: "Access to premium streaming platforms like Netflix, Shahid, and more.",
    icon: "play-circle"
  },
  {
    id: "cat2",
    name: "Game Recharges",
    description: "Top up your favorite games like PUBG, Fortnite, and more.",
    icon: "gamepad-2"
  },
  {
    id: "cat3",
    name: "Social Media Boosts",
    description: "Increase your social media presence with followers, likes, and views.",
    icon: "thumbs-up"
  },
  {
    id: "cat4",
    name: "Custom Requests",
    description: "Need something specific? We can help with custom online purchases.",
    icon: "shopping-cart"
  }
];

// Services
export const services: Service[] = [
  {
    id: "svc1",
    name: "Netflix Premium",
    description: "Access to all Netflix content in 4K with up to 4 screens.",
    price: 15.99,
    wholesalePrice: 12.99,
    categoryId: "cat1",
    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=1000&auto=format&fit=crop",
    deliveryTime: "Instant",
    featured: true
  },
  {
    id: "svc2",
    name: "Shahid VIP",
    description: "Access to exclusive Arabic content with no ads.",
    price: 11.99,
    wholesalePrice: 9.99,
    categoryId: "cat1",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
    deliveryTime: "Instant",
    featured: true
  },
  {
    id: "svc3",
    name: "PUBG Mobile UC",
    description: "1000 Unknown Cash for PUBG Mobile.",
    price: 19.99,
    wholesalePrice: 17.99,
    categoryId: "cat2",
    image: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?q=80&w=1000&auto=format&fit=crop",
    deliveryTime: "5-10 minutes",
    featured: false
  },
  {
    id: "svc4",
    name: "Fortnite V-Bucks",
    description: "2800 V-Bucks for Fortnite.",
    price: 24.99,
    wholesalePrice: 21.99,
    categoryId: "cat2",
    image: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?q=80&w=1000&auto=format&fit=crop",
    deliveryTime: "5-10 minutes",
    featured: false
  },
  {
    id: "svc5",
    name: "Instagram Followers",
    description: "1000 high-quality Instagram followers.",
    price: 29.99,
    wholesalePrice: 24.99,
    categoryId: "cat3",
    image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?q=80&w=1000&auto=format&fit=crop",
    deliveryTime: "1-2 days",
    featured: true
  },
  {
    id: "svc6",
    name: "TikTok Views",
    description: "10,000 TikTok views for your videos.",
    price: 14.99,
    wholesalePrice: 11.99,
    categoryId: "cat3",
    image: "https://images.unsplash.com/photo-1595000603696-b323aff36d6c?q=80&w=1000&auto=format&fit=crop",
    deliveryTime: "1-2 days",
    featured: false
  }
];

// Mock Users
export const users: User[] = [
  {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    role: "customer",
    balance: 50.00,
    createdAt: "2023-01-15T12:00:00Z"
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+9876543210",
    role: "wholesale",
    balance: 500.00,
    createdAt: "2023-02-20T15:30:00Z"
  },
  {
    id: "user3",
    name: "Admin User",
    email: "admin@servexlb.com",
    phone: "+1122334455",
    role: "admin",
    balance: 0,
    createdAt: "2023-01-01T10:00:00Z"
  }
];

// Subscriptions
export const subscriptions: Subscription[] = [
  {
    id: "sub1",
    userId: "user1",
    serviceId: "svc1",
    startDate: "2023-05-01T00:00:00Z",
    endDate: "2023-06-01T00:00:00Z",
    credentials: {
      email: "premium1@servexlb.com",
      password: "securepass123"
    },
    status: "active"
  },
  {
    id: "sub2",
    userId: "user2",
    serviceId: "svc2",
    startDate: "2023-04-15T00:00:00Z",
    endDate: "2023-05-15T00:00:00Z",
    credentials: {
      email: "premium2@servexlb.com",
      password: "wholesale456"
    },
    status: "active"
  }
];

// Orders
export const orders: Order[] = [
  {
    id: "ord1",
    userId: "user1",
    serviceId: "svc1",
    quantity: 1,
    totalPrice: 15.99,
    status: "completed",
    createdAt: "2023-05-01T10:30:00Z",
    completedAt: "2023-05-01T10:35:00Z"
  },
  {
    id: "ord2",
    userId: "user1",
    serviceId: "svc5",
    quantity: 1,
    totalPrice: 29.99,
    status: "processing",
    createdAt: "2023-05-10T14:20:00Z"
  },
  {
    id: "ord3",
    userId: "user2",
    serviceId: "svc2",
    quantity: 5,
    totalPrice: 49.95,
    status: "completed",
    createdAt: "2023-04-15T09:00:00Z",
    completedAt: "2023-04-15T09:10:00Z"
  }
];

// Support Tickets
export const supportTickets: SupportTicket[] = [
  {
    id: "ticket1",
    userId: "user1",
    subject: "Fix Password",
    description: "The Netflix password is not working anymore.",
    status: "open",
    createdAt: "2023-05-05T08:15:00Z",
    updatedAt: "2023-05-05T08:15:00Z"
  },
  {
    id: "ticket2",
    userId: "user2",
    subject: "Service Not Delivered",
    description: "I purchased Instagram followers but they haven't been delivered yet.",
    status: "in-progress",
    createdAt: "2023-05-09T11:45:00Z",
    updatedAt: "2023-05-10T09:20:00Z"
  }
];

// Auth functions (mock)
export const loginUser = (email: string, password: string): User | null => {
  // In a real app, you would verify against a database
  if (email === "john@example.com" && password === "password") {
    return users[0];
  } else if (email === "jane@example.com" && password === "password") {
    return users[1];
  } else if (email === "admin@servexlb.com" && password === "admin") {
    return users[2];
  }
  return null;
};

export const registerUser = (name: string, email: string, phone: string, password: string): User => {
  // In a real app, you would save to a database
  const newUser: User = {
    id: `user${users.length + 1}`,
    name,
    email,
    phone,
    role: "customer",
    balance: 0,
    createdAt: new Date().toISOString()
  };
  
  // This is just for mocking - in a real app you'd push to a database
  // users.push(newUser);
  
  return newUser;
};

// Helper functions
export const getServicesByCategory = (categoryId: string): Service[] => {
  return services.filter(service => service.categoryId === categoryId);
};

export const getServiceById = (id: string): Service | undefined => {
  return services.find(service => service.id === id);
};

export const getUserSubscriptions = (userId: string): Subscription[] => {
  return subscriptions.filter(sub => sub.userId === userId);
};

export const getUserOrders = (userId: string): Order[] => {
  return orders.filter(order => order.userId === userId);
};

export const getUserTickets = (userId: string): SupportTicket[] => {
  return supportTickets.filter(ticket => ticket.userId === userId);
};

export const getCategoryById = (id: string): ServiceCategory | undefined => {
  return serviceCategories.find(category => category.id === id);
};
