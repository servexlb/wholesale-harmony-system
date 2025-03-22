
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CreditCard, Eye, ImageIcon } from 'lucide-react';
import { toast } from '@/lib/toast';

interface ProductCardProps {
  product: Product;
  isWholesale?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isWholesale = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const navigate = useNavigate();

  const price = isWholesale ? product.wholesalePrice : product.price;

  // Get current user balance from localStorage
  const userBalanceStr = localStorage.getItem('userBalance');
  const userBalance = userBalanceStr ? parseFloat(userBalanceStr) : 120.00; // Default to 120 if not set

  const handleBuyNow = () => {
    console.log("Buy now clicked for product:", product);
    setIsPurchasing(true);
    
    // Check if user has sufficient balance
    if (userBalance < price) {
      toast.error("Insufficient balance", {
        description: "You don't have enough funds to make this purchase"
      });
      setIsPurchasing(false);
      // Redirect to payment page
      navigate("/payment");
      return;
    }

    // Simulate purchase processing
    setTimeout(() => {
      // Deduct the price from user balance immediately
      const newBalance = userBalance - price;
      localStorage.setItem('userBalance', newBalance.toString());

      // Create order with pending status
      const order = {
        id: `order-${Date.now()}`,
        productId: product.id,
        quantity: 1,
        totalPrice: price,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // Save order to localStorage
      const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
      customerOrders.push(order);
      localStorage.setItem('customerOrders', JSON.stringify(customerOrders));

      // In a real app, you would send this to your backend
      console.log("Created order:", order);
      
      toast.success("Purchase successful!", {
        description: `Your order is being processed. $${price.toFixed(2)} has been deducted from your balance.`
      });
      
      setIsPurchasing(false);
      
      // Redirect to dashboard
      navigate("/dashboard");
    }, 1000);
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
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-50 relative">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="h-10 w-10 text-gray-300 animate-spin border-4 border-t-primary rounded-full"></div>
          </div>
        )}
        
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            className={cn(
              "h-full w-full object-cover object-center transition-all duration-700",
              imageLoaded ? "opacity-100" : "opacity-0",
              isHovered ? "scale-105" : "scale-100"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.log(`Product image failed to load: ${product.image}`);
              setImageError(true);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">{product.name}</span>
          </div>
        )}
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
                <Eye className="h-4 w-4 mr-1" />
                View
              </Link>
            </Button>
            <Button 
              size="sm" 
              className="subtle-focus-ring"
              onClick={handleBuyNow}
              disabled={isPurchasing}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              {isPurchasing ? "Processing..." : "Buy Now"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
