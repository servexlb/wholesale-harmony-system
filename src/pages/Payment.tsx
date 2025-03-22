
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import MainLayout from "@/components/MainLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("10.00");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow valid currency input (numbers and one decimal point)
    const value = e.target.value;
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
    }
  };

  const handleAddFunds = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);

    // Simulate API call to process payment
    setTimeout(() => {
      // In a real app, this would update the user's balance in your backend
      toast.success(`Successfully added $${amount} to your balance`);
      setIsProcessing(false);
      navigate("/checkout");
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
        <h1 className="text-3xl font-bold mb-8">Add Funds</h1>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="amount">Amount to Add ($)</Label>
                <Input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="mb-2 block">Payment Method</Label>
                <RadioGroup 
                  defaultValue="credit-card"
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="flex items-center space-x-2 border p-4 rounded-md">
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
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={handleAddFunds}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Add Funds"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Payment;
