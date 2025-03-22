
import React from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/MainLayout";
import { Check, Clock, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
    featured: true
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
                
                <Button className="w-full mb-4">Add to Cart</Button>
                <Button variant="outline" className="w-full">Buy Now</Button>
                
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
