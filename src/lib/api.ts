
import { toast } from 'sonner';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.example.com';

// Default headers
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Try to get error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    } catch (e) {
      // If parsing error response fails, throw generic error
      throw new Error(`API Error: ${response.status}`);
    }
  }
  
  // Check if response is empty
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  method: string = 'GET',
  data?: any,
  customHeaders: HeadersInit = {}
): Promise<T> => {
  try {
    const headers = { ...defaultHeaders, ...customHeaders };
    const config: RequestInit = { method, headers };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }
    
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.error('API Request Failed', { description: message });
    throw error;
  }
};

// Convenience methods
export const api = {
  get: <T>(endpoint: string, headers?: HeadersInit) => 
    apiRequest<T>(endpoint, 'GET', undefined, headers),
    
  post: <T>(endpoint: string, data: any, headers?: HeadersInit) => 
    apiRequest<T>(endpoint, 'POST', data, headers),
    
  put: <T>(endpoint: string, data: any, headers?: HeadersInit) => 
    apiRequest<T>(endpoint, 'PUT', data, headers),
    
  patch: <T>(endpoint: string, data: any, headers?: HeadersInit) => 
    apiRequest<T>(endpoint, 'PATCH', data, headers),
    
  delete: <T>(endpoint: string, headers?: HeadersInit) => 
    apiRequest<T>(endpoint, 'DELETE', undefined, headers),
};

// Mock API functions for demonstration purposes
export const mockApi = {
  fetchProducts: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const products = localStorage.getItem('products');
    return products ? JSON.parse(products) : [];
  },
  
  fetchServices: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const services = localStorage.getItem('services');
    return services ? JSON.parse(services) : [];
  },
  
  placeOrder: async (orderData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Store the order
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = {
      id: `order-${Date.now()}`,
      ...orderData,
      createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    return newOrder;
  }
};

export default api;
