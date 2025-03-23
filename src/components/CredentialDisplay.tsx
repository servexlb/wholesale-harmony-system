
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle, Clock } from 'lucide-react';
import { toast } from '@/lib/toast';

interface Credential {
  username?: string;
  password?: string;
  email?: string;
  notes?: string;
  [key: string]: any;
}

interface CredentialDisplayProps {
  orderId: string;
  serviceId: string;
  serviceName: string;
  credentials?: Credential | null;
  isPending?: boolean;
  purchaseDate: string;
}

const CredentialDisplay: React.FC<CredentialDisplayProps> = ({
  orderId,
  serviceId,
  serviceName,
  credentials,
  isPending = false,
  purchaseDate,
}) => {
  const [isCopied, setIsCopied] = useState<{[key: string]: boolean}>({});

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(prev => ({ ...prev, [field]: true }));
    
    toast.success(`${field} copied to clipboard`);
    
    setTimeout(() => {
      setIsCopied(prev => ({ ...prev, [field]: false }));
    }, 2000);
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{serviceName} Access</CardTitle>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="text-sm text-muted-foreground mb-4">
          <div className="flex justify-between items-center">
            <span>Order ID:</span>
            <span className="font-mono">{orderId}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span>Purchased:</span>
            <span>{formatDate(purchaseDate)}</span>
          </div>
        </div>

        {isPending ? (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-md flex items-center mt-2">
            <Clock className="h-5 w-5 mr-3" />
            <div>
              <p className="font-medium">Your account is being prepared</p>
              <p className="text-sm">We're setting up your account. You'll receive your login credentials shortly.</p>
            </div>
          </div>
        ) : credentials ? (
          <div className="space-y-3 mt-2">
            {credentials.email && (
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Email:</span>
                <div className="flex items-center">
                  <span className="mr-2 font-mono">{credentials.email}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0" 
                    onClick={() => handleCopyToClipboard(credentials.email!, 'Email')}
                  >
                    {isCopied['Email'] ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
            
            {credentials.username && (
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Username:</span>
                <div className="flex items-center">
                  <span className="mr-2 font-mono">{credentials.username}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0" 
                    onClick={() => handleCopyToClipboard(credentials.username!, 'Username')}
                  >
                    {isCopied['Username'] ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
            
            {credentials.password && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Password:</span>
                <div className="flex items-center">
                  <span className="mr-2 font-mono">{credentials.password}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0" 
                    onClick={() => handleCopyToClipboard(credentials.password!, 'Password')}
                  >
                    {isCopied['Password'] ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
            
            {credentials.notes && (
              <div className="mt-3 border-t pt-3">
                <span className="font-medium block mb-1">Additional Information:</span>
                <p className="text-sm whitespace-pre-wrap">{credentials.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-md flex items-center mt-2">
            <Clock className="h-5 w-5 mr-3" />
            <div>
              <p className="font-medium">No credentials available</p>
              <p className="text-sm">Credentials for this service haven't been provided yet.</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => window.open(`https://support.example.com?orderId=${orderId}`, '_blank')}
        >
          Need help?
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CredentialDisplay;
