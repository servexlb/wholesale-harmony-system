import { Product, Service, MonthlyPricing, ServiceType } from './types';
import { toast } from 'sonner';

// Event names for product changes
export const PRODUCT_EVENTS = {
  PRODUCT_ADDED: 'product-added',
  PRODUCT_UPDATED: 'product-updated',
  PRODUCT_DELETED: 'product-deleted',
  SERVICE_ADDED: 'service-added',
  SERVICE_UPDATED: 'service-updated',
  SERVICE_DELETED: 'service-deleted',
};

// Utility function to convert Service to Product
export const serviceToProduct = (service: Service): Product => {
  return {
    id: service.id,
    name: service.name,
    description: service.description || "",
    price: service.price,
    wholesalePrice: service.wholesalePrice,
    image: service.image,
    category: service.category || service.categoryId || 'Uncategorized',
    categoryId: service.categoryId || service.category?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
    featured: service.featured,
    type: service.type,
    value: service.value,
    deliveryTime: service.deliveryTime,
    availableMonths: service.availableMonths,
    apiUrl: service.apiUrl,
    minQuantity: service.minQuantity,
    requiresId: service.requiresId,
    monthlyPricing: service.monthlyPricing || [],
    features: service.features || [],
    availableForCustomers: service.availableForCustomers !== undefined ? service.availableForCustomers : true
  };
};

// Utility function to convert Product to Service
export const productToService = (product: Product): Service => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    wholesalePrice: product.wholesalePrice || 0,
    image: product.image,
    categoryId: product.categoryId || product.category.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
    category: product.category,
    featured: product.featured || false,
    type: product.type || 'subscription',
    deliveryTime: product.deliveryTime || '',
    availableMonths: product.availableMonths,
    apiUrl: product.apiUrl,
    minQuantity: product.minQuantity,
    requiresId: product.requiresId,
    value: product.value,
    monthlyPricing: product.monthlyPricing || [],
    features: product.features || [],
    availableForCustomers: product.availableForCustomers
  };
};

// Save products to localStorage
export const saveProducts = (products: Product[]): void => {
  localStorage.setItem('products', JSON.stringify(products));
  dispatchProductEvent(PRODUCT_EVENTS.PRODUCT_UPDATED, products);
};

// Save services to localStorage
export const saveServices = (services: Service[]): void => {
  localStorage.setItem('services', JSON.stringify(services));
  dispatchProductEvent(PRODUCT_EVENTS.SERVICE_UPDATED, services);
};

// Load products from localStorage
export const loadProducts = (): Product[] => {
  const storedProducts = localStorage.getItem('products');
  return storedProducts ? JSON.parse(storedProducts) : [];
};

// Load services from localStorage
export const loadServices = (): Service[] => {
  const storedServices = localStorage.getItem('services');
  return storedServices ? JSON.parse(storedServices) : [];
};

// Add a new product and sync with services
export const addProduct = (product: Product): void => {
  const products = loadProducts();
  products.push(product);
  saveProducts(products);
  
  // Sync with services
  const service = productToService(product);
  const services = loadServices();
  services.push(service);
  saveServices(services);
  
  toast.success(`${product.name} added to the product catalog`);
  dispatchProductEvent(PRODUCT_EVENTS.PRODUCT_ADDED, product);
};

// Add a new service and sync with products
export const addService = (service: Service): void => {
  const services = loadServices();
  services.push(service);
  saveServices(services);
  
  // Sync with products
  const product = serviceToProduct(service);
  const products = loadProducts();
  products.push(product);
  saveProducts(products);
  
  toast.success(`${service.name} added to the service catalog`);
  dispatchProductEvent(PRODUCT_EVENTS.SERVICE_ADDED, service);
};

// Update a product and sync with services
export const updateProduct = (updatedProduct: Product): void => {
  const products = loadProducts();
  const index = products.findIndex(p => p.id === updatedProduct.id);
  
  if (index !== -1) {
    products[index] = updatedProduct;
    saveProducts(products);
    
    // Sync with services
    const services = loadServices();
    const serviceIndex = services.findIndex(s => s.id === updatedProduct.id);
    
    if (serviceIndex !== -1) {
      services[serviceIndex] = productToService(updatedProduct);
    } else {
      services.push(productToService(updatedProduct));
    }
    
    saveServices(services);
    toast.success(`${updatedProduct.name} updated successfully`);
    dispatchProductEvent(PRODUCT_EVENTS.PRODUCT_UPDATED, updatedProduct);
  }
};

