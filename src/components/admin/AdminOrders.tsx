import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order } from "@/lib/types";
import { format } from "date-fns";

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Fetch orders from localStorage
    const storedOrders = localStorage.getItem('orders');
    const parsedOrders = storedOrders ? JSON.parse(storedOrders) : [];
    
    // Process orders to ensure all products have a name property
    const processedOrders = processOrders(parsedOrders);
    
    setOrders(processedOrders);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            A list of all orders placed by customers.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer ID</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customerId}</TableCell>
                <TableCell>
                  {order.products.map((product, index) => (
                    <div key={index}>
                      {product.name}: {product.quantity} x ${product.price}
                    </div>
                  ))}
                </TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{format(new Date(order.createdAt), 'PPP')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const processOrders = (orders: any[]) => {
  return orders.map(order => {
    // Ensure all products have a name property
    if (order.products) {
      order.products = order.products.map((product: any) => {
        if (!product.name) {
          // Add a name property if it doesn't exist
          return {
            ...product,
            name: `Product ${product.productId}`
          };
        }
        return product;
      });
    }
    return order;
  });
};

export { AdminOrders };
