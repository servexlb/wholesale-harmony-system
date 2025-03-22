
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/data';

interface ProductsTabProps {
  products: Product[];
  onOpenPurchaseDialog: () => void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({ products, onOpenPurchaseDialog }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Wholesale Products</h1>
        <Button onClick={onOpenPurchaseDialog}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Quick Purchase
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} isWholesale={true} />
        ))}
      </div>
    </motion.div>
  );
};

export default ProductsTab;
