
import React, { useState } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { Key, Clock, CircleAlert, CircleX, Search, Phone, Copy, Check, Calendar, RefreshCw, CreditCard } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Subscription } from '@/lib/types';
import { products, customers } from '@/lib/data';
import { toast } from '@/lib/toast';
import { useIsMobile } from '@/hooks/use-mobile';
import SubscriptionActions from '@/components/customer/SubscriptionActions';

interface StockSubscriptionsProps {
  subscriptions: Subscription[];
  allowRenewal?: boolean;
}

const StockSubscriptions: React.FC<StockSubscriptionsProps> = ({ 
  subscriptions,
  allowRenewal = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // Filter active subscriptions only
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  
  // Sort subscriptions by end date (earliest first)
  const sortedSubscriptions = [...activeSubscriptions].sort((a, b) => {
    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
  });
  
  // Filter by search term if present
  const filteredSubscriptions = sortedSubscriptions.filter(sub => {
    const customer = customers.find(c => c.id === sub.userId);
    const product = products.find(p => p.id === sub.serviceId);
    
    return (
      (customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.credentials?.email || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  const getSubscriptionStatus = (endDate: string) => {
    const today = new Date();
    const end = parseISO(endDate);
    const daysLeft = differenceInDays(end, today);
    
    if (daysLeft < 0) return { status: "expired", color: "destructive", icon: <CircleX className="h-4 w-4" /> };
    if (daysLeft === 0) return { status: "expires today", color: "destructive", icon: <CircleAlert className="h-4 w-4" /> };
    if (daysLeft <= 3) return { status: `expires in ${daysLeft} days`, color: "orange", icon: <CircleAlert className="h-4 w-4" /> };
    return { status: `expires in ${daysLeft} days`, color: "green", icon: <Clock className="h-4 w-4" /> };
  };
  
  const copyToClipboard = (text: string, id: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setCopiedField(field);
      toast.success(`Copied ${field} to clipboard!`);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
        setCopiedField(null);
      }, 2000);
    });
  };

  const handleRenewSubscription = (subscription: Subscription) => {
    const product = products.find(p => p.id === subscription.serviceId);
    const customer = customers.find(c => c.id === subscription.userId);
    
    // In a real app, this would process a renewal
    toast.success(`Renewal initiated for ${customer?.name}'s ${product?.name} subscription`, {
      description: "The account will be renewed after payment processing"
    });
  };
  
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Stock Management</h2>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="search"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
              No active subscriptions found
            </div>
          ) : (
            filteredSubscriptions.map((subscription) => {
              const product = products.find(p => p.id === subscription.serviceId);
              const customer = customers.find(c => c.id === subscription.userId);
              const statusInfo = getSubscriptionStatus(subscription.endDate);
              
              return (
                <div key={subscription.id} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{customer?.name || 'Unknown'}</h3>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                        <Phone className="h-3 w-3" />
                        <span>{customer?.phone || 'N/A'}</span>
                        {customer?.phone && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 ml-1" 
                            onClick={() => copyToClipboard(customer.phone, subscription.id, 'phone')}
                          >
                            {copiedId === subscription.id && copiedField === 'phone' ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Service:</span>
                      <div>{product?.name || 'Unknown Service'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expiry Date:</span>
                      <div>{new Date(subscription.endDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  {subscription.durationMonths && (
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {subscription.durationMonths} month{subscription.durationMonths > 1 ? 's' : ''} subscription
                    </div>
                  )}
                  
                  {subscription.credentials ? (
                    <div className="bg-muted/30 p-3 rounded text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Email:</span> 
                        <div className="flex items-center gap-1 max-w-[180px] truncate">
                          <span className="truncate">{subscription.credentials.email}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 flex-shrink-0" 
                            onClick={() => copyToClipboard(subscription.credentials!.email, subscription.id, 'email')}
                          >
                            {copiedId === subscription.id && copiedField === 'email' ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Password:</span> 
                        <div className="flex items-center gap-1 max-w-[180px] truncate">
                          <span className="truncate">{subscription.credentials.password}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 flex-shrink-0" 
                            onClick={() => copyToClipboard(subscription.credentials!.password, subscription.id, 'password')}
                          >
                            {copiedId === subscription.id && copiedField === 'password' ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-1 text-xs h-7" 
                        onClick={() => {
                          const fullText = `Email: ${subscription.credentials!.email}\nPassword: ${subscription.credentials!.password}`;
                          copyToClipboard(fullText, subscription.id, 'all-credentials');
                        }}
                      >
                        {copiedId === subscription.id && copiedField === 'all-credentials' ? (
                          <><Check className="h-3 w-3 mr-1 text-green-500" /> Copied all</>
                        ) : (
                          <><Copy className="h-3 w-3 mr-1" /> Copy all credentials</>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">No credentials</div>
                  )}
                  
                  {allowRenewal && (
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full flex items-center justify-center gap-1 text-primary" 
                        onClick={() => handleRenewSubscription(subscription)}
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Renew Account</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Stock Management</h2>
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Credentials</TableHead>
              {allowRenewal && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={allowRenewal ? 8 : 7} className="h-24 text-center">
                  No active subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((subscription) => {
                const product = products.find(p => p.id === subscription.serviceId);
                const customer = customers.find(c => c.id === subscription.userId);
                const statusInfo = getSubscriptionStatus(subscription.endDate);
                
                return (
                  <TableRow key={subscription.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{customer?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{customer?.phone || 'N/A'}</span>
                        {customer?.phone && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 ml-1" 
                            onClick={() => copyToClipboard(customer.phone, subscription.id, 'phone')}
                          >
                            {copiedId === subscription.id && copiedField === 'phone' ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product?.name || 'Unknown Service'}</TableCell>
                    <TableCell>
                      {subscription.durationMonths ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{subscription.durationMonths} month{subscription.durationMonths > 1 ? 's' : ''}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
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
                    <TableCell>{new Date(subscription.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {subscription.credentials ? (
                        <div className="bg-muted/30 p-2 rounded text-sm space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Email:</span> 
                            <div className="flex items-center gap-1">
                              {subscription.credentials.email}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => copyToClipboard(subscription.credentials!.email, subscription.id, 'email')}
                              >
                                {copiedId === subscription.id && copiedField === 'email' ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Password:</span> 
                            <div className="flex items-center gap-1">
                              {subscription.credentials.password}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => copyToClipboard(subscription.credentials!.password, subscription.id, 'password')}
                              >
                                {copiedId === subscription.id && copiedField === 'password' ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-1 text-xs h-7" 
                            onClick={() => {
                              const fullText = `Email: ${subscription.credentials!.email}\nPassword: ${subscription.credentials!.password}`;
                              copyToClipboard(fullText, subscription.id, 'all-credentials');
                            }}
                          >
                            {copiedId === subscription.id && copiedField === 'all-credentials' ? (
                              <><Check className="h-3 w-3 mr-1 text-green-500" /> Copied all</>
                            ) : (
                              <><Copy className="h-3 w-3 mr-1" /> Copy all credentials</>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No credentials</span>
                      )}
                    </TableCell>
                    {allowRenewal && (
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 text-primary" 
                          onClick={() => handleRenewSubscription(subscription)}
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Renew Account</span>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StockSubscriptions;
