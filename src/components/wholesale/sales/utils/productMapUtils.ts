
import { products } from '@/lib/data';
import { services } from '@/lib/mockData';

// Create a memoized product/service lookup map for better performance
export const createProductMap = () => {
  const productMap = new Map();
  
  // Add products to map
  products.forEach(product => {
    productMap.set(product.id, {
      id: product.id,
      name: product.name,
      type: product.type || 'product'
    });
  });
  
  // Add services to map
  services.forEach(service => {
    productMap.set(service.id, {
      id: service.id,
      name: service.name,
      type: service.type || 'service'
    });
  });
  
  return productMap;
};
