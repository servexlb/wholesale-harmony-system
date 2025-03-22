
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Product } from "@/lib/types";
import { products } from "@/lib/data";
import { services } from "@/lib/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import ProductCard from "./ProductCard";
import ProductForm from "./ProductForm";

const ProductManager = () => {
  // State management
  const [productList, setProductList] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Convert services to the Product type expected by our component
    const servicesAsProducts: Product[] = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      wholesalePrice: service.wholesalePrice,
      image: service.image,
      category: service.categoryId ? `Category ${service.categoryId}` : 'Uncategorized',
      featured: service.featured || false,
      type: service.type,
      deliveryTime: service.deliveryTime || "",
      apiUrl: service.apiUrl,
      availableMonths: service.availableMonths,
      value: service.value,
      minQuantity: undefined, // Default value for new field
    }));
    
    // Convert products from data.ts to the expected Product type
    const formattedProducts: Product[] = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      wholesalePrice: product.wholesalePrice,
      image: product.image,
      category: product.category,
      featured: product.featured || false,
      type: product.type,
      deliveryTime: product.deliveryTime || "",
      apiUrl: product.apiUrl,
      availableMonths: product.availableMonths,
      value: product.value,
      minQuantity: undefined, // Default value for new field
    }));
    
    // Combine both product lists with the correct typing
    setProductList([...formattedProducts, ...servicesAsProducts]);
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (data: Product) => {
    // In a real app, we would save this to the database
    // For now, we'll just update the local state
    const updatedProducts = productList.map(product => 
      product.id === data.id ? { ...product, ...data } : product
    );
    
    setProductList(updatedProducts);
    setIsDialogOpen(false);
    toast.success("Product updated successfully");
  };
  
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
          <ProductCard 
            key={product.id}
            product={product} 
            onClick={handleProductClick}
          />
        ))}
      </div>

      {/* Product Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to the product information here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <ProductForm 
            product={selectedProduct}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManager;
