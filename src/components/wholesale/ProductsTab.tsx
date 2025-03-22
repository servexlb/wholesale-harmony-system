
import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/data';
import { Service } from '@/lib/types';
import { services } from '@/lib/mockData';

interface ProductsTabProps {
  products: Product[];
  onOpenPurchaseDialog: () => void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({ products, onOpenPurchaseDialog }) => {
  const [allItems, setAllItems] = useState<Product[]>([]);

  useEffect(() => {
    // Convert services to the Product format expected by ProductCard
    const servicesAsProducts: Product[] = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      wholesalePrice: service.wholesalePrice || service.price * 0.7, // Default wholesale price if not set
      image: service.image,
      category: service.categoryId ? `Category ${service.categoryId}` : 'Uncategorized',
      featured: service.featured || false,
      type: service.type || 'service',
      deliveryTime: service.deliveryTime || "",
      apiUrl: service.apiUrl,
      availableMonths: service.availableMonths,
      value: service.value,
    }));
    
    // Combine products and services
    console.log("Products count:", products.length);
    console.log("Services count:", servicesAsProducts.length);
    setAllItems([...products, ...servicesAsProducts]);
  }, [products]);
  
  // Handler for when a product is clicked
  const handleProductClick = useCallback((product: Product) => {
    console.log("Product clicked:", product.name);
    onOpenPurchaseDialog();
  }, [onOpenPurchaseDialog]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Wholesale Products</h1>
        <Button onClick={onOpenPurchaseDialog}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Quick Purchase
        </Button>
      </div>
      
      <div className="mb-4">
        <p>Showing {allItems.length} items ({products.length} products and {allItems.length - products.length} services)</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allItems.map((product) => (
          <div 
            key={product.id} 
            className="cursor-pointer h-full" 
            onClick={() => handleProductClick(product)}
            style={{ display: 'block', height: '100%' }}
          >
            <ProductCard 
              product={product} 
              isWholesale={true}
              onClick={() => handleProductClick(product)}
            />
          </div>
        ))}
        
        {allItems.length === 0 && (
          <div className="col-span-3 text-center py-10">
            <p className="text-gray-500">No products or services found.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(ProductsTab);
