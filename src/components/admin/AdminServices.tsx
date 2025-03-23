import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Pencil, Trash2, GiftIcon, RotateCw, Zap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { Service, ServiceType } from "@/lib/types";
import { services as mockServices } from "@/lib/mockData";
import { toast } from "sonner";

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ServiceType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const storedServices = localStorage.getItem("services");
    if (storedServices) {
      setServices(JSON.parse(storedServices));
    } else {
      const formattedServices = mockServices.map(service => ({
        ...service,
        type: (service.type as ServiceType) || "subscription"
      }));
      setServices(formattedServices);
      localStorage.setItem("services", JSON.stringify(formattedServices));
    }
  }, []);

  useEffect(() => {
    if (services.length > 0) {
      localStorage.setItem("services", JSON.stringify(services));
    }
  }, [services]);

  const filteredServices = services.filter(service => {
    const matchesTab = activeTab === "all" || service.type === activeTab;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const handleDeleteService = (service: Service) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteService = () => {
    if (selectedService) {
      const updatedServices = services.filter(service => service.id !== selectedService.id);
      setServices(updatedServices);
      toast.success(`${selectedService.name} has been deleted`);
      setIsDeleteDialogOpen(false);
      setSelectedService(null);
    }
  };

  const handleAddNewService = () => {
    const newService: Service = {
      id: `service-${Date.now()}`,
      name: "New Service",
      description: "Service description",
      price: 0,
      wholesalePrice: 0,
      categoryId: "uncategorized",
      image: "/placeholder.svg",
      deliveryTime: "24 hours",
      featured: false,
      type: activeTab === "all" ? "subscription" : activeTab,
    };
    
    setSelectedService(newService);
    setIsDialogOpen(true);
  };

  const handleSaveService = (updatedService: Service) => {
    const isNewService = !services.some(service => service.id === updatedService.id);
    
    let updatedServices: Service[];
    if (isNewService) {
      updatedServices = [...services, updatedService];
      toast.success(`${updatedService.name} has been added`);
    } else {
      updatedServices = services.map(service => 
        service.id === updatedService.id ? updatedService : service
      );
      toast.success(`${updatedService.name} has been updated`);
    }
    
    setServices(updatedServices);
    setIsDialogOpen(false);
    setSelectedService(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Management</h2>
        <Button onClick={handleAddNewService}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as ServiceType | "all")}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="subscription">Subscriptions</TabsTrigger>
          <TabsTrigger value="topup">Top-ups</TabsTrigger>
          <TabsTrigger value="giftcard">Gift Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ServiceList 
            services={filteredServices} 
            onEdit={handleEditService} 
            onDelete={handleDeleteService} 
          />
        </TabsContent>
        
        <TabsContent value="subscription" className="space-y-4">
          <ServiceList 
            services={filteredServices} 
            onEdit={handleEditService} 
            onDelete={handleDeleteService} 
          />
        </TabsContent>
        
        <TabsContent value="topup" className="space-y-4">
          <ServiceList 
            services={filteredServices} 
            onEdit={handleEditService} 
            onDelete={handleDeleteService} 
          />
        </TabsContent>
        
        <TabsContent value="giftcard" className="space-y-4">
          <ServiceList 
            services={filteredServices} 
            onEdit={handleEditService} 
            onDelete={handleDeleteService} 
          />
        </TabsContent>
      </Tabs>

      <ServiceFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        service={selectedService}
        onSave={handleSaveService}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedService?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteService}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const ServiceList = ({ 
  services, 
  onEdit, 
  onDelete 
}: { 
  services: Service[], 
  onEdit: (service: Service) => void, 
  onDelete: (service: Service) => void 
}) => {
  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No services found. Add a new service to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map(service => (
        <Card key={service.id} className="overflow-hidden">
          <div className="aspect-video relative bg-gray-100">
            {service.image ? (
              <img 
                src={service.image} 
                alt={service.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                {service.type === "subscription" && <RotateCw className="h-12 w-12 text-gray-400" />}
                {service.type === "topup" && <Zap className="h-12 w-12 text-gray-400" />}
                {service.type === "giftcard" && <GiftIcon className="h-12 w-12 text-gray-400" />}
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge variant={getBadgeVariant(service.type)}>
                {getServiceTypeName(service.type)}
              </Badge>
            </div>
          </div>
          
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-lg">{service.name}</CardTitle>
          </CardHeader>
          
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {service.description}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="font-semibold">${service.price.toFixed(2)}</span>
              <div className="flex space-x-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onEdit(service)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(service)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ServiceFormDialog = ({ 
  open, 
  onOpenChange, 
  service, 
  onSave 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  service: Service | null, 
  onSave: (service: Service) => void 
}) => {
  const form = useForm<Service>({
    defaultValues: service || {
      id: `service-${Date.now()}`,
      name: "",
      description: "",
      price: 0,
      wholesalePrice: 0,
      categoryId: "uncategorized",
      image: "/placeholder.svg",
      deliveryTime: "24 hours",
      featured: false,
      type: "subscription",
    }
  });

  useEffect(() => {
    if (service) {
      form.reset(service);
    }
  }, [service, form]);

  const handleSubmit = (data: Service) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service && service.id ? "Edit" : "Add"} Service</DialogTitle>
          <DialogDescription>
            Fill in the details for this service. Different fields will be available based on the service type.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                    <FormLabel>Service Type</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value as ServiceType)}
                      defaultValue={field.value}
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
                name="categoryId"
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
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
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
                        Show this service on the homepage
                      </FormDescription>
                    </div>
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
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch("type") === "subscription" && (
              <FormField
                control={form.control}
                name="availableMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Durations (Months)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="1,3,6,12"
                        value={field.value ? field.value.join(',') : ''}
                        onChange={(e) => {
                          const values = e.target.value.split(',')
                            .map(val => parseInt(val.trim()))
                            .filter(val => !isNaN(val));
                          field.onChange(values.length > 0 ? values : [1]);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter subscription durations in months, separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {form.watch("type") === "topup" && (
              <>
                <FormField
                  control={form.control}
                  name="requiresId"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Requires ID</FormLabel>
                        <FormDescription>
                          Customer must provide an ID or account number for this top-up
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
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
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum quantity required for purchase
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {form.watch("type") === "giftcard" && (
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gift Card Value</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      The value loaded on the gift card (if different from price)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const getServiceTypeName = (type: ServiceType): string => {
  switch (type) {
    case "subscription": return "Subscription";
    case "topup": return "Top-up";
    case "giftcard": return "Gift Card";
    default: return "Unknown";
  }
};

const getBadgeVariant = (type: ServiceType): "default" | "secondary" | "outline" => {
  switch (type) {
    case "subscription": return "default";
    case "topup": return "secondary";
    case "giftcard": return "outline";
    default: return "default";
  }
};

export default AdminServices;
