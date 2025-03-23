
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import CustomerTable from '@/components/CustomerTable';
import { Customer, Product } from '@/lib/data';
import { Subscription, WholesaleOrder, Service } from '@/lib/types';
import ProductsTab from './ProductsTab';
import SalesTab from './SalesTab';
import SettingsTab from './SettingsTab';
import StockTab from './StockTab';
import { services } from '@/lib/mockData';
import { toast } from '@/lib/toast';

interface WholesaleTabContentProps {
  activeTab: string;
  products: Product[];
  customers: Customer[];
  wholesalerCustomers: Customer[];
  orders: WholesaleOrder[];
  subscriptions: Subscription[];
  currentWholesaler: string;
  handleOrderPlaced: (order: WholesaleOrder) => void;
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer?: (customerId: string, updatedCustomer: Partial<Customer>) => void;
  onPurchaseForCustomer?: (customerId: string) => void;
}

const WholesaleTabContent: React.FC<WholesaleTabContentProps> = ({ 
  activeTab,
  products,
  customers,
  wholesalerCustomers,
  orders,
  subscriptions,
  currentWholesaler,
  handleOrderPlaced,
  onAddCustomer,
  onUpdateCustomer,
  onPurchaseForCustomer
}) => {
  // Combine products and services for the ProductsTab
  const allServices = React.useMemo(() => {
    try {
      // Convert services to the Service format expected by ProductCard
      const servicesList = services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        wholesalePrice: service.wholesalePrice || service.price * 0.7, // Default wholesale price if not set
        image: service.image || '/placeholder.svg', // Fallback image
        categoryId: service.categoryId || "uncategorized",
        featured: service.featured || false,
        type: "service" as "service", // Use explicit type assertion
        deliveryTime: service.deliveryTime || "",
        apiUrl: service.apiUrl,
        availableMonths: service.availableMonths,
        value: service.value,
        minQuantity: service.minQuantity || 1
      })) as Service[];
      
      // Convert products to Service type with categoryId
      const productsAsServices = products.map(product => ({
        ...product,
        // Mark non-service products as subscription type by default
        type: product.type || "subscription" as "subscription",
        // Add required categoryId property from the product's category
        categoryId: product.categoryId || product.category || "uncategorized"
      })) as Service[];
      
      console.log('Services count:', servicesList.length);
      console.log('Products count:', productsAsServices.length);
      
      // Create a combined array of both products and services
      const combined = [...productsAsServices, ...servicesList];
      console.log('Combined products and services count:', combined.length);
      
      return combined;
    } catch (error) {
      console.error('Error combining products and services:', error);
      toast.error('Error loading services');
      return [] as Service[];
    }
  }, [products]);

  return (
    <div className="h-full">
      <Tabs value={activeTab} defaultValue={activeTab}>
        <TabsContent value="dashboard" className="h-full">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Dashboard content */}
            <h2>Dashboard content</h2>
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="h-full">
          <ProductsTab 
            services={allServices} 
            customers={wholesalerCustomers}
            onOrderPlaced={handleOrderPlaced}
          />
        </TabsContent>
        
        <TabsContent value="customers" className="h-full">
          <CustomerTable 
            customers={customers} 
            wholesalerId={currentWholesaler}
            subscriptions={subscriptions}
            onAddCustomer={onAddCustomer}
            onUpdateCustomer={onUpdateCustomer}
            onPurchaseForCustomer={onPurchaseForCustomer}
          />
        </TabsContent>
        
        <TabsContent value="sales" className="h-full">
          <SalesTab 
            orders={orders}
            customers={wholesalerCustomers}
          />
        </TabsContent>
        
        <TabsContent value="stock" className="h-full">
          <StockTab 
            subscriptions={subscriptions}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="h-full">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WholesaleTabContent;
