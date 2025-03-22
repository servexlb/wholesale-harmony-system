
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Customer, Product } from '@/lib/data';
import { toast } from 'sonner';
import { WholesaleOrder } from '@/lib/types';
import { Search, Calendar, Zap, Package, Clock } from 'lucide-react';
import { 
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<WholesaleOrder[]>([]);
  
  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedProductData = products.find(p => p.id === selectedProduct);

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
    // In a real application, this would fetch from an API
    // For now, we'll just use the existing purchase history in state
    setShowPurchaseHistory(true);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Purchase for Customer</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Customer</label>
            
            {/* Customer Search UI */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Button 
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => setIsCustomerSearchOpen(true)}
                  >
                    <span className="flex items-center">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-70" />
                      {selectedCustomer 
                        ? customers.find(c => c.id === selectedCustomer)?.name 
                        : "Search customers..."}
                    </span>
                  </Button>
                  
                  <Dialog open={isCustomerSearchOpen} onOpenChange={setIsCustomerSearchOpen}>
                    <DialogContent className="p-0" style={{ maxWidth: 500 }}>
                      <Command className="rounded-lg border shadow-sm">
                        <CommandInput 
                          placeholder="Search customer by name, email or phone..."
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>No customers found.</CommandEmpty>
                          <CommandGroup heading="Customers">
                            {filteredCustomers.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={customer.id}
                                onSelect={(currentValue) => {
                                  setSelectedCustomer(customer.id);
                                  setIsCustomerSearchOpen(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span>{customer.name}</span>
                                  <span className="text-sm text-muted-foreground">{customer.phone}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {selectedCustomer && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => loadPurchaseHistory(selectedCustomer)}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
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
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center gap-2">
                      {product.type === 'subscription' && <Calendar className="h-4 w-4 text-blue-500" />}
                      {product.type === 'recharge' && <Zap className="h-4 w-4 text-amber-500" />}
                      {(!product.type || product.type === 'giftcard') && <Package className="h-4 w-4 text-green-500" />}
                      <span>{product.name} - ${product.wholesalePrice.toFixed(2)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
