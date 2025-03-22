
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/MainLayout";
import { Check, Clock, ChevronLeft, Minus, Plus, AlertCircle, CreditCard, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Service } from "@/lib/types";
import { toast } from "@/lib/toast";
import { services } from "@/lib/mockData";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [gameAccountId, setGameAccountId] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState("1");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
  const userBalance = 120.00;
  
  useEffect(() => {
    if (id) {
      setLoading(true);
      setTimeout(() => {
        const foundService = services.find(s => s.id === id);
        setService(foundService || null);
        setLoading(false);
      }, 300);
    }
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading service details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!service) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
            <p className="text-muted-foreground mb-6">The service you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/services">Browse All Services</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isSubscription = service?.type === "subscription";
  const isGameRecharge = service?.type === "recharge" || service?.categoryId === "category6";
  const isGiftCard = service?.categoryId === "category7";

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value);
    }
  };

  const handleGameAccountIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGameAccountId(e.target.value);
  };

  const calculateTotal = () => {
    if (isGameRecharge && customAmount) {
      return service!.wholesalePrice * (parseInt(customAmount) || 0);
    } else if (isSubscription) {
      return service!.wholesalePrice * parseInt(selectedDuration);
    } else {
      return service!.wholesalePrice * quantity;
    }
  };

  const total = calculateTotal();

  const handleAddToCart = () => {
    console.log("Add to cart:", { service, quantity, gameAccountId, total });
  };
  
  const showPurchaseConfirmation = () => {
    if (isGameRecharge) {
      if (!customAmount || parseInt(customAmount) <= 0) {
        toast.error("Invalid amount", {
          description: "Please enter a valid recharge amount"
        });
        return;
      }
      
      if (!gameAccountId) {
        toast.error("Account ID required", {
          description: "Please enter your game account ID"
        });
        return;
      }

      if (!customerName || !customerEmail) {
        toast.error("Customer information required", {
          description: "Please enter your name and email"
        });
        return;
      }
    }
    
    setIsConfirmDialogOpen(true);
  };
  
  const handleBuyNow = () => {
    console.log("Buy now:", { 
      service, 
      quantity, 
      gameAccountId, 
      customAmount, 
      total,
      customerInfo: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        additionalInfo: additionalInfo
      }
    });
    
    if (userBalance < total) {
      toast.error("Insufficient balance", {
        description: "You don't have enough funds to make this purchase"
      });
      navigate("/payment");
      return;
    }
    
    if (isGameRecharge) {
      sessionStorage.setItem('rechargeDetails', JSON.stringify({
        serviceId: service?.id,
        serviceName: service?.name,
        amount: customAmount,
        gameAccountId: gameAccountId,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        additionalInfo: additionalInfo,
        total: total
      }));
      
      const customerRequests = JSON.parse(localStorage.getItem('customerRequests') || '[]');
      customerRequests.push({
        id: `request-${Date.now()}`,
        timestamp: new Date().toISOString(),
        serviceId: service?.id,
        serviceName: service?.name,
        amount: customAmount,
        gameAccountId: gameAccountId,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        additionalInfo: additionalInfo,
        total: total,
        status: 'pending'
      });
      localStorage.setItem('customerRequests', JSON.stringify(customerRequests));
      
      setIsConfirmDialogOpen(false);
      navigate(`/service/${service?.id}/recharge-confirm`);
      return;
    }
    
    setIsProcessing(true);
    
    setTimeout(() => {
      // Deduct the price from user balance
      const userBalanceStr = localStorage.getItem('userBalance');
      const currentBalance = userBalanceStr ? parseFloat(userBalanceStr) : 120.00;
      const newBalance = currentBalance - total;
      localStorage.setItem('userBalance', newBalance.toString());
      
      const order = {
        id: `order-${Date.now()}`,
        serviceId: service?.id,
        quantity: isSubscription ? parseInt(selectedDuration) : quantity,
        customAmount: customAmount,
        gameAccountId: gameAccountId,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        additionalInfo: additionalInfo,
        totalPrice: total,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
      customerOrders.push(order);
      localStorage.setItem('customerOrders', JSON.stringify(customerOrders));

      console.log("Created order:", order);
      
      toast.success("Purchase successful!", {
        description: "Your order is being processed"
      });
      
      setIsProcessing(false);
      setIsConfirmDialogOpen(false);
      
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container py-8"
      >
        <Link to="/services" className="flex items-center text-sm text-gray-600 hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to all services
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <img 
              src={service.image} 
              alt={service.name} 
              className="w-full h-auto rounded-lg shadow-md object-cover" 
              style={{ maxHeight: "400px" }}
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/600x400/333/fff?text=${encodeURIComponent(service.name)}`;
              }}
            />
            
            <h1 className="text-3xl font-bold mt-6 mb-2">{service.name}</h1>
            <div className="flex items-center text-gray-500 mb-6">
              <Clock className="h-4 w-4 mr-2" />
              <span>Delivery: {service.deliveryTime}</span>
            </div>
            
            <Tabs defaultValue="description" className="mt-6">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p className="text-gray-700">{service.description}</p>
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                <ul className="space-y-2">
                  {service.features && service.features.length > 0 ? (
                    service.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))
                  ) : (
                    <li>No additional features available for this service.</li>
                  )}
                </ul>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4">
                <p className="text-gray-700">No reviews yet for this service.</p>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold">${service?.price}</span>
                  <p className="text-sm text-gray-500">Regular Price</p>
                </div>
                
                <div className="text-center mb-6">
                  <span className="text-2xl font-semibold text-primary">${service?.wholesalePrice}</span>
                  <p className="text-sm text-gray-500">Wholesale Price</p>
                </div>
                
                {isSubscription && (
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">
                      Subscription Duration
                    </label>
                    <Select 
                      defaultValue="1" 
                      onValueChange={(val) => {
                        setSelectedDuration(val);
                        setQuantity(parseInt(val));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {service.availableMonths && service.availableMonths.length > 0 ? (
                          service.availableMonths.map(month => (
                            <SelectItem key={month} value={month.toString()}>
                              {month} Month{month !== 1 ? 's' : ''}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="1">1 Month</SelectItem>
                            <SelectItem value="3">3 Months</SelectItem>
                            <SelectItem value="6">6 Months</SelectItem>
                            <SelectItem value="12">12 Months</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!isSubscription && !isGameRecharge && (
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">
                      Quantity
                    </label>
                    <div className="flex items-center">
                      <Button 
                        type="button" 
                        size="icon"
                        variant="outline" 
                        className="h-10 w-10 rounded-r-none"
                        onClick={decreaseQuantity}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="h-10 border-y px-4 flex items-center justify-center min-w-[4rem]">
                        {quantity}
                      </div>
                      <Button 
                        type="button" 
                        size="icon"
                        variant="outline" 
                        className="h-10 w-10 rounded-l-none"
                        onClick={increaseQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {isGameRecharge && (
                  <>
                    <div className="mb-4">
                      <label className="text-sm font-medium mb-2 block">
                        Recharge Amount <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        className="mb-1"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the amount of in-game currency you wish to purchase
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <label className="text-sm font-medium mb-2 block">
                        Game Account ID <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter your game ID"
                        value={gameAccountId}
                        onChange={handleGameAccountIdChange}
                        className="mb-1"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Your in-game ID where the recharge will be applied
                      </p>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium mb-3">Customer Information</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="Your full name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="email"
                            placeholder="Your email address"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Phone Number
                          </label>
                          <Input
                            type="tel"
                            placeholder="Your phone number"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Additional Information
                          </label>
                          <Textarea
                            placeholder="Any special requirements or notes"
                            value={additionalInfo}
                            onChange={(e) => setAdditionalInfo(e.target.value)}
                            className="resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="mt-4 mb-6 pt-4 border-t">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Price:</span>
                    <span className="text-xl text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full mb-4" onClick={handleAddToCart}>Add to Cart</Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={showPurchaseConfirmation}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : isGameRecharge ? "Proceed to Recharge" : "Buy Now"}
                </Button>
                
                <div className="mt-6 text-sm text-gray-500">
                  <div className="flex items-center justify-between py-1">
                    <span>Delivery:</span>
                    <span className="font-medium">{service?.deliveryTime}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Support:</span>
                    <span className="font-medium">24/7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Purchase Confirmation Dialog */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                Are you sure you want to purchase {service.name}?
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Price:</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Service:</span>
                <span>{service.name}</span>
              </div>
              
              {isSubscription && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Duration:</span>
                  <span>{selectedDuration} month{parseInt(selectedDuration) !== 1 ? 's' : ''}</span>
                </div>
              )}
              
              {!isSubscription && !isGameRecharge && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Quantity:</span>
                  <span>{quantity}</span>
                </div>
              )}
              
              {isGameRecharge && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Recharge Amount:</span>
                    <span>{customAmount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Game Account ID:</span>
                    <span>{gameAccountId}</span>
                  </div>
                </>
              )}
              
              {isGiftCard && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Gift Card Value:</span>
                  <span>${(service?.value || service?.price)?.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Delivery Time:</span>
                <span>{service.deliveryTime}</span>
              </div>
              
              <div className="pt-2 mt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Current Balance:</span>
                  <span>${userBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-primary">
                  <span className="font-medium">Balance After Purchase:</span>
                  <span>${(userBalance - total).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBuyNow} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Confirm Purchase"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </MainLayout>
  );
};

export default ServiceDetail;
