
import React from "react";
import { Button } from "@/components/ui/button";
import ServiceCard from "./ServiceCard";
import { Service, ServiceCategory } from "@/lib/types";

interface ServicesListProps {
  filteredServices: Service[];
  serviceCategories: ServiceCategory[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

const ServicesList: React.FC<ServicesListProps> = ({
  filteredServices,
  serviceCategories,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}) => {
  return (
    <>
      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
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
