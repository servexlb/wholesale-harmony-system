
import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductCard from '@/components/ProductCard';
import { Product, Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import { toast } from '@/lib/toast';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [showServicesOnly, setShowServicesOnly] = useState(false);
  const [showProductsOnly, setShowProductsOnly] = useState(false);

  // Log products to debug
  useEffect(() => {
    console.log('Products in ProductsTab:', products);
    console.log('Products with type "service":', products.filter(p => p.type === 'service').length);
    console.log('Products with type "product" or "subscription":', products.filter(p => !p.type || p.type !== 'service').length);
  }, [products]);

  // Filter products based on search query and filters
  useEffect(() => {
    try {
      let filtered = [...products];
      
      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query) || 
          (product.description && product.description.toLowerCase().includes(query))
        );
      }
      
      // Apply type filters
      if (showServicesOnly) {
        filtered = filtered.filter(product => product.type === 'service');
      } else if (showProductsOnly) {
        filtered = filtered.filter(product => product.type !== 'service');
      }
      
      setFilteredProducts(filtered);
    } catch (error) {
      console.error('Error filtering products:', error);
      toast.error('Error filtering products');
      setFilteredProducts(products);
    }
  }, [searchQuery, products, showServicesOnly, showProductsOnly]);

  // Handler for when a product is clicked
  const handleProductClick = useCallback((product: Product) => {
    console.log("Product clicked:", product.name, product.id, product.type);
    // We'll use the onOpenPurchaseDialog prop passed from the parent
    window.dispatchEvent(new CustomEvent('openPurchaseDialog', { 
      detail: { productId: product.id }
    }));
  }, []);
  
  // Reset filters
  const handleResetFilters = () => {
    setShowServicesOnly(false);
    setShowProductsOnly(false);
    setSearchQuery('');
  };
  
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
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products and services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showServicesOnly ? "default" : "outline"} 
            size="sm"
            onClick={() => {
              setShowServicesOnly(!showServicesOnly);
              setShowProductsOnly(false);
            }}
          >
            Services Only
          </Button>
          <Button 
            variant={showProductsOnly ? "default" : "outline"} 
            size="sm"
            onClick={() => {
              setShowProductsOnly(!showProductsOnly);
              setShowServicesOnly(false);
            }}
          >
            Products Only
          </Button>
          {(showServicesOnly || showProductsOnly || searchQuery) && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              Reset
            </Button>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <p>Showing {filteredProducts.length} items ({productsCount} products and {servicesCount} services)</p>
      </div>
      
      {filteredProducts.length === 0 ? (
        searchQuery || showServicesOnly || showProductsOnly ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No products or services found matching your criteria</p>
            <Button variant="outline" className="mt-4" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <div key={index} className="h-[300px] bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
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
        </div>
      )}
    </motion.div>
  );
};

export default ProductsTab;
