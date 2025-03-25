
import React, { useState, useEffect } from 'react';
import { getAvailableCredentials } from '@/lib/credentialService';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Service, CredentialStock } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Copy, Check } from 'lucide-react';
import { toast } from '@/lib/toast';

interface AdminCredentialsListProps {
  services: Service[];
}

const AdminCredentialsList: React.FC<AdminCredentialsListProps> = ({ services }) => {
  const [selectedService, setSelectedService] = useState<string>("");
  const [credentials, setCredentials] = useState<CredentialStock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCredentials = async () => {
    if (!selectedService) return;
    
    setIsLoading(true);
    try {
      const data = await getAvailableCredentials(selectedService);
      setCredentials(data);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast.error('Error loading credentials');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedService) {
      fetchCredentials();
    }
  }, [selectedService]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderCredentialValue = (value: any, id: string) => (
    <div className="flex items-center justify-between">
      <span className="font-mono text-sm truncate">{value}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => copyToClipboard(value, id)}
      >
        {copiedId === id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="service-select">Select Service</Label>
        <Select value={selectedService} onValueChange={setSelectedService}>
          <SelectTrigger id="service-select">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="pt-2">
        <Button 
          onClick={fetchCredentials} 
          disabled={!selectedService || isLoading}
          variant="outline"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
      
      {selectedService && credentials.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No credentials found for this service.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {credentials.map((credential) => (
          <Card key={credential.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <Badge>{credential.status}</Badge>
                <div className="text-xs text-muted-foreground">
                  ID: {credential.id.substring(0, 8)}...
                </div>
              </div>
              
              {credential.credentials && (
                <div className="space-y-3">
                  {credential.credentials.email && (
                    <div>
                      <Label className="text-xs">Email</Label>
                      {renderCredentialValue(credential.credentials.email, `${credential.id}-email`)}
                    </div>
                  )}
                  
                  {credential.credentials.username && (
                    <div>
                      <Label className="text-xs">Username</Label>
                      {renderCredentialValue(credential.credentials.username, `${credential.id}-username`)}
                    </div>
                  )}
                  
                  {credential.credentials.password && (
                    <div>
                      <Label className="text-xs">Password</Label>
                      {renderCredentialValue(credential.credentials.password, `${credential.id}-password`)}
                    </div>
                  )}
                  
                  {credential.credentials.pinCode && (
                    <div>
                      <Label className="text-xs">PIN Code</Label>
                      {renderCredentialValue(credential.credentials.pinCode, `${credential.id}-pin`)}
                    </div>
                  )}
                  
                  {credential.credentials.notes && (
                    <div>
                      <Label className="text-xs">Notes</Label>
                      <div className="text-sm mt-1 whitespace-pre-wrap">
                        {credential.credentials.notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCredentialsList;
