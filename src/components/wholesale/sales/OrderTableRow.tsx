
import React, { memo } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import { Customer } from '@/lib/data';
import { WholesaleOrder } from '@/lib/types';

interface OrderTableRowProps {
  order: WholesaleOrder;
  customer: Customer | undefined;
  product: { id: string, name: string, type?: string } | undefined;
}

const OrderTableRow: React.FC<OrderTableRowProps> = ({ order, customer, product }) => {
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
};

export default memo(OrderTableRow);
