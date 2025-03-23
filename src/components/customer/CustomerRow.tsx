
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Calendar, Key } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { Subscription } from '@/lib/types';
import { Customer, products } from '@/lib/data';
import SubscriptionStatusBadge, { getSubscriptionStatusColor } from './SubscriptionStatusBadge';
import CustomerActionsMenu from './CustomerActionsMenu';
import ExpandedSubscriptionDetails from './ExpandedSubscriptionDetails';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface CustomerRowProps {
  customer: Customer;
  subscriptions: Subscription[];
  onPurchaseForCustomer?: (customerId: string) => void;
}

const CustomerRow: React.FC<CustomerRowProps> = ({ 
  customer, 
  subscriptions, 
  onPurchaseForCustomer 
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleRowClick = (e: React.MouseEvent) => {
    // Skip expansion when clicking on dropdown elements
    if (
      (e.target as HTMLElement).closest('.dropdown-action') || 
      (e.target as HTMLElement).closest('[role="menuitem"]') ||
      (e.target as HTMLElement).closest('[data-radix-menu-content]')
    ) {
      return;
    }
    setExpanded(!expanded);
  };

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="hover:bg-muted/50 cursor-pointer relative"
        onClick={handleRowClick}
      >
        <TableCell className="font-medium">
          <Link 
            to={`/wholesale/customers/${customer.id}`}
            className="hover:underline transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {customer.name}
          </Link>
        </TableCell>
        <TableCell>
          <div className="flex items-center text-sm">
            <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
            <span>{customer.phone}</span>
          </div>
        </TableCell>
        <TableCell>
          {subscriptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {subscriptions.map((sub) => {
                const product = products.find(p => p.id === sub.serviceId);
                const statusColor = getSubscriptionStatusColor(sub.endDate);
                
                return (
                  <TooltipProvider key={sub.id}>
                    <Tooltip>
                      <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Badge 
                          variant={
                            statusColor === "green" ? "default" : 
                            statusColor === "orange" ? "outline" : 
                            "destructive"
                          }
                          className={
                            statusColor === "orange" 
                              ? "border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-100" 
                              : ""
                          }
                        >
                          {product?.name || 'Unknown'}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="z-[90]">
                        <div className="space-y-1">
                          <p className="font-medium">{product?.name || 'Unknown'}</p>
                          <p>Expires: {new Date(sub.endDate).toLocaleDateString()}</p>
                          {sub.durationMonths && (
                            <p className="text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {sub.durationMonths} month{sub.durationMonths > 1 ? 's' : ''} subscription
                            </p>
                          )}
                          {sub.credentials && (
                            <div className="pt-1 border-t">
                              <div className="flex items-center gap-1">
                                <Key className="h-3 w-3" />
                                <span className="text-xs">{sub.credentials.email}</span>
                              </div>
                              <div className="text-xs">
                                Password: {sub.credentials.password}
                              </div>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">No active subscriptions</span>
          )}
        </TableCell>
        <TableCell className="text-right">
          <div className="z-[100] relative dropdown-action" onClick={(e) => e.stopPropagation()}>
            <CustomerActionsMenu 
              customerId={customer.id} 
              onPurchaseForCustomer={onPurchaseForCustomer} 
            />
          </div>
        </TableCell>
      </motion.tr>
      {expanded && subscriptions.length > 0 && (
        <TableRow>
          <TableCell colSpan={4} className="bg-muted/20 p-0">
            <ExpandedSubscriptionDetails 
              subscriptions={subscriptions} 
              customerId={customer.id} 
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default CustomerRow;
