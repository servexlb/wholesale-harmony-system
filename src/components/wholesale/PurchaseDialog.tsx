
import React, { useState, useEffect } from 'react';
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
  const [productSearch, setProductSearch] = useState<string>('');
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<WholesaleOrder[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  
  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setProductSearch('');
      setActiveTab('all');
    }
  }, [open]);

  // Filter products based on search query and active tab
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.description.toLowerCase().includes(productSearch.toLowerCase());
      
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'subscription') return matchesSearch && product.type === 'subscription';
    if (activeTab === 'recharge') return matchesSearch && product.type === 'recharge';
    if (activeTab === 'giftcard') return matchesSearch && (product.type === 'giftcard' || !product.type);
    
    return matchesSearch;
  });

  // Group products by category
  const productsByCategory = filteredProducts.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const selectedProductData = products.find(p => p.id === selectedProduct);
  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  const handlePurchaseSubmit = () => {
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
    
    setSelectedCustomer('');
    setSelectedProduct('');
    setQuantity(1);
    onOpenChange(false);
  };

  // Mock function to load purchase history
  const loadPurchaseHistory = (customerId: string) => {
    setShowPurchaseHistory(true);
  };

  const renderProductIcon = (type?: string) => {
    if (type === 'subscription') return <Calendar className="h-4 w-4 text-blue-500" />;
    if (type === 'recharge') return <Zap className="h-4 w-4 text-amber-500" />;
    return <Package className="h-4 w-4 text-green-500" />;
  };
  
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
            <div className="p-4 bg-muted/40 rounded-md space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Purchase History</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowPurchaseHistory(false)}>
                  Close
                </Button>
              </div>
              
              <div className="max-h-40 overflow-y-auto space-y-2">
                {purchaseHistory.length > 0 ? (
                  purchaseHistory.map((order) => (
                    <div key={order.id} className="text-xs p-2 bg-background rounded border">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {products.find(p => p.id === order.serviceId)?.name}
                        </span>
                        <span>${order.totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Qty: {order.quantity}</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No purchase history found
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium mb-1 block">Product</label>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
              <TabsList className="grid grid-cols-4 mb-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="subscription">Subscriptions</TabsTrigger>
                <TabsTrigger value="recharge">Recharges</TabsTrigger>
                <TabsTrigger value="giftcard">Gift Cards</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
              
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Search products..." value={productSearch} onValueChange={setProductSearch} className="h-9" />
                <CommandList className="max-h-[250px] overflow-auto">
                  <CommandEmpty>No products found.</CommandEmpty>
                  {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                    <CommandGroup key={category} heading={category}>
                      {categoryProducts.map((product) => (
                        <CommandItem
                          key={product.id}
                          onSelect={() => {
                            setSelectedProduct(product.id);
                          }}
                          className={`flex items-center gap-2 cursor-pointer ${selectedProduct === product.id ? 'bg-accent text-accent-foreground' : ''}`}
                        >
                          {renderProductIcon(product.type)}
                          <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-xs text-muted-foreground">${product.wholesalePrice.toFixed(2)}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </div>
          </div>
          
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
