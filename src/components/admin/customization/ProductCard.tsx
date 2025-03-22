
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <Card 
      key={product.id} 
      className="overflow-hidden transition-all hover:shadow-md"
      onClick={() => onClick(product)}
    >
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
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onClick(product);
          }}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Product
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
