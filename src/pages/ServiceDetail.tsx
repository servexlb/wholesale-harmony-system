
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Tag, Check, CreditCard, Zap, RotateCw, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { Service, ServiceCategory } from '@/lib/types';
import { getServiceById, getCategoryById } from '@/lib/mockData';
import { toast } from '@/lib/toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState<string>("1");
  const [accountId, setAccountId] = useState("");

  // Get current user ID
  const userId = localStorage.getItem('currentUserId') || 'guest';
  
  // Get user-specific balance from localStorage
  const userBalanceStr = localStorage.getItem(`userBalance_${userId}`);
  const userBalance = userBalanceStr ? parseFloat(userBalanceStr) : 0;

  useEffect(() => {
    if (id) {
      // Fetch service data
      setLoading(true);
      setTimeout(() => {
        const foundService = getServiceById(id);
        setService(foundService || null);
        
        if (foundService && foundService.categoryId) {
          const foundCategory = getCategoryById(foundService.categoryId);
          setCategory(foundCategory || null);
        }
        
        setLoading(false);
      }, 500);
    }
  }, [id]);

  // Helper to determine if service is a subscription
  const isSubscription = service?.type === "subscription";
  
  // Helper to determine if service is a recharge
  const isRecharge = service?.type === "recharge";
  
  // Helper to determine if service is a gift card
  const isGiftCard = service?.type === "giftcard";
  
  // Helper to determine if service should use months feature
  const shouldUseMonths = isSubscription || 
    (category?.name.toLowerCase().includes('streaming') || 
    category?.name.toLowerCase().includes('vpn') || 
    category?.name.toLowerCase().includes('security') ||
    category?.name.toLowerCase().includes('productivity'));

  const showPurchaseConfirmation = () => {
    // Reset fields
    setAccountId("");
    setQuantity(1);
    
    // For subscriptions, set default selected duration
    if (shouldUseMonths) {
      if (service?.availableMonths && service.availableMonths.length > 0) {
        setSelectedDuration(service.availableMonths[0].toString());
      } else {
        setSelectedDuration("1");
      }
    }
    
    setIsConfirmDialogOpen(true);
  };

  const handleBuyNow = () => {
    // Validate account ID for recharge services
    if (isRecharge && !accountId.trim()) {
      toast.error("Account ID required", {
        description: "Please enter your account ID for this recharge"
      });
      return;
    }
    
    console.log("Buy now clicked for service:", service);
    setIsPurchasing(true);
    
    // Calculate final price based on months or quantity
    const finalPrice = shouldUseMonths 
      ? (service?.price || 0) * parseInt(selectedDuration)
      : (service?.price || 0) * quantity;
    
    // Check if user has sufficient balance
    if (userBalance < finalPrice) {
      toast.error("Insufficient balance", {
        description: "You don't have enough funds to make this purchase"
      });
      setIsPurchasing(false);
      // Redirect to payment page
      navigate("/payment");
      return;
    }

    // Deduct the price from user balance immediately
    const newBalance = userBalance - finalPrice;
    localStorage.setItem(`userBalance_${userId}`, newBalance.toString());

    // Create order with pending status
    const order = {
      id: `order-${Date.now()}`,
      serviceId: service?.id,
      quantity: shouldUseMonths ? 1 : quantity,
      durationMonths: shouldUseMonths ? parseInt(selectedDuration) : undefined,
      accountId: isRecharge ? accountId : undefined,
      totalPrice: finalPrice,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Save order to user-specific storage
    const customerOrdersKey = `customerOrders_${userId}`;
    const customerOrders = JSON.parse(localStorage.getItem(customerOrdersKey) || '[]');
    customerOrders.push(order);
    localStorage.setItem(customerOrdersKey, JSON.stringify(customerOrders));

    // In a real app, you would send this to your backend
    console.log("Created order:", order);
    
    toast.success("Purchase successful!", {
      description: `Your order is being processed. $${finalPrice.toFixed(2)} has been deducted from your balance.`
    });
    
    setIsPurchasing(false);
    setIsConfirmDialogOpen(false);
    
    // Redirect to dashboard
    navigate("/dashboard");
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    } else if (e.target.value === '') {
      setQuantity(1); // Reset to 1 if input is cleared
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
            <p className="text-muted-foreground mb-6">The service you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/services">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Services
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/services">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between mb-4">
                <h1 className="text-2xl md:text-3xl font-bold">{service.name}</h1>
                
                <div className="flex items-center mt-2 md:mt-0">
                  {category && (
                    <Badge variant="outline" className="mr-2">
                      {category.name}
                    </Badge>
                  )}
                  
                  {service.type && (
                    <Badge variant={service.type === "subscription" ? "default" : "secondary"}>
                      {service.type === "subscription" ? (
                        <RotateCw className="h-3 w-3 mr-1" />
                      ) : (
                        <Zap className="h-3 w-3 mr-1" />
                      )}
                      {service.type === "subscription" ? "Subscription" : "Recharge"}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="prose max-w-none dark:prose-invert mb-6">
                <p className="text-muted-foreground">{service.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {service.deliveryTime}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Tag className="h-4 w-4 mr-1" />
                  ${service.price.toFixed(2)} {shouldUseMonths ? '/month' : ''}
                </div>
                
                {shouldUseMonths && service.availableMonths && service.availableMonths.length > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    Durations: {service.availableMonths.join(", ")} {service.availableMonths.length === 1 ? "month" : "months"}
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Features & Benefits</h3>
                <ul className="space-y-2">
                  {service.features && service.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {!service.features && (
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>Premium quality service</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-sm p-6 sticky top-24">
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">Purchase Options</h2>
                <p className="text-sm text-muted-foreground">
                  Select your preferred options below
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Base Price:</span>
                  <span className="font-bold">
                    ${service.price.toFixed(2)} {shouldUseMonths ? '/month' : ''}
                  </span>
                </div>
                
                {shouldUseMonths ? (
                  <div>
                    <label className="text-sm font-medium block mb-1.5">
                      Duration
                    </label>
                    <Select 
                      value={selectedDuration}
                      onValueChange={(value) => setSelectedDuration(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select months" />
                      </SelectTrigger>
                      <SelectContent>
                        {service.availableMonths && service.availableMonths.length > 0 ? (
                          service.availableMonths.map(month => (
                            <SelectItem key={month} value={month.toString()}>
                              {month} month{month !== 1 ? 's' : ''}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="1">1 month</SelectItem>
                            <SelectItem value="3">3 months</SelectItem>
                            <SelectItem value="6">6 months</SelectItem>
                            <SelectItem value="12">12 months</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium block mb-1.5">
                      Quantity
                    </label>
                    <div className="flex items-center">
                      <Button 
                        type="button" 
                        size="icon"
                        variant="outline" 
                        className="h-9 w-9 rounded-r-none"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={quantity.toString()}
                        onChange={handleQuantityChange}
                        className="h-9 rounded-none border-x-0 w-16 px-0 text-center"
                      />
                      <Button 
                        type="button" 
                        size="icon"
                        variant="outline" 
                        className="h-9 w-9 rounded-l-none"
                        onClick={increaseQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {isRecharge && (
                  <div>
                    <label className="text-sm font-medium block mb-1.5">
                      Account ID <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      placeholder="Enter your account ID"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Required for processing your recharge
                    </p>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Total Price:</span>
                  <span className="text-xl font-bold">
                    ${(shouldUseMonths 
                      ? service.price * parseInt(selectedDuration)
                      : service.price * quantity).toFixed(2)}
                  </span>
                </div>
                {shouldUseMonths && (
                  <div className="text-sm text-muted-foreground mb-4">
                    For {selectedDuration} {parseInt(selectedDuration) === 1 ? 'month' : 'months'} of service
                  </div>
                )}
              </div>
              
              <Button className="w-full" size="lg" onClick={showPurchaseConfirmation}>
                <CreditCard className="mr-2 h-5 w-5" />
                Buy Now
              </Button>
              
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Your purchase is protected by our satisfaction guarantee
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Purchase Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to purchase {service.name}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Base Price:</span>
              <span className="font-bold">${service.price.toFixed(2)} {shouldUseMonths ? '/month' : ''}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Service:</span>
              <span>{service.name}</span>
            </div>
            
            {category && (
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Category:</span>
                <span>{category.name}</span>
              </div>
            )}
            
            {/* Subscription duration selection */}
            {shouldUseMonths ? (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">
                  Duration <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={selectedDuration}
                  onValueChange={(value) => setSelectedDuration(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select months" />
                  </SelectTrigger>
                  <SelectContent>
                    {service.availableMonths && service.availableMonths.length > 0 ? (
                      service.availableMonths.map(month => (
                        <SelectItem key={month} value={month.toString()}>
                          {month} month{month !== 1 ? 's' : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="1">1 month</SelectItem>
                        <SelectItem value="3">3 months</SelectItem>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center">
                  <Button 
                    type="button" 
                    size="icon"
                    variant="outline" 
                    className="h-8 w-8 rounded-r-none"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={quantity.toString()}
                    onChange={handleQuantityChange}
                    className="h-8 rounded-none border-x-0 w-16 px-0 text-center"
                  />
                  <Button 
                    type="button" 
                    size="icon"
                    variant="outline" 
                    className="h-8 w-8 rounded-l-none"
                    onClick={increaseQuantity}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Account ID field for recharge services */}
            {isRecharge && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">
                  Account ID <span className="text-red-500">*</span>
                </label>
                <Input 
                  placeholder="Enter your account ID"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This ID is required to process your recharge
                </p>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2 border-t mb-2">
              <span className="font-medium">Total Price:</span>
              <span className="font-bold">
                ${(shouldUseMonths 
                  ? service.price * parseInt(selectedDuration)
                  : service.price * quantity).toFixed(2)}
              </span>
            </div>
            
            {/* Additional details based on service type */}
            {shouldUseMonths && (
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">Duration:</span>
                <span>{selectedDuration} {parseInt(selectedDuration) === 1 ? 'month' : 'months'}</span>
              </div>
            )}
            
            {isGiftCard && (
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">Gift Card Value:</span>
                <span>${service.value?.toFixed(2) || service.price.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Estimated Delivery:</span>
              <span>{service.deliveryTime}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBuyNow} disabled={isPurchasing}>
              {isPurchasing ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceDetail;
