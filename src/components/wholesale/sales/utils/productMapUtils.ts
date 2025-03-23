
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
      type: product.type || 'product',
      price: product.wholesalePrice
    });
  });
  
  // Add services to map if they exist
  if (services && Array.isArray(services)) {
    services.forEach(service => {
      productMap.set(service.id, {
        id: service.id,
        name: service.name,
        type: service.type || 'service',
        price: service.wholesalePrice || service.price
      });
    });
  }
  
  // If map is empty, add fallback items to prevent errors
  if (productMap.size === 0) {
    // Add fallback products to ensure the UI doesn't break
    products.forEach(product => {
      productMap.set(product.id, {
        id: product.id,
        name: product.name,
        type: product.type || 'product',
        price: product.wholesalePrice
      });
    });
  }
  
  return productMap;
};

// Helper function to get a product by ID, with fallback handling
export const getProductById = (productMap, productId) => {
  if (!productId) return null;
  
  const product = productMap.get(productId);
  
  if (!product) {
    console.warn(`Product not found for ID: ${productId}`);
    return {
      id: productId,
      name: 'Unknown Product',
      type: 'product',
      price: 0
    };
  }
  
  return product;
};
