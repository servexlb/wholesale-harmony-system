import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ImageIcon, InfoIcon, Check, X } from "lucide-react";
import { Product, MonthlyPricing } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const DEFAULT_IMAGE = "/placeholder.svg";

const serviceCategories = [
  { id: "streaming", name: "Streaming Services" },
  { id: "gaming", name: "Gaming Credits" },
  { id: "social", name: "Social Media" },
  { id: "recharge", name: "Recharge Services" },
  { id: "giftcard", name: "Gift Cards" },
  { id: "vpn", name: "VPN Services" },
  { id: "other", name: "Other Services" }
];

interface ProductFormProps {
  product: Product | null;
  onSubmit: (product: Product) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  const isNewProduct = !product?.id || product.id.includes('new-product');

  const [formData, setFormData] = useState<Product>({
    id: product?.id || `product-${Date.now()}`,
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    wholesalePrice: product?.wholesalePrice || 0,
    image: product?.image || DEFAULT_IMAGE,
    category: product?.category || "Uncategorized",
    categoryId: product?.categoryId || "uncategorized",
    featured: product?.featured || false,
    type: product?.type || "subscription",
    deliveryTime: product?.deliveryTime || "24 hours",
    requiresId: product?.requiresId || false,
    availableMonths: product?.availableMonths || [1, 3, 6, 12],
    monthlyPricing: product?.monthlyPricing || [],
    features: product?.features || [],
    availableForCustomers: product?.availableForCustomers !== undefined ? product.availableForCustomers : true
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [imagePreview, setImagePreview] = useState<string>(product?.image || DEFAULT_IMAGE);
  const [featureInput, setFeatureInput] = useState("");
  const [availableForCustomers, setAvailableForCustomers] = useState<boolean>(
    product?.availableForCustomers !== undefined ? product.availableForCustomers : true
  );

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        description: product.description || "",
        wholesalePrice: product.wholesalePrice || 0,
        image: product.image || DEFAULT_IMAGE,
        categoryId: product.categoryId || product.category?.toLowerCase() || "uncategorized",
        features: product.features || [],
        availableForCustomers: product.availableForCustomers !== undefined ? product.availableForCustomers : true
      });
      setImagePreview(product.image || DEFAULT_IMAGE);
      setAvailableForCustomers(product.availableForCustomers !== undefined ? product.availableForCustomers : true);
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (name === 'availableForCustomers') {
      setAvailableForCustomers(checked);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'categoryId' ? { category: serviceCategories.find(c => c.id === value)?.name || value } : {})
    }));
  };

  const handleImageSelect = (imageUrl: string) => {
    setImagePreview(imageUrl);
    setFormData(prev => ({
      ...prev,
      image: imageUrl
    }));
  };

  const selectFromUploaded = () => {
    try {
      const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
      
      if (uploadedImages.length === 0) {
        toast.error("No uploaded images found");
        return;
      }
      
      if (uploadedImages.length > 0) {
        handleImageSelect(uploadedImages[0].url);
        toast.success("Image selected from uploaded images");
      }
    } catch (error) {
      console.error("Error selecting from uploaded images:", error);
      toast.error("Error selecting image");
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()]
      }));
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Product name is required");
      return;
    }
    
    if (isNewProduct && formData.image === DEFAULT_IMAGE) {
      toast.warning("Using default image. Consider adding a custom image for better visibility.");
    }
    
    const productData = {
      ...formData,
      availableForCustomers
    };
    
    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="Product Name" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(value) => handleSelectChange('categoryId', value)}
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              placeholder="Product description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Product Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: any) => handleSelectChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="giftcard">Gift Card</SelectItem>
                  <SelectItem value="recharge">Recharge/Topup</SelectItem>
                  <SelectItem value="service">One-time Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deliveryTime">Delivery Time</Label>
              <Input 
                id="deliveryTime" 
                name="deliveryTime" 
                value={formData.deliveryTime} 
                onChange={handleInputChange} 
                placeholder="e.g. 24 hours, Instant, etc." 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="image">Product Image</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={selectFromUploaded}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Select From Uploaded
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="border rounded-md overflow-hidden w-24 h-24">
                <img 
                  src={imagePreview} 
                  alt={formData.name} 
                  className="w-full h-full object-cover"
                  onError={() => setImagePreview(DEFAULT_IMAGE)}
                />
              </div>
              <Input 
                id="image" 
                name="image" 
                value={formData.image} 
                onChange={handleInputChange} 
                placeholder="Image URL" 
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="featured" 
              checked={formData.featured} 
              onCheckedChange={(checked) => handleSwitchChange('featured', checked)} 
            />
            <Label htmlFor="featured">Featured Product</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="availableForCustomers" 
              checked={availableForCustomers} 
              onCheckedChange={(checked) => handleSwitchChange('availableForCustomers', checked)} 
            />
            <Label htmlFor="availableForCustomers">Available for Customer Purchase</Label>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Retail Price ($)</Label>
              <Input 
                id="price" 
                name="price" 
                type="number" 
                min="0" 
                step="0.01" 
                value={formData.price} 
                onChange={handleNumberChange} 
                placeholder="0.00" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wholesalePrice">Wholesale Price ($)</Label>
              <Input 
                id="wholesalePrice" 
                name="wholesalePrice" 
                type="number" 
                min="0" 
                step="0.01" 
                value={formData.wholesalePrice} 
                onChange={handleNumberChange} 
                placeholder="0.00" 
              />
            </div>
          </div>
          
          {formData.type === 'subscription' && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Available Subscription Durations</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 3, 6, 12].map((month) => (
                    <div key={month} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`month-${month}`}
                        checked={(formData.availableMonths || []).includes(month)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              availableMonths: [...(prev.availableMonths || []), month].sort((a, b) => a - b)
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              availableMonths: (prev.availableMonths || []).filter(m => m !== month)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`month-${month}`}>{month} {month === 1 ? 'month' : 'months'}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="requiresId" 
              checked={formData.requiresId} 
              onCheckedChange={(checked) => handleSwitchChange('requiresId', checked as boolean)}
            />
            <Label htmlFor="requiresId">Requires ID Verification</Label>
          </div>
          
          <div className="space-y-2">
            <Label>Product Features</Label>
            <div className="flex space-x-2">
              <Input 
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Add a feature"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddFeature}>Add</Button>
            </div>
            
            <div className="space-y-2 mt-2">
              {(formData.features || []).map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <span>{feature}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(formData.features || []).length === 0 && (
                <p className="text-sm text-muted-foreground">No features added yet</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isNewProduct ? 'Create Product' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
