import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Filter, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductCard from '@/components/ProductCard';
import { Product, Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import { toast } from '@/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ExtendedProduct extends Product {
  minQuantity?: number;
}

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
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProduct | null>(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);

  useEffect(() => {
    console.log('Products in ProductsTab:', products);
    console.log('Products with type "service":', products.filter(p => p.type === 'service').length);
    console.log('Products with type "product" or "subscription":', products.filter(p => p.type !== 'service').length);
  }, [products]);

  useEffect(() => {
    try {
      let filtered = [...products];
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query) || 
          (product.description && product.description.toLowerCase().includes(query))
        );
      }
      
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

  const handleProductClick = useCallback((product: Product) => {
    console.log("Product clicked:", product.name, product.id, product.type);
    window.dispatchEvent(new CustomEvent('openPurchaseDialog', { 
      detail: { productId: product.id }
    }));
  }, []);

  const handleViewDetails = useCallback((product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setProductDetailOpen(true);
  }, []);

  const handleResetFilters = () => {
    setShowServicesOnly(false);
    setShowProductsOnly(false);
    setSearchQuery('');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const productsCount = products.filter(p => p.type !== 'service').length;
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
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products and services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 py-2"
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          )}
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
              Reset Filters
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
                onViewDetails={(e) => handleViewDetails(product, e)}
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={productDetailOpen} onOpenChange={setProductDetailOpen}>
        {selectedProduct && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedProduct.name}</DialogTitle>
              <DialogDescription>
                Product ID: {selectedProduct.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }} 
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-1">Description</h3>
                  <p className="text-gray-600">{selectedProduct.description || "No description available."}</p>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-lg font-medium mb-1">Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{selectedProduct.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium capitalize">{selectedProduct.type || "Standard"}</span>
                    </div>
                    {selectedProduct.deliveryTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Delivery Time:</span>
                        <span className="font-medium">{selectedProduct.deliveryTime}</span>
                      </div>
                    )}
                    {selectedProduct?.minQuantity && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Minimum Quantity:</span>
                        <span className="font-medium">{selectedProduct.minQuantity}</span>
                      </div>
                    )}
                    {selectedProduct.value && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Value:</span>
                        <span className="font-medium">${selectedProduct.value.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-lg font-medium mb-1">Price Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Retail Price:</span>
                      <span className="font-medium">${selectedProduct.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Wholesale Price:</span>
                      <span className="font-medium">${selectedProduct.wholesalePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Profit Margin:</span>
                      <span className="font-medium">
                        {((1 - (selectedProduct.wholesalePrice / selectedProduct.price)) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setProductDetailOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={() => {
                  setProductDetailOpen(false);
                  window.dispatchEvent(new CustomEvent('openPurchaseDialog', { 
                    detail: { productId: selectedProduct.id }
                  }));
                }}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Purchase Now
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </motion.div>
  );
};

export default ProductsTab;
