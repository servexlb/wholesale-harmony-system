
import React, { useState } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { Key, Clock, CircleAlert, CircleX, Search, Phone, Copy, Check } from 'lucide-react';
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

interface StockSubscriptionsProps {
  subscriptions: Subscription[];
}

const StockSubscriptions: React.FC<StockSubscriptionsProps> = ({ subscriptions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
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
              <TableHead>Status</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Credentials</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
