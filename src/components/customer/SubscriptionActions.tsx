
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserCog, CreditCard, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { fixSubscriptionProfile, reportPaymentIssue, reportPasswordIssue, getCustomerById, getProductById } from '@/lib/data';

interface SubscriptionActionsProps {
  subscriptionId: string;
  serviceId: string;
  customerId: string;
  hasCredentials?: boolean;
}

const SubscriptionActions: React.FC<SubscriptionActionsProps> = ({
  subscriptionId,
  serviceId,
  customerId,
  hasCredentials
}) => {
  const handleFixProfile = async () => {
    const customer = getCustomerById(customerId);
    const product = getProductById(serviceId);
    
    if (customer && product) {
      await fixSubscriptionProfile(
        subscriptionId, 
        customerId, 
        customer.name, 
        product.name
      );
      
      toast.success("Profile fix request submitted", {
        description: "Our team will review and fix the profile within 24 hours."
      });
    }
  };

  const handleFixPayment = async () => {
    const customer = getCustomerById(customerId);
    const product = getProductById(serviceId);
    
    if (customer && product) {
      await reportPaymentIssue(
        subscriptionId, 
        customerId, 
        customer.name, 
        product.name
      );
      
      toast.success("Payment issue reported", {
        description: "Our team will contact you shortly to resolve the payment issue."
      });
    }
  };

  const handlePasswordReset = async () => {
    const customer = getCustomerById(customerId);
    const product = getProductById(serviceId);
    
    if (customer && product) {
      await reportPasswordIssue(
        subscriptionId, 
        customerId, 
        customer.name, 
        product.name
      );
      
      toast.success("Password reset requested", {
        description: "Our team will reset the password and provide new credentials soon."
      });
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1" 
        onClick={(e) => {
          e.stopPropagation();
          handleFixProfile();
        }}
      >
        <UserCog className="h-3 w-3" />
        <span>Fix Profile</span>
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1"
        onClick={(e) => {
          e.stopPropagation();
          handleFixPayment();
        }}
      >
        <CreditCard className="h-3 w-3" />
        <span>Payment Issue</span>
      </Button>
      {hasCredentials && (
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={(e) => {
            e.stopPropagation();
            handlePasswordReset();
          }}
        >
          <KeyRound className="h-3 w-3" />
          <span>Reset Password</span>
        </Button>
      )}
    </div>
  );
};

export default SubscriptionActions;
