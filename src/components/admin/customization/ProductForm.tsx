import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Product, ServiceType, MonthlyPricing } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ImageIcon, UploadCloud, Plus, Trash2 } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface ProductFormProps {
  product: Product | null;
  onSubmit: (data: Product) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [availableImages, setAvailableImages] = useState<any[]>([]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [monthlyPricing, setMonthlyPricing] = useState<MonthlyPricing[]>([]);

  const form = useForm<Product>({
    defaultValues: product || {
      id: `product-${Date.now()}`,
      name: "",
      description: "",
      price: 0,
      wholesalePrice: 0,
      category: "",
      categoryId: "uncategorized",
      featured: false,
      deliveryTime: "24 hours",
      type: "subscription",
      requiresId: false,
    }
  });

  // Load available images from the image manager
  useEffect(() => {
    const uploadedImages = localStorage.getItem("uploadedImages");
    if (uploadedImages) {
      setAvailableImages(JSON.parse(uploadedImages));
    }
  }, []);

  // Update form when product changes
  useEffect(() => {
    if (product) {
      form.reset(product);
      setPreviewImage(product.image);
      if (product.monthlyPricing && product.monthlyPricing.length > 0) {
        setMonthlyPricing(product.monthlyPricing);
      } else if (product.availableMonths && product.availableMonths.length > 0) {
        setMonthlyPricing(
          product.availableMonths.map(month => ({
            months: month,
            price: product.price * month,
            wholesalePrice: product.wholesalePrice * month
          }))
        );
      } else {
        setMonthlyPricing([]);
      }
    }
  }, [product, form]);

  // Get the current service type
  const serviceType = form.watch("type") as ServiceType;
  const currentImage = form.watch("image");

  useEffect(() => {
    // Update preview when image URL changes
    if (currentImage) {
      setPreviewImage(currentImage);
      setImageError(false);
    }
  }, [currentImage]);

  const handleImagePreview = () => {
    if (currentImage) {
      setShowImagePreview(true);
    } else {
      toast.error("No image to preview");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        form.setValue("image", dataUrl);
        setPreviewImage(dataUrl);
        setImageError(false);
        toast.success("Image selected", {
          description: "The image has been added to the product"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    form.setValue("image", imageUrl);
    setPreviewImage(imageUrl);
    setShowImageSelector(false);
    toast.success("Image selected from library");
  };

  const handleImageError = () => {
    setImageError(true);
    const errorLog = JSON.parse(localStorage.getItem('productImageErrorLog') || '[]');
    if (product && !errorLog.some((log: any) => log.productId === product.id)) {
      errorLog.push({
        productId: product?.id,
        productName: product?.name,
        imageUrl: currentImage,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('productImageErrorLog', JSON.stringify(errorLog));
    }
  };

  const addMonthlyPricing = () => {
    const months = 1;
    const basePrice = form.getValues("price");
    const baseWholesalePrice = form.getValues("wholesalePrice");
    
    // Find a month that isn't already in the pricing
    const existingMonths = monthlyPricing.map(p => p.months);
    let newMonth = months;
    
    // Common subscription durations if none exist yet
    if (monthlyPricing.length === 0) {
      setMonthlyPricing([
        { months: 1, price: basePrice, wholesalePrice: baseWholesalePrice },
        { months: 3, price: basePrice * 3 * 0.95, wholesalePrice: baseWholesalePrice * 3 * 0.95 },
        { months: 6, price: basePrice * 6 * 0.9, wholesalePrice: baseWholesalePrice * 6 * 0.9 },
        { months: 12, price: basePrice * 12 * 0.85, wholesalePrice: baseWholesalePrice * 12 * 0.85 }
      ]);
      return;
    }
    
    // Find next available month
    while (existingMonths.includes(newMonth)) {
      newMonth++;
    }
    
    setMonthlyPricing([
      ...monthlyPricing,
      { 
        months: newMonth, 
        price: basePrice * newMonth, 
        wholesalePrice: baseWholesalePrice * newMonth 
      }
    ]);
  };

  const updateMonthlyPricing = (index: number, field: keyof MonthlyPricing, value: number) => {
    const updated = [...monthlyPricing];
    updated[index] = { ...updated[index], [field]: value };
    setMonthlyPricing(updated);
  };

  const removeMonthlyPricing = (index: number) => {
    const updated = [...monthlyPricing];
    updated.splice(index, 1);
    setMonthlyPricing(updated);
  };

  const sortedMonthlyPricing = [...monthlyPricing].sort((a, b) => a.months - b.months);

  useEffect(() => {
    if (monthlyPricing.length > 0) {
      const months = monthlyPricing.map(p => p.months);
      form.setValue("availableMonths", months);
      form.setValue("monthlyPricing", monthlyPricing);
    }
  }, [monthlyPricing, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Image preview and selection at the top */}
        <div className="mb-6">
          <FormLabel className="block mb-2">Product Image</FormLabel>
          <div className="flex items-start gap-4">
            <div className="w-32 h-32 border rounded-md overflow-hidden bg-muted flex-shrink-0">
              {!imageError ? (
                <img 
                  src={previewImage || "/placeholder.svg"} 
                  alt="Product preview" 
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Image error</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2 flex-grow">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Image URL" />
                    </FormControl>
                    <FormDescription>
                      Enter an image URL or select from options below
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
                  Upload
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowImageSelector(true)}
                >
                  <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                  Library
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleImagePreview}
                  disabled={!currentImage || imageError}
                >
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </div>

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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Type</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="topup">Top-up</SelectItem>
                    <SelectItem value="giftcard">Gift Card</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Input {...field} 
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      form.setValue("categoryId", e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }}
                  />
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
                <FormLabel>Base Price (Per Month)</FormLabel>
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
                <FormLabel>Base Wholesale Price (Per Month)</FormLabel>
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
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
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
        
        {/* Conditional fields based on product type */}
        {serviceType === "subscription" && (
          <div className="space-y-4 border p-4 rounded-md">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Subscription Pricing</h3>
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                onClick={addMonthlyPricing}
              >
                <Plus className="h-4 w-4 mr-1" />
                {monthlyPricing.length === 0 ? "Add Standard Durations" : "Add Duration"}
              </Button>
            </div>
            
            {sortedMonthlyPricing.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Duration (Months)</TableHead>
                    <TableHead>Regular Price</TableHead>
                    <TableHead>Wholesale Price</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMonthlyPricing.map((pricing, index) => (
                    <TableRow key={pricing.months}>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={pricing.months}
                          onChange={(e) => updateMonthlyPricing(index, "months", parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={pricing.price}
                          onChange={(e) => updateMonthlyPricing(index, "price", parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={pricing.wholesalePrice}
                          onChange={(e) => updateMonthlyPricing(index, "wholesalePrice", parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMonthlyPricing(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                Click "Add Standard Durations" to set up subscription pricing options.
              </div>
            )}
          </div>
        )}
        
        {/* Top-up specific fields */}
        {serviceType === "topup" && (
          <>
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
              name="requiresId"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Requires Account ID</FormLabel>
                    <FormDescription>
                      Require customers to provide an ID for this top-up
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        {/* Gift card specific fields */}
        {serviceType === "giftcard" && (
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
                <FormDescription>
                  The actual value of the gift card (if different from its price)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* API URL - useful for programmatic integrations */}
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
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </DialogFooter>
      </form>

      {/* Image Preview Dialog */}
      <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <img 
              src={previewImage || "/placeholder.svg"} 
              alt="Preview" 
              className="max-h-[60vh] max-w-full object-contain"
              onError={() => {
                toast.error("Failed to load image");
                setImageError(true);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Library Selector */}
      <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select from Image Library</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto p-2">
            {availableImages.length > 0 ? (
              availableImages.map((image) => (
                <div 
                  key={image.id}
                  className="cursor-pointer border rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => handleImageSelect(image.url)}
                >
                  <div className="aspect-square relative">
                    <img 
                      src={image.url} 
                      alt={image.name}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1 text-xs truncate">
                      {image.name}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-4 text-center text-muted-foreground">
                No images in library. Add images in the Image Manager tab.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
};

export default ProductForm;
