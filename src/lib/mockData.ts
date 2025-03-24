
import { Service, User, ServiceCategory, Subscription, Order, SupportTicket, TicketResponse, SimpleCustomer, AdminNotification } from './types';

// Mock users
export const users: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    balance: 245.50,
    createdAt: '2023-01-15T08:30:00Z',
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'customer',
    balance: 120.75,
    createdAt: '2023-02-20T10:15:00Z',
  },
  {
    id: 'user-3',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    balance: 0,
    createdAt: '2022-12-01T09:00:00Z',
  },
  {
    id: 'user-4',
    name: 'Wholesale Client',
    email: 'wholesale@example.com',
    role: 'wholesaler',
    balance: 5000,
    createdAt: '2023-03-10T14:45:00Z',
  },
];

// Mock categories
export const categories: ServiceCategory[] = [
  {
    id: 'streaming',
    name: 'Streaming Services',
    description: 'Enjoy your favorite movies and TV shows.',
    icon: 'tv',
  },
  {
    id: 'gaming',
    name: 'Gaming Credits',
    description: 'Top up your gaming accounts.',
    icon: 'gamepad',
  },
  {
    id: 'social',
    name: 'Social Media',
    description: 'Boost your social media presence.',
    icon: 'users',
  },
  {
    id: 'recharge',
    name: 'Recharge Services',
    description: 'Recharge your mobile and other services.',
    icon: 'phone',
  },
  {
    id: 'giftcard',
    name: 'Gift Cards',
    description: 'Send gift cards to your loved ones.',
    icon: 'gift',
  },
  {
    id: 'vpn',
    name: 'VPN Services',
    description: 'Secure your internet connection.',
    icon: 'lock',
  },
];

