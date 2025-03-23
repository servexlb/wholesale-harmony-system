import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Product, ServiceType } from "@/lib/types";
import { products } from "@/lib/data";
import { services } from "@/lib/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import ProductCard from "./ProductCard";
import ProductForm from "./ProductForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const ProductManager = () => {
  // State management
  const [productList, setProductList] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    // Check localStorage first
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
      setProductList(JSON.parse(storedProducts));
      return;
    }
    
    // Convert services to the Product type expected by our component
    const servicesAsProducts: Product[] = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      wholesalePrice: service.wholesalePrice,
      image: service.image,
      category: service.categoryId ? `Category ${service.categoryId}` : 'Uncategorized',
      categoryId: service.categoryId || 'uncategorized', // Ensure categoryId is always set
      featured: service.featured || false,
      type: service.type as ServiceType,
      deliveryTime: service.deliveryTime || "",
      apiUrl: service.apiUrl,
      availableMonths: service.availableMonths,
      value: service.value,
      minQuantity: service.minQuantity,
      requiresId: service.requiresId ?? false // Ensure requiresId is always set
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
      categoryId: product.categoryId || product.category || 'uncategorized', // Use category as fallback
      featured: product.featured || false,
      type: (product.type || "subscription") as ServiceType,
      deliveryTime: product.deliveryTime || "",
      apiUrl: product.apiUrl,
      availableMonths: product.availableMonths,
      value: product.value,
      minQuantity: product.minQuantity,
      requiresId: product.requiresId ?? false // Using nullish coalescing to ensure a boolean value
    }));
    
    // Combine both product lists with the correct typing
    const combinedProducts = [...formattedProducts, ...servicesAsProducts];
    setProductList(combinedProducts);
    
    // Store in localStorage
    localStorage.setItem("products", JSON.stringify(combinedProducts));
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (productList.length > 0) {
      localStorage.setItem("products", JSON.stringify(productList));
    }
  }, [productList]);

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

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteConfirm = () => {
    if (productToDelete) {
      // Filter out the product to delete
      const updatedProducts = productList.filter(
        product => product.id !== productToDelete.id
      );
      
      setProductList(updatedProducts);
      setShowDeleteDialog(false);
      setProductToDelete(null);
      toast.success(`${productToDelete.name} has been removed`);
    }
  };
  
  const handleAddProduct = () => {
    // Create a new product with default values
    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: "New Product",
      description: "Product description",
      price: 0,
      wholesalePrice: 0,
      image: "/placeholder.svg",
      category: "Uncategorized",
      categoryId: "uncategorized",
      featured: false,
      type: "subscription",
      deliveryTime: "24 hours",
      requiresId: false // Ensure requiresId is set with default value
    };
    
    // Add it to the list
    setProductList([...productList, newProduct]);
    
    // Select it for editing
    setSelectedProduct(newProduct);
    setIsDialogOpen(true);
    toast.success("New product added. Please edit the details.");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Products</h3>
        <Button onClick={handleAddProduct}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productList.map((product: Product) => (
          <div key={product.id} className="relative group">
            <ProductCard 
              product={product} 
              onClick={handleProductClick}
            />
            <Button 
              variant="destructive" 
              size="sm" 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(product);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove {productToDelete?.name} from your product list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManager;
