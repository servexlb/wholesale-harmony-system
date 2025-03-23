
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText, Edit, Trash2, ShoppingBag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CustomerActionsMenuProps {
  customerId: string;
  onPurchaseForCustomer?: (customerId: string) => void;
}

const CustomerActionsMenu: React.FC<CustomerActionsMenuProps> = ({
  customerId,
  onPurchaseForCustomer
}) => {
  const { toast } = useToast();

  // Handle purchase action
  const handlePurchase = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Purchase clicked for customer:", customerId);
    
    if (onPurchaseForCustomer) {
      onPurchaseForCustomer(customerId);
      toast({
        title: "Purchase initiated",
        description: `Starting purchase process for customer ${customerId}`,
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
    
    toast({
      title: "Delete customer",
      description: `Deleting customer ${customerId}`,
      variant: "destructive",
    });
    
    // Implement actual functionality later
  };

  // Handle menu open/close to prevent row expansion
  const handleMenuOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={handleMenuOpen}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          data-dropdown-trigger="true"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="z-[9999] bg-white border shadow-md"
        onClick={(e) => e.stopPropagation()}
        onPointerDownOutside={(e) => e.preventDefault()}
        forceMount
      >
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handlePurchase}
          disabled={!onPurchaseForCustomer}
          className="cursor-pointer hover:bg-accent focus:bg-accent flex items-center"
          data-action="purchase"
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Purchase for Customer
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleViewOrders}
          className="cursor-pointer hover:bg-accent focus:bg-accent flex items-center"
          data-action="view-orders"
        >
          <FileText className="h-4 w-4 mr-2" />
          View Orders
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleEditCustomer}
          className="cursor-pointer hover:bg-accent focus:bg-accent flex items-center"
          data-action="edit"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Customer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive cursor-pointer hover:bg-accent focus:bg-accent flex items-center"
          onClick={handleDeleteCustomer}
          data-action="delete"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Customer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomerActionsMenu;