// Mock services
export const services: Service[] = [
  // Streaming services
  {
    id: 'service-1',
    name: 'Netflix Premium',
    description: 'Access to Netflix Premium for high-quality streaming on multiple devices.',
    price: 15.99,
    wholesalePrice: 12.99,
    categoryId: 'streaming',
    type: 'subscription',
    image: '/placeholder.svg',
    featured: true,
    deliveryTime: '1-2 hours',
    status: 'active',
    createdAt: '2023-01-01T12:00:00Z',
  },
  {
    id: 'service-2',
    name: 'Disney Plus',
    description: 'Stream Disney, Marvel, Star Wars, and more on Disney Plus.',
    price: 9.99,
    wholesalePrice: 7.99,
    categoryId: 'streaming',
    type: 'subscription',
    image: '/placeholder.svg',
    featured: true,
    deliveryTime: '1-2 hours',
    status: 'active',
    createdAt: '2023-01-02T14:30:00Z',
  },
  {
    id: 'service-3',
    name: 'Amazon Prime Video',
    description: 'Stream thousands of movies and TV shows with Amazon Prime Video.',
    price: 12.99,
    wholesalePrice: 10.49,
    categoryId: 'streaming',
    type: 'subscription',
    image: '/placeholder.svg',
    featured: false,
    deliveryTime: '1-2 hours',
    status: 'active',
    createdAt: '2023-01-03T09:45:00Z',
  },
  {
    id: 'service-4',
    name: 'Hulu Premium',
    description: 'Ad-free streaming on Hulu with access to exclusive content.',
    price: 11.99,
    wholesalePrice: 9.49,
    categoryId: 'streaming',
    type: 'subscription',
    image: '/placeholder.svg',
    featured: false,
    deliveryTime: '1-2 hours',
    status: 'active',
    createdAt: '2023-01-04T16:20:00Z',
  },
  
  // Gaming services
  {
    id: 'service-5',
    name: 'Xbox Game Pass',
    description: 'Access hundreds of games with Xbox Game Pass subscription.',
    price: 14.99,
    wholesalePrice: 11.99,
    categoryId: 'gaming',
    type: 'subscription',
    image: '/placeholder.svg',
    featured: true,
    deliveryTime: '1-2 hours',
    status: 'active',
    createdAt: '2023-01-05T11:10:00Z',
  },
  {
    id: 'service-6',
    name: 'PlayStation Plus',
    description: 'Get free games monthly and play online with PlayStation Plus.',
    price: 12.99,
    wholesalePrice: 10.49,
    categoryId: 'gaming',
    type: 'subscription',
    image: '/placeholder.svg',
    featured: false,
    deliveryTime: '1-2 hours',
    status: 'active',
    createdAt: '2023-01-06T13:25:00Z',
  },
  {
    id: 'service-7',
    name: 'Steam Wallet $50',
    description: 'Add $50 to your Steam Wallet for game purchases.',
    price: 52.99,
    wholesalePrice: 49.99,
    categoryId: 'gaming',
    type: 'one-time',
    image: '/placeholder.svg',
    featured: false,
    deliveryTime: 'Instant',
    status: 'active',
    createdAt: '2023-01-07T08:05:00Z',
  },
  {
    id: 'service-8',
    name: 'Roblox Gift Card $25',
    description: 'Get $25 worth of Robux for Roblox games.',
    price: 27.99,
    wholesalePrice: 24.99,
    categoryId: 'gaming',
    type: 'one-time',
    image: '/placeholder.svg',
    featured: false,
    deliveryTime: 'Instant',
    status: 'active',
    createdAt: '2023-01-08T10:50:00Z',
  },
  
  // Gift cards
  {
    id: 'service-9',
    name: 'Amazon Gift Card $50',
    description: 'Send a $50 Amazon gift card to anyone via email.',
    price: 52.99,
    wholesalePrice: 50.49,
    categoryId: 'giftcard',
    type: 'one-time',
    image: '/placeholder.svg',
    featured: true,
    deliveryTime: 'Instant',
    status: 'active',
    createdAt: '2023-01-09T17:30:00Z',
  },
  {
    id: 'service-10',
    name: 'Apple App Store $100',
    description: 'Get a $100 App Store & iTunes gift card for apps, games, music, and more.',
    price: 103.99,
    wholesalePrice: 99.99,
    categoryId: 'giftcard',
    type: 'one-time',
    image: '/placeholder.svg',
    featured: false,
    deliveryTime: 'Instant',
    status: 'active',
    createdAt: '2023-01-10T14:15:00Z',
  },
  {
    id: 'service-11',
    name: 'Google Play $25',
    description: 'Get a $25 Google Play gift card for apps, games, and digital content.',
    price: 26.99,
    wholesalePrice: 25.49,
    categoryId: 'giftcard',
    type: 'one-time',
    image: '/placeholder.svg',
    featured: false,
    deliveryTime: 'Instant',
    status: 'active',
    createdAt: '2023-01-11T09:20:00Z',
  },
  
  // Recharge services
  {
    id: 'service-12',
    name: 'Mobile Recharge $20',
    description: 'Recharge any mobile carrier with $20 credit.',
    price: 21.99,
    wholesalePrice: 20.49,
    categoryId: 'recharge',
    type: 'one-time',
    image: '/placeholder.svg',
    featured: true,
    deliveryTime: 'Instant',
    status: 'active',
    createdAt: '2023-01-12T16:40:00Z',
  },
  {
    id: 'service-13',
    name: 'International Calling Card $30',
    description: 'Make international calls with $30 credit.',
    price: 31.99,
    wholesalePrice: 29.99,
    categoryId: 'recharge',
    type: 'one-time',
    image: '/placeholder.svg',
    featured: false,
    deliveryTime: 'Instant',
    status: 'active',
    createdAt: '2023-01-13T15:55:00Z',
  },
  {
    id: 'service-14',
    name: 'Internet Data Pack 10GB',
    description: 'Add 10GB of data to your mobile plan.',
    price: 24.99,
    wholesalePrice: 22.49,
    categoryId: 'recharge',
    type: 'one-time',
    image: '/placeholder.svg',
    featured: false,
    deliveryTime: 'Instant',
    status: 'active',
    createdAt: '2023-01-14T11:35:00Z',
  },
  
  // Social media services
  {
    id: 'service-15',
    name: 'Instagram Followers 1000+',
    description: 'Get 1000+ real Instagram followers for your account.',
    price: 19.99,
    wholesalePrice: 15.99,
    categoryId: 'social',
    type: 'one-time',
    image: '/placeholder.svg',
    featured: true,
    deliveryTime: '1-3 days',
    status: 'active',
    createdAt: '2023-01-15T10:25:00Z',
  },
  {
    id: 'service-16',
    name: 'YouTube Views 5000+',
    description: 'Boost your YouTube video with 5000+ views.',
    price: 29.99,
    wholesalePrice: 24.99,
    categoryId: 'social',
    type: 'one-time',
    image: '/placeholder.svg',
    featured: false,
    deliveryTime: '2-4 days',
    status: 'active',
    createdAt: '2023-01-16T13:40:00Z',
  },
  {
    id: 'service-17',
    name: 'TikTok Likes 2000+',
    description: 'Get 2000+ likes on your TikTok videos.',
    price: 14.99,
    wholesalePrice: 11.99,
    categoryId: 'social',
    type: 'one-time',
    image: '/placeholder.svg',
    featured: false,
    deliveryTime: '1-2 days',
    status: 'active',
    createdAt: '2023-01-17T09:15:00Z',
  },
  
  // VPN services
  {
    id: 'service-18',
    name: 'NordVPN Premium',
    description: 'Secure your internet with NordVPN Premium subscription.',
    price: 11.99,
    wholesalePrice: 9.49,
    categoryId: 'vpn',
    type: 'subscription',
    image: '/placeholder.svg',
    featured: true,
    deliveryTime: 'Instant',
    status: 'active',
    createdAt: '2023-01-18T14:20:00Z',
  },
  {
    id: 'service-19',
    name: 'ExpressVPN',
    description: 'High-speed, ultra-secure, and easy-to-use VPN service.',
    price: 12.99,
    wholesalePrice: 10.49,
    categoryId: 'vpn',
    type: 'subscription',
    image: '/placeholder.svg',
    featured: false,
    deliveryTime: 'Instant',
    status: 'active',
    createdAt: '2023-01-19T16:50:00Z',
  },
  {
    id: 'service-20',
    name: 'CyberGhost VPN',
    description: 'Protect your privacy with CyberGhost VPN.',
    price: 9.99,
    wholesalePrice: 7.99,
    categoryId: 'vpn',
    type: 'subscription',
    image: '/placeholder.svg',
    featured: false,
    deliveryTime: 'Instant',
    status: 'active',
    createdAt: '2023-01-20T12:35:00Z',
  },
];

