
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import CustomerTable from '@/components/CustomerTable';
import { Customer, Product } from '@/lib/data';
import { Subscription, WholesaleOrder } from '@/lib/types';
import ProductsTab from './ProductsTab';
import SalesTab from './SalesTab';
import SettingsTab from './SettingsTab';
import { services } from '@/lib/mockData';

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
  const allProducts = React.useMemo(() => {
    // Convert services to the Product format expected by ProductCard
    const servicesAsProducts: Product[] = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      wholesalePrice: service.wholesalePrice || service.price * 0.7, // Default wholesale price if not set
      image: service.image || '/placeholder.svg', // Fallback image
      category: service.categoryId ? `Category ${service.categoryId}` : 'Uncategorized',
      featured: service.featured || false,
      type: 'service' as const, // Use 'as const' to narrow the type
      deliveryTime: service.deliveryTime || "",
      apiUrl: service.apiUrl,
      availableMonths: service.availableMonths,
      value: service.value,
    }));
    
    // Make sure products have the right type
    const typedProducts: Product[] = products.map(product => ({
      ...product,
      // Mark non-service products as subscription type by default
      type: product.type || 'subscription' as const
    }));
    
    console.log('Services count:', servicesAsProducts.length);
    console.log('Products count:', typedProducts.length);
    
    return [...typedProducts, ...servicesAsProducts];
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
            products={allProducts} 
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
        
        <TabsContent value="settings" className="h-full">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WholesaleTabContent;
