import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Customer, Product } from '@/lib/data';
import { toast } from 'sonner';
import { WholesaleOrder } from '@/lib/types';
import { Search, Calendar, Zap, Package, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import ProductSearch from './ProductSearch';
import PurchaseHistoryList from './PurchaseHistoryList';
import { useNavigate } from 'react-router-dom';

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  products: Product[];
  selectedCustomer: string;
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
  
  useEffect(() => {
    if (!open) {
      setSelectedProduct('');
      setQuantity(1);
    }
  }, [open]);
  
  useEffect(() => {
    if (open && initialSelectedCustomer) {
      setSelectedCustomer(initialSelectedCustomer);
    }
  }, [open, initialSelectedCustomer]);
  
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
  }, []);

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

    const totalPrice = product.wholesalePrice * quantity;
    
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
      userId: selectedCustomer,
      wholesalerId: currentWholesaler,
      serviceId: selectedProduct,
      customerId: selectedCustomer,
      quantity: quantity,
      totalPrice: totalPrice,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    
    onOrderPlaced(newOrder);
    toast.success(`Order placed for ${customers.find(c => c.id === selectedCustomer)?.name}`);
    
    setPurchaseHistory(prev => [newOrder, ...prev]);
    
    setSelectedProduct('');
    setQuantity(1);
    onOpenChange(false);
  }, [selectedCustomer, selectedProduct, quantity, products, customers, currentWholesaler, onOrderPlaced, onOpenChange, getUserBalance, navigate]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] md:max-w-[900px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase for Customer</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
                  ${selectedProductData.wholesalePrice.toFixed(2)}
                  {isSubscription ? '/month' : ''}
                </span>
              </div>
              
              <div className="flex justify-between font-medium">
                <span>Total price:</span>
                <span className="text-primary">
                  ${isSubscription 
                    ? (selectedProductData.wholesalePrice * parseInt(selectedDuration)).toFixed(2)
                    : (selectedProductData.wholesalePrice * quantity).toFixed(2)}
                </span>
              </div>

              {currentBalance < (isSubscription 
                ? selectedProductData.wholesalePrice * parseInt(selectedDuration)
                : selectedProductData.wholesalePrice * quantity) && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  Warning: Your balance is insufficient for this purchase. Please add funds before proceeding.
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handlePurchaseSubmit}
            disabled={!selectedProduct || !selectedCustomer || (selectedProductData && currentBalance < (
              isSubscription 
                ? selectedProductData.wholesalePrice * parseInt(selectedDuration)
                : selectedProductData.wholesalePrice * quantity
            ))}
          >
            Place Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;

