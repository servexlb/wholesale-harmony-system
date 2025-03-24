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
