
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from Supabase first
        const { data: supabaseOrders, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching orders from Supabase:', error);
          // Fall back to localStorage if there's an error
          loadOrdersFromLocalStorage();
        } else if (supabaseOrders && supabaseOrders.length > 0) {
          // Process orders to ensure all products have a name property
          const processedOrders = processOrders(supabaseOrders);
          setOrders(processedOrders);
        } else {
          // If no orders in Supabase, fall back to localStorage
          loadOrdersFromLocalStorage();
        }
      } catch (error) {
        console.error('Error in fetchOrders:', error);
        // Fall back to localStorage
        loadOrdersFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadOrdersFromLocalStorage = () => {
      // Fetch orders from localStorage
      const storedOrders = localStorage.getItem('orders');
      const parsedOrders = storedOrders ? JSON.parse(storedOrders) : [];
      
      // Process orders to ensure all products have a name property
      const processedOrders = processOrders(parsedOrders);
      
      setOrders(processedOrders);
    };
    
    fetchOrders();
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
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No orders found.
          </div>
        ) : (
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
                  <TableCell>{order.customerId || order.userId}</TableCell>
                  <TableCell>
                    {order.products && Array.isArray(order.products) ? (
                      order.products.map((product, index) => (
                        <div key={index}>
                          {product.name || `Product ${product.productId}`}: {product.quantity} x ${product.price}
                        </div>
                      ))
                    ) : (
                      <div>{order.serviceName || 'Unknown Product'}: {order.quantity || 1} x ${order.totalPrice}</div>
                    )}
                  </TableCell>
                  <TableCell>${order.total?.toFixed(2) || order.totalPrice?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>
                    {order.createdAt ? format(new Date(order.createdAt), 'PPP') : 'Unknown date'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export const processOrders = (orders: any[]) => {
  if (!orders || !Array.isArray(orders)) return [];
  
  return orders.map(order => {
    // Ensure all products have a name property
    if (order.products && Array.isArray(order.products)) {
      order.products = order.products.map((product: any) => {
        if (!product) return { name: 'Unknown', quantity: 1, price: 0 };
        
        if (!product.name) {
          // Add a name property if it doesn't exist
          return {
            ...product,
            name: `Product ${product.productId || 'Unknown'}`
          };
        }
        return product;
      });
    }
    
    // Handle case where products is not defined
    if (!order.products) {
      order.products = [];
    }
    
    return order;
  });
};

export { AdminOrders };
