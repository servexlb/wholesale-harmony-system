
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import MainLayout from "@/components/MainLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("account-balance");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
  // Get current user balance from localStorage
  const userBalanceStr = localStorage.getItem('userBalance');
  const userBalance = userBalanceStr ? parseFloat(userBalanceStr) : 10.00; // Default to 10 to match original
  const total = 12.99;

  // Check if user has sufficient balance on component mount
  useEffect(() => {
    if (paymentMethod === "account-balance" && userBalance < total) {
      toast.error("Insufficient balance", {
        description: "You don't have enough funds to make this purchase"
      });
      // Redirect to payment page after a short delay
      setTimeout(() => {
        navigate("/payment");
      }, 1500);
    }
  }, []);

  const showPurchaseConfirmation = () => {
    // Check balance again when attempting purchase
    if (paymentMethod === "account-balance" && userBalance < total) {
      toast.error("Insufficient balance", {
        description: "You don't have enough funds to make this purchase"
      });
      // Redirect to payment page
      navigate("/payment");
      return;
    }
    
    setIsConfirmDialogOpen(true);
  };

  const handleCompletePurchase = () => {
    setIsProcessing(true);

    // Deduct the price from user balance immediately
    if (paymentMethod === "account-balance") {
      const newBalance = userBalance - total;
      localStorage.setItem('userBalance', newBalance.toString());
    }

    // Create order with pending status
    const order = {
      id: `order-${Date.now()}`,
      userId: "user-123", // In a real app, this would be the current user's ID
      serviceId: "service-123", // In a real app, this would be the actual service ID
      quantity: 1,
      totalPrice: total,
      status: "pending",
      createdAt: new Date().toISOString(),
      paymentStatus: paymentMethod === "account-balance" ? "paid" : "pending"
    };

    // Save order to localStorage
    const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    customerOrders.push(order);
    localStorage.setItem('customerOrders', JSON.stringify(customerOrders));

    // In a real app, you would send this to your backend
    console.log("Created order:", order);
    
    toast.success(
      paymentMethod === "account-balance"
        ? "Order placed! Your payment has been processed."
        : "Order placed! Payment is pending confirmation."
    );

    if (paymentMethod === "account-balance") {
      toast.success("Balance updated", {
        description: `$${total.toFixed(2)} has been deducted from your balance.`
      });
    }
    
    setIsProcessing(false);
    setIsConfirmDialogOpen(false);
    
    // Redirect to a confirmation page
    navigate("/dashboard");
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container py-8"
      >
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mt-0">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  defaultValue="account-balance"
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="flex items-center space-x-2 border p-4 rounded-md">
                    <RadioGroupItem value="account-balance" id="account-balance" />
                    <Label htmlFor="account-balance" className="flex-1">
                      Account Balance (${userBalance.toFixed(2)} available)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-md mt-2">
                    <RadioGroupItem value="credit-card" id="credit-card" />
                    <Label htmlFor="credit-card" className="flex-1">
                      Credit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-md mt-2">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1">
                      PayPal
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "account-balance" && userBalance < total && (
                  <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-md text-red-800 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Insufficient balance</p>
                      <p className="text-sm">Your current balance (${userBalance.toFixed(2)}) is less than the total (${total.toFixed(2)}). Please <Button variant="link" className="p-0 h-auto text-sm text-red-800 underline" onClick={() => navigate("/payment")}>add funds</Button> to continue.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <p>Netflix Premium Subscription</p>
                      <p className="text-sm text-gray-500">1-month subscription</p>
                    </div>
                    <p>$15.99</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p>$15.99</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Discount</p>
                    <p>-$3.00</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <p>Total</p>
                    <p>${total}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={showPurchaseConfirmation}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Complete Purchase"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Purchase Confirmation Dialog */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                Are you sure you want to complete this purchase?
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Total Price:</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Payment Method:</span>
                <span>
                  {paymentMethod === "account-balance" ? "Account Balance" : 
                   paymentMethod === "credit-card" ? "Credit Card" : "PayPal"}
                </span>
              </div>
              {paymentMethod === "account-balance" && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Remaining Balance After Purchase:</span>
                  <span>${(userBalance - total).toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCompletePurchase} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Confirm Purchase"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </MainLayout>
  );
};

export default Checkout;
