
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/MainLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import { Copy, Check, AlertCircle, CreditCard } from "lucide-react";

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("wish-money");
  const [amount, setAmount] = useState<string>("10.00");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const wishMoneyAccount = "76349522";
  
  const handleCopyAccount = () => {
    navigator.clipboard.writeText(wishMoneyAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow valid currency input (numbers and one decimal point)
    const value = e.target.value;
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
    }
  };

  const handleWishMoneySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);

    // Simulate API call to process payment
    setTimeout(() => {
      // Send notification to admin (in a real app, this would be done server-side)
      // In this demo, we'll just log it to console
      console.log("ADMIN NOTIFICATION: User topped up with Wish Money:", {
        amount,
        timestamp: new Date().toISOString(),
        notes
      });
      
      toast.success(`Successfully added $${amount} to your balance via Wish Money`);
      toast("Admin notified", {
        description: "The admin has been notified of your payment"
      });
      
      setIsProcessing(false);
      navigate("/checkout");
    }, 1500);
  };
  
  const handleCreditCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);

    // Simulate API call to process payment
    setTimeout(() => {
      toast.success(`Successfully added $${amount} to your balance via Credit Card`);
      setIsProcessing(false);
      navigate("/checkout");
    }, 1500);
  };
  
  const handleBinancePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);

    // Simulate API call to process payment
    setTimeout(() => {
      toast.success(`Successfully added $${amount} to your balance via Binance Pay`);
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
        
        <div className="max-w-xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium">Your Current Balance</h2>
                  <div className="text-3xl font-bold mt-2">$10.00</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Select a payment method to add funds to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="wish-money">Wish Money</TabsTrigger>
                  <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
                  <TabsTrigger value="binance">Binance Pay</TabsTrigger>
                </TabsList>
                
                <TabsContent value="wish-money" className="space-y-4">
                  <div className="bg-primary/5 p-4 rounded-md mb-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Wish Money Account Number:</p>
                        <p className="text-xl font-bold">{wishMoneyAccount}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCopyAccount}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 mb-6 p-3 bg-amber-50 text-amber-800 rounded-md">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Important:</p>
                      <p>Include your registered username in the payment notes so we can identify your payment.</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleWishMoneySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="wm-amount">Amount You Sent</Label>
                      <Input
                        id="wm-amount"
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes/Reference (Optional)</Label>
                      <Input
                        id="notes"
                        placeholder="Any reference you included in your payment"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Confirm Payment"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="credit-card" className="space-y-4">
                  <form onSubmit={handleCreditCardSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cc-amount">Amount to Add</Label>
                      <Input
                        id="cc-amount"
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cc-number">Card Number</Label>
                      <Input
                        id="cc-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cc-name">Cardholder Name</Label>
                      <Input
                        id="cc-name"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cc-expiry">Expiry Date</Label>
                        <Input
                          id="cc-expiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cc-cvc">CVC</Label>
                        <Input
                          id="cc-cvc"
                          placeholder="123"
                          value={cardCVC}
                          onChange={(e) => setCardCVC(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isProcessing}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {isProcessing ? "Processing..." : "Pay Now"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="binance" className="space-y-4">
                  <div className="bg-primary/5 p-4 rounded-md mb-6">
                    <p className="text-sm">
                      After clicking "Proceed with Binance Pay", you'll be redirected to complete the payment through Binance's secure payment gateway.
                    </p>
                  </div>
                  
                  <form onSubmit={handleBinancePaySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bp-amount">Amount to Add</Label>
                      <Input
                        id="bp-amount"
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Proceed with Binance Pay"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Payment;
