
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("account-balance");
  const [isProcessing, setIsProcessing] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  
  // Mock user balance - in a real app, this would come from your auth/user state
  const userBalance = 10.00; // Lower than the total to trigger insufficient balance scenario
  const total = 12.99;

  const handleCompletePurchase = () => {
    setIsProcessing(true);
    setInsufficientBalance(false);

    // Simulate a network request
    setTimeout(() => {
      if (paymentMethod === "account-balance" && userBalance < total) {
        setInsufficientBalance(true);
        setIsProcessing(false);
        return;
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

      // In a real app, you would send this to your backend
      console.log("Created order:", order);
      
      toast.success(
        paymentMethod === "account-balance"
          ? "Purchase complete! You'll receive your credentials shortly."
          : "Order placed! Payment is pending confirmation."
      );
      setIsProcessing(false);
      
      // Redirect to a confirmation page
      navigate("/dashboard");
    }, 1500);
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
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter your first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter your last name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Enter your phone number" />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
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

                {insufficientBalance && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient balance. Please add funds to your account or select a different payment method.
                    </AlertDescription>
                  </Alert>
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
                  onClick={handleCompletePurchase}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Complete Purchase"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Checkout;
