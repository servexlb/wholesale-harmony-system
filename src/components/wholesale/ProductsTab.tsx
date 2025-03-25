
import React, { useState, useEffect } from 'react';
import ServiceCard from './ServiceCard';
import ServiceDetails from './ServiceDetails';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Service } from '@/lib/types';
import { Search, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PurchaseDialog from './PurchaseDialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductsTabProps {
  products: Service[];
  onPurchase: (order: any) => void;
  isMobile: boolean;
}

function sortServices(services: Service[], sortOption: string): Service[] {
  const sortedServices = [...services];
  
  switch (sortOption) {
    case 'name_asc':
      return sortedServices.sort((a, b) => a.name.localeCompare(b.name));
    case 'name_desc':
      return sortedServices.sort((a, b) => b.name.localeCompare(a.name));
    case 'price_asc':
      return sortedServices.sort((a, b) => (a.wholesalePrice || 0) - (b.wholesalePrice || 0));
    case 'price_desc':
      return sortedServices.sort((a, b) => (b.wholesalePrice || 0) - (a.wholesalePrice || 0));
    default:
      return sortedServices;
  }
}

function filterServices(services: Service[], searchTerm: string, categoryFilter: string, typeFilter: string): Service[] {
  return services.filter(service => {
    const nameMatch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const descriptionMatch = service.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const categoryMatch = categoryFilter === 'all' || service.category === categoryFilter || service.categoryId === categoryFilter;
    const typeMatch = typeFilter === 'all' || service.type === typeFilter;
    
    return (nameMatch || descriptionMatch) && categoryMatch && typeMatch;
  });
}

const ProductsTab: React.FC<ProductsTabProps> = ({ products, onPurchase, isMobile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name_asc');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mobileCheck = useIsMobile();
  
  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.category || p.categoryId || 'Uncategorized')));
  
  // Get unique product types
  const types = Array.from(new Set(products.filter(p => p.type).map(p => p.type))) as string[];
  
  // Filter and sort products
  const filteredProducts = filterServices(products, searchTerm, categoryFilter, typeFilter);
  const sortedProducts = sortServices(filteredProducts, sortOption);
  
  useEffect(() => {
    if (showDetails && !selectedService && sortedProducts.length > 0) {
      setSelectedService(sortedProducts[0]);
    }
  }, [showDetails, selectedService, sortedProducts]);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
  };

  const handleViewDetails = (e: React.MouseEvent, service: Service) => {
    e.stopPropagation();
    setSelectedService(service);
    setShowDetails(true);
  };
  
  const handleCloseDetails = () => {
    setShowDetails(false);
  };
  
  const handlePurchaseClick = (service: Service) => {
    setSelectedService(service);
    setShowPurchaseDialog(true);
  };
  
  const handlePurchase = (order: any) => {
    setIsProcessing(true);
    onPurchase(order);
    setTimeout(() => {
      setIsProcessing(false);
      setShowPurchaseDialog(false);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search and filters */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search services..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category, index) => (
                <SelectItem key={index} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((type, index) => (
                <SelectItem key={index} value={type}>
                  {type === 'one-time' ? 'One-Time Purchase' : 
                   type === 'subscription' ? 'Subscription' :
                   type === 'topup' ? 'Top-up' :
                   type === 'recharge' ? 'Recharge' :
                   type === 'lifetime' ? 'Lifetime' :
                   type === 'giftcard' ? 'Gift Card' : 
                   type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
              <SelectItem value="price_asc">Price (Low to High)</SelectItem>
              <SelectItem value="price_desc">Price (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* No results message */}
      {sortedProducts.length === 0 && (
        <Alert className="mb-4">
          <AlertTitle>No services found</AlertTitle>
          <AlertDescription>
            No services match your search criteria. Try adjusting your filters.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow">
        {sortedProducts.map((service) => (
          <ServiceCard 
            key={service.id}
            service={service}
            isWholesale={true}
            isMobile={isMobile || mobileCheck}
            onClick={() => handleServiceClick(service)}
            onViewDetails={(e) => handleViewDetails(e, service)}
          />
        ))}
      </div>
      
      {/* Service details sidebar/modal */}
      {selectedService && (
        <ServiceDetails
          service={selectedService}
          isWholesale={true}
          isOpen={showDetails}
          onClose={handleCloseDetails}
          onPurchase={() => handlePurchaseClick(selectedService)}
        />
      )}
      
      {/* Purchase Dialog */}
      {selectedService && (
        <PurchaseDialog
          onPurchase={handlePurchase}
          isSubmitting={isProcessing}
          isMobile={isMobile || mobileCheck}
          open={showPurchaseDialog}
          onOpenChange={setShowPurchaseDialog}
        >
          <Button variant="ghost" className="hidden">Hidden Button</Button>
        </PurchaseDialog>
      )}
    </div>
  );
};

export default ProductsTab;
