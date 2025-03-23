
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Mail, Key, PlusCircle, Trash2, Server, ShoppingCart, Search, User, Hash, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, Service, ServiceType } from "@/lib/types";
import { products as dataProducts } from "@/lib/data";
import { services } from "@/lib/mockData";

interface DigitalItem {
  id: string;
  serviceId: string;
  serviceName: string;
  credentials: {
    email: string;
    password: string;
    username?: string;
    pinCode?: string;
  };
  status: "available" | "delivered";
  addedAt: string;
  deliveredAt?: string;
}

const mockServices = [
  { id: "s1", name: "Premium Email Service" },
  { id: "s2", name: "VPN Subscription" },
  { id: "s3", name: "Streaming Service" },
];

const mockInventory: DigitalItem[] = [
  {
    id: "di1",
    serviceId: "s1",
    serviceName: "Premium Email Service",
    credentials: {
      email: "user1@example.com",
      password: "securepass123",
      username: "user1",
      pinCode: "1234"
    },
    status: "available",
    addedAt: new Date().toISOString(),
  },
  {
    id: "di2",
    serviceId: "s2",
    serviceName: "VPN Subscription",
    credentials: {
      email: "vpnuser@example.com",
      password: "vpnpass456",
      username: "vpnuser",
      pinCode: "5678"
    },
    status: "delivered",
    addedAt: new Date(Date.now() - 86400000).toISOString(),
    deliveredAt: new Date().toISOString(),
  },
];

