
import { products } from '@/lib/data';
import { services } from '@/lib/mockData';

// Create a memoized service lookup map for better performance
export const createServiceMap = () => {
  const serviceMap = new Map();
  
  // Add services to map
  if (services && Array.isArray(services)) {
    services.forEach(service => {
      serviceMap.set(service.id, {
        id: service.id,
        name: service.name,
        type: service.type || 'service',
        price: service.wholesalePrice || service.price
      });
    });
  }
  
  // If map is empty, add fallback items to prevent errors
  if (serviceMap.size === 0) {
    console.warn('No services found in the system');
    // Add a dummy service to prevent UI errors
    serviceMap.set('service-fallback', {
      id: 'service-fallback',
      name: 'Unknown Service',
      type: 'service',
      price: 0
    });
  }
  
  return serviceMap;
};

// Helper function to get a service by ID, with fallback handling
export const getServiceById = (serviceMap, serviceId) => {
  if (!serviceId) return null;
  
  const service = serviceMap.get(serviceId);
  
  if (!service) {
    console.warn(`Service not found for ID: ${serviceId}`);
    return {
      id: serviceId,
      name: 'Unknown Service',
      type: 'service',
      price: 0
    };
  }
  
  return service;
};

// For backward compatibility, aliases for the product-related functions
export const createProductMap = createServiceMap;
export const getProductById = getServiceById;
