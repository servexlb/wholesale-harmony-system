
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText, Edit, Trash2, ShoppingBag } from 'lucide-react';
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

interface CustomerActionsMenuProps {
  customerId: string;
  onPurchaseForCustomer?: (customerId: string) => void;
}

const CustomerActionsMenu: React.FC<CustomerActionsMenuProps> = ({
  customerId,
  onPurchaseForCustomer
}) => {
  const { toast } = useToast();
  
  // Dialog states
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [ordersSheetOpen, setOrdersSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Handle purchase action
  const handlePurchase = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Purchase clicked for customer:", customerId);
    
    if (onPurchaseForCustomer) {
      setPurchaseDialogOpen(false);
      onPurchaseForCustomer(customerId);
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
    console.log("Edit clicked for customer:", customerId);
    
    setEditSheetOpen(false);
    toast({
      title: "Edit customer",
      description: `Editing customer ${customerId}`,
    });
    
    // Implement actual functionality later
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

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0 z-10"
        onClick={handleMenuClick}
        data-dropdown-trigger="true"
      >
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      
      <div 
        className="absolute right-0 top-0 mt-2 mr-2 opacity-0 hover:opacity-100 z-20 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center justify-start px-2 py-1 h-7 text-xs bg-white"
            onClick={(e) => handleActionButtonClick('purchase', e)}
            disabled={!onPurchaseForCustomer}
          >
            <ShoppingBag className="h-3 w-3 mr-1" />
            Purchase
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center justify-start px-2 py-1 h-7 text-xs bg-white"
            onClick={(e) => handleActionButtonClick('view-orders', e)}
          >
            <FileText className="h-3 w-3 mr-1" />
            Orders
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center justify-start px-2 py-1 h-7 text-xs bg-white"
            onClick={(e) => handleActionButtonClick('edit', e)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center justify-start px-2 py-1 h-7 text-xs bg-white text-red-500 hover:text-red-600"
            onClick={(e) => handleActionButtonClick('delete', e)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Purchase Confirmation Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Purchase for Customer</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to purchase for this customer?</p>
            <p className="text-sm text-muted-foreground mt-2">
              You will be redirected to the purchase form.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePurchase}>Continue</Button>
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
          <div className="py-4">
            <p>Edit customer ID: {customerId}</p>
            <div className="mt-4 border rounded p-4 text-center text-muted-foreground">
              Customer edit form will be implemented here
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
