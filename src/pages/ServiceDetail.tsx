
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/MainLayout";
import { Check, Clock, ChevronLeft, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Service } from "@/lib/types";

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [customAmount, setCustomAmount] = useState<string>("");
  
  // In a real app, you would fetch the service details based on the ID
  // For now, let's use mock data
  const service = {
    id: id || "1",
    name: "Netflix Premium Subscription",
    description: "Access to all Netflix content in 4K UHD quality with the ability to stream on multiple devices simultaneously.",
    price: 15.99,
    wholesalePrice: 12.99,
    categoryId: "streaming",
    image: "https://placehold.co/600x400/333/fff?text=Netflix",
    deliveryTime: "Instant",
    features: [
      "4K UHD Streaming",
      "Watch on up to 4 devices",
      "Access to all content",
      "Ad-free experience",
      "Downloads available"
    ],
    featured: true,
    type: "subscription" // This would come from your data model. For now, hardcoded for demo
  };

  const isSubscription = service.type === "subscription";
  const isGameRecharge = service.categoryId === "gaming" || service.categoryId === "game-credits";

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value);
    }
  };

  const total = isGameRecharge && customAmount 
    ? parseFloat(customAmount) 
    : service.wholesalePrice * quantity;
    
  const handleAddToCart = () => {
    // Add to cart functionality would go here
    console.log("Add to cart:", { service, quantity, total });
  };
  
  const handleBuyNow = () => {
    console.log("Buy now:", { service, quantity, total });
    // Navigate to checkout page
    navigate("/checkout");
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
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
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
                  <span className="text-3xl font-bold">${service.price}</span>
                  <p className="text-sm text-gray-500">Regular Price</p>
                </div>
                
                <div className="text-center mb-6">
                  <span className="text-2xl font-semibold text-primary">${service.wholesalePrice}</span>
                  <p className="text-sm text-gray-500">Wholesale Price</p>
                </div>
                
                {isSubscription && (
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">
                      Subscription Duration
                    </label>
                    <Select defaultValue="1" onValueChange={(val) => setQuantity(parseInt(val))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Month</SelectItem>
                        <SelectItem value="3">3 Months</SelectItem>
                        <SelectItem value="6">6 Months</SelectItem>
                        <SelectItem value="12">12 Months</SelectItem>
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
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">
                      Custom Amount
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                    />
                  </div>
                )}
                
                <div className="mt-4 mb-6 pt-4 border-t">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Price:</span>
                    <span className="text-xl text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full mb-4" onClick={handleAddToCart}>Add to Cart</Button>
                <Button variant="outline" className="w-full" onClick={handleBuyNow}>Buy Now</Button>
                
                <div className="mt-6 text-sm text-gray-500">
                  <div className="flex items-center justify-between py-1">
                    <span>Delivery:</span>
                    <span className="font-medium">{service.deliveryTime}</span>
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
      </motion.div>
    </MainLayout>
  );
};

export default ServiceDetail;
