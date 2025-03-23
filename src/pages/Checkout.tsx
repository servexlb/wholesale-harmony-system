import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, Wallet } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import MainLayout from "@/components/MainLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import PurchaseSuccessDialog from "@/components/PurchaseSuccessDialog";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("account-balance");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [requireCredentials, setRequireCredentials] = useState(true);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [purchasedOrder, setPurchasedOrder] = useState<{
    id: string;
    serviceId: string;
    serviceName: string;
    totalPrice: number;
    credentials: any | null;
    createdAt: string;
  } | null>(null);
  
  // Get current user ID and check if authenticated
  const userId = localStorage.getItem('currentUserId');
  
  // Get current user balance from localStorage
  const userBalanceStr = localStorage.getItem(`userBalance_${userId}`);
  const userBalance = userBalanceStr && userId ? parseFloat(userBalanceStr) : 0;
  const total = 12.99;

  // Check if user is authenticated on component mount
  useEffect(() => {
    // Check if user is logged in
    const isUserLoggedIn = !!userId && userId.startsWith('user_');
    setIsAuthenticated(isUserLoggedIn);
    
    if (!isUserLoggedIn) {
      toast.error("Authentication required", {
        description: "Please log in to make a purchase"
      });
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }
    
    // Now check balance for authenticated users
    if (paymentMethod === "account-balance" && userBalance < total) {
      toast.error("Insufficient balance", {
        description: "You don't have enough funds to make this purchase"
      });
      // Redirect to payment page after a short delay
      setTimeout(() => {
        navigate("/payment");
      }, 1500);
    }
    
    // Load credential requirement setting
    const savedSetting = localStorage.getItem("requireSubscriptionCredentials");
    if (savedSetting !== null) {
      const requireCreds = savedSetting === "true";
      setRequireCredentials(requireCreds);
      setShowCredentials(requireCreds);
    }
    
    // Listen for settings changes
    const handleCredentialSettingChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.requireCredentials !== undefined) {
        setRequireCredentials(customEvent.detail.requireCredentials);
        setShowCredentials(customEvent.detail.requireCredentials);
      }
    };
    
    window.addEventListener('credential-setting-changed', handleCredentialSettingChanged);
    
    return () => {
      window.removeEventListener('credential-setting-changed', handleCredentialSettingChanged);
    };
  }, []);

  const showPurchaseConfirmation = () => {
    // Check authentication again when attempting purchase
    if (!isAuthenticated) {
      toast.error("Authentication required", {
        description: "Please log in to make a purchase"
      });
      navigate("/login");
      return;
    }
    
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
    // Final authentication check
    if (!isAuthenticated) {
      toast.error("Authentication required");
      navigate("/login");
      return;
    }
    
    // Validate credentials if required
    if (showCredentials && (credentials.email.trim() === '' || credentials.password.trim() === '')) {
      toast.error("Missing credentials", {
        description: "Please provide both email and password for the subscription account"
      });
      return;
    }
    
    setIsProcessing(true);

    // Deduct the price from user balance immediately
    if (paymentMethod === "account-balance") {
      const newBalance = userBalance - total;
      localStorage.setItem(`userBalance_${userId}`, newBalance.toString());
    }

    // Check if there are available stock credentials
    const stockCredentials = checkAvailableCredentials("service-netflix");

    // Create order with pending status
    const order = {
      id: `order-${Date.now()}`,
      userId: userId,
      serviceId: "service-netflix", // In a real app, this would be the actual service ID
      quantity: 1,
      totalPrice: total,
      status: "pending",
      createdAt: new Date().toISOString(),
      paymentStatus: paymentMethod === "account-balance" ? "paid" : "pending",
      ...(showCredentials ? { credentials } : {}),
      ...(stockCredentials ? { credentials: stockCredentials } : {})
    };

    // Save order to localStorage
    const customerOrders = JSON.parse(localStorage.getItem(`customerOrders_${userId}`) || '[]');
    customerOrders.push(order);
    localStorage.setItem(`customerOrders_${userId}`, JSON.stringify(customerOrders));

    // In a real app, you would send this to your backend
    console.log("Created order:", order);
    
    // Set purchased order for success dialog
    setPurchasedOrder({
      id: order.id,
      serviceId: "service-netflix",
      serviceName: "Netflix Premium",
      totalPrice: total,
      credentials: order.credentials || null,
      createdAt: order.createdAt
    });
    
    setIsProcessing(false);
    setIsConfirmDialogOpen(false);
    setIsSuccessDialogOpen(true);
  };

  // Helper function to check for available credentials in stock
  const checkAvailableCredentials = (serviceId: string) => {
    // In a real app, this would check a database
    // For demo purposes, we'll always return credentials for Netflix
    
    if (serviceId === "service-netflix") {
      return {
        email: `user_${Math.floor(1000 + Math.random() * 9000)}@netflix-example.com`,
        password: `NetflixPass${Math.floor(1000 + Math.random() * 9000)}!`,
        notes: "This Netflix account is ready to use immediately. Login at netflix.com."
      };
    }
    
    // No stock credentials available
    return null;
  };

  // If not authenticated, show a message
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="container py-8"
        >
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You need to be logged in to make a purchase.</p>
              <div className="flex gap-4">
                <Button onClick={() => navigate('/login')} className="flex-1">
                  Sign In
                </Button>
                <Button variant="outline" onClick={() => navigate('/register')} className="flex-1">
                  Register
                </Button>
              </div>
            </CardContent>
          </Card>
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
                
                {/* Subscription credentials section */}
                {showCredentials && (
                  <div className="mt-6 p-4 border rounded-md">
                    <h3 className="text-base font-medium mb-3">Subscription Credentials</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Please provide the email and password you'd like to use for this subscription service.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="subscription-email">Email</Label>
                        <Input 
                          id="subscription-email" 
                          type="email"
                          value={credentials.email}
                          onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your-email@example.com"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="subscription-password">Password</Label>
                        <Input 
                          id="subscription-password" 
                          type="password"
                          value={credentials.password}
                          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="••••••••"
                          className="mt-1"
                        />
                      </div>
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
                  disabled={isProcessing || (showCredentials && (credentials.email === '' || credentials.password === ''))}
                >
                  {isProcessing ? "Processing..." : "Complete Purchase"}
                </Button>
              </CardFooter>
            </Card>
            
            {userBalance < total && paymentMethod === "account-balance" && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/payment")}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Top Up Balance
                </Button>
              </div>
            )}
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
              {showCredentials && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Subscription Credentials</h4>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span>Email:</span>
                    <span>{credentials.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Password:</span>
                    <span>••••••••</span>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCompletePurchase} 
                disabled={isProcessing || (showCredentials && (credentials.email === '' || credentials.password === ''))}
              >
                {isProcessing ? "Processing..." : "Confirm Purchase"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Purchase Success Dialog */}
        {purchasedOrder && (
          <PurchaseSuccessDialog
            open={isSuccessDialogOpen}
            onOpenChange={setIsSuccessDialogOpen}
            orderId={purchasedOrder.id}
            serviceId={purchasedOrder.serviceId}
            serviceName={purchasedOrder.serviceName}
            amount={purchasedOrder.totalPrice}
            credentials={purchasedOrder.credentials}
            purchaseDate={purchasedOrder.createdAt}
          />
        )}
      </motion.div>
    </MainLayout>
  );
};

export default Checkout;
