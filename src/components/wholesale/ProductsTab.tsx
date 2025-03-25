import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceCard from './ServiceCard';
import ServiceDetails from './ServiceDetails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Search, Filter, ListFilter, Check, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Service, WholesaleOrder, Customer } from '@/lib/types';
import PurchaseDialog from './PurchaseDialog';
import { toast } from '@/lib/toast';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ProductsTabProps {
  customers: Customer[];
  onOrderPlaced: (order: WholesaleOrder) => void;
  services?: Service[]; // Add this prop to accept services from parent
}

const ProductsTab: React.FC<ProductsTabProps> = ({ 
  customers,
  onOrderPlaced,
  services = [] // Default to empty array if not provided
}) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [ascOrder, setAscOrder] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  // Get services from props or localStorage if not available
  const [availableServices, setAvailableServices] = useState<Service[]>(services);
  
  useEffect(() => {
    // If services are provided as props, use them
    if (services && services.length > 0) {
      console.log('Using services from props:', services.length);
      setAvailableServices(services);
      return;
    }
    
    // Otherwise fall back to localStorage
    const storedServices = localStorage.getItem('services');
    if (storedServices) {
      try {
        const parsedServices = JSON.parse(storedServices);
        console.log('Using services from localStorage:', parsedServices.length);
        setAvailableServices(parsedServices);
      } catch (error) {
        console.error('Error parsing services:', error);
      }
    }

    const handleServiceUpdated = () => {
      const updatedServices = localStorage.getItem('services');
      if (updatedServices) {
        try {
          const parsedServices = JSON.parse(updatedServices);
          setAvailableServices(parsedServices);
        } catch (error) {
          console.error('Error parsing updated services:', error);
        }
      }
    };
    
    window.addEventListener('service-updated', handleServiceUpdated);
    window.addEventListener('service-added', handleServiceUpdated);
    window.addEventListener('service-deleted', handleServiceUpdated);
    
    return () => {
      window.removeEventListener('service-updated', handleServiceUpdated);
      window.removeEventListener('service-added', handleServiceUpdated);
      window.removeEventListener('service-deleted', handleServiceUpdated);
    };
  }, [services]);

  // Filter services based on search query and category
  const filteredServices = React.useMemo(() => {
    let filtered = availableServices.filter((service) => {
      const nameMatch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
      const descriptionMatch = service.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      return nameMatch || descriptionMatch;
    });

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((service) => service.category === categoryFilter);
    }

    // Log to help debug what services are being shown
    console.log('Filtered services count:', filtered.length);
    
    return filtered;
  }, [availableServices, searchQuery, categoryFilter]);

  // Sort services
  const sortedServices = React.useMemo(() => {
    const sorted = [...filteredServices];

    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        comparison = (a.wholesalePrice || 0) - (b.wholesalePrice || 0);
      }

      return ascOrder ? comparison : -comparison;
    });

    return sorted;
  }, [filteredServices, sortBy, ascOrder]);

  // Handle service selection
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  // Handle view details click
  const handleViewDetails = (e: React.MouseEvent, service: Service) => {
    e.stopPropagation();
    setSelectedService(service);
  };

  // Handle purchase dialog open
  const handleOpenPurchaseDialog = () => {
    setPurchaseOpen(true);
  };

  // Handle customer selection
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setCustomerName(customer.name);
    }
  };

  // Handle purchase dialog submission
  const handlePurchase = (order: WholesaleOrder) => {
    setIsSubmitting(true);
    try {
      // If we have a selected service, add its id to the order
      if (selectedService) {
        order.serviceId = selectedService.id;
      }
      
      onOrderPlaced(order);
      toast.success('Purchase completed successfully');
      setPurchaseOpen(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error in purchase:', error);
      toast.error('Failed to complete purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueCategories = React.useMemo(() => {
    return [...new Set(availableServices.map((service) => service.category))].filter(Boolean);
  }, [availableServices]);

  return (
    <div className="h-full">
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Browse available products and services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ListFilter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem checked={categoryFilter === 'all'} onCheckedChange={() => setCategoryFilter('all')}>
                    All Categories
                  </DropdownMenuCheckboxItem>
                  {uniqueCategories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={categoryFilter === category}
                      onCheckedChange={() => setCategoryFilter(category)}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center space-x-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={() => setAscOrder(!ascOrder)}>
                  {ascOrder ? 'Asc' : 'Desc'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {sortedServices.length === 0 ? (
        <div className="mt-8 p-6 text-center border rounded-md">
          <p className="text-muted-foreground">No services found. Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {sortedServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isWholesale={true}
              isMobile={isMobile}
              onClick={() => handleServiceSelect(service)}
              onViewDetails={(e) => handleViewDetails(e, service)}
            />
          ))}
        </div>
      )}

      {/* Service details modal */}
      {selectedService && (
        <ServiceDetails
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onPurchase={() => {
            setPurchaseOpen(true);
          }}
          isOpen={!!selectedService}
        />
      )}

      {/* Purchase dialog with proper customer selection */}
      <PurchaseDialog
        customerName={customerName}
        serviceName={selectedService?.name}
        serviceId={selectedService?.id}
        onPurchase={handlePurchase}
        isSubmitting={isSubmitting}
        isMobile={isMobile}
        open={purchaseOpen}
        onOpenChange={setPurchaseOpen}
        customers={customers}
        onCustomerChange={handleCustomerChange}
        selectedCustomerId={selectedCustomer}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Create New Purchase</h3>
          <Button 
            variant="default" 
            onClick={handleOpenPurchaseDialog}
          >
            Create New Purchase
          </Button>
        </div>
      </PurchaseDialog>
    </div>
  );
};

export default ProductsTab;
