
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Product, ServiceType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ImageIcon } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductFormProps {
  product: Product | null;
  onSubmit: (data: Product) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
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
    }
  });

  // Update form when product changes
  useEffect(() => {
    if (product) {
      form.reset(product);
    }
  }, [product, form]);

  // Get the current service type
  const serviceType = form.watch("type") as ServiceType;

  return (
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
                      // Also update categoryId to match category (slugified)
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
          <FormField
            control={form.control}
            name="availableMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Months</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="1,3,6,12"
                    value={field.value ? field.value.join(',') : ''}
                    onChange={(e) => {
                      const values = e.target.value.split(',')
                        .map(val => parseInt(val.trim()))
                        .filter(val => !isNaN(val));
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
    </Form>
  );
};

export default ProductForm;
