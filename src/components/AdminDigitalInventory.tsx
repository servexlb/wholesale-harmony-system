import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Mail, Key, PlusCircle, Trash2, Server, ShoppingCart, Search } from "lucide-react";
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
import { Product } from "@/lib/types";
import { products as dataProducts } from "@/lib/data";
import { services } from "@/lib/mockData";

interface DigitalItem {
  id: string;
  serviceId: string;
  serviceName: string;
  credentials: {
    email: string;
    password: string;
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
      password: "securepass123"
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
      password: "vpnpass456"
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
  const [newCredentials, setNewCredentials] = useState({ email: "", password: "" });
  const [bulkCredentials, setBulkCredentials] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
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
      featured: service.featured || false,
      type: service.type,
      deliveryTime: service.deliveryTime || "",
      apiUrl: service.apiUrl,
      availableMonths: service.availableMonths,
      value: service.value,
      minQuantity: service.type === "subscription" ? 1 : undefined
    }));
    
    const formattedDataProducts = dataProducts.map(product => {
      const baseProduct = {
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
      };
      
      if ('minQuantity' in product && product.minQuantity !== undefined) {
        return {
          ...baseProduct,
          minQuantity: Number(product.minQuantity)
        };
      }
      
      return baseProduct;
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
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const serviceName = mockServices.find(s => s.id === selectedService)?.name || "";
    
    const newItem: DigitalItem = {
      id: `di${Date.now()}`,
      serviceId: selectedService,
      serviceName,
      credentials: {
        email: newCredentials.email,
        password: newCredentials.password
      },
      status: "available",
      addedAt: new Date().toISOString(),
    };

    setInventory([...inventory, newItem]);
    setNewCredentials({ email: "", password: "" });
    toast({
      title: "Item Added",
      description: "Digital inventory item has been added successfully",
    });
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
      const [email, password] = line.split(':').map(part => part.trim());
      
      if (email && password) {
        newItems.push({
          id: `di${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          serviceId: selectedService,
          serviceName,
          credentials: { email, password },
          status: "available",
          addedAt: new Date().toISOString(),
        });
      }
    });

    if (newItems.length > 0) {
      setInventory([...inventory, ...newItems]);
      setBulkCredentials("");
      toast({
        title: "Bulk Import Successful",
        description: `Added ${newItems.length} items to inventory`,
      });
    } else {
      toast({
        title: "Import Failed",
        description: "No valid credentials found. Use format: email:password",
        variant: "destructive",
      });
    }
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
    const productsToAdd = selectedProducts.map(productId => {
      const product = allProducts.find(p => p.id === productId);
      return {
        id: `di${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        serviceId: product?.id || "",
        serviceName: product?.name || "",
        credentials: {
          email: "",
          password: ""
        },
        status: "available" as const,
        addedAt: new Date().toISOString(),
      };
    });
    
    setInventory([...inventory, ...productsToAdd]);
    toast({
      title: "Products Added to Inventory",
      description: `Added ${productsToAdd.length} products to inventory. You can now add credentials for them.`,
    });
    setSelectedProducts([]);
    setShowProductSelector(false);
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product.id));
    }
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
              <Button onClick={() => setShowProductSelector(true)} variant="outline">
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
              <div className="flex justify-end gap-2 mt-4">
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
                  Add {selectedProducts.length} Products
                </Button>
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
              
              {!bulkImport ? (
                <>
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
                  <Button onClick={handleAddItem} className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Add to Inventory
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bulkCredentials">
                      Bulk Credentials (one per line, format: email:password)
                    </Label>
                    <Textarea 
                      id="bulkCredentials"
                      value={bulkCredentials}
                      onChange={(e) => setBulkCredentials(e.target.value)}
                      placeholder="user1@example.com:password123&#10;user2@example.com:password456"
                      className="min-h-[150px]"
                    />
                  </div>
                  <Button onClick={handleBulkImport} className="w-full">
                    <Server className="h-4 w-4 mr-2" />
                    Import Bulk Credentials
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                    No inventory items found. Add stock to get started.
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.serviceName}</TableCell>
                    <TableCell>
                      {item.credentials.email || (
                        <Input 
                          placeholder="Enter email" 
                          value={item.credentials.email}
                          onChange={(e) => {
                            const updatedInventory = inventory.map(i => 
                              i.id === item.id 
                                ? { ...i, credentials: { ...i.credentials, email: e.target.value } } 
                                : i
                            );
                            setInventory(updatedInventory);
                          }}
                          className="w-full"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {item.credentials.password ? (
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                          {item.credentials.password}
                        </span>
                      ) : (
                        <Input 
                          placeholder="Enter password" 
                          value={item.credentials.password}
                          onChange={(e) => {
                            const updatedInventory = inventory.map(i => 
                              i.id === item.id 
                                ? { ...i, credentials: { ...i.credentials, password: e.target.value } } 
                                : i
                            );
                            setInventory(updatedInventory);
                          }}
                          className="w-full"
                        />
                      )}
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
                      {item.status === "available" && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDigitalInventory;
