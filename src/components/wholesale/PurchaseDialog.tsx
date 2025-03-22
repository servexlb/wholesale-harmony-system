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
  const [selectedCustomer, setSelectedCustomer] = useState<string>(initialSelectedCustomer);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<WholesaleOrder[]>([]);
  
  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedProduct('');
    }
  }, [open]);
  
  // Set selected customer when initialSelectedCustomer changes or dialog opens
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
    
    const newOrder: WholesaleOrder = {
      id: `order-${Date.now()}`,
      userId: selectedCustomer,
      wholesalerId: currentWholesaler,
      serviceId: selectedProduct,
      customerId: selectedCustomer,
      quantity: quantity,
      totalPrice: product.wholesalePrice * quantity,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    
    onOrderPlaced(newOrder);
    toast.success(`Order placed for ${customers.find(c => c.id === selectedCustomer)?.name}`);
    
    // Add to mock purchase history
    setPurchaseHistory(prev => [newOrder, ...prev]);
    
    setSelectedProduct('');
    setQuantity(1);
    onOpenChange(false);
  }, [selectedCustomer, selectedProduct, quantity, products, customers, currentWholesaler, onOrderPlaced, onOpenChange]);

  // Mock function to load purchase history
  const loadPurchaseHistory = useCallback((customerId: string) => {
    setShowPurchaseHistory(true);
  }, []);

  const renderProductIcon = useCallback((type?: string) => {
    if (type === 'subscription') return <Calendar className="h-4 w-4 text-blue-500" />;
    if (type === 'recharge') return <Zap className="h-4 w-4 text-amber-500" />;
    return <Package className="h-4 w-4 text-green-500" />;
  }, []);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Purchase for Customer</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Customer</label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
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
          
          <div>
            <label className="text-sm font-medium mb-1 block">Quantity</label>
            <Input 
              type="number" 
              min="1"
              value={quantity.toString()}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
          
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
                </span>
              </div>
              
              <div className="flex justify-between font-medium">
                <span>Total price:</span>
                <span className="text-primary">
                  ${(selectedProductData.wholesalePrice * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePurchaseSubmit}>
            Place Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;
