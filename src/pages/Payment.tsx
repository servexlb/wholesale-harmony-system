
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/MainLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import { Copy, Check, AlertCircle, CreditCard, ExternalLink } from "lucide-react";
import { AdminNotification } from "@/lib/types";

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
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const wishMoneyAccount = "76349522";
  // Example bank account for direct transfers
  const bankAccount = {
    name: "Top-Up Account",
    number: "1234 5678 9012 3456",
    routingNumber: "987654321",
    swift: "YOURSWIFT"
  };
  
  // Binance Pay link - would be replaced with an actual merchant link in production
  const binancePayUrl = "https://www.binance.com/en/pay";
  
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

    // Create admin notification
    const adminNotification: Partial<AdminNotification> = {
      type: "payment_issue", // Using payment_issue as a placeholder for payment notification
      customerName: "Current User", // In a real app, you'd use the actual username
      serviceName: `Top-up $${amount} via Wish Money`,
      read: false,
      createdAt: new Date().toISOString()
    };

    // In a real implementation, this would be sent to the server
    console.log("ADMIN NOTIFICATION: User topped up with Wish Money:", {
      amount,
      timestamp: new Date().toISOString(),
      notes,
      adminNotification
    });
    
    setTimeout(() => {
      toast.success(`Your payment of $${amount} has been recorded`);
      
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 1500);
  };
  
  const handleCreditCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    toast("Redirecting to bank payment page...");
    // In a real app, this would redirect to a secure payment provider
    window.open("https://www.yourbank.com/payments", "_blank");
    
    setTimeout(() => {
      toast.success(`Your payment request of $${amount} has been initiated`);
      
      setPaymentSuccess(true);
    }, 1000);
  };
  
  const handleBinancePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    toast("Redirecting to Binance Pay...");
    // In a real app, this would include order details in the URL
    window.open(binancePayUrl, "_blank");
    
    setTimeout(() => {
      toast.success(`Your Binance Pay transaction of $${amount} has been initiated`);
      
      setPaymentSuccess(true);
    }, 1000);
  };
  
  const handleReturnToShopping = () => {
    navigate("/services");
  };

  // If the payment was successful, show the success screen
  if (paymentSuccess) {
    return (
      <MainLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="container py-8"
        >
          <div className="max-w-xl mx-auto text-center">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardHeader>
                <CardTitle className="text-2xl">Payment Successful</CardTitle>
                <CardDescription>
                  Your payment has been processed. Your account will be credited soon.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                
                <p className="mb-4">
                  Thank you for your payment. An administrator has been notified and your account will be credited shortly.
                </p>
                
                <p className="text-sm text-muted-foreground">
                  Payment method: {activeTab === "wish-money" ? "Wish Money" : activeTab === "credit-card" ? "Credit Card" : "Binance Pay"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Amount: ${amount}
                </p>
                
                <div className="mt-6">
                  <Button onClick={handleReturnToShopping} className="w-full">
                    Return to Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </MainLayout>
    );
  }

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
                  
                  <div className="flex items-start gap-2 mb-6 p-3 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 rounded-md">
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
                  <div className="bg-primary/5 p-4 rounded-md mb-6">
                    <div className="mb-2">
                      <p className="font-medium">Bank Account Details:</p>
                      <p className="text-sm mt-2">Account Name: {bankAccount.name}</p>
                      <p className="text-sm">Account Number: {bankAccount.number}</p>
                      <p className="text-sm">Routing Number: {bankAccount.routingNumber}</p>
                      <p className="text-sm">SWIFT: {bankAccount.swift}</p>
                    </div>
                  </div>
                  
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
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Bank Payment
                      <ExternalLink className="h-4 w-4 ml-2" />
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
                    >
                      Proceed with Binance Pay
                      <ExternalLink className="h-4 w-4 ml-2" />
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
