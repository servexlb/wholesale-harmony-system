
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CreditCard, Eye, ImageIcon, Minus, Plus, User } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from '@/lib/toast';

interface ProductCardProps {
  product: Product;
  isWholesale?: boolean;
  onClick?: (product: Product) => void;
  onViewDetails?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isWholesale = false, 
  onClick,
  onViewDetails
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState("1");
  const [accountId, setAccountId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [requireCredentials, setRequireCredentials] = useState(true);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string }>({
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();

  const price = isWholesale ? product.wholesalePrice : product.price;

  // Get current user ID
  const userId = localStorage.getItem('currentUserId') || 'guest';
  
  // Get user balance from localStorage
  const userBalanceStr = localStorage.getItem(`userBalance_${userId}`);
  const userBalance = userBalanceStr ? parseFloat(userBalanceStr) : 0;

  // Helper to determine if product is a subscription
  const isSubscription = product.type === 'subscription';
  
  // Helper to determine if product is a gift card
  const isGiftCard = product.type === 'giftcard';

  // Helper to determine if product is a recharge
  const isRecharge = product.type === 'recharge';
  
  // Helper to determine if product should use months feature
  const shouldUseMonths = isSubscription || 
    product.category.toLowerCase().includes('streaming') || 
    product.category.toLowerCase().includes('vpn') || 
    product.category.toLowerCase().includes('security') ||
    product.category.toLowerCase().includes('productivity');
  
  // Load credential requirement setting from localStorage
  useEffect(() => {
    const loadCredentialSetting = () => {
      const savedSetting = localStorage.getItem("requireSubscriptionCredentials");
      if (savedSetting !== null) {
        const requireCreds = savedSetting === "true";
        setRequireCredentials(requireCreds);
        setShowCredentials(requireCreds && isSubscription);
      }
    };
    
    loadCredentialSetting();
    
    // Listen for credential setting changes
    const handleCredentialSettingChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.requireCredentials !== undefined) {
        setRequireCredentials(customEvent.detail.requireCredentials);
        setShowCredentials(customEvent.detail.requireCredentials && isSubscription);
      }
    };
    
    window.addEventListener('credential-setting-changed', handleCredentialSettingChanged);
    
    return () => {
      window.removeEventListener('credential-setting-changed', handleCredentialSettingChanged);
    };
  }, [isSubscription]);

  // Show purchase confirmation dialog
  const showPurchaseConfirmation = () => {
    // Reset fields when opening dialog
    setAccountId("");
    setQuantity(1);
    setCustomerName("");
    setCredentials({ email: '', password: '' });
    
    // Set default duration for subscriptions
    if (shouldUseMonths) {
      setSelectedDuration("1");
    }
    
    setIsConfirmDialogOpen(true);
  };

  const handleBuyNow = () => {
    // Validate account ID for recharge products
    if (isRecharge && !accountId.trim()) {
      toast.error("Account ID required", {
        description: "Please enter your account ID for this recharge"
      });
      return;
    }
    
    // Validate customer name if wholesale
    if (isWholesale && !customerName.trim()) {
      toast.error("Customer name required", {
        description: "Please enter the customer name for this order"
      });
      return;
    }
    
    // Validate credentials if required for subscription
    if (showCredentials && (credentials.email.trim() === '' || credentials.password.trim() === '')) {
      toast.error("Credentials required", {
        description: "Please provide both email and password for this subscription"
      });
      return;
    }
    
    console.log("Buy now clicked for product:", product);
    setIsPurchasing(true);
    
    // Calculate final price based on type
    const finalPrice = shouldUseMonths 
      ? price * parseInt(selectedDuration) 
      : price * quantity;
    
    // Check if user has sufficient balance
    if (userBalance < finalPrice) {
      toast.error("Insufficient balance", {
        description: "You don't have enough funds to make this purchase"
      });
      setIsPurchasing(false);
      // Redirect to payment page
      navigate("/payment");
      return;
    }

    // Deduct the price from user balance immediately
    const newBalance = userBalance - finalPrice;
    localStorage.setItem(`userBalance_${userId}`, newBalance.toString());

    // Create order with pending status
    const order = {
      id: `order-${Date.now()}`,
      productId: product.id,
      quantity: shouldUseMonths ? 1 : quantity,
      durationMonths: shouldUseMonths ? parseInt(selectedDuration) : undefined,
      accountId: isRecharge ? accountId : undefined,
      customerName: isWholesale ? customerName : undefined,
      totalPrice: finalPrice,
      status: "pending",
      createdAt: new Date().toISOString(),
      ...(showCredentials && credentials.email && credentials.password ? {
        credentials: credentials
      } : {})
    };

    // Save order to localStorage
    const orderStorageKey = `customerOrders_${userId}`;
    const customerOrders = JSON.parse(localStorage.getItem(orderStorageKey) || '[]');
    customerOrders.push(order);
    localStorage.setItem(orderStorageKey, JSON.stringify(customerOrders));

    // In a real app, you would send this to your backend
    console.log("Created order:", order);
    
    toast.success("Purchase successful!", {
      description: `Your order is being processed. $${finalPrice.toFixed(2)} has been deducted from your balance.`
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

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    } else if (e.target.value === '') {
      setQuantity(1); // Reset to 1 if input is cleared
    }
  };

  // Handle card click event if onClick prop is provided
  const handleCardClick = () => {
    if (onClick) {
      onClick(product);
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
        onClick={onClick ? handleCardClick : undefined}
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
                ${price.toFixed(2)} {shouldUseMonths ? '/month' : ''}
              </p>
              {isWholesale && (
                <p className="text-xs text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              {onViewDetails ? (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="subtle-focus-ring"
                  onClick={onViewDetails}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              ) : (
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
              )}
              <Button 
                size="sm" 
                className="subtle-focus-ring"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the card click
                  showPurchaseConfirmation();
                }}
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
          
          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Price per {shouldUseMonths ? 'month' : 'unit'}:</span>
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
            
            {/* Customer field for wholesale users */}
            {isWholesale && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <Input 
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the name of the customer for this order
                </p>
              </div>
            )}
            
