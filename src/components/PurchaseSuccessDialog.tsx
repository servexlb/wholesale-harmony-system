
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, AlertCircle, Clock } from "lucide-react";
import { Service, Subscription } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

interface PurchaseSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service;
  subscription?: Subscription;
  credentials?: {
    email?: string;
    password?: string;
    username?: string;
    notes?: string;
  };
  stockAvailable?: boolean;
}

export const PurchaseSuccessDialog: React.FC<PurchaseSuccessDialogProps> = ({
  open,
  onOpenChange,
  service,
  subscription,
  credentials,
  stockAvailable = true,
}) => {
  const navigate = useNavigate();

  const handleViewDashboard = () => {
    onOpenChange(false);
    navigate('/dashboard');
  };

  const handleCopyCredentials = () => {
    if (!credentials) return;
    
    const credentialText = `
Service: ${service.name}
${credentials.email ? `Email: ${credentials.email}` : ''}
${credentials.username ? `Username: ${credentials.username}` : ''}
${credentials.password ? `Password: ${credentials.password}` : ''}
${credentials.notes ? `Notes: ${credentials.notes}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(credentialText);
    toast.success("Credentials copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-green-600">
            <CheckCircle className="mr-2 h-5 w-5" />
            Purchase Successful
          </DialogTitle>
          <DialogDescription>
            Your order for {service.name} has been processed successfully
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Order confirmed
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your payment has been processed and your service is now active.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {stockAvailable ? (
            credentials && (
              <div className="border rounded-md p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Your Access Credentials</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyCredentials}
                    className="h-8"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </Button>
                </div>
                
                {credentials.email && (
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="col-span-2 font-mono bg-gray-100 px-2 py-1 rounded">{credentials.email}</span>
                  </div>
                )}
                
                {credentials.password && (
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-muted-foreground">Password:</span>
                    <span className="col-span-2 font-mono bg-gray-100 px-2 py-1 rounded">{credentials.password}</span>
                  </div>
                )}
                
                {credentials.username && (
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-muted-foreground">Username:</span>
                    <span className="col-span-2 font-mono bg-gray-100 px-2 py-1 rounded">{credentials.username}</span>
                  </div>
                )}
                
                {credentials.notes && (
                  <div className="text-sm mt-2">
                    <span className="text-muted-foreground block">Notes:</span>
                    <span className="text-xs mt-1">{credentials.notes}</span>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-2">
                  Please save these credentials. You can also access them later from your dashboard.
                </p>
              </div>
            )
          ) : (
            <div className="border border-amber-200 rounded-md p-4 space-y-2 bg-amber-50">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-amber-500 mr-2" />
                <h4 className="text-sm font-medium text-amber-800">Pending Credentials</h4>
              </div>
              <p className="text-sm text-amber-700">
                Your credentials are being processed and will be available shortly. Please check your dashboard or email for updates.
              </p>
              <div className="flex items-center mt-2 text-xs text-amber-700">
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                <span>You will be notified when your credentials are ready</span>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={handleViewDashboard}>
            View My Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseSuccessDialog;
