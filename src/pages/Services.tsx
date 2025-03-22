
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import ServiceFilters from "@/components/services/ServiceFilters";
import ServiceSearchBar from "@/components/services/ServiceSearchBar";
import ServicesList from "@/components/services/ServicesList";
import { services, serviceCategories, getServicesByCategory } from "@/lib/mockData";
import { Service } from "@/lib/types";

const Services: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get("category");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [filteredServices, setFilteredServices] = useState<Service[]>(services);
  
  useEffect(() => {
    let result = services;
    
    // Filter by category
    if (selectedCategory) {
      result = getServicesByCategory(selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(service => 
        service.name.toLowerCase().includes(query) || 
        service.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredServices(result);
  }, [selectedCategory, searchQuery]);
  
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="space-y-8 pb-32" // Increased padding-bottom from pb-16 to pb-32
      >
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Browse Services
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover our wide range of digital services tailored to your needs.
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters - Desktop */}
          <ServiceFilters 
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            serviceCategories={serviceCategories}
          />
          
          {/* Services Grid */}
          <div className="md:col-span-3 space-y-6">
            {/* Search */}
            <ServiceSearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              serviceCategories={serviceCategories}
            />
            
            {/* Services List */}
            <ServicesList 
              filteredServices={filteredServices}
              serviceCategories={serviceCategories}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Services;
