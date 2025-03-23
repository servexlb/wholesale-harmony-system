
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { CheckCircle, WalletCards, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CredentialDisplay from './CredentialDisplay';

interface PurchaseSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  serviceId: string;
  serviceName: string;
  amount: number;
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    [key: string]: any;
  } | null;
  purchaseDate: string;
}

const PurchaseSuccessDialog: React.FC<PurchaseSuccessDialogProps> = ({
  open,
  onOpenChange,
  orderId,
  serviceId,
  serviceName,
  amount,
  credentials,
  purchaseDate,
}) => {
  const navigate = useNavigate();
  const [showCredentials, setShowCredentials] = useState(!!credentials);
  
  const hasCredentials = !!credentials;
  
  const handleViewOrders = () => {
    onOpenChange(false);
    navigate('/dashboard/orders');
  };
  
  const handleAddFunds = () => {
    onOpenChange(false);
    navigate('/payment');
  };
  
  const handleGoToDashboard = () => {
    onOpenChange(false);
    navigate('/dashboard');
  };
  
  const handleToggleCredentials = () => {
    setShowCredentials(!showCredentials);
  };

  // Format the amount to ensure consistent display
  const formattedAmount = parseFloat(amount.toString()).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Purchase Successful
          </DialogTitle>
          <DialogDescription>
            Thank you for your purchase! Your order has been processed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-green-50 p-4 rounded-md mb-4 flex items-start">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">${formattedAmount} has been deducted</p>
              <p className="text-sm text-green-700">Your order for {serviceName} has been confirmed</p>
            </div>
          </div>
          
          {hasCredentials ? (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Account Information</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleCredentials}
                >
                  {showCredentials ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>
              
              {showCredentials && (
                <CredentialDisplay
                  orderId={orderId}
                  serviceId={serviceId}
                  serviceName={serviceName}
                  credentials={credentials}
                  purchaseDate={purchaseDate}
                />
              )}
            </div>
          ) : (
            <CredentialDisplay
              orderId={orderId}
              serviceId={serviceId}
              serviceName={serviceName}
              credentials={null}
              isPending={true}
              purchaseDate={purchaseDate}
            />
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleViewOrders}
            className="w-full sm:w-auto"
          >
            View Orders
          </Button>
          <Button
            variant="outline"
            onClick={handleAddFunds}
            className="w-full sm:w-auto"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Add Funds
          </Button>
          <Button
            onClick={handleGoToDashboard}
            className="w-full sm:w-auto"
          >
            Go to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseSuccessDialog;