// Utility functions for getting services and categories
export const getServiceById = (id: string): Service | undefined => {
  return services.find(service => service.id === id);
};

export const getCategoryById = (id: string): ServiceCategory | undefined => {
  return categories.find(category => category.id === id);
};

// Mock support tickets
export const supportTickets: SupportTicket[] = [
  {
    id: 'ticket-1',
    userId: 'user-1',
    subject: 'Netflix account not working',
    description: 'I purchased a Netflix Premium account yesterday but I cannot log in.',
    status: 'open',
    priority: 'high',
    createdAt: '2023-04-10T09:30:00Z',
    updatedAt: '2023-04-10T09:30:00Z',
    serviceId: 'service-1',
  },
  {
    id: 'ticket-2',
    userId: 'user-2',
    subject: 'Wrong gift card code',
    description: 'The Amazon gift card code I received seems to be invalid or already used.',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2023-04-11T14:20:00Z',
    updatedAt: '2023-04-11T15:45:00Z',
    serviceId: 'service-9',
  },
  {
    id: 'ticket-3',
    userId: 'user-1',
    subject: 'Billing question',
    description: 'I need to understand the billing cycle for my Disney Plus subscription.',
    status: 'resolved',
    priority: 'low',
    createdAt: '2023-04-05T11:10:00Z',
    updatedAt: '2023-04-06T13:25:00Z',
    serviceId: 'service-2',
  },
];