// Update a service and sync with products
export const updateService = (updatedService: Service): void => {
  const services = loadServices();
  const index = services.findIndex(s => s.id === updatedService.id);
  
  if (index !== -1) {
    services[index] = updatedService;
    saveServices(services);
    
    // Sync with products
    const products = loadProducts();
    const productIndex = products.findIndex(p => p.id === updatedService.id);
    
    if (productIndex !== -1) {
      products[productIndex] = serviceToProduct(updatedService);
    } else {
      products.push(serviceToProduct(updatedService));
    }
    
    saveProducts(products);
    toast.success(`${updatedService.name} updated successfully`);
    dispatchProductEvent(PRODUCT_EVENTS.SERVICE_UPDATED, updatedService);
  }
};

// Delete a product and sync with services
export const deleteProduct = (productId: string): void => {
  const products = loadProducts();
  const index = products.findIndex(p => p.id === productId);
  
  if (index !== -1) {
    const deletedProduct = products[index];
    products.splice(index, 1);
    saveProducts(products);
    
    // Sync with services
    const services = loadServices();
    const serviceIndex = services.findIndex(s => s.id === productId);
    
    if (serviceIndex !== -1) {
      services.splice(serviceIndex, 1);
      saveServices(services);
    }
    
    toast.success(`${deletedProduct.name} removed from catalog`);
    dispatchProductEvent(PRODUCT_EVENTS.PRODUCT_DELETED, deletedProduct);
  }
};

// Delete a service and sync with products
export const deleteService = (serviceId: string): void => {
  const services = loadServices();
  const index = services.findIndex(s => s.id === serviceId);
  
  if (index !== -1) {
    const deletedService = services[index];
    services.splice(index, 1);
    saveServices(services);
    
    // Sync with products
    const products = loadProducts();
    const productIndex = products.findIndex(p => p.id === serviceId);
    
    if (productIndex !== -1) {
      products.splice(productIndex, 1);
      saveProducts(products);
    }
    
    toast.success(`${deletedService.name} removed from catalog`);
    dispatchProductEvent(PRODUCT_EVENTS.SERVICE_DELETED, deletedService);
  }
};

// Calculate monthly price based on monthly pricing or base price
export const getMonthlyPrice = (
  product: Product | Service, 
  months: number, 
  isWholesale: boolean = false
): number => {
  if (!product.monthlyPricing || (product.monthlyPricing as MonthlyPricing[]).length === 0) {
    // If no monthly pricing, use the base price * months
    return isWholesale 
      ? (product.wholesalePrice || 0) * months
      : (product.price || 0) * months;
  }
  
  // Find the exact match for the months
  const exactMatch = (product.monthlyPricing as MonthlyPricing[]).find(p => p.months === months);
  if (exactMatch) {
    return isWholesale ? exactMatch.wholesalePrice : exactMatch.price;
  }
  
  // If no exact match, use the base price * months as fallback
  return isWholesale 
    ? (product.wholesalePrice || 0) * months
    : (product.price || 0) * months;
};

// Dispatch custom events for product changes
const dispatchProductEvent = (eventName: string, data: any): void => {
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  } catch (e) {
    console.error(`Error dispatching ${eventName} event:`, e);
  }
};

// Initialize the product manager (sync products and services on load)
export const initProductManager = (): void => {
  const products = loadProducts();
  const services = loadServices();
  
  // If we have products but no services, convert products to services
  if (products.length > 0 && services.length === 0) {
    const convertedServices = products.map(productToService);
    saveServices(convertedServices);
  }
  
  // If we have services but no products, convert services to products
  if (services.length > 0 && products.length === 0) {
    const convertedProducts = services.map(serviceToProduct);
    saveProducts(convertedProducts);
  }
  
  console.log(`Product manager initialized: ${products.length} products, ${services.length} services`);
};
