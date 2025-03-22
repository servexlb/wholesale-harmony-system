
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

interface OrdersTableProps {
  filteredOrders: WholesaleOrder[];
  customers: Customer[];
}

const OrdersTable: React.FC<OrdersTableProps> = ({ filteredOrders, customers }) => {
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
              const product = products.find(p => p.id === order.serviceId);
              const customer = customers.find(c => c.id === order.customerId);
              
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id}</TableCell>
                  <TableCell>{customer?.name || "Unknown"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product?.type === 'subscription' && <Calendar className="h-4 w-4 text-blue-500" />}
                      {product?.name || "Unknown Product"}
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
