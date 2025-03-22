import React, { useState, useCallback } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { Key, Clock, CircleAlert, CircleX, Search, Phone, Copy, Check, Calendar, RefreshCw, CreditCard } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  onRenew?: (subscription: Subscription) => void;
  renewedSubscriptions?: string[];
}

const StockSubscriptions: React.FC<StockSubscriptionsProps> = ({
  subscriptions,
  allowRenewal = false,
  onRenew,
  renewedSubscriptions = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const customer = customers.find(c => c.id === subscription.userId);
    const product = products.find(p => p.id === subscription.serviceId);

    if (!customer || !product) return false;

    const searchStr = `${customer.name} ${customer.phone} ${customer.email} ${product.name}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const getSubscriptionStatus = (subscription: Subscription): { label: string; variant: "default" | "secondary" | "destructive"; icon: React.ReactNode } => {
    const expiryDate = parseISO(subscription.endDate);
    const daysUntilExpiry = differenceInDays(expiryDate, new Date());

    if (subscription.status === "canceled") {
      return { label: "Canceled", variant: "destructive", icon: <CircleX className="h-3 w-3 mr-1" /> };
    } else if (daysUntilExpiry <= 0) {
      return { label: "Expired", variant: "destructive", icon: <CircleX className="h-3 w-3 mr-1" /> };
    } else if (daysUntilExpiry <= 7) {
      return { label: "Expiring Soon", variant: "secondary", icon: <CircleAlert className="h-3 w-3 mr-1" /> };
    } else {
      return { label: "Active", variant: "default", icon: <Clock className="h-3 w-3 mr-1" /> };
    }
  };

  const handleCopyToClipboard = (text: string, id: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedField(null);
    }, 2000);
  };

  const handleRenewSubscription = (subscription: Subscription) => {
    if (onRenew) {
      onRenew(subscription);
    } else {
      const product = products.find(p => p.id === subscription.serviceId);
      const customer = customers.find(c => c.id === subscription.userId);

      // Default behavior if no onRenew handler is provided
      toast.success(`Renewal initiated for ${customer?.name}'s ${product?.name} subscription`, {
        description: "The account will be renewed after payment processing"
      });
    }
  };

  const getCustomerName = (userId: string): string => {
    const customer = customers.find(c => c.id === userId);
    return customer ? customer.name : "Unknown Customer";
  };

  const getProductName = (serviceId: string): string => {
    const product = products.find(p => p.id === serviceId);
    return product ? product.name : "Unknown Service";
  };

  // Render for mobile screens
  if (isMobile) {
    return (
      <div className="space-y-6">
        <div className="sticky top-16 z-10 bg-background pb-4 pt-2">
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
            type="search"
            icon={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        {filteredSubscriptions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No subscriptions found matching your search.
            </CardContent>
          </Card>
        ) : (
          filteredSubscriptions.map((subscription) => {
            const { label, variant, icon } = getSubscriptionStatus(subscription);
            const customer = customers.find(c => c.id === subscription.userId);
            const product = products.find(p => p.id === subscription.serviceId);

            return (
              <Card key={subscription.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {product?.name}
                  </CardTitle>
                  <Badge variant={variant}>
                    {icon}
                    {label}
                  </Badge>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      <span className="font-bold">{customer?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {customer?.phone}
                    </div>
                  </div>

                  {subscription.credentials ? (
                    <div className="rounded-md border p-3 mt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Key className="h-3 w-3" />
                          Email:
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyToClipboard(subscription.credentials!.email, subscription.id, "Email")}
                        >
                          {copiedId === subscription.id && copiedField === "Email" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">{subscription.credentials.email}</div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Key className="h-3 w-3" />
                          Password:
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyToClipboard(subscription.credentials!.password, subscription.id, "Password")}
                        >
                          {copiedId === subscription.id && copiedField === "Password" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">{subscription.credentials.password}</div>
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
                        disabled={renewedSubscriptions.includes(subscription.id)}
                      >
                        {renewedSubscriptions.includes(subscription.id) ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Renewed</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3" />
                            <span>Renew Account</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    );
  }

  // Render for desktop screens
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Management</CardTitle>
        <CardDescription>Manage your active subscriptions and their credentials</CardDescription>
        <div className="mt-4">
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
            type="search"
            icon={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Customer</TableHead>
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
                const { label, variant, icon } = getSubscriptionStatus(subscription);
                const customer = customers.find(c => c.id === subscription.userId);
                const product = products.find(p => p.id === subscription.serviceId);

                return (
                  <TableRow key={subscription.id}>
                    <TableCell>{product?.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold">{customer?.name}</p>
                        <p className="text-muted-foreground text-sm">{customer?.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant}>
                        {icon}
                        {label}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(subscription.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {subscription.credentials ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Key className="h-3 w-3" />
                              Email:
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyToClipboard(subscription.credentials!.email, subscription.id, "Email")}
                            >
                              {copiedId === subscription.id && copiedField === "Email" ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground">{subscription.credentials.email}</div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Key className="h-3 w-3" />
                              Password:
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyToClipboard(subscription.credentials!.password, subscription.id, "Password")}
                            >
                              {copiedId === subscription.id && copiedField === "Password" ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground">{subscription.credentials.password}</div>
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
                          disabled={renewedSubscriptions.includes(subscription.id)}
                        >
                          {renewedSubscriptions.includes(subscription.id) ? (
                            <>
                              <Check className="h-3 w-3" />
                              <span>Renewed</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3" />
                              <span>Renew Account</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StockSubscriptions;
