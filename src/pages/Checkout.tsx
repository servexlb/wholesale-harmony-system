
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Wallet, CheckCircle2, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Service, Order } from '@/lib/types';
import { fulfillOrderWithCredentials } from '@/lib/credentialUtils';
import PurchaseSuccessDialog from '@/components/PurchaseSuccessDialog';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [service, setService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('balance');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    username: '',
    notes: ''
  });
  const [showCredentialFields, setShowCredentialFields] = useState(false);
  
  // Get current user ID
  const userId = localStorage.getItem('currentUserId') || 'guest';
  
  // Get user balance from localStorage
  const userBalanceStr = localStorage.getItem(`userBalance_${userId}`);
  const userBalance = userBalanceStr ? parseFloat(userBalanceStr) : 0;

  useEffect(() => {
    // Get service from location state
    if (location.state?.service) {
      setService(location.state.service);
      
      // Set default quantity and duration
      if (location.state.quantity) {
        setQuantity(location.state.quantity);
      }
      
      if (location.state.duration) {
        setDuration(location.state.duration);
      }
      
      // Set default account ID if provided
      if (location.state.accountId) {
        setAccountId(location.state.accountId);
      }
      
      // Determine if we should show credential fields
      const isSubscription = location.state.service.type === 'subscription';
      const requireCredentials = localStorage.getItem("requireSubscriptionCredentials") === "true";
      setShowCredentialFields(isSubscription && requireCredentials);
    } else {
      // No service provided, redirect to services page
      navigate('/services');
    }
  }, [location, navigate]);

  // Calculate total price
  const calculateTotal = () => {
    if (!service) return 0;
    
    // For subscription services, multiply by duration
    if (service.type === 'subscription') {
      return service.price * duration;
    }
    
    // For other services, multiply by quantity
    return service.price * quantity;
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleDurationChange = (value: string) => {
    setDuration(parseInt(value));
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
  };

  const handleCredentialChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckout = async () => {
    // Validate required fields
    if (service?.type === 'topup' && !accountId) {
      toast.error("Account ID required", {
        description: "Please enter your account ID for this service"
      });
      return;
    }
    
    // Validate credentials if required
    if (showCredentialFields && (!credentials.email || !credentials.password)) {
      toast.error("Credentials required", {
        description: "Please provide both email and password for this subscription"
      });
      return;
    }
    
    // Calculate total price
    const totalPrice = calculateTotal();
    
    // Check if user has sufficient balance for balance payment
    if (paymentMethod === 'balance' && userBalance < totalPrice) {
      toast.error("Insufficient balance", {
        description: "You don't have enough funds to complete this purchase"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Deduct from balance if using balance payment
      if (paymentMethod === 'balance') {
        const newBalance = userBalance - totalPrice;
        localStorage.setItem(`userBalance_${userId}`, newBalance.toString());
      }
      
      // Create order
      const order: Order = {
        id: `order-${Date.now()}`,
        userId,
        products: [], // Add empty products array to satisfy the type
        total: totalPrice,
        serviceId: service?.id || '',
        serviceName: service?.name || '',
        quantity: service?.type === 'subscription' ? 1 : quantity,
        durationMonths: service?.type === 'subscription' ? duration : undefined,
        totalPrice,
        status: 'completed',
        paymentMethod,
        accountId: service?.type === 'topup' ? accountId : undefined,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
        ...(showCredentialFields ? {
          credentials: {
            email: credentials.email,
            password: credentials.password,
            username: credentials.username || undefined,
            notes: credentials.notes || undefined
          }
        } : {})
      };
      
      // Process order with credentials if available
      const processedOrder = fulfillOrderWithCredentials(order);
      
      // Save order to localStorage
      const orderStorageKey = `customerOrders_${userId}`;
      const customerOrders = JSON.parse(localStorage.getItem(orderStorageKey) || '[]');
      customerOrders.push(processedOrder);
      localStorage.setItem(orderStorageKey, JSON.stringify(customerOrders));
      
      // Set completed order for success dialog
      setCompletedOrder(processedOrder);
      
      // Show success dialog
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast.error("Checkout failed", {
        description: "There was an error processing your payment. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!service) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading checkout...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
              <CardDescription>
                Complete your purchase of {service.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service details */}
              <div className="flex items-start space-x-4">
                <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                  <img 
                    src={service.image || '/placeholder.svg'} 
                    alt={service.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <div className="mt-1">
                    <span className="text-sm font-medium">${service.price.toFixed(2)}</span>
                    {service.type === 'subscription' && <span className="text-sm text-muted-foreground"> / month</span>}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Quantity or Duration */}
              {service.type === 'subscription' ? (
                <div className="space-y-2">
                  <Label htmlFor="duration">Subscription Duration</Label>
                  <Select 
                    value={duration.toString()} 
                    onValueChange={handleDurationChange}
                  >
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {(service.availableMonths || [1, 3, 6, 12]).map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {month} {month === 1 ? 'month' : 'months'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                  />
                </div>
              )}
              
              {/* Account ID for topup services */}
              {service.type === 'topup' && (
                <div className="space-y-2">
                  <Label htmlFor="accountId">
                    Account ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="accountId"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="Enter your account ID"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    This ID is required to process your recharge
                  </p>
                </div>
              )}
              
              {/* Credential fields for subscription services */}
              {showCredentialFields && (
                <div className="space-y-4 p-4 border rounded-md">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Account Credentials</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Please provide your account credentials for this subscription
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        value={credentials.email}
                        onChange={(e) => handleCredentialChange('email', e.target.value)}
                        placeholder="your-email@example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                      <Input
                        id="password"
                        type="password"
                        value={credentials.password}
                        onChange={(e) => handleCredentialChange('password', e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Username (Optional)</Label>
                      <Input
                        id="username"
                        value={credentials.username}
                        onChange={(e) => handleCredentialChange('username', e.target.value)}
                        placeholder="Your username"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="credentialNotes">Notes (Optional)</Label>
                      <Textarea
                        id="credentialNotes"
                        value={credentials.notes}
                        onChange={(e) => handleCredentialChange('notes', e.target.value)}
                        placeholder="Any additional information"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Additional notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or requirements"
                  rows={3}
                />
              </div>
              
              <Separator />
              
              {/* Payment method */}
              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={handlePaymentMethodChange}
                  className="grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                  <div className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer ${paymentMethod === 'balance' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="balance" id="balance" />
                    <Label htmlFor="balance" className="flex items-center cursor-pointer">
                      <Wallet className="h-4 w-4 mr-2" />
                      <div>
                        <div>Account Balance</div>
                        <div className="text-sm text-muted-foreground">
                          Available: ${userBalance.toFixed(2)}
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <div>
                        <div>Credit/Debit Card</div>
                        <div className="text-sm text-muted-foreground">
                          Secure payment
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span>{service.name}</span>
                </div>
                
                {service.type === 'subscription' ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{duration} {duration === 1 ? 'month' : 'months'}</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>{quantity}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span>${service.price.toFixed(2)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              
              {/* Payment method warning */}
              {paymentMethod === 'balance' && userBalance < calculateTotal() && (
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Insufficient balance</p>
                    <p>Please add funds or choose another payment method.</p>
                  </div>
                </div>
              )}
              
              {/* Service delivery info */}
              <div className="bg-muted p-3 rounded-md space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    Delivery: {service.deliveryTime || 'Within 24 hours'}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <ShieldCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Secure transaction</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
                disabled={
                  isProcessing || 
                  (service.type === 'topup' && !accountId) ||
                  (paymentMethod === 'balance' && userBalance < calculateTotal()) ||
                  (showCredentialFields && (!credentials.email || !credentials.password))
                }
              >
                {isProcessing ? 'Processing...' : 'Complete Purchase'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Success dialog */}
      {completedOrder && (
        <PurchaseSuccessDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          orderId={completedOrder.id}
          serviceId={completedOrder.serviceId}
          serviceName={completedOrder.serviceName}
          amount={completedOrder.totalPrice}
          credentials={completedOrder.credentials}
          purchaseDate={completedOrder.createdAt}
        />
      )}
    </div>
  );
};

export default Checkout;
