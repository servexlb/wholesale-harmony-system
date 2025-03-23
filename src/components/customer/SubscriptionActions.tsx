
import React, { useState } from 'react';
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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFixProfile = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const customer = getCustomerById(customerId);
      const product = getProductById(serviceId);
      
      if (!customer || !product) {
        toast.error("Customer or product not found");
        setIsProcessing(false);
        return;
      }
      
      await fixSubscriptionProfile(
        subscriptionId, 
        customerId, 
        customer.name, 
        product.name
      );
      
      toast.success("Profile fix request submitted", {
        description: "Our team will review and fix the profile within 24 hours."
      });
    } catch (error) {
      console.error('Error fixing profile:', error);
      toast.error("Failed to submit profile fix request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFixPayment = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const customer = getCustomerById(customerId);
      const product = getProductById(serviceId);
      
      if (!customer || !product) {
        toast.error("Customer or product not found");
        setIsProcessing(false);
        return;
      }
      
      await reportPaymentIssue(
        subscriptionId, 
        customerId, 
        customer.name, 
        product.name
      );
      
      toast.success("Payment issue reported", {
        description: "Our team will contact you shortly to resolve the payment issue."
      });
    } catch (error) {
      console.error('Error reporting payment issue:', error);
      toast.error("Failed to report payment issue");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordReset = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const customer = getCustomerById(customerId);
      const product = getProductById(serviceId);
      
      if (!customer || !product) {
        toast.error("Customer or product not found");
        setIsProcessing(false);
        return;
      }
      
      await reportPasswordIssue(
        subscriptionId, 
        customerId, 
        customer.name, 
        product.name
      );
      
      toast.success("Password reset requested", {
        description: "Our team will reset the password and provide new credentials soon."
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error("Failed to request password reset");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1" 
        onClick={handleFixProfile}
        disabled={isProcessing}
      >
        <UserCog className="h-3 w-3" />
        <span>Fix Profile</span>
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1"
        onClick={handleFixPayment}
        disabled={isProcessing}
      >
        <CreditCard className="h-3 w-3" />
        <span>Payment Issue</span>
      </Button>
      {hasCredentials && (
        <Button 
          size="sm"
          variant="outline" 
          className="flex items-center gap-1"
          onClick={handlePasswordReset}
          disabled={isProcessing}
        >
          <KeyRound className="h-3 w-3" />
          <span>Reset Password</span>
        </Button>
      )}
    </div>
  );
};

export default SubscriptionActions;
