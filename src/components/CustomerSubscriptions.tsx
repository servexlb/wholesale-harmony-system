
import React from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { Key, Clock, CircleAlert, CircleX, CreditCard, UserCog } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Subscription } from '@/lib/types';
import { products } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CustomerSubscriptionsProps {
  subscriptions: Subscription[];
  customerId: string;
}

const CustomerSubscriptions: React.FC<CustomerSubscriptionsProps> = ({ 
  subscriptions,
  customerId
}) => {
  // Filter subscriptions for this customer
  const customerSubscriptions = subscriptions.filter(sub => sub.userId === customerId);
  
  const getSubscriptionStatus = (endDate: string) => {
    const today = new Date();
    const end = parseISO(endDate);
    const daysLeft = differenceInDays(end, today);
    
    if (daysLeft < 0) return { status: "expired", color: "destructive", icon: <CircleX className="h-4 w-4" /> };
    if (daysLeft === 0) return { status: "expires today", color: "destructive", icon: <CircleAlert className="h-4 w-4" /> };
    if (daysLeft <= 3) return { status: `expires in ${daysLeft} days`, color: "orange", icon: <CircleAlert className="h-4 w-4" /> };
    return { status: "active", color: "green", icon: <Clock className="h-4 w-4" /> };
  };

  const handleFixProfile = (subscriptionId: string) => {
    toast.success("Profile fix request submitted", {
      description: "Our team will review and fix the profile within 24 hours."
    });
  };

  const handleFixPayment = (subscriptionId: string) => {
    toast.success("Payment issue reported", {
      description: "Our team will contact you shortly to resolve the payment issue."
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-medium text-lg mb-4">Active Subscriptions</h3>
      
      {customerSubscriptions.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No active subscriptions found for this customer.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Credentials</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customerSubscriptions.map((subscription) => {
              const product = products.find(p => p.id === subscription.serviceId);
              const statusInfo = getSubscriptionStatus(subscription.endDate);
              
              return (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">{product?.name || 'Unknown Service'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        statusInfo.color === "green" ? "default" : 
                        statusInfo.color === "orange" ? "outline" : 
                        "destructive"
                      }
                      className={
                        statusInfo.color === "orange" 
                          ? "border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-100" 
                          : ""
                      }
                    >
                      <span className="flex items-center gap-1">
                        {statusInfo.icon}
                        {statusInfo.status}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>{subscription.endDate.split('T')[0]}</TableCell>
                  <TableCell>
                    {subscription.credentials ? (
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center cursor-pointer gap-1 text-sm">
                                <Key className="h-4 w-4 text-primary" />
                                <span className="font-medium">{subscription.credentials.email}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Password: {subscription.credentials.password}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No credentials</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1" 
                        onClick={() => handleFixProfile(subscription.id)}
                      >
                        <UserCog className="h-3 w-3" />
                        <span>Fix Profile</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={() => handleFixPayment(subscription.id)}
                      >
                        <CreditCard className="h-3 w-3" />
                        <span>Payment Issue</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default CustomerSubscriptions;
