
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

// Mock data for payments
const mockPayments: Payment[] = [
  {
    id: "pmt-1",
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
    userId: "user3",
    userEmail: "alex.johnson@example.com",
    userName: "Alex Johnson",
    amount: 75.50,
    method: "credit_card",
    status: "approved",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    reviewedAt: new Date(Date.now() - 86400000).toISOString(),
    reviewedBy: "admin1",
    transactionId: "tx_54321",
  }
];

const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(mockPayments);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [notes, setNotes] = useState("");
  
  const { updateDocument } = useFirestore("payments");

  useEffect(() => {
    // This would normally fetch from your backend/Firestore
    // For now using mock data
    setPayments(mockPayments);
  }, []);

  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(payments.filter(payment => payment.status === filterStatus));
    }
  }, [filterStatus, payments]);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setNotes(payment.notes || "");
    setDetailsOpen(true);
  };

  const handleStatusChange = async (paymentId: string, newStatus: PaymentStatus) => {
    try {
      // In a real app, this would update the database
      const updatedPayments = payments.map(payment => 
        payment.id === paymentId 
          ? { 
              ...payment, 
              status: newStatus, 
              reviewedAt: new Date().toISOString(), 
              reviewedBy: "current-admin",
              notes: notes 
            } 
          : payment
      );
      
      setPayments(updatedPayments);
      
      // This would normally call your backend or Firestore
      // await updateDocument(paymentId, { 
      //   status: newStatus, 
      //   reviewedAt: new Date().toISOString(), 
      //   reviewedBy: "current-admin",
      //   notes 
      // });
      
      toast.success(`Payment ${newStatus === "approved" ? "approved" : "rejected"} successfully`);
      setDetailsOpen(false);
      
      // If payment is approved, update user balance
      if (newStatus === "approved" && selectedPayment) {
        // In a real app, this would update the user's balance in the database
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
      default:
        return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No payments found matching the selected filter.
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
                  <TableCell>{formatMethod(payment.method)}</TableCell>
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
        
        {/* Payment Details Dialog */}
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
