
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import CustomerTable from '@/components/CustomerTable';
import SalesCalculator from '@/components/SalesCalculator';
import StockSubscriptions from '@/components/StockSubscriptions';
import { WholesaleOrder, Subscription } from '@/lib/types';
import { Product, Customer } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ShoppingBag } from 'lucide-react';

interface WholesaleTabContentProps {
  activeTab: string;
  products: Product[];
  customers: Customer[];
  wholesalerCustomers: Customer[];
  orders: WholesaleOrder[];
  subscriptions: Subscription[];
  currentWholesaler: string;
  handleOrderPlaced: (order: WholesaleOrder) => void;
}

const WholesaleTabContent: React.FC<WholesaleTabContentProps> = ({
  activeTab,
  products,
  customers,
  wholesalerCustomers,
  orders,
  subscriptions,
  currentWholesaler,
  handleOrderPlaced
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  
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
    
    // Create a new wholesale order
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
    
    handleOrderPlaced(newOrder);
    toast.success(`Order placed for ${wholesalerCustomers.find(c => c.id === selectedCustomer)?.name}`);
    
    // Reset form
    setSelectedCustomer('');
    setSelectedProduct('');
    setQuantity(1);
    setIsPurchaseDialogOpen(false);
  };
  
  return (
    <>      
      {activeTab === 'products' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Wholesale Products</h1>
            <Button onClick={() => setIsPurchaseDialogOpen(true)}>
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
      )}
      
      {activeTab === 'customers' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Manage Customers</h1>
            <Button onClick={() => setIsPurchaseDialogOpen(true)}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Purchase for Customer
            </Button>
          </div>
          <CustomerTable 
            subscriptions={subscriptions} 
            customers={wholesalerCustomers} 
            wholesalerId={currentWholesaler}
          />
        </motion.div>
      )}
      
      {activeTab === 'stock' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <StockSubscriptions subscriptions={subscriptions} />
        </motion.div>
      )}
      
      {activeTab === 'sales' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Sales Overview</h1>
          <SalesCalculator />
        </motion.div>
      )}
      
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium mb-4">Preferences</h2>
            <p className="text-muted-foreground mb-6">
              Settings panel is under development.
            </p>
            <Button variant="outline">
              Save Changes
            </Button>
          </div>
        </motion.div>
      )}
      
      {/* Purchase Dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent>
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
                  {wholesalerCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Product</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ${product.wholesalePrice.toFixed(2)}
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
            
            {selectedProduct && (
              <div className="p-4 bg-muted/40 rounded-md mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Price per unit:</span>
                  <span className="font-medium">
                    ${products.find(p => p.id === selectedProduct)?.wholesalePrice.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total price:</span>
                  <span className="text-primary">
                    ${(
                      (products.find(p => p.id === selectedProduct)?.wholesalePrice || 0) * quantity
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPurchaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchaseSubmit}>
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WholesaleTabContent;
