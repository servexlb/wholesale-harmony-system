
// Update the import to use services from our own mock implementation
import { Service } from '@/lib/types';
import { services } from '@/lib/data'; // Use services from data.ts instead of mockData.ts

export const getAllServices = (): Service[] => {
  try {
    return services as Service[];
  } catch (error) {
    console.error('Error getting services:', error);
    return [];
  }
};

// Add missing utility functions
export const createServiceMap = (): Map<string, { id: string, name: string, type?: string, price?: number }> => {
  const map = new Map();
  try {
    const servicesList = getAllServices();
    servicesList.forEach(service => {
      map.set(service.id, {
        id: service.id,
        name: service.name,
        type: service.type,
        price: service.price
      });
    });
  } catch (error) {
    console.error('Error creating service map:', error);
  }
  return map;
};

export const getServiceById = (
  productMap: Map<string, { id: string, name: string, type?: string, price?: number }>,
  serviceId?: string
): { id: string, name: string, type?: string, price?: number } | undefined => {
  if (!serviceId) return undefined;
  return productMap.get(serviceId);
};
