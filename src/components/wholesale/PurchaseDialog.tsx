import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Customer } from '@/lib/data';
import { toast } from 'sonner';
import { WholesaleOrder, Service } from '@/lib/types';
import { Search, Calendar, Zap, Package, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductSearch from './ProductSearch';
import PurchaseHistoryList from './PurchaseHistoryList';
import { checkCredentialAvailability, processOrderWithCredentials } from '@/lib/credentialUtils';

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  products: Service[];
  selectedCustomer?: string;
  currentWholesaler: string;
  onOrderPlaced: (order: WholesaleOrder) => void;
}

const PurchaseDialog: React.FC<PurchaseDialogProps> = ({
  open,
  onOpenChange,
  customers,
  products,
  selectedCustomer: initialSelectedCustomer,
  currentWholesaler,
  onOrderPlaced
}) => {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<string>(initialSelectedCustomer);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<WholesaleOrder[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string>("1");
  
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  }>({ email: '', password: '' });
  
  const [showCredentials, setShowCredentials] = useState(false);
  const [requireCredentials, setRequireCredentials] = useState(true);
  
  useEffect(() => {
    const loadCredentialSetting = () => {
      const savedSetting = localStorage.getItem("requireSubscriptionCredentials");
      if (savedSetting !== null) {
        setRequireCredentials(savedSetting === "true");
      }
    };
    
    loadCredentialSetting();
    
    const handleCredentialSettingChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.requireCredentials !== undefined) {
        setRequireCredentials(customEvent.detail.requireCredentials);
      }
    };
    
    window.addEventListener('credential-setting-changed', handleCredentialSettingChanged);
    
    return () => {
      window.removeEventListener('credential-setting-changed', handleCredentialSettingChanged);
    };
  }, []);
  
  useEffect(() => {
    if (!open) {
      setSelectedProduct('');
      setQuantity(1);
      setCredentials({ email: '', password: '' });
      setShowCredentials(false);
    }
  }, [open]);
  
  useEffect(() => {
    if (open && initialSelectedCustomer) {
      setSelectedCustomer(initialSelectedCustomer);
    }
  }, [open, initialSelectedCustomer]);
  
  useEffect(() => {
    const product = products.find(p => p.id === selectedProduct);
    setShowCredentials(requireCredentials && product?.type === 'subscription');
  }, [selectedProduct, products, requireCredentials]);
  
  const selectedProductData = useMemo(() => 
    products.find(p => p.id === selectedProduct),
    [products, selectedProduct]
  );
  
  const selectedCustomerData = useMemo(() => 
    customers.find(c => c.id === selectedCustomer),
    [customers, selectedCustomer]
  );

  const getUserBalance = useCallback(() => {
    const userBalanceStr = localStorage.getItem(`userBalance_${currentWholesaler}`);
    return userBalanceStr ? parseFloat(userBalanceStr) : 0;
  }, [currentWholesaler]);

  const handleProductSelect = useCallback((productId: string) => {
    setSelectedProduct(productId);
    setSelectedDuration("1");
  }, []);

  const availableDurations = useMemo(() => {
    if (!selectedProductData || selectedProductData.type !== 'subscription') return [];
    
    if (selectedProductData.monthlyPricing && selectedProductData.monthlyPricing.length > 0) {
      return selectedProductData.monthlyPricing
        .sort((a, b) => a.months - b.months)
        .map(p => p.months.toString());
    }
    
    if (selectedProductData.availableMonths && selectedProductData.availableMonths.length > 0) {
      return selectedProductData.availableMonths
        .sort((a, b) => a - b)
        .map(m => m.toString());
    }
    
    return ["1", "3", "6", "12"];
  }, [selectedProductData]);

  useEffect(() => {
    if (availableDurations.length > 0 && selectedProductData?.type === 'subscription') {
      setSelectedDuration(availableDurations[0]);
    }
  }, [availableDurations, selectedProductData]);

  const getSubscriptionPrice = useCallback((isWholesale: boolean): number => {
    if (!selectedProductData) return 0;
    
    const durationMonths = parseInt(selectedDuration);
    
    if (selectedProductData.monthlyPricing && selectedProductData.monthlyPricing.length > 0) {
      const pricing = selectedProductData.monthlyPricing.find(p => p.months === durationMonths);
      if (pricing) {
        return isWholesale ? pricing.wholesalePrice : pricing.price;
      }
    }
    
    const basePrice = isWholesale ? selectedProductData.wholesalePrice : selectedProductData.price;
    return basePrice * durationMonths;
  }, [selectedProductData, selectedDuration]);

  const handlePurchaseSubmit = useCallback(() => {
    if (!selectedCustomer || !selectedProduct) {
      toast.error("Please select both a customer and a product");
      return;
    }
    
    const product = products.find(p => p.id === selectedProduct);
    
    if (!product) {
      toast.error("Product not found");
      return;
    }
    
    if (showCredentials && (credentials.email.trim() === '' || credentials.password.trim() === '')) {
      toast.error("Credentials required", {
        description: "Please provide both email and password for this subscription"
      });
      return;
    }

    let totalPrice: number;
    
    if (product.type === 'subscription') {
      totalPrice = getSubscriptionPrice(true);
    } else {
      totalPrice = product.wholesalePrice * quantity;
    }
    
    const currentBalance = getUserBalance();
    if (currentBalance < totalPrice) {
      toast.error("Insufficient balance", {
        description: "You don't have enough funds to place this order"
      });
      
      onOpenChange(false);
      navigate("/payment");
      return;
    }
    
    const newBalance = currentBalance - totalPrice;
    localStorage.setItem(`userBalance_${currentWholesaler}`, newBalance.toString());
    
    const newOrder: WholesaleOrder = {
      id: `order-${Date.now()}`,
      userId: currentWholesaler,
      wholesalerId: currentWholesaler,
      serviceId: selectedProduct,
      customerId: selectedCustomer,
      quantity: product.type === 'subscription' ? 1 : quantity,
      totalPrice: totalPrice,
      status: "pending",
      createdAt: new Date().toISOString(),
      ...(product.type === 'subscription' && { 
        durationMonths: parseInt(selectedDuration) 
      }),
      products: []
    };
    
    const processedOrder = processOrderWithCredentials(newOrder) as WholesaleOrder;
    
    onOrderPlaced(processedOrder);
    toast.success(`Order placed for ${customers.find(c => c.id === selectedCustomer)?.name}`);
    
    setPurchaseHistory(prev => [processedOrder, ...prev]);
    
    setSelectedProduct('');
    setQuantity(1);
    setCredentials({ email: '', password: '' });
    onOpenChange(false);
  }, [
    selectedCustomer, 
    selectedProduct, 
    quantity, 
    products, 
    customers, 
    currentWholesaler, 
    onOrderPlaced, 
    onOpenChange, 
    getUserBalance, 
    navigate, 
    selectedDuration, 
    showCredentials, 
    credentials,
    getSubscriptionPrice
  ]);

  const loadPurchaseHistory = useCallback((customerId: string) => {
    setShowPurchaseHistory(true);
  }, []);

  const renderProductIcon = useCallback((type?: string) => {
    if (type === 'subscription') return <Calendar className="h-4 w-4 text-blue-500" />;
    if (type === 'recharge') return <Zap className="h-4 w-4 text-amber-500" />;
    return <Package className="h-4 w-4 text-green-500" />;
  }, []);

  const currentBalance = getUserBalance();
  const isSubscription = selectedProductData?.type === 'subscription';

  if (!open) return null;

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
      <div className="mb-4 pb-2 border-b">
        <h2 className="text-lg font-semibold">Purchase for Customer</h2>
      </div>
      
      <div className="space-y-4 py-2">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            Your Balance: <span className="font-semibold">${currentBalance.toFixed(2)}</span>
          </div>
          {currentBalance < 100 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                onOpenChange(false);
                navigate("/payment");
              }}
            >
              Add Funds
            </Button>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Customer</label>
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-md z-[100]">
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  <div className="flex flex-col">
                    <span>{customer.name}</span>
                    <span className="text-xs text-muted-foreground">{customer.phone}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedCustomer && (
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => loadPurchaseHistory(selectedCustomer)}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              View purchase history
            </Button>
          </div>
        )}
        
        {showPurchaseHistory && selectedCustomer && (
          <PurchaseHistoryList 
            purchaseHistory={purchaseHistory}
            products={products}
            onClose={() => setShowPurchaseHistory(false)}
          />
        )}
        
        <ProductSearch 
          products={products} 
          onProductSelect={handleProductSelect}
          selectedProductId={selectedProduct}
        />
        
        {selectedProductData && (
          <>
            {isSubscription ? (
              <div>
                <label className="text-sm font-medium mb-1 block">Duration</label>
                <div className="flex gap-2 flex-wrap">
                  {availableDurations.map((duration) => (
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
            ) : (
              <div>
                <label className="text-sm font-medium mb-1 block">Quantity</label>
                <Input 
                  type="number" 
                  min="1"
                  value={quantity.toString()}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            )}
          </>
        )}
        
        {showCredentials && (
          <div className="space-y-3 p-3 border rounded-md">
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
        
        {selectedProductData && (
          <div className="p-4 bg-muted/40 rounded-md">
            <div className="flex items-center gap-2 mb-3">
              {selectedProductData.type === 'subscription' && (
                <>
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Subscription Service</span>
                </>
              )}
              {selectedProductData.type === 'recharge' && (
                <>
                  <Zap className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium">Recharge Service</span>
                </>
              )}
              {(!selectedProductData.type || selectedProductData.type === 'giftcard') && (
                <>
                  <Package className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">One-time Purchase</span>
                </>
              )}
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Price per unit:</span>
              <span className="font-medium">
                ${isSubscription 
                  ? (getSubscriptionPrice(true) / parseInt(selectedDuration)).toFixed(2)
                  : selectedProductData.wholesalePrice.toFixed(2)}
                {isSubscription ? '/month' : ''}
              </span>
            </div>
            
            <div className="flex justify-between font-medium">
              <span>Total price:</span>
              <span className="text-primary">
                ${isSubscription 
                  ? getSubscriptionPrice(true).toFixed(2)
                  : (selectedProductData.wholesalePrice * quantity).toFixed(2)}
              </span>
            </div>

            {currentBalance < (isSubscription 
              ? getSubscriptionPrice(true)
              : selectedProductData.wholesalePrice * quantity) && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                Warning: Your balance is insufficient for this purchase. Please add funds before proceeding.
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button 
          onClick={handlePurchaseSubmit}
          disabled={
            !selectedProduct || 
            !selectedCustomer || 
            (showCredentials && (!credentials.email || !credentials.password)) ||
            (selectedProductData && currentBalance < (
              isSubscription 
                ? getSubscriptionPrice(true)
                : selectedProductData.wholesalePrice * quantity
            ))
          }
        >
          Place Order
        </Button>
      </div>
    </div>
  );
};

export default PurchaseDialog;
