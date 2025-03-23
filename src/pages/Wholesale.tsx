
import React, { useEffect, useState } from 'react';
import { customers as defaultCustomers } from '@/lib/data';
import { services } from '@/lib/mockData';
import WholesaleAuth from '@/components/wholesale/WholesaleAuth';
import WholesaleTabContent from '@/components/wholesale/WholesaleTabContent';
import WholesaleLayout from '@/components/wholesale/WholesaleLayout';
import { useWholesaleAuth } from '@/hooks/useWholesaleAuth';
import { useWholesaleData } from '@/hooks/useWholesaleData';
import { useWholesaleSidebar } from '@/hooks/useWholesaleSidebar';
import PurchaseDialog from '@/components/wholesale/PurchaseDialog';
import { Service } from '@/lib/types';
import { loadServices } from '@/lib/productManager';
import { Button } from '@/components/ui/button';

const Wholesale = () => {
  // State for purchase dialog
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  
  // For purchase dialog component
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize hooks
  const { 
    isAuthenticated, 
    currentWholesaler, 
    handleLoginSuccess, 
    handleLogout,
    isLoggedOut
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

  // Load services
  useEffect(() => {
    setAvailableServices(loadServices());
    
    const handleServiceUpdated = () => {
      setAvailableServices(loadServices());
    };
    
    window.addEventListener('service-updated', handleServiceUpdated);
    window.addEventListener('service-added', handleServiceUpdated);
    window.addEventListener('service-deleted', handleServiceUpdated);
    
    return () => {
      window.removeEventListener('service-updated', handleServiceUpdated);
      window.removeEventListener('service-added', handleServiceUpdated);
      window.removeEventListener('service-deleted', handleServiceUpdated);
    };
  }, []);

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
  
  // Handle purchase submission
  const handlePurchaseSubmit = () => {
    setIsSubmitting(true);
    // Implement your purchase logic here
    setTimeout(() => {
      setIsSubmitting(false);
      setPurchaseDialogOpen(false);
    }, 1000);
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <WholesaleAuth onLoginSuccess={handleLoginSuccess} isLoggedOut={isLoggedOut} />;
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
        {/* Show the inline purchase form when open */}
        {purchaseDialogOpen && (
          <PurchaseDialog
            customerName={customerName}
            customerEmail={customerEmail}
            customerPhone={customerPhone}
            customerAddress={customerAddress}
            customerCompany={customerCompany}
            customerNotes={customerNotes}
            onPurchase={handlePurchaseSubmit}
            isSubmitting={isSubmitting}
            isMobile={false}
          >
            <Button>Open Purchase Dialog</Button>
          </PurchaseDialog>
        )}
        
        <WholesaleTabContent 
          activeTab={activeTab}
          products={availableServices}
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
    </>
  );
};

export default React.memo(Wholesale);
