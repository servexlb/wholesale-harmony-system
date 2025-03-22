import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Customer, 
  customers as allCustomers, 
  fixSubscriptionProfile, 
  reportPaymentIssue, 
  reportPasswordIssue,
  getProductById 
} from '@/lib/data';
import { Subscription } from '@/lib/types';
import { 
  MoreHorizontal, 
  Search, 
  Phone, 
  Edit,
  Trash2, 
  FileText, 
  UserPlus,
  Key,
  UserCog,
  CreditCard,
  KeyRound,
  Calendar,
  ShoppingBag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Mock data for subscriptions - in a real app this would come from props
import { products } from '@/lib/data';

interface CustomerTableProps {
  subscriptions?: Subscription[];
  customers?: Customer[];
  wholesalerId?: string;
  onPurchaseForCustomer?: (customerId: string) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ 
  subscriptions = [], 
  customers = allCustomers,
  wholesalerId = '',
  onPurchaseForCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCustomers = customers.filter(customer => 
    (customer.wholesalerId === wholesalerId) && 
    (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm))
  );

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="subtle-focus-ring">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Active Subscriptions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <CustomerRow 
                    key={customer.id} 
                    customer={customer} 
                    subscriptions={subscriptions.filter(sub => sub.userId === customer.id)}
                    onPurchaseForCustomer={onPurchaseForCustomer}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

interface CustomerRowProps {
  customer: Customer;
  subscriptions: Subscription[];
  onPurchaseForCustomer?: (customerId: string) => void;
}

const CustomerRow: React.FC<CustomerRowProps> = ({ customer, subscriptions, onPurchaseForCustomer }) => {
  const [expanded, setExpanded] = useState(false);

  const getSubscriptionStatusColor = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const daysLeft = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return "destructive";
    if (daysLeft === 0) return "destructive";
    if (daysLeft <= 3) return "orange"; 
    return "green";
  };

  const handleFixProfile = async (subscriptionId: string, serviceId: string) => {
    const product = getProductById(serviceId);
    
    if (product) {
      await fixSubscriptionProfile(
        subscriptionId, 
        customer.id, 
        customer.name, 
        product.name
      );
      
      toast.success("Profile fix request submitted", {
        description: "Our team will review and fix the profile within 24 hours."
      });
    }
  };

  const handleFixPayment = async (subscriptionId: string, serviceId: string) => {
    const product = getProductById(serviceId);
    
    if (product) {
      await reportPaymentIssue(
        subscriptionId, 
        customer.id, 
        customer.name, 
        product.name
      );
      
      toast.success("Payment issue reported", {
        description: "Our team will contact you shortly to resolve the payment issue."
      });
    }
  };

  const handlePasswordReset = async (subscriptionId: string, serviceId: string) => {
    const product = getProductById(serviceId);
    
    if (product) {
      await reportPasswordIssue(
        subscriptionId, 
        customer.id, 
        customer.name, 
        product.name
      );
      
      toast.success("Password reset requested", {
        description: "Our team will reset the password and provide new credentials soon."
      });
    }
  };

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="hover:bg-muted/50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
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
                      <TooltipTrigger asChild>
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
                      <TooltipContent>
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
                    onPurchaseForCustomer(customer.id);
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
        </TableCell>
      </motion.tr>
      {expanded && subscriptions.length > 0 && (
        <TableRow>
          <TableCell colSpan={4} className="bg-muted/20 p-0">
            <div className="p-4">
              <h4 className="font-medium mb-2">Subscription Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subscriptions.map((sub) => {
                  const product = products.find(p => p.id === sub.serviceId);
                  const statusColor = getSubscriptionStatusColor(sub.endDate);
                  
                  return (
                    <div key={sub.id} className="bg-white p-3 rounded-md border shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{product?.name || 'Unknown Service'}</h5>
                          <p className="text-sm text-muted-foreground">
                            Expires: {new Date(sub.endDate).toLocaleDateString()}
                          </p>
                          {sub.durationMonths && (
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {sub.durationMonths} month{sub.durationMonths > 1 ? 's' : ''} subscription
                            </p>
                          )}
                        </div>
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
                          {statusColor === "green" ? "Active" : 
                           statusColor === "orange" ? "Expiring Soon" : 
                           "Expired"}
                        </Badge>
                      </div>
                      
                      {sub.credentials && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex items-center gap-1 mb-1">
                            <Key className="h-3 w-3 text-primary" />
                            <span className="text-sm font-medium">Credentials</span>
                          </div>
                          <div className="bg-muted/30 p-2 rounded text-sm">
                            <div><span className="font-medium">Email:</span> {sub.credentials.email}</div>
                            <div><span className="font-medium">Password:</span> {sub.credentials.password}</div>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-t flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1 text-xs" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFixProfile(sub.id, sub.serviceId);
                          }}
                        >
                          <UserCog className="h-3 w-3" />
                          <span>Fix Profile</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFixPayment(sub.id, sub.serviceId);
                          }}
                        >
                          <CreditCard className="h-3 w-3" />
                          <span>Payment Issue</span>
                        </Button>
                        {sub.credentials && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePasswordReset(sub.id, sub.serviceId);
                            }}
                          >
                            <KeyRound className="h-3 w-3" />
                            <span>Reset Password</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default CustomerTable;
