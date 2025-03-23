
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ServiceCard from "./ServiceCard";
import { Service, ServiceCategory } from "@/lib/types";
import { loadServices, PRODUCT_EVENTS, initProductManager } from "@/lib/productManager";

interface ServicesListProps {
  filteredServices: Service[];
  serviceCategories: ServiceCategory[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

const ServicesList: React.FC<ServicesListProps> = ({
  filteredServices: initialFilteredServices,
  serviceCategories,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}) => {
  const [filteredServices, setFilteredServices] = useState<Service[]>(initialFilteredServices);

  // Initialize and listen for service changes
  useEffect(() => {
    initProductManager();
    
    // Update filtered services when props change
    setFilteredServices(initialFilteredServices);
    
    // Listen for service changes and apply current filters
    const handleServiceUpdated = () => {
      const services = loadServices();
      let filtered = services;
      
      // Apply current category filter
      if (selectedCategory) {
        filtered = filtered.filter(service => service.categoryId === selectedCategory);
      }
      
      // Apply current search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(service => 
          service.name.toLowerCase().includes(query) || 
          service.description.toLowerCase().includes(query)
        );
      }
      
      setFilteredServices(filtered);
    };
    
    window.addEventListener(PRODUCT_EVENTS.SERVICE_UPDATED, handleServiceUpdated);
    window.addEventListener(PRODUCT_EVENTS.SERVICE_ADDED, handleServiceUpdated);
    window.addEventListener(PRODUCT_EVENTS.SERVICE_DELETED, handleServiceUpdated);
    
    return () => {
      window.removeEventListener(PRODUCT_EVENTS.SERVICE_UPDATED, handleServiceUpdated);
      window.removeEventListener(PRODUCT_EVENTS.SERVICE_ADDED, handleServiceUpdated);
      window.removeEventListener(PRODUCT_EVENTS.SERVICE_DELETED, handleServiceUpdated);
    };
  }, [initialFilteredServices, searchQuery, selectedCategory]);

  // Find the selected category name if one is selected
  const selectedCategoryName = selectedCategory 
    ? serviceCategories.find(cat => cat.id === selectedCategory)?.name 
    : null;

  return (
    <>
      {/* Results Count with active filters */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Showing {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
        {selectedCategoryName && (
          <>
            {" in "}
            <span className="font-medium">
              {selectedCategoryName}
            </span>
          </>
        )}
        {searchQuery && (
          <>
            {" matching "}
            <span className="font-medium">"{searchQuery}"</span>
          </>
        )}
      </div>
      
      {/* Services List */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => {
            const category = serviceCategories.find(cat => cat.id === service.categoryId);
            return (
              <ServiceCard 
                key={service.id} 
                service={service} 
                category={category}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl text-center">
          <h3 className="text-lg font-medium mb-2">No services found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <Button onClick={() => {
            setSearchQuery("");
            setSelectedCategory(null);
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </>
  );
};

export default ServicesList;
