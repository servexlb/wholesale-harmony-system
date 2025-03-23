
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, FileText, Edit, Trash2, ShoppingBag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { products } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Customer } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadServices } from "@/lib/productManager";
import { Service } from "@/lib/types";

interface CustomerActionsMenuProps {
  customerId: string;
  onPurchaseForCustomer?: (customerId: string) => void;
  customer?: Customer;
  onUpdateCustomer?: (customerId: string, updatedCustomer: Partial<Customer>) => void;
}

const CustomerActionsMenu: React.FC<CustomerActionsMenuProps> = ({
  customerId,
  onPurchaseForCustomer,
  customer,
  onUpdateCustomer
}) => {
  const { toast } = useToast();
  
  // Dialog states
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [ordersSheetOpen, setOrdersSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState('streaming');
  const [selectedDuration, setSelectedDuration] = useState<string>("1");
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  
  // Customer edit state
  const [editedCustomer, setEditedCustomer] = useState<{
    name: string;
    email: string;
    phone: string;
    company: string;
  }>({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  
  // Load available services from product manager
  useEffect(() => {
    setAvailableServices(loadServices());
    
    const handleServiceUpdated = () => {
      setAvailableServices(loadServices());
    };
    
    window.addEventListener('service-updated', handleServiceUpdated);
    window.addEventListener('service-added', handleServiceUpdated);
    window.addEventListener('service-deleted', handleServiceUpdated);
    
    return () => {
      window.removeEventListener('service-updated', handleServiceUpdated);
      window.removeEventListener('service-added', handleServiceUpdated);
      window.removeEventListener('service-deleted', handleServiceUpdated);
    };
  }, []);
  
  // Update editedCustomer when customer prop changes or edit dialog opens
  useEffect(() => {
    if (customer && editSheetOpen) {
      setEditedCustomer({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || ''
      });
    }
  }, [customer, editSheetOpen]);

  // Handle purchase action
  const handlePurchase = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Purchase clicked for customer:", customerId, "Product:", selectedProduct, "Quantity:", quantity);
    
    if (onPurchaseForCustomer && selectedProduct) {
      setPurchaseDialogOpen(false);
      setSelectedProduct('');
      setQuantity(1);
      onPurchaseForCustomer(customerId);
      
      toast({
        title: "Purchase initiated",
        description: `Purchase for customer ${customerId} has been initiated`,
      });
    } else if (!selectedProduct) {
      toast({
        title: "Product selection required",
        description: "Please select a product before proceeding",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Action unavailable",
        description: "Purchase functionality is not available at this time",
        variant: "destructive",
      });
    }
  };

  // Handle view orders action
  const handleViewOrders = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("View orders clicked for customer:", customerId);
    
    setOrdersSheetOpen(false);
    toast({
      title: "View orders",
      description: `Viewing orders for customer ${customerId}`,
    });
    
    // Implement actual functionality later
  };

  // Handle edit customer action
  const handleEditCustomer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Edit submitted for customer:", customerId, "Updated data:", editedCustomer);
    
    // Call the onUpdateCustomer prop if provided
    if (onUpdateCustomer) {
      onUpdateCustomer(customerId, editedCustomer);
    }
    
    setEditSheetOpen(false);
    
    toast({
      title: "Customer updated",
      description: `Customer ${editedCustomer.name} has been updated successfully`,
    });
  };
  
  // Handle input change for the edit form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle delete customer action
  const handleDeleteCustomer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Delete clicked for customer:", customerId);
    
    setDeleteDialogOpen(false);
    toast({
      title: "Delete customer",
      description: `Deleting customer ${customerId}`,
      variant: "destructive",
    });
    
    // Implement actual functionality later
  };

  // Handle menu button click to prevent row expansion
  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Show appropriate action based on button type
  const handleActionButtonClick = (action: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Action button clicked:", action);
    
    switch (action) {
      case 'purchase':
        if (onPurchaseForCustomer) {
          setPurchaseDialogOpen(true);
        } else {
          toast({
            title: "Action unavailable",
            description: "Purchase functionality is not available at this time",
            variant: "destructive",
          });
        }
        break;
      case 'view-orders':
        setOrdersSheetOpen(true);
        break;
      case 'edit':
        setEditSheetOpen(true);
        break;
      case 'delete':
        setDeleteDialogOpen(true);
        break;
    }
  };

  const getProductsByCategory = () => {
    if (activeTab === 'streaming') {
      return availableServices.filter(s => s.type === 'subscription');
    } else {
      return availableServices.filter(s => s.type !== 'subscription');
    }
  };

  const getSelectedProductDetails = () => {
    return availableServices.find(s => s.id === selectedProduct);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={handleMenuClick} data-dropdown-trigger="true">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 z-10">
            <span className="sr-only">Open menu</span>
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px] bg-white">
          <DropdownMenuItem 
            onClick={(e) => handleActionButtonClick('purchase', e)}
            disabled={!onPurchaseForCustomer}
            className="flex items-center cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Purchase
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => handleActionButtonClick('view-orders', e)}
            className="flex items-center cursor-pointer"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Orders
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => handleActionButtonClick('edit', e)}
            className="flex items-center cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => handleActionButtonClick('delete', e)}
            className="flex items-center cursor-pointer text-red-500 focus:text-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Purchase Dialog with Product Selection */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Purchase for Customer</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Tabs defaultValue="streaming" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="streaming">Streaming Services</TabsTrigger>
                <TabsTrigger value="other">Other Products</TabsTrigger>
              </TabsList>
              <TabsContent value="streaming" className="pt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Select Streaming Service</label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a streaming service" />
                    </SelectTrigger>
                    <SelectContent>
                      {getProductsByCategory().map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex flex-col">
                            <span>{service.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ${service.wholesalePrice?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProduct && activeTab === 'streaming' && (
                  <div>
                    <label className="text-sm font-medium mt-4 mb-1 block">Subscription Duration</label>
                    <div className="flex gap-2 flex-wrap">
                      {['1', '3', '6', '12'].map((duration) => (
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
              </TabsContent>
              <TabsContent value="other" className="pt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Select Product</label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {getProductsByCategory().map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex flex-col">
                            <span>{product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ${product.wholesalePrice?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mt-4 mb-1 block">Quantity</label>
                  <Input 
                    type="number" 
                    min="1"
                    value={quantity.toString()}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            {selectedProduct && (
              <div className="p-4 bg-muted/40 rounded-md mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Product:</span>
                  <span className="font-medium">
                    {getSelectedProductDetails()?.name || 'Unknown Product'}
                  </span>
                </div>
                {getSelectedProductDetails()?.description && (
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Description:</span>
                    <span className="text-sm text-right max-w-[250px]">
                      {getSelectedProductDetails()?.description}
                    </span>
                  </div>
                )}
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Price per unit:</span>
                  <span className="font-medium">
                    ${getSelectedProductDetails()?.wholesalePrice?.toFixed(2) || "0.00"}
                  </span>
                </div>
                {activeTab === 'streaming' && (
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {selectedDuration} {parseInt(selectedDuration) === 1 ? 'month' : 'months'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>Total price:</span>
                  <span className="text-primary">
                    ${activeTab === 'streaming' 
                      ? ((getSelectedProductDetails()?.wholesalePrice || 0) * parseInt(selectedDuration)).toFixed(2)
                      : ((getSelectedProductDetails()?.wholesalePrice || 0) * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handlePurchase}
              disabled={!selectedProduct}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Orders Sheet */}
      <Sheet open={ordersSheetOpen} onOpenChange={setOrdersSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Customer Orders</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <p>Orders for customer ID: {customerId}</p>
            <div className="mt-4 border rounded p-4 text-center text-muted-foreground">
              No order history available
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleViewOrders}>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      {/* Edit Customer Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Customer</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name"
                  name="name"
                  value={editedCustomer.name}
                  onChange={handleInputChange}
                  placeholder="Customer name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={editedCustomer.email}
                  onChange={handleInputChange}
                  placeholder="customer@example.com"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone"
                  name="phone"
                  value={editedCustomer.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="company">Company</Label>
                <Input 
                  id="company"
                  name="company"
                  value={editedCustomer.company}
                  onChange={handleInputChange}
                  placeholder="Company name"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setEditSheetOpen(false)}>Cancel</Button>
            <Button onClick={handleEditCustomer}>Save Changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer 
              and all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCustomer}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CustomerActionsMenu;
