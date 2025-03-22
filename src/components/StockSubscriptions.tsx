
import React, { useState } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { Key, Clock, CircleAlert, CircleX, Search } from 'lucide-react';
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
import { Subscription } from '@/lib/types';
import { products, customers } from '@/lib/data';

interface StockSubscriptionsProps {
  subscriptions: Subscription[];
}

const StockSubscriptions: React.FC<StockSubscriptionsProps> = ({ subscriptions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
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
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Credentials</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
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
                        <div className="bg-muted/30 p-2 rounded text-sm">
                          <div><span className="font-medium">Email:</span> {subscription.credentials.email}</div>
                          <div><span className="font-medium">Password:</span> {subscription.credentials.password}</div>
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
