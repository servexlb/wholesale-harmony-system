import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Filter, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ServiceCard from '@/components/ServiceCard';
import { Customer } from '@/lib/types';
import { Service, ServiceType, WholesaleOrder } from '@/lib/types';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  loadServices, 
  PRODUCT_EVENTS, 
  initProductManager 
} from '@/lib/productManager';

interface ServicesTabProps {
  services: Service[];
  customers: Customer[];
  onOrderPlaced: (order: WholesaleOrder) => void;
}

const ServicesTab: React.FC<ServicesTabProps> = ({ 
  services: initialServices, 
  customers, 
  onOrderPlaced 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>(initialServices);
  const [filteredServices, setFilteredServices] = useState<Service[]>(services);
  const [showSubscriptionsOnly, setShowSubscriptionsOnly] = useState(false);
  const [showRechargesOnly, setShowRechargesOnly] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceDetailOpen, setServiceDetailOpen] = useState(false);

  useEffect(() => {
    initProductManager();
    const loadServiceData = () => {
      const serviceData = loadServices();
      setServices(serviceData);
    };
    
    loadServiceData();
    
    window.addEventListener(PRODUCT_EVENTS.SERVICE_UPDATED, loadServiceData);
    window.addEventListener(PRODUCT_EVENTS.SERVICE_ADDED, loadServiceData);
    window.addEventListener(PRODUCT_EVENTS.SERVICE_DELETED, loadServiceData);
    
    return () => {
      window.removeEventListener(PRODUCT_EVENTS.SERVICE_UPDATED, loadServiceData);
      window.removeEventListener(PRODUCT_EVENTS.SERVICE_ADDED, loadServiceData);
      window.removeEventListener(PRODUCT_EVENTS.SERVICE_DELETED, loadServiceData);
    };
  }, []);

  useEffect(() => {
    try {
      let filtered = [...services];
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(service => 
          service.name.toLowerCase().includes(query) || 
          (service.description && service.description.toLowerCase().includes(query))
        );
      }
      
      if (showSubscriptionsOnly) {
        filtered = filtered.filter(service => service.type === "subscription");
      } else if (showRechargesOnly) {
        filtered = filtered.filter(service => service.type === "recharge" || service.type === "topup");
      } else if (services && services.length > 0 && services[0].type === "service") {
        filtered = filtered.filter(service => service.type === "service");
      }
      
      setFilteredServices(filtered);
    } catch (error) {
      console.error('Error filtering services:', error);
      toast.error('Error filtering services');
      setFilteredServices(services);
    }
  }, [searchQuery, services, showSubscriptionsOnly, showRechargesOnly]);

  const handleServiceClick = useCallback((service: Service) => {
    console.log("Service clicked:", service.name, service.id, service.type);
    window.dispatchEvent(new CustomEvent('openPurchaseDialog', { 
      detail: { serviceId: service.id }
    }));
  }, []);

  const handleViewDetails = useCallback((service: Service, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedService(service);
    setServiceDetailOpen(true);
  }, []);

  const handleResetFilters = () => {
    setShowSubscriptionsOnly(false);
    setShowRechargesOnly(false);
    setSearchQuery('');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const subscriptionsCount = services.filter(s => s.type === "subscription").length;
  const rechargesCount = services.filter(s => s.type === "recharge" || s.type === "topup").length;
  const regularServicesCount = services.filter(s => !s.type || s.type === "service").length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Wholesale Services</h1>
        <Button onClick={() => window.dispatchEvent(new CustomEvent('openPurchaseDialog'))}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Quick Purchase
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search services and subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 py-2"
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showSubscriptionsOnly ? "default" : "outline"} 
            size="sm"
            onClick={() => {
              setShowSubscriptionsOnly(!showSubscriptionsOnly);
              setShowRechargesOnly(false);
            }}
          >
            Subscriptions Only
          </Button>
          <Button 
            variant={showRechargesOnly ? "default" : "outline"} 
            size="sm"
            onClick={() => {
              setShowRechargesOnly(!showRechargesOnly);
              setShowSubscriptionsOnly(false);
            }}
          >
            Recharges & Top-ups Only
          </Button>
          {(showSubscriptionsOnly || showRechargesOnly || searchQuery) && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <p>Showing {filteredServices.length} items ({subscriptionsCount} subscriptions, {rechargesCount} recharges, and {regularServicesCount} regular services)</p>
      </div>
      
      {filteredServices.length === 0 ? (
        searchQuery || showSubscriptionsOnly || showRechargesOnly ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No services found matching your criteria</p>
            <Button variant="outline" className="mt-4" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <div key={index} className="h-[300px] bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div 
              key={service.id} 
              className="cursor-pointer h-full" 
              onClick={() => handleServiceClick(service)}
              style={{ display: 'block', height: '100%' }}
            >
              <ServiceCard 
                service={service} 
                isWholesale={true}
                onClick={() => handleServiceClick(service)}
                onViewDetails={(e) => handleViewDetails(service, e)}
                isMobile={false}
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={serviceDetailOpen} onOpenChange={setServiceDetailOpen}>
        {selectedService && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedService.name}</DialogTitle>
              <DialogDescription>
                Service ID: {selectedService.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={selectedService.image} 
                  alt={selectedService.name} 
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }} 
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-1">Description</h3>
                  <p className="text-gray-600">{selectedService.description || "No description available."}</p>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-lg font-medium mb-1">Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{selectedService.categoryId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium capitalize">{selectedService.type || "Standard"}</span>
                    </div>
                    {selectedService.deliveryTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Delivery Time:</span>
                        <span className="font-medium">{selectedService.deliveryTime}</span>
                      </div>
                    )}
                    {selectedService?.minQuantity && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Minimum Quantity:</span>
                        <span className="font-medium">{selectedService.minQuantity}</span>
                      </div>
                    )}
                    {selectedService.value !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Value:</span>
                        <span className="font-medium">${selectedService.value.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-lg font-medium mb-1">Price Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Retail Price:</span>
                      <span className="font-medium">${selectedService.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Wholesale Price:</span>
                      <span className="font-medium">${selectedService.wholesalePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Profit Margin:</span>
                      <span className="font-medium">
                        {((1 - (selectedService.wholesalePrice / selectedService.price)) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setServiceDetailOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={() => {
                  setServiceDetailOpen(false);
                  window.dispatchEvent(new CustomEvent('openPurchaseDialog', { 
                    detail: { serviceId: selectedService.id }
                  }));
                }}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Purchase Now
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </motion.div>
  );
};

export default ServicesTab;
