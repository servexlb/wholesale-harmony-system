
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
import { CheckCircle, WalletCards, CreditCard, Clock } from 'lucide-react';
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
  const isPending = !hasCredentials;
  
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-full my-2">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center">Purchase Successful!</DialogTitle>
          <DialogDescription className="text-center">
            Your order has been successfully processed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service:</span>
              <span className="font-medium">{serviceName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">
                {new Date(purchaseDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {hasCredentials ? (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Account Credentials</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowCredentials(!showCredentials)}
                >
                  {showCredentials ? "Hide" : "Show"}
                </Button>
              </div>
              
              {showCredentials && (
                <div className="space-y-2">
                  {credentials.email && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email/Username:</span>
                      <span className="font-medium">{credentials.email}</span>
                    </div>
                  )}
                  
                  {credentials.username && !credentials.email && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Username:</span>
                      <span className="font-medium">{credentials.username}</span>
                    </div>
                  )}
                  
                  {credentials.password && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Password:</span>
                      <span className="font-medium">{credentials.password}</span>
                    </div>
                  )}
                  
                  {credentials.notes && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground block mb-1">Notes:</span>
                      <p className="bg-muted p-2 rounded">{credentials.notes}</p>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-sm text-green-600 mt-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Your account is ready to use immediately!
              </p>
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Account Status</h3>
              </div>
              
              <p className="text-sm text-amber-600 mt-1 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Your account is being prepared and will be available soon.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                We'll notify you when your account credentials are ready. You can also check the status in your orders section.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleViewOrders}
            className="sm:flex-1"
          >
            View Orders
          </Button>
          <Button 
            onClick={handleGoToDashboard} 
            className="sm:flex-1"
          >
            Go to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseSuccessDialog;
