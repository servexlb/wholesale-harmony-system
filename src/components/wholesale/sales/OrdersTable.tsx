
import React from 'react';
import { Calendar } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Customer, Product, products } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { services } from '@/lib/mockData';

interface OrdersTableProps {
  filteredOrders: WholesaleOrder[];
  customers: Customer[];
}

const OrdersTable: React.FC<OrdersTableProps> = ({ filteredOrders, customers }) => {
  const isMobile = useIsMobile();
  
  // Helper function to find the product or service by id
  const findProductOrService = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) return product;
    
    const service = services.find(s => s.id === id);
    if (service) {
      return {
        id: service.id,
        name: service.name,
        type: service.type || 'service'
      };
    }
    
    return null;
  };
  
  if (isMobile) {
    return (
      <div className="p-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No orders found
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.slice(0, 20).map((order) => {
              const item = findProductOrService(order.serviceId);
              const customer = customers.find(c => c.id === order.customerId);
              
              return (
                <div key={order.id} className="border rounded-md p-3 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{item?.name || "Unknown Product"}</h3>
                      <p className="text-sm text-muted-foreground">{customer?.name || "Unknown"}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-mono ml-1 text-xs">{order.id.substring(0, 8)}...</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <span className="ml-1">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="ml-1">{order.quantity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <span className="ml-1 font-semibold">${order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.slice(0, 20).map((order) => {
              const item = findProductOrService(order.serviceId);
              const customer = customers.find(c => c.id === order.customerId);
              
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id}</TableCell>
                  <TableCell>{customer?.name || "Unknown"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item?.type === 'subscription' && <Calendar className="h-4 w-4 text-blue-500" />}
                      {item?.name || "Unknown Product"}
                    </div>
                  </TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
