import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/lib/types";
import { Order } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <Card
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
      onClick={() => onClick(product)}
    >
      <div className="aspect-w-4 aspect-h-3">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="object-cover rounded-t-lg"
          style={{ height: '200px', width: '100%' }}
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600">{product.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 bg-gray-100">
        <span className="text-md font-bold text-blue-600">${product.price.toFixed(2)}</span>
        <Button size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
