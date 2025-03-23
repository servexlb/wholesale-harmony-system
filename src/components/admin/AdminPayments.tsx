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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Payment, PaymentStatus } from "@/lib/types";
import { Check, X, AlertTriangle, ExternalLink, Filter } from "lucide-react";
import { format } from "date-fns";
import { useFirestore } from "@/hooks/useFirestore";
import { toast } from "@/lib/toast";

const mockPayments: Payment[] = [
  {
    id: "pmt-1",
    orderId: "ord-1",
    userId: "user1",
    userEmail: "john.doe@example.com",
    userName: "John Doe",
    amount: 250.00,
    method: "bank_transfer",
    status: "pending",
    createdAt: new Date().toISOString(),
    receiptUrl: "https://example.com/receipt1.pdf",
    transactionId: "tx_12345",
  },
  {
    id: "pmt-2",
    orderId: "ord-2",
    userId: "user2",
    userEmail: "jane.smith@example.com",
    userName: "Jane Smith",
    amount: 100.00,
    method: "paypal",
    status: "pending",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    transactionId: "tx_67890",
  },
  {
    id: "pmt-3",
    orderId: "ord-3",
    userId: "user3",
    userEmail: "alex.johnson@example.com",
    userName: "Alex Johnson",
    amount: 75.50,
    method: "credit_card",
    status: "approved",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    reviewedAt: new Date(Date.now() - 86400000).toISOString(),
    transactionId: "tx_54321",
  },
  {
    id: "pmt-4",
    orderId: "ord-4",
    userId: "user4",
    userEmail: "sarah.parker@example.com",
    userName: "Sarah Parker",
    amount: 180.00,
    method: "usdt",
    status: "pending",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    transactionId: "tx_usdt789",
  },
  {
    id: "pmt-5",
    orderId: "ord-5",
    userId: "user5",
    userEmail: "mike.wilson@example.com",
    userName: "Mike Wilson",
    amount: 320.00,
    method: "wish_money",
    status: "pending",
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    transactionId: "tx_wish123",
  }
];

const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(mockPayments);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [notes, setNotes] = useState("");
  
  const { updateDocument } = useFirestore("payments");

  useEffect(() => {
    setPayments(mockPayments);
  }, []);

  useEffect(() => {
    let filtered = payments;
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }
    
    if (filterMethod !== "all") {
      filtered = filtered.filter(payment => payment.method === filterMethod);
    }
    
    setFilteredPayments(filtered);
  }, [filterStatus, filterMethod, payments]);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setNotes(payment.notes || "");
    setDetailsOpen(true);
  };

  const handleStatusChange = async (paymentId: string, newStatus: PaymentStatus) => {
    try {
      const updatedPayments = payments.map(payment => 
        payment.id === paymentId 
          ? { 
              ...payment, 
              status: newStatus, 
              reviewedAt: new Date().toISOString(),
              notes: notes 
            } 
          : payment
      );
      
      setPayments(updatedPayments);
      
      toast.success(`Payment ${newStatus === "approved" ? "approved" : "rejected"} successfully`);
      setDetailsOpen(false);
      
      if (newStatus === "approved" && selectedPayment) {
        toast.success(`Added $${selectedPayment.amount.toFixed(2)} to ${selectedPayment.userName}'s balance`);
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-300">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300">Rejected</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">Completed</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300">Failed</Badge>;
      case "refunded":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-300">Refunded</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatMethod = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card";
      case "bank_transfer":
        return "Bank Transfer";
      case "paypal":
        return "PayPal";
      case "usdt":
        return "USDT";
      case "wish_money":
        return "Wish Money";
      case "balance":
        return "Account Balance";
      default:
        return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "credit_card":
        return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-300">Credit Card</Badge>;
      case "bank_transfer":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-300">Bank Transfer</Badge>;
      case "paypal":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-300">PayPal</Badge>;
      case "usdt":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">USDT</Badge>;
      case "wish_money":
        return <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-300">Wish Money</Badge>;
      case "balance":
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">Account Balance</Badge>;
      default:
        return <Badge variant="outline">{formatMethod(method)}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Payment Management</CardTitle>
          <CardDescription>
            Review and approve customer payment requests
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="usdt">USDT</SelectItem>
              <SelectItem value="wish_money">Wish Money</SelectItem>
              <SelectItem value="balance">Account Balance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No payments found matching the selected filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>
                    {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">{payment.userName}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{getMethodBadge(payment.method)}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(payment)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          {selectedPayment && (
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Payment Details</DialogTitle>
                <DialogDescription>
                  Review payment information and take action
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-4">
                <div className="flex justify-between">
                  <span className="font-medium">Payment ID:</span>
                  <span>{selectedPayment.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Order ID:</span>
                  <span>{selectedPayment.orderId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{format(new Date(selectedPayment.createdAt), 'PPP')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Customer:</span>
                  <span>{selectedPayment.userName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{selectedPayment.userEmail}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="font-bold">${selectedPayment.amount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Payment Method:</span>
                  <span>{formatMethod(selectedPayment.method)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span>{getStatusBadge(selectedPayment.status)}</span>
                </div>
                
                {selectedPayment.transactionId && (
                  <div className="flex justify-between">
                    <span className="font-medium">Transaction ID:</span>
                    <span>{selectedPayment.transactionId}</span>
                  </div>
                )}
                
                {selectedPayment.receiptUrl && (
                  <div className="flex justify-between">
                    <span className="font-medium">Receipt:</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(selectedPayment.receiptUrl, '_blank')}
                    >
                      View Receipt
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {selectedPayment.reviewedAt && (
                  <div className="flex justify-between">
                    <span className="font-medium">Reviewed:</span>
                    <span>{format(new Date(selectedPayment.reviewedAt), 'PPP')}</span>
                  </div>
                )}
                
                <div className="pt-4">
                  <div className="font-medium mb-2">Admin Notes:</div>
                  <Textarea
                    placeholder="Add notes about this payment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={selectedPayment.status !== 'pending'}
                    className="w-full"
                  />
                </div>
              </div>
              
              {selectedPayment.status === 'pending' && (
                <DialogFooter className="flex justify-between sm:justify-between">
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={() => handleStatusChange(selectedPayment.id, 'rejected')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="default"
                    onClick={() => handleStatusChange(selectedPayment.id, 'approved')}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminPayments;
