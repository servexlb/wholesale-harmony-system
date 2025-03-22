
import React from "react";
import { Link } from "react-router-dom";
import { Clock, Tag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Service, ServiceCategory } from "@/lib/types";

interface ServiceCardProps {
  service: Service;
  category: ServiceCategory | undefined;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, category }) => {
  return (
    <Card key={service.id} className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-video relative">
        <img 
          src="https://placehold.co/600x400/333/fff?text=Service+Image" 
          alt={service.name}
          className="w-full h-full object-cover"
        />
        {service.featured && (
          <Badge
            variant="default" 
            className="absolute top-2 right-2"
          >
            Featured
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
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {service.deliveryTime}
          </div>
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-1" />
            ${service.price.toFixed(2)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Link to={`/services/${service.id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        <Button size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