            {/* Subscription credentials if required */}
            {showCredentials && (
              <div className="space-y-2 mb-4 p-3 border rounded-md">
                <h3 className="text-sm font-medium">Subscription Credentials</h3>
                <div>
                  <label className="text-xs font-medium block mb-1">Email/Username</label>
                  <Input
                    type="text"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="username@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Password</label>
                  <Input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
            
            {/* Subscription duration for subscription and streaming/vpn/security products */}
            {shouldUseMonths && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">
                  Duration <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["1", "3", "6", "12"].map((duration) => (
                    <Button 
                      key={duration}
                      type="button"
                      variant={selectedDuration === duration ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDuration(duration)}
                      className="flex-1 min-w-[70px]"
                    >
                      {duration} {parseInt(duration) === 1 ? 'month' : 'months'}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Account ID for recharge products */}
            {isRecharge && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">
                  Account ID <span className="text-red-500">*</span>
                </label>
                <Input 
                  placeholder="Enter your account ID"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This ID is required to process your recharge
                </p>
                
                {/* Add quantity controls for recharge products (if not using months) */}
                {!shouldUseMonths && (
                  <div className="mt-4">
                    <label className="text-sm font-medium">
                      Quantity
                    </label>
                    <div className="flex items-center mt-1">
                      <Button 
                        type="button" 
                        size="icon"
                        variant="outline" 
                        className="h-8 w-8 rounded-r-none"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={quantity.toString()}
                        onChange={handleQuantityChange}
                        className="h-8 rounded-none border-x-0 w-16 px-0 text-center"
                      />
                      <Button 
                        type="button" 
                        size="icon"
                        variant="outline" 
                        className="h-8 w-8 rounded-l-none"
                        onClick={increaseQuantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Show quantity controls for non-monthly products */}
            {!shouldUseMonths && !isRecharge && (
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center">
                  <Button 
                    type="button" 
                    size="icon"
                    variant="outline" 
                    className="h-8 w-8 rounded-r-none"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={quantity.toString()}
                    onChange={handleQuantityChange}
                    className="h-8 rounded-none border-x-0 w-16 px-0 text-center"
                  />
                  <Button 
                    type="button" 
                    size="icon"
                    variant="outline" 
                    className="h-8 w-8 rounded-l-none"
                    onClick={increaseQuantity}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mb-2 pt-2 border-t">
              <span className="font-medium">Total:</span>
              <span className="font-bold">
                ${(shouldUseMonths 
                  ? price * parseInt(selectedDuration) 
                  : price * quantity).toFixed(2)}
              </span>
            </div>
            
            {shouldUseMonths && (
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">Duration:</span>
                <span>{selectedDuration} {parseInt(selectedDuration) === 1 ? 'month' : 'months'}</span>
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
            <Button 
              onClick={handleBuyNow} 
              disabled={
                isPurchasing ||
                (isRecharge && !accountId) ||
                (isWholesale && !customerName) ||
                (showCredentials && (!credentials.email || !credentials.password))
              }
            >
              {isPurchasing ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
