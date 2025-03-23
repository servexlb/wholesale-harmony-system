
import React from 'react';
import { motion } from 'framer-motion';
import ServiceCard from '@/components/services/ServiceCard';
import { Service } from '@/lib/types';

interface ServicesListProps {
  filteredServices: Service[];
  serviceCategories: {
    id: string;
    name: string;
    description: string;
    icon: string;
  }[];
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
  // If no services are found
  if (filteredServices.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No services found
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {searchQuery ? 
            `We couldn't find any services matching "${searchQuery}"` : 
            'There are no services in this category yet'}
        </p>
        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory(null);
          }}
          className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary transition-colors"
        >
          Reset filters
        </button>
      </motion.div>
    );
  }

  // Find the category object for each service
  const getServiceCategory = (service: Service) => {
    return serviceCategories.find(category => 
      category.id === service.categoryId || 
      category.name.toLowerCase() === service.category?.toLowerCase()
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredServices.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          category={getServiceCategory(service)}
        />
      ))}
    </div>
  );
};

export default ServicesList;