// Mock ticket responses
export const ticketResponses: TicketResponse[] = [
  {
    id: 'response-1',
    ticketId: 'ticket-1',
    message: 'I apologize for the inconvenience. Please provide the email address used for the Netflix account so I can check the status.',
    createdAt: '2023-04-10T10:15:00Z',
    sentBy: 'admin',
  },
  {
    id: 'response-2',
    ticketId: 'ticket-1',
    message: 'My email is john@example.com. The account credentials I received were username: netflix_user101 and password: pass123',
    createdAt: '2023-04-10T10:30:00Z',
    sentBy: 'user',
  },
  {
    id: 'response-3',
    ticketId: 'ticket-2',
    message: 'I've checked the gift card code and it appears it hasn't been activated properly. I'll issue a new one for you right away.',
    createdAt: '2023-04-11T15:45:00Z',
    sentBy: 'admin',
  },
];

// Mock simple customers (for wholesale section)
export const simpleCustomers: SimpleCustomer[] = [
  {
    id: 'customer-1',
    name: 'Michael Johnson',
    email: 'michael@example.com',
    phone: '+1234567890',
    totalSpent: 450.75,
    activeSubscriptions: 2,
    lastPurchase: '2023-04-12T08:45:00Z',
  },
  {
    id: 'customer-2',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    phone: '+1987654321',
    totalSpent: 320.50,
    activeSubscriptions: 1,
    lastPurchase: '2023-04-08T14:30:00Z',
  },
  {
    id: 'customer-3',
    name: 'Robert Brown',
    email: 'robert@example.com',
    phone: '+1567890123',
    totalSpent: 780.25,
    activeSubscriptions: 3,
    lastPurchase: '2023-04-15T11:20:00Z',
  },
];

// Mock admin notifications
export const adminNotifications: AdminNotification[] = [
  {
    id: 'notification-1',
    title: 'New Support Ticket',
    message: 'A new high-priority support ticket has been created by John Doe.',
    type: 'ticket',
    isRead: false,
    createdAt: '2023-04-16T09:30:00Z',
    linkTo: '/admin/support/ticket-1',
    subscriptionId: 'sub-123',
  },
  {
    id: 'notification-2',
    title: 'Low Stock Alert',
    message: 'Netflix Premium accounts are running low in stock (5 remaining).',
    type: 'stock',
    isRead: true,
    createdAt: '2023-04-15T14:45:00Z',
    linkTo: '/admin/inventory/service-1',
    subscriptionId: 'sub-456',
  },
  {
    id: 'notification-3',
    title: 'Payment Received',
    message: 'Payment of $129.99 received from Jane Smith for Disney Plus annual subscription.',
    type: 'payment',
    isRead: false,
    createdAt: '2023-04-16T11:20:00Z',
    linkTo: '/admin/payments/payment-789',
    subscriptionId: 'sub-789',
  },
  {
    id: 'notification-4',
    title: 'Subscription Expired',
    message: 'HBO Max subscription for customer Michael Johnson has expired.',
    type: 'subscription',
    isRead: false,
    createdAt: '2023-04-15T23:59:00Z',
    linkTo: '/admin/subscriptions/sub-456',
    subscriptionId: 'sub-456',
  },
  {
    id: 'notification-5',
    title: 'New Wholesale Order',
    message: 'Wholesale Client has placed a bulk order worth $2,499.50.',
    type: 'order',
    isRead: true,
    createdAt: '2023-04-14T16:30:00Z',
    linkTo: '/admin/orders/order-345',
    subscriptionId: 'sub-345',
  },
  {
    id: 'notification-6',
    title: 'System Update Required',
    message: 'A new system update is available for the admin dashboard.',
    type: 'system',
    isRead: false,
    createdAt: '2023-04-13T08:15:00Z',
    linkTo: '/admin/settings/updates',
    subscriptionId: 'sub-567',
  },
  {
    id: 'notification-7',
    title: 'Refund Processed',
    message: 'Refund of $24.99 has been processed for customer Robert Brown.',
    type: 'payment',
    isRead: true,
    createdAt: '2023-04-12T13:40:00Z',
    linkTo: '/admin/payments/refund-123',
    subscriptionId: 'sub-678',
  },
];
