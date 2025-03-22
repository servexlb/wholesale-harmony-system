
import React, { memo, useMemo } from 'react';
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

// Create a memoized product/service lookup map for better performance
const createProductMap = () => {
  const productMap = new Map();
  
  // Add products to map
  products.forEach(product => {
    productMap.set(product.id, {
      id: product.id,
      name: product.name,
      type: product.type || 'product'
    });
  });
  
  // Add services to map
  services.forEach(service => {
    productMap.set(service.id, {
      id: service.id,
      name: service.name,
      type: service.type || 'service'
    });
  });
  
  return productMap;
};

// Create a memoized table row component to prevent re-renders
const TableRowMemo = memo(({ 
  order, 
  customer, 
  product 
}: { 
  order: WholesaleOrder, 
  customer: Customer | undefined, 
  product: { id: string, name: string, type?: string } | undefined 
}) => {
  return (
    <TableRow>
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
});

// Create a memoized mobile card component
const MobileOrderCard = memo(({ 
  order, 
  customer, 
  product 
}: { 
  order: WholesaleOrder, 
  customer: Customer | undefined, 
  product: { id: string, name: string, type?: string } | undefined 
}) => {
  return (
    <div key={order.id} className="border rounded-md p-3 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium">{product?.name || "Unknown Product"}</h3>
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
});

const OrdersTable: React.FC<OrdersTableProps> = ({ filteredOrders, customers }) => {
  const isMobile = useIsMobile();
  
  // Create a memoized product lookup map
  const productMap = useMemo(() => createProductMap(), []);
  
  // Create a memoized customer lookup map
  const customerMap = useMemo(() => {
    const map = new Map();
    customers.forEach(customer => {
      map.set(customer.id, customer);
    });
    return map;
  }, [customers]);
  
  // Limit the number of orders rendered to improve performance
  const displayOrders = useMemo(() => {
    return filteredOrders.slice(0, 20);
  }, [filteredOrders]);
  
  if (isMobile) {
    return (
      <div className="p-3">
        {displayOrders.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No orders found
          </div>
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order) => (
              <MobileOrderCard
                key={order.id}
                order={order}
                customer={customerMap.get(order.customerId)}
                product={productMap.get(order.serviceId)}
              />
            ))}
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
          {displayOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            displayOrders.map((order) => (
              <TableRowMemo
                key={order.id}
                order={order}
                customer={customerMap.get(order.customerId)}
                product={productMap.get(order.serviceId)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default memo(OrdersTable);
