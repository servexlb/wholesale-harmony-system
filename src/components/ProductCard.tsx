
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CreditCard, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isWholesale?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isWholesale = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const price = isWholesale ? product.wholesalePrice : product.price;

  const handleBuyNow = () => {
    console.log("Buy now clicked for product:", product);
    navigate(`/checkout`);
  };

  return (
    <motion.div
      className="group relative h-full overflow-hidden rounded-lg bg-white shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-50">
        <div className={cn(
          "absolute inset-0 bg-gray-100 animate-pulse",
          imageLoaded ? "opacity-0" : "opacity-100"
        )} />
        <img
          src={product.image}
          alt={product.name}
          className={cn(
            "h-full w-full object-cover object-center transition-all duration-700",
            imageLoaded ? "opacity-100" : "opacity-0",
            isHovered ? "scale-105" : "scale-100"
          )}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      <div className="p-5">
        <div className="mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.category}
          </span>
        </div>
        <h3 className="text-lg font-medium leading-tight text-primary">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>
        
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xl font-semibold text-primary">
              ${price.toFixed(2)}
            </p>
            {isWholesale && (
              <p className="text-xs text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="subtle-focus-ring"
              asChild
            >
              <Link to={`/products/${product.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button 
              size="sm" 
              className="subtle-focus-ring"
              onClick={handleBuyNow}
            >
              <CreditCard className="h-4 w-4" />
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
