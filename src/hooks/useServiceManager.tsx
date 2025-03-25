
import { useState, useEffect, useCallback } from 'react';
import { Service } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

export const useServiceManager = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadServices = useCallback(() => {
    try {
      // First try to get from localStorage
      const storedServices = localStorage.getItem('services');
      if (storedServices) {
        const parsedServices = JSON.parse(storedServices) as Service[];
        setServices(parsedServices);
        return parsedServices;
      }
      return [];
    } catch (error) {
      console.error('Error loading services:', error);
      return [];
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('services')
        .select('*');
      
      if (error) {
        console.error('Error fetching services:', error);
        // Fallback to local storage if exists
        const storedServices = localStorage.getItem('services');
        if (storedServices) {
          const parsedServices = JSON.parse(storedServices) as Service[];
          setServices(parsedServices);
        }
        return;
      }
      
      if (data) {
        const formattedServices = data.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          wholesalePrice: service.wholesale_price,
          type: service.type as any,
          image: service.image_url,
          categoryId: service.category_id,
          category: service.category_name,
          featured: service.featured,
          deliveryTime: service.delivery_time,
          apiUrl: service.api_url,
          availableMonths: service.available_months,
          value: service.value,
          minQuantity: service.min_quantity,
          requiresId: service.requires_id,
          features: service.features
        }));
        
        setServices(formattedServices);
        localStorage.setItem('services', JSON.stringify(formattedServices));
      }
    } catch (error) {
      console.error('Error in fetchServices:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addService = useCallback(async (service: Omit<Service, 'id'>) => {
    try {
      // Generate a temporary ID
      const tempId = `service-${Date.now()}`;
      
      // Create the service with the full data structure
      const newService: Service = {
        ...service,
        id: tempId
      };
      
      // Add to local state first
      const updatedServices = [...services, newService];
      setServices(updatedServices);
      localStorage.setItem('services', JSON.stringify(updatedServices));
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('service-added'));
      
      toast.success('Service added successfully');
      return newService;
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
      return null;
    }
  }, [services]);

  const updateService = useCallback(async (id: string, updates: Partial<Service>) => {
    try {
      const serviceIndex = services.findIndex(s => s.id === id);
      if (serviceIndex === -1) {
        toast.error('Service not found');
        return false;
      }
      
      // Update the service
      const updatedService = {
        ...services[serviceIndex],
        ...updates
      };
      
      const updatedServices = [
        ...services.slice(0, serviceIndex),
        updatedService,
        ...services.slice(serviceIndex + 1)
      ];
      
      setServices(updatedServices);
      localStorage.setItem('services', JSON.stringify(updatedServices));
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('service-updated'));
      
      toast.success('Service updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
      return false;
    }
  }, [services]);

  const deleteService = useCallback(async (id: string) => {
    try {
      const filteredServices = services.filter(s => s.id !== id);
      setServices(filteredServices);
      localStorage.setItem('services', JSON.stringify(filteredServices));
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('service-deleted'));
      
      toast.success('Service deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
      return false;
    }
  }, [services]);

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return {
    services,
    isLoading,
    loadServices,
    fetchServices,
    addService,
    updateService,
    deleteService
  };
};
