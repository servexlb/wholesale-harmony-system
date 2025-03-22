import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, Tag, CreditCard, RotateCw, Zap, Calendar, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Service, ServiceCategory } from "@/lib/types";
import { toast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ServiceCardProps {
  service: Service;
  category: ServiceCategory | undefined;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, category }) => {
  const navigate = useNavigate();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
  // Get current user balance from localStorage
  const userBalanceStr = localStorage.getItem('userBalance');
  const userBalance = userBalanceStr ? parseFloat(userBalanceStr) : 120.00; // Default to 120 if not set
  
  // Generate a more specific image URL for each service type
  const getImageUrl = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    
    if (name.includes('netflix')) return "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&h=400&fit=crop";
    if (name.includes('amazon') || name.includes('prime')) return "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?w=600&h=400&fit=crop";
    if (name.includes('disney')) return "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&h=400&fit=crop";
    if (name.includes('apple') || name.includes('itunes')) return "https://images.unsplash.com/photo-1585184394271-4c0a47dc59c9?w=600&h=400&fit=crop";
    if (name.includes('spotify') || name.includes('music')) return "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&h=400&fit=crop";
    if (name.includes('youtube')) return "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=400&fit=crop";
    if (name.includes('hbo')) return "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&h=400&fit=crop";
    if (name.includes('playstation') || name.includes('xbox') || name.includes('game')) return "https://images.unsplash.com/photo-1592155931584-901ac15763e3?w=600&h=400&fit=crop";
    if (name.includes('gift') || name.includes('card')) return "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=400&fit=crop";
    if (name.includes('vpn') || name.includes('security')) return "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop";
    if (name.includes('adobe') || name.includes('creative') || name.includes('canva')) return "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop";
    if (name.includes('microsoft') || name.includes('office')) return "https://images.unsplash.com/photo-1588200618450-3a5b122c9fb9?w=600&h=400&fit=crop";
    if (name.includes('premium') || name.includes('subscription')) return "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=600&h=400&fit=crop";
    
    // Default image with service name
    return `https://placehold.co/600x400/3949ab/ffffff?text=${encodeURIComponent(serviceName)}`;
  };

  // Show purchase confirmation dialog
  const showPurchaseConfirmation = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleBuyNow = () => {
    console.log("Buy now clicked for service:", service);
    setIsPurchasing(true);
    
    // Check if user has sufficient balance
    if (userBalance < service.price) {
      toast.error("Insufficient balance", {
        description: "You don't have enough funds to make this purchase"
      });
      setIsPurchasing(false);
      // Redirect to payment page
      navigate("/payment");
      return;
    }

    // Deduct the price from user balance immediately
    const newBalance = userBalance - service.price;
    localStorage.setItem('userBalance', newBalance.toString());

    // Create order with pending status
    const order = {
      id: `order-${Date.now()}`,
      serviceId: service.id,
      totalPrice: service.price,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Save order to localStorage
    const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    customerOrders.push(order);
    localStorage.setItem('customerOrders', JSON.stringify(customerOrders));

    // In a real app, you would send this to your backend
    console.log("Created order:", order);
    
    toast.success("Purchase successful!", {
      description: `Your order is being processed. $${service.price.toFixed(2)} has been deducted from your balance.`
    });
    
    setIsPurchasing(false);
    setIsConfirmDialogOpen(false);
    
    // Redirect to dashboard
    navigate("/dashboard");
  };

  const imageUrl = getImageUrl(service.name);

  return (
    <>
      <Card key={service.id} className="overflow-hidden transition-all hover:shadow-md">
        <div className="aspect-video relative">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Loader2 className="h-10 w-10 text-gray-300 animate-spin" />
            </div>
          )}
          
          {!imageError ? (
            <img 
              src={imageUrl} 
              alt={service.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.log(`Service image failed to load: ${imageUrl}`);
                setImageError(true);
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">{service.name}</span>
            </div>
          )}
          
          {service.featured && (
            <Badge
              variant="default" 
              className="absolute top-2 right-2"
            >
              Featured
            </Badge>
          )}
          {service.type && (
            <Badge
              variant="outline" 
              className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
            >
              {service.type === "subscription" ? (
                <RotateCw className="h-3 w-3 mr-1" />
              ) : (
                <Zap className="h-3 w-3 mr-1" />
              )}
              {service.type === "subscription" ? "Subscription" : "Recharge"}
            </Badge>
          )}
        </div>
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">{service.name}</h3>
            <Badge variant="outline">{category?.name}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {service.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {service.deliveryTime}
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              ${service.price.toFixed(2)}
            </div>
            {service.type === "subscription" && service.availableMonths && service.availableMonths.length > 0 && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {service.availableMonths.join(", ")} {service.availableMonths.length === 1 ? "month" : "months"}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <Link to={`/services/${service.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
          <Button 
            size="sm" 
            onClick={showPurchaseConfirmation}
            disabled={isPurchasing}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Buy Now
          </Button>
        </CardFooter>
      </Card>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to purchase {service.name}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Price:</span>
              <span className="font-bold">${service.price.toFixed(2)}</span>
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
            
            {service.type === "subscription" && service.availableMonths && (
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Duration:</span>
                <span>
                  {service.availableMonths.length > 0 
                    ? `${service.availableMonths[0]} month${service.availableMonths[0] !== 1 ? 's' : ''}` 
                    : "1 month"
                  }
                </span>
              </div>
            )}
            
            {service.type === "recharge" && (
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Recharge Type:</span>
                <span>Standard Amount</span>
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
    </>
  );
};

export default ServiceCard;
