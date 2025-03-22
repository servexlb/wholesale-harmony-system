
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            if (onPurchaseForCustomer) {
              onPurchaseForCustomer(customerId);
            }
          }}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Purchase for Customer
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileText className="h-4 w-4 mr-2" />
          View Orders
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="h-4 w-4 mr-2" />
          Edit Customer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Customer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomerActionsMenu;
