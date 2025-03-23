
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

interface CustomerActionsMenuProps {
  customerId: string;
  onPurchaseForCustomer?: (customerId: string) => void;
}

const CustomerActionsMenu: React.FC<CustomerActionsMenuProps> = ({
  customerId,
  onPurchaseForCustomer
}) => {
  // Handle purchase action
  const handlePurchase = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Purchase clicked for customer:", customerId);
    if (onPurchaseForCustomer) {
      onPurchaseForCustomer(customerId);
    }
  };

  // Handle view orders action
  const handleViewOrders = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("View orders clicked for customer:", customerId);
    // Add actual implementation later
  };

  // Handle edit customer action
  const handleEditCustomer = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Edit clicked for customer:", customerId);
    // Add actual implementation later
  };

  // Handle delete customer action
  const handleDeleteCustomer = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Delete clicked for customer:", customerId);
    // Add actual implementation later
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="z-50 bg-popover shadow-md"
        onClick={(e) => e.stopPropagation()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handlePurchase}
          disabled={!onPurchaseForCustomer}
          className="cursor-pointer hover:bg-accent focus:bg-accent"
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Purchase for Customer
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleViewOrders}
          className="cursor-pointer hover:bg-accent focus:bg-accent"
        >
          <FileText className="h-4 w-4 mr-2" />
          View Orders
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleEditCustomer}
          className="cursor-pointer hover:bg-accent focus:bg-accent"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Customer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive cursor-pointer hover:bg-accent focus:bg-accent"
          onClick={handleDeleteCustomer}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Customer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomerActionsMenu;
