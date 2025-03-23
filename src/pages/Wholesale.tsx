
import React from 'react';
import { customers as defaultCustomers } from '@/lib/data';
import WholesaleAuth from '@/components/wholesale/WholesaleAuth';
import WholesaleTabContent from '@/components/wholesale/WholesaleTabContent';
import WholesaleLayout from '@/components/wholesale/WholesaleLayout';
import { useWholesaleAuth } from '@/hooks/useWholesaleAuth';
import { useWholesaleData } from '@/hooks/useWholesaleData';
import { useWholesaleSidebar } from '@/hooks/useWholesaleSidebar';
import { createMockSubscriptions } from '@/components/wholesale/WholesaleMockData';

const Wholesale = () => {
  // Initialize hooks
  const { 
    isAuthenticated, 
    currentWholesaler, 
    handleLoginSuccess, 
    handleLogout 
  } = useWholesaleAuth();
  
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    toggleSidebar
  } = useWholesaleSidebar();
  
  const {
    orders,
    subscriptions,
    customersData,
    wholesalerCustomers,
    handleOrderPlaced,
    handleAddCustomer
  } = useWholesaleData(currentWholesaler);

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <WholesaleAuth onLoginSuccess={handleLoginSuccess} />;
  }

  // Render main wholesale interface
  return (
    <WholesaleLayout
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      handleLogout={handleLogout}
    >
      <WholesaleTabContent 
        activeTab={activeTab}
        products={defaultCustomers.length > 0 ? [] : []} // This will trigger product loading
        customers={customersData}
        wholesalerCustomers={wholesalerCustomers}
        orders={orders}
        subscriptions={subscriptions}
        currentWholesaler={currentWholesaler}
        handleOrderPlaced={handleOrderPlaced}
        onAddCustomer={handleAddCustomer}
      />
    </WholesaleLayout>
  );
};

export default React.memo(Wholesale);
