import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Routes, Route } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import MainLayout from "@/components/MainLayout";
import { useForm } from "react-hook-form";
import AdminSupportTickets from "@/components/AdminSupportTickets";
import AdminBalanceManagement from "@/components/AdminBalanceManagement";
import { 
  Users, Package, ShoppingCart, TicketCheck, 
  BarChart3, Settings, AlertCircle, PlusCircle,
  Pencil, Image, Upload, Type, LayoutDashboard,
  Save, Trash2, CreditCard
} from "lucide-react";
import { products, customers } from "@/lib/data";

const AdminDashboard = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">1,294</div>
        <p className="text-xs text-gray-500">+5.2% from last month</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">42</div>
        <p className="text-xs text-gray-500">-12% from last month</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">$12,345</div>
        <p className="text-xs text-gray-500">+18.2% from last month</p>
      </CardContent>
    </Card>
  </div>
);

const AdminCustomers = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Customer Management</h2>
      <Button>
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Customer
      </Button>
    </div>
    <Card>
      <CardContent className="p-6">
        <p>Customer list will appear here...</p>
      </CardContent>
    </Card>
  </div>
);

const AdminServices = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Service Management</h2>
      <Button>
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Service
      </Button>
    </div>
    <Card>
      <CardContent className="p-6">
        <p>Service list will appear here...</p>
      </CardContent>
    </Card>
  </div>
);

const AdminOrders = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Order Management</h2>
    <Card>
      <CardContent className="p-6">
        <p>Order list will appear here...</p>
      </CardContent>
    </Card>
  </div>
);

const AdminCustomization = () => {
  const [activeTab, setActiveTab] = useState("content");
  const [editingItem, setEditingItem] = useState(null);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customization</h2>
      </div>
      
      <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">
            <Type className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="images">
            <Image className="h-4 w-4 mr-2" />
            Images
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-6">
          <ContentEditor />
        </TabsContent>
        
        <TabsContent value="images" className="mt-6">
          <ImageManager />
        </TabsContent>
        
        <TabsContent value="products" className="mt-6">
          <ProductManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ContentEditor = () => {
  const [contentItems, setContentItems] = useState([
    { id: '1', name: 'Hero Title', content: 'Fast & Secure Digital Services', location: 'Homepage' },
    { id: '2', name: 'Hero Subtitle', content: 'Get your services delivered instantly', location: 'Homepage' },
    { id: '3', name: 'About Us', content: 'We provide premium digital services with 24/7 support.', location: 'About Page' },
  ]);
  
  const [editing, setEditing] = useState(null);
  
  const saveContent = (id, newContent) => {
    setContentItems(contentItems.map(item => 
      item.id === id ? {...item, content: newContent} : item
    ));
    setEditing(null);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Edit Website Content</h3>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>
      
      <div className="grid gap-4">
        {contentItems.map(item => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                  <CardDescription>Location: {item.location}</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setEditing(editing === item.id ? null : item.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editing === item.id ? (
                <div className="space-y-2">
                  <Textarea 
                    defaultValue={item.content} 
                    id={`content-${item.id}`}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditing(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        const textareaElement = document.getElementById(`content-${item.id}`) as HTMLTextAreaElement;
                        saveContent(item.id, textareaElement.value);
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p>{item.content}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ImageManager = () => {
  const [images, setImages] = useState([
    { id: '1', name: 'Hero Background', url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', location: 'Homepage' },
    { id: '2', name: 'About Us Banner', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d', location: 'About Page' },
    { id: '3', name: 'Services Banner', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475', location: 'Services Page' },
  ]);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Website Images</h3>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map(image => (
          <Card key={image.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-sm font-medium">{image.name}</CardTitle>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Location: {image.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video overflow-hidden rounded-md">
                <img 
                  src={image.url} 
                  alt={image.name}
                  className="object-cover w-full h-full" 
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="outline" size="sm">Replace</Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ProductManager = () => {
  const [productList, setProductList] = useState(products);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      wholesalePrice: 0,
      category: "",
      image: ""
    }
  });
  
  const onSubmit = (data) => {
    if (editingProduct) {
      setProductList(productList.map(p => 
        p.id === editingProduct.id ? {...data, id: editingProduct.id} : p
      ));
    } else {
      const newProduct = {
        ...data,
        id: `p${productList.length + 1}`
      };
      setProductList([...productList, newProduct]);
    }
    setShowForm(false);
    setEditingProduct(null);
    form.reset();
  };
  
  const handleEdit = (product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      wholesalePrice: product.wholesalePrice,
      category: product.category,
      image: product.image
    });
    setShowForm(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Products</h3>
        <Button onClick={() => {
          setEditingProduct(null);
          form.reset();
          setShowForm(!showForm);
        }}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? "Edit Product" : "Add New Product"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input 
                    id="name" 
                    {...form.register("name")} 
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input 
                    id="category" 
                    {...form.register("category")} 
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Regular Price ($)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01" 
                    {...form.register("price", { valueAsNumber: true })} 
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="wholesalePrice">Wholesale Price ($)</Label>
                  <Input 
                    id="wholesalePrice" 
                    type="number" 
                    step="0.01" 
                    {...form.register("wholesalePrice", { valueAsNumber: true })} 
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input 
                    id="image" 
                    {...form.register("image")} 
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    {...form.register("description")} 
                    required
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex items-center space-x-2 md:col-span-2">
                  <Checkbox id="featured" />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingProduct ? "Update" : "Add"} Product
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productList.map(product => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="object-cover w-full h-full transition-transform hover:scale-105"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  <CardDescription>{product.category}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <div>
                  <p className="font-medium">${product.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Wholesale: ${product.wholesalePrice.toFixed(2)}</p>
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

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="container py-8"
      >
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin")}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/customers")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Customers
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/services")}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Services
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/orders")}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Orders
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/balance")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    User Balance
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/customization")}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Customization
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/support")}
                  >
                    <TicketCheck className="mr-2 h-4 w-4" />
                    Support
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/reports")}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Reports
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate("/admin/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-4">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/customers" element={<AdminCustomers />} />
              <Route path="/services" element={<AdminServices />} />
              <Route path="/orders" element={<AdminOrders />} />
              <Route path="/balance" element={<AdminBalanceManagement />} />
              <Route path="/customization" element={<AdminCustomization />} />
              <Route path="/support" element={<AdminSupportTickets />} />
              <Route path="/reports" element={<div>Reports and Analytics</div>} />
              <Route path="/settings" element={<div>Admin Settings</div>} />
            </Routes>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default AdminPanel;