const AdminDigitalInventory: React.FC = () => {
  const [inventory, setInventory] = useState<DigitalItem[]>(mockInventory);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bulkImport, setBulkImport] = useState(false);
  const [selectedService, setSelectedService] = useState(mockServices[0]?.id || "");
  const [newCredentials, setNewCredentials] = useState({ email: "", password: "", username: "", pinCode: "" });
  const [bulkCredentials, setBulkCredentials] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  
  const { toast } = useToast();

  useEffect(() => {
    const servicesAsProducts: Product[] = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      wholesalePrice: service.wholesalePrice,
      image: service.image,
      category: service.categoryId ? `Category ${service.categoryId}` : 'Uncategorized',
      categoryId: service.categoryId || 'uncategorized',
      featured: service.featured || false,
      type: service.type as ServiceType,
      deliveryTime: service.deliveryTime || "",
      apiUrl: service.apiUrl,
      availableMonths: service.availableMonths,
      value: service.value,
      minQuantity: service.type === "subscription" ? 1 : undefined
    }));
    
    const formattedDataProducts = dataProducts.map(product => {
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        wholesalePrice: product.wholesalePrice,
        image: product.image, 
        category: product.category,
        categoryId: product.categoryId || product.category || 'uncategorized',
        featured: product.featured || false,
        type: (product.type || "subscription") as ServiceType,
        deliveryTime: product.deliveryTime || "",
        apiUrl: product.apiUrl,
        availableMonths: product.availableMonths,
        value: product.value,
        minQuantity: 'minQuantity' in product && product.minQuantity !== undefined 
          ? Number(product.minQuantity) 
          : undefined
      };
    });
    
    const combinedProducts = [...formattedDataProducts, ...servicesAsProducts];
    setAllProducts(combinedProducts);
    setFilteredProducts(combinedProducts);
    
    console.log("Total products loaded:", combinedProducts.length);
    console.log("Data products:", formattedDataProducts.length);
    console.log("Service products:", servicesAsProducts.length);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(allProducts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, allProducts]);

  const handleAddItem = () => {
    if (!selectedService || !newCredentials.email || !newCredentials.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least email and password fields",
        variant: "destructive",
      });
      return;
    }

    const serviceName = mockServices.find(s => s.id === selectedService)?.name || "";
    
    const newItems: DigitalItem[] = [];
    
    for (let i = 0; i < quantity; i++) {
      newItems.push({
        id: `di${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        serviceId: selectedService,
        serviceName,
        credentials: {
          email: newCredentials.email,
          password: newCredentials.password,
          username: newCredentials.username,
          pinCode: newCredentials.pinCode
        },
        status: "available",
        addedAt: new Date().toISOString(),
      });
    }

    setInventory([...inventory, ...newItems]);
    setNewCredentials({ email: "", password: "", username: "", pinCode: "" });
    toast({
      title: "Items Added",
      description: `${quantity} digital inventory item(s) have been added successfully`,
    });
    setQuantity(1);
  };

  const handleBulkImport = () => {
    if (!selectedService || !bulkCredentials) {
      toast({
        title: "Missing Information",
        description: "Please select a service and enter credentials",
        variant: "destructive",
      });
      return;
    }

    const lines = bulkCredentials.split('\n').filter(line => line.trim());
    const serviceName = mockServices.find(s => s.id === selectedService)?.name || "";
    
    const newItems: DigitalItem[] = [];
    
    lines.forEach(line => {
      const parts = line.split(':').map(part => part.trim());
      const [email, password, username, pinCode] = parts;
      
      if (email && password) {
        for (let i = 0; i < quantity; i++) {
          newItems.push({
            id: `di${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`,
            serviceId: selectedService,
            serviceName,
            credentials: { 
              email, 
              password,
              username: username || "",
              pinCode: pinCode || ""
            },
            status: "available",
            addedAt: new Date().toISOString(),
          });
        }
      }
    });

    if (newItems.length > 0) {
      setInventory([...inventory, ...newItems]);
      setBulkCredentials("");
      toast({
        title: "Bulk Import Successful",
        description: `Added ${newItems.length} items to inventory`,
      });
      setQuantity(1);
    } else {
      toast({
        title: "Import Failed",
        description: "No valid credentials found. Use format: email:password[:username][:pinCode]",
        variant: "destructive",
      });
    }
  };

  const duplicateItem = (item: DigitalItem) => {
    const duplicatedItems: DigitalItem[] = [];
    
    for (let i = 0; i < quantity; i++) {
      duplicatedItems.push({
        ...item,
        id: `di${Date.now()}-dup-${i}-${Math.random().toString(36).substr(2, 9)}`,
        status: "available",
        addedAt: new Date().toISOString(),
        deliveredAt: undefined
      });
    }
    
    setInventory([...inventory, ...duplicatedItems]);
    
    toast({
      title: "Items Duplicated",
      description: `${quantity} copies of the item have been added to inventory`,
    });
    setQuantity(1);
  };

  const handleDeleteItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "Digital inventory item has been removed",
    });
  };

  const handleAddToInventory = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleAddSelectedProducts = () => {
    const productsToAdd: DigitalItem[] = [];
    
    selectedProducts.forEach(productId => {
      const product = allProducts.find(p => p.id === productId);
      
      for (let i = 0; i < quantity; i++) {
        productsToAdd.push({
          id: `di${Date.now()}-${productId}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          serviceId: product?.id || "",
          serviceName: product?.name || "",
          credentials: {
            email: "",
            password: ""
          },
          status: "available" as const,
          addedAt: new Date().toISOString(),
        });
      }
    });
    
    setInventory([...inventory, ...productsToAdd]);
    toast({
      title: "Products Added to Inventory",
      description: `Added ${productsToAdd.length} products to inventory. You can now add credentials for them.`,
    });
    setSelectedProducts([]);
    setShowProductSelector(false);
    setQuantity(1);
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product.id));
    }
  };

  const updateCredential = (itemId: string, field: keyof DigitalItem['credentials'], value: string) => {
    console.log(`Updating item ${itemId}, field ${field} to value: ${value}`);
    
    const updatedInventory = inventory.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          credentials: {
            ...item.credentials,
            [field]: value
          }
        };
      }
      return item;
    });
    
    setInventory(updatedInventory);
    
    toast({
      title: "Credential Updated",
      description: `Updated ${field} for item ${itemId.substring(0, 8)}...`,
    });
  };

  const availableCount = inventory.filter(item => item.status === "available").length;
  const deliveredCount = inventory.filter(item => item.status === "delivered").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Digital Inventory</h2>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Select Products
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Select Products for Inventory</SheetTitle>
                <SheetDescription>
                  Choose which products you want to add to your digital inventory
                </SheetDescription>
              </SheetHeader>
              <div className="my-4">
                <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredProducts.length} of {allProducts.length} products
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectAll}
                  >
                    {selectedProducts.length === filteredProducts.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                
                <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-4">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No products found matching your search.
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div key={product.id} className="flex items-center space-x-2 border-b pb-2">
                        <Checkbox
                          id={`product-${product.id}`}
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => handleAddToInventory(product.id)}
                        />
                        <div className="grid grid-cols-[40px_1fr] gap-4 items-center">
                          <img 
                            src={product.image || "https://placehold.co/40x40/gray/white?text=No+Image"} 
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/40x40/gray/white?text=Error";
                            }}
                          />
                          <div>
                            <Label
                              htmlFor={`product-${product.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {product.name}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              ${product.price.toFixed(2)} - {product.category}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center">
                  <Label htmlFor="quantity" className="w-24">Quantity:</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowProductSelector(false);
                      setSearchQuery("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddSelectedProducts}
                    disabled={selectedProducts.length === 0}
                  >
                    Add {selectedProducts.length * quantity} Products
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCount}</div>
            <p className="text-xs text-gray-500">Ready to be delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredCount}</div>
            <p className="text-xs text-gray-500">Successfully delivered to customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-gray-500">Total items in inventory</p>
          </CardContent>
        </Card>
      </div>
      
      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Add Digital Stock</CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={bulkImport ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBulkImport(true)}
                >
                  Bulk Import
                </Button>
                <Button 
                  variant={!bulkImport ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBulkImport(false)}
                >
                  Single Item
                </Button>
              </div>
            </div>
            <CardDescription>
              Add digital credentials that will be automatically delivered to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <select 
                  id="service"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  {mockServices.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full"
                />
              </div>
              
              {!bulkImport ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        value={newCredentials.email}
                        onChange={(e) => setNewCredentials({...newCredentials, email: e.target.value})}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password"
                        type="text"
                        value={newCredentials.password}
                        onChange={(e) => setNewCredentials({...newCredentials, password: e.target.value})}
                        placeholder="password123"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username"
                        value={newCredentials.username}
                        onChange={(e) => setNewCredentials({...newCredentials, username: e.target.value})}
                        placeholder="username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pinCode">PIN Code</Label>
                      <Input 
                        id="pinCode"
                        value={newCredentials.pinCode}
                        onChange={(e) => setNewCredentials({...newCredentials, pinCode: e.target.value})}
                        placeholder="1234"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddItem} className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Add to Inventory ({quantity > 1 ? `${quantity} items` : "1 item"})
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bulkCredentials">
                      Bulk Credentials (one per line, format: email:password[:username][:pinCode])
                    </Label>
                    <Textarea 
                      id="bulkCredentials"
                      value={bulkCredentials}
                      onChange={(e) => setBulkCredentials(e.target.value)}
                      placeholder="user1@example.com:password123:user1:1234&#10;user2@example.com:password456:user2:5678"
                      className="min-h-[150px]"
                    />
                  </div>
                  <Button onClick={handleBulkImport} className="w-full">
                    <Server className="h-4 w-4 mr-2" />
                    Import Bulk Credentials ({quantity > 1 ? `${quantity} copies each` : "1 copy each"})
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            Manage your digital credentials inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>PIN Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                      No inventory items found. Add stock to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.serviceName}</TableCell>
                      <TableCell className="min-w-[180px]">
                        <Input 
                          placeholder="Enter email" 
                          value={item.credentials.email}
                          onChange={(e) => updateCredential(item.id, 'email', e.target.value)}
                          className="w-full focus:border-blue-500"
                        />
                      </TableCell>
                      <TableCell className="min-w-[180px]">
                        <Input 
                          placeholder="Enter password" 
                          value={item.credentials.password}
                          onChange={(e) => updateCredential(item.id, 'password', e.target.value)}
                          className="w-full focus:border-blue-500"
                        />
                      </TableCell>
                      <TableCell className="min-w-[180px]">
                        <Input 
                          placeholder="Enter username" 
                          value={item.credentials.username || ""}
                          onChange={(e) => updateCredential(item.id, 'username', e.target.value)}
                          className="w-full focus:border-blue-500"
                        />
                      </TableCell>
                      <TableCell className="min-w-[180px]">
                        <Input 
                          placeholder="Enter PIN code" 
                          value={item.credentials.pinCode || ""}
                          onChange={(e) => updateCredential(item.id, 'pinCode', e.target.value)}
                          className="w-full focus:border-blue-500"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === "available" ? "outline" : "secondary"}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.addedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {item.status === "available" && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => duplicateItem(item)}
                                title="Duplicate Item"
                              >
                                <Copy className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteItem(item.id)}
                                title="Delete Item"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor="duplicateQuantity">Duplicate Quantity:</Label>
            <Input
              id="duplicateQuantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            Use the <Copy className="h-3 w-3 inline mx-1" /> icon to duplicate an item {quantity > 1 ? `${quantity} times` : ""}
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminDigitalInventory;
