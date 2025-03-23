
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { CreditCard, Repeat, AlertCircle, Copy, Check, Clock, User, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCustomerById, addCustomerBalance } from "@/lib/data";

const UserPaymentOptions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("wish-money");
  const [amount, setAmount] = useState<number | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Get current user ID (check for both customer and wholesaler)
  const customerId = localStorage.getItem('currentUserId');
  const wholesalerId = localStorage.getItem('wholesalerId');
  const userId = wholesalerId || customerId || '';
  
  useEffect(() => {
    // Check if user is authenticated
    if (wholesalerId) {
      setIsAuthenticated(true);
    } else if (customerId && customerId.startsWith('user_')) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      toast.error("Authentication required", {
        description: "Please log in to access payment options"
      });
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    
    // Load user balance from localStorage only for authenticated users
    let balance = 0;
    
    if (wholesalerId) {
      const balanceStr = localStorage.getItem(`userBalance_${wholesalerId}`);
      balance = balanceStr ? parseFloat(balanceStr) : 0;
    } else if (customerId && customerId.startsWith('user_')) {
      const customer = getCustomerById(customerId);
      if (customer) {
        balance = customer.balance || 0;
      } else {
        const balanceStr = localStorage.getItem(`userBalance_${customerId}`);
        balance = balanceStr ? parseFloat(balanceStr) : 0;
      }
    }
    
    setUserBalance(balance);
  }, [customerId, wholesalerId, navigate]);
  
  // If not authenticated, show login required component
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Balance & Payments</h1>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-medium mb-2">Authentication Required</h2>
            <p className="text-center text-muted-foreground mb-6">
              You need to be logged in to access payment options.
            </p>
            <div className="flex gap-4">
              <Button variant="default" onClick={() => navigate('/login')}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <Button variant="outline" onClick={() => navigate('/register')}>
                Register
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const wishMoneyAccount = "76349522";
  
  const handleCopyAccount = () => {
    navigator.clipboard.writeText(wishMoneyAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const updateUserBalance = (newAmount: number) => {
    const newBalance = userBalance + newAmount;
    
    // Update balance in localStorage
    if (wholesalerId) {
      localStorage.setItem(`userBalance_${wholesalerId}`, newBalance.toString());
    } else if (customerId) {
      // For regular customers, update through the data function
      addCustomerBalance(customerId, newAmount);
    }
    
    setUserBalance(newBalance);
  };
  
  const handleCreditCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      setIsProcessing(false);
      return;
    }
    
    // Simulate processing time
    setTimeout(() => {
      updateUserBalance(amount);
      
      toast.success(`Payment of $${amount.toFixed(2)} processed successfully!`, {
        description: "Your balance has been updated."
      });
      
      resetForm();
      setIsProcessing(false);
      
      // Redirect back to dashboard after successful payment
      setTimeout(() => navigate("/dashboard"), 1500);
    }, 1500);
  };
  
  const handleWishMoneySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      setIsProcessing(false);
      return;
    }
    
    // Simulate processing time
    setTimeout(() => {
      updateUserBalance(amount);
      
      toast.success("Wish Money payment processed successfully!", {
        description: "Your balance has been updated."
      });
      
      resetForm();
      setIsProcessing(false);
      
      // Redirect back to dashboard after successful payment
      setTimeout(() => navigate("/dashboard"), 1500);
    }, 1500);
  };
  
  const handleBinancePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      setIsProcessing(false);
      return;
    }
    
    // Simulate processing time
    setTimeout(() => {
      updateUserBalance(amount);
      
      toast.success("Binance Pay transaction processed successfully!", { 
        description: "Your balance has been updated."
      });
      
      resetForm();
      setIsProcessing(false);
      
      // Redirect back to dashboard after successful payment
      setTimeout(() => navigate("/dashboard"), 1500);
    }, 1500);
  };
  
  const resetForm = () => {
    setAmount(null);
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCVC("");
    setNotes("");
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Balance & Payments</h1>
      
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">Your Current Balance</h2>
              <div className="text-3xl font-bold mt-2">${userBalance.toFixed(2)}</div>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                className="w-full md:w-auto"
                onClick={() => navigate("/dashboard/transaction-history")}
              >
                <Repeat className="h-4 w-4 mr-2" />
                Transaction History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Add Funds to Your Account</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="wish-money">Wish Money</TabsTrigger>
            <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
            <TabsTrigger value="binance">Binance Pay</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wish-money" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pay with Wish Money</CardTitle>
                <CardDescription>
                  Send your payment to our Wish Money account and we'll credit your balance
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      type="number"
                      placeholder="Enter amount"
                      min="10"
                      step="0.01"
                      value={amount || ''}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || null)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Confirm Payment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="credit-card" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pay with Credit Card</CardTitle>
                <CardDescription>Securely add funds using your credit or debit card</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreditCardSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cc-amount">Amount to Add</Label>
                    <Input
                      id="cc-amount"
                      type="number"
                      placeholder="Enter amount"
                      min="10"
                      step="0.01"
                      value={amount || ''}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || null)}
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
                  
                  <Button type="submit" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="binance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pay with Binance Pay</CardTitle>
                <CardDescription>
                  Quickly and securely add funds using Binance Pay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBinancePaySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bp-amount">Amount to Add</Label>
                    <Input
                      id="bp-amount"
                      type="number"
                      placeholder="Enter amount"
                      min="10"
                      step="0.01"
                      value={amount || ''}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || null)}
                      required
                    />
                  </div>
                  
                  <div className="bg-primary/5 p-4 rounded-md mb-2">
                    <p className="text-sm">
                      After clicking "Proceed with Binance Pay", you'll be redirected to complete the payment through Binance's secure payment gateway.
                    </p>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Proceed with Binance Pay
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserPaymentOptions;
