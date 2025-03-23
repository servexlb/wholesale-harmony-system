
import React, { useEffect } from 'react';
import { customers as defaultCustomers, products as defaultProducts } from '@/lib/data';
import WholesaleAuth from '@/components/wholesale/WholesaleAuth';
import WholesaleTabContent from '@/components/wholesale/WholesaleTabContent';
import WholesaleLayout from '@/components/wholesale/WholesaleLayout';
import { useWholesaleAuth } from '@/hooks/useWholesaleAuth';
import { useWholesaleData } from '@/hooks/useWholesaleData';
import { useWholesaleSidebar } from '@/hooks/useWholesaleSidebar';
import PurchaseDialog from '@/components/wholesale/PurchaseDialog';
import { useState } from 'react';

const Wholesale = () => {
  // State for purchase dialog
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
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
    handleAddCustomer,
    handleUpdateCustomer
  } = useWholesaleData(currentWholesaler);

  // Listen for purchase dialog events
  useEffect(() => {
    const handleOpenPurchaseDialog = (event: Event) => {
      try {
        const customEvent = event as CustomEvent;
        if (customEvent.detail?.customerId) {
          setSelectedCustomerId(customEvent.detail.customerId);
        } else {
          setSelectedCustomerId('');
        }
        setPurchaseDialogOpen(true);
      } catch (error) {
        console.error('Error opening purchase dialog:', error);
      }
    };

    window.addEventListener('openPurchaseDialog', handleOpenPurchaseDialog);

    return () => {
      window.removeEventListener('openPurchaseDialog', handleOpenPurchaseDialog);
    };
  }, []);

  // Purchase for customer handler
  const handlePurchaseForCustomer = (customerId: string) => {
    try {
      setSelectedCustomerId(customerId);
      setPurchaseDialogOpen(true);
    } catch (error) {
      console.error('Error handling purchase for customer:', error);
    }
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <WholesaleAuth onLoginSuccess={handleLoginSuccess} />;
  }

  // Render main wholesale interface
  return (
    <>
      <WholesaleLayout
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      >
        <WholesaleTabContent 
          activeTab={activeTab}
          products={defaultProducts}
          customers={customersData}
          wholesalerCustomers={wholesalerCustomers}
          orders={orders}
          subscriptions={subscriptions}
          currentWholesaler={currentWholesaler}
          handleOrderPlaced={handleOrderPlaced}
          onAddCustomer={handleAddCustomer}
          onUpdateCustomer={handleUpdateCustomer}
          onPurchaseForCustomer={handlePurchaseForCustomer}
        />
      </WholesaleLayout>
      
      <PurchaseDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        customers={wholesalerCustomers}
        products={defaultProducts}
        selectedCustomer={selectedCustomerId}
        currentWholesaler={currentWholesaler}
        onOrderPlaced={handleOrderPlaced}
      />
    </>
  );
};

export default React.memo(Wholesale);
