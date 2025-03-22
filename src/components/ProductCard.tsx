
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CreditCard, Eye, ImageIcon } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
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
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const price = isWholesale ? product.wholesalePrice : product.price;

  // Get current user balance from localStorage
  const userBalanceStr = localStorage.getItem('userBalance');
  const userBalance = userBalanceStr ? parseFloat(userBalanceStr) : 120.00; // Default to 120 if not set

  // Show purchase confirmation dialog
  const showPurchaseConfirmation = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleBuyNow = () => {
    console.log("Buy now clicked for product:", product);
    setIsPurchasing(true);
    
    // Check if user has sufficient balance
    if (userBalance < price * quantity) {
      toast.error("Insufficient balance", {
        description: "You don't have enough funds to make this purchase"
      });
      setIsPurchasing(false);
      // Redirect to payment page
      navigate("/payment");
      return;
    }

    // Deduct the price from user balance immediately
    const newBalance = userBalance - (price * quantity);
    localStorage.setItem('userBalance', newBalance.toString());

    // Create order with pending status
    const order = {
      id: `order-${Date.now()}`,
      productId: product.id,
      quantity: quantity,
      totalPrice: price * quantity,
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
      description: `Your order is being processed. $${(price * quantity).toFixed(2)} has been deducted from your balance.`
    });
    
    setIsPurchasing(false);
    setIsConfirmDialogOpen(false);
    
    // Redirect to dashboard
    navigate("/dashboard");
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  // Helper to determine if product is a subscription
  const isSubscription = product.type === 'subscription';
  
  // Helper to determine if product is a gift card
  const isGiftCard = product.type === 'giftcard';

  // Get appropriate quantity label
  const getQuantityLabel = () => {
    if (isSubscription) {
      return quantity === 1 ? 'Month' : 'Months';
    } else {
      return 'Quantity';
    }
  };

  return (
    <>
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
                onClick={showPurchaseConfirmation}
                disabled={isPurchasing}
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to purchase {product.name}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Price per {isSubscription ? 'month' : 'unit'}:</span>
              <span className="font-bold">${price.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Product:</span>
              <span>{product.name}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Category:</span>
              <span>{product.category}</span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">{getQuantityLabel()}:</span>
              <div className="flex items-center">
                <Button 
                  type="button" 
                  size="icon"
                  variant="outline" 
                  className="h-8 w-8 rounded-r-none"
                  onClick={decreaseQuantity}
                >
                  <span>-</span>
                </Button>
                <div className="h-8 border-y px-4 flex items-center justify-center min-w-[3rem]">
                  {quantity}
                </div>
                <Button 
                  type="button" 
                  size="icon"
                  variant="outline" 
                  className="h-8 w-8 rounded-l-none"
                  onClick={increaseQuantity}
                >
                  <span>+</span>
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-2 pt-2 border-t">
              <span className="font-medium">Total:</span>
              <span className="font-bold">${(price * quantity).toFixed(2)}</span>
            </div>
            
            {isSubscription && (
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">Duration:</span>
                <span>{quantity} {quantity === 1 ? 'month' : 'months'}</span>
              </div>
            )}
            
            {isGiftCard && (
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">Gift Card Value:</span>
                <span>${product.value?.toFixed(2) || price.toFixed(2)}</span>
              </div>
            )}
            
            {product.deliveryTime && (
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">Estimated Delivery:</span>
                <span>{product.deliveryTime}</span>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBuyNow} disabled={isPurchasing}>
              {isPurchasing ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
