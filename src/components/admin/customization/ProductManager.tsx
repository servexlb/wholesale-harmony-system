
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { PlusCircle, Edit, Image as ImageIcon } from "lucide-react";
import { Product } from "@/lib/types"; // Make sure we use the types.ts Product type
import { products } from "@/lib/data";
import { services } from "@/lib/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

const ProductManager = () => {
  // Combine products from both data sources
  const [productList, setProductList] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Set up form
  const form = useForm<Product>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      wholesalePrice: 0,
      category: "",
      featured: false,
      deliveryTime: "",
    }
  });

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
      value: service.value
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
      value: product.value
    }));
    
    // Combine both product lists with the correct typing
    setProductList([...formattedProducts, ...servicesAsProducts]);
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    form.reset(product);
    setIsDialogOpen(true);
  };

  const onSubmit = (data: Product) => {
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
          <Card 
            key={product.id} 
            className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
            onClick={() => handleProductClick(product)}
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
              <Button variant="outline" size="sm" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
            </CardFooter>
          </Card>
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
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="wholesalePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wholesale Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value (for gift cards)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deliveryTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Time</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input {...field} />
                          <Button type="button" size="icon" variant="outline">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured</FormLabel>
                        <FormDescription>
                          Mark this product to be featured on the homepage
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Quantity and availability fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum quantity required for purchase
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="availableMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Months</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="1,3,6,12"
                          value={field.value ? field.value.join(',') : ''}
                          onChange={(e) => {
                            const values = e.target.value.split(',').map(val => parseInt(val.trim())).filter(val => !isNaN(val));
                            field.onChange(values.length > 0 ? values : undefined);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter subscription months separated by commas (e.g. 1,3,6,12)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apiUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API URL</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        API endpoint for this product (if applicable)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                        >
                          <option value="">Select Type</option>
                          <option value="subscription">Subscription</option>
                          <option value="recharge">Recharge</option>
                          <option value="giftcard">Gift Card</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManager;
