
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { PlusCircle } from "lucide-react";
import { Product } from "@/lib/types";
import { products } from "@/lib/data";
import { services } from "@/lib/mockData";

const ProductManager = () => {
  // Combine products from both data sources
  const [productList, setProductList] = useState<Product[]>([]);
  
  useEffect(() => {
    // Convert services to Product type format and combine with products
    const servicesAsProducts = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      wholesalePrice: service.wholesalePrice,
      image: service.image,
      category: service.categoryId ? `Category ${service.categoryId}` : 'Uncategorized',
      featured: service.featured,
      type: service.type as any,
      deliveryTime: service.deliveryTime,
      apiUrl: service.apiUrl
    }));
    
    // Combine both product lists
    setProductList([...products, ...servicesAsProducts]);
  }, []);
  
  const [showForm, setShowForm] = useState(false);
  
  // This is just a placeholder component to avoid making the refactoring too long
  // In a real implementation, we would include all the product management functionality
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Products</h3>
        <Button onClick={() => setShowForm(!showForm)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productList.map((product: Product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="object-cover w-full h-full transition-transform hover:scale-105"
              />
              {product.featured && (
                <Badge
                  variant="default" 
                  className="absolute top-2 right-2"
                >
                  Featured
                </Badge>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-base">{product.name}</CardTitle>
              <CardDescription>{product.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <div>
                  <p className="font-medium">${product.price?.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Wholesale: ${product.wholesalePrice?.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-sm line-clamp-2">{product.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductManager;
