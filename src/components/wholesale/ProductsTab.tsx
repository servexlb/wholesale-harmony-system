
import React, { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { Product, Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';

interface ProductsTabProps {
  products: Product[];
  customers: Customer[];
  onOrderPlaced: (order: WholesaleOrder) => void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({ 
  products, 
  customers, 
  onOrderPlaced 
}) => {
  // Log products to debug
  useEffect(() => {
    console.log('Products in ProductsTab:', products);
    console.log('Products with type "service":', products.filter(p => p.type === 'service').length);
    console.log('Products with type "product" or undefined:', products.filter(p => !p.type || p.type !== 'service').length);
  }, [products]);

  // Handler for when a product is clicked
  const handleProductClick = useCallback((product: Product) => {
    console.log("Product clicked:", product.name, product.id, product.type);
    // We'll use the onOpenPurchaseDialog prop passed from the parent
    window.dispatchEvent(new CustomEvent('openPurchaseDialog', { 
      detail: { productId: product.id }
    }));
  }, []);
  
  // Determine if products or services have been passed
  const productsCount = products.filter(p => !p.type || p.type !== 'service').length;
  const servicesCount = products.filter(p => p.type === 'service').length;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Wholesale Products</h1>
        <Button onClick={() => window.dispatchEvent(new CustomEvent('openPurchaseDialog'))}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Quick Purchase
        </Button>
      </div>
      
      <div className="mb-4">
        <p>Showing {products.length} items ({productsCount} products and {servicesCount} services)</p>
      </div>
      
      {products.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <div key={index} className="h-[300px] bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
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
          
          {products.length === 0 && (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500">No products or services found.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ProductsTab;
