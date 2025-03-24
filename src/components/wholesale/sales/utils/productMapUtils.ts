import { Service, Product } from '@/lib/types';
import { loadServices, loadProducts } from '@/lib/productManager';
import { services as mockServices } from '@/lib/mockData';

// Create a memoized service lookup map for better performance
export const createServiceMap = () => {
  const serviceMap = new Map();
  
  // Load services from the product manager
  const services = loadServices();
  
  // If no services from product manager, fall back to mockData
  const servicesToUse = services.length > 0 ? services : mockServices;
  
  // Add services to map
  if (servicesToUse && Array.isArray(servicesToUse)) {
    servicesToUse.forEach(service => {
      // Make sure we have a valid category value
      const category = service.category || service.categoryId || "Other";
      
      serviceMap.set(service.id, {
        id: service.id,
        name: service.name,
        type: service.type || 'service',
        price: service.wholesalePrice || service.price,
        category: category,
        value: service.value,
        apiUrl: service.apiUrl,
        minQuantity: service.minQuantity
      });
    });
  }
  
  // If map is empty, add fallback items to prevent errors
  if (serviceMap.size === 0) {
    console.warn('No services found in the system, using fallback');
    // Add a dummy service to prevent UI errors
    serviceMap.set('service-fallback', {
      id: 'service-fallback',
      name: 'Unknown Service',
      type: 'service',
      price: 0,
      category: 'Uncategorized'
    });
  }
  
  return serviceMap;
};

// Helper function to get a service by ID, with fallback handling
export const getServiceById = (serviceMap: Map<string, any>, serviceId: string) => {
  if (!serviceId) return null;
  
  const service = serviceMap.get(serviceId);
  
  if (!service) {
    console.warn(`Service not found for ID: ${serviceId}`);
    return {
      id: serviceId,
      name: 'Unknown Service',
      type: 'service',
      price: 0,
      category: 'Uncategorized'
    };
  }
  
  return service;
};

// Method to get all available services
export const getAllServices = (): Service[] => {
  const services = loadServices();
  
  // If no services from product manager, fall back to mockData
  const servicesWithCategory = (services.length > 0 ? services : mockServices).map(service => ({
    ...service,
    category: service.category || service.categoryId || "Other"
  }));
  
  return servicesWithCategory;
};

// For backward compatibility, aliases for the product-related functions
export const createProductMap = createServiceMap;
export const getProductById = getServiceById;
export const getAllProducts = getAllServices;
