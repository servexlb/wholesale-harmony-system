
import React, { useState, useEffect } from 'react';
import { getPendingStockRequests, resolveStockIssue, fulfillStockRequest } from '@/lib/credentialService';
import { StockRequest, Service, Credential } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface AdminStockIssuesProps {
  services: Service[];
}

const AdminStockIssues: React.FC<AdminStockIssuesProps> = ({ services }) => {
  const [issues, setIssues] = useState<StockRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<StockRequest | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [notes, setNotes] = useState('');

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const data = await getPendingStockRequests();
      setIssues(data);
    } catch (error) {
      console.error('Error fetching stock issues:', error);
      toast.error('Failed to load stock issues');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    
    const handleStockUpdate = () => {
      fetchIssues();
    };
    
    window.addEventListener('stock-issue-resolved', handleStockUpdate);
    
    return () => {
      window.removeEventListener('stock-issue-resolved', handleStockUpdate);
    };
  }, []);

  const handleCancelRequest = async (issueId: string) => {
    try {
      const success = await resolveStockIssue(issueId, 'cancelled');
      if (success) {
        toast.success('Stock request cancelled');
        fetchIssues();
      } else {
        toast.error('Failed to cancel request');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Failed to cancel request');
    }
  };

  const handleFulfillRequest = async () => {
    if (!selectedIssue) return;
    
    if (!email && !username) {
      toast.error('Please provide either email or username');
      return;
    }
    
    if (!password) {
      toast.error('Please provide a password');
      return;
    }
    
    try {
      const credentials: Credential = {
        email,
        password,
        username,
        pinCode,
        notes
      };
      
      const success = await fulfillStockRequest(
        selectedIssue.id,
        selectedIssue.orderId,
        selectedIssue.userId,
        selectedIssue.serviceId,
        credentials
      );
      
      if (success) {
        toast.success('Stock request fulfilled');
        setSelectedIssue(null);
        fetchIssues();
        
        // Reset form
        setEmail('');
        setPassword('');
        setUsername('');
        setPinCode('');
        setNotes('');
      } else {
        toast.error('Failed to fulfill request');
      }
    } catch (error) {
      console.error('Error fulfilling request:', error);
      toast.error('Failed to fulfill request');
    }
  };

  const getServiceNameById = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading stock issues...</div>;
  }

  if (issues.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No pending stock issues found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedIssue ? (
        <Card>
          <CardHeader>
            <CardTitle>Fulfill Stock Request</CardTitle>
            <CardDescription>
              Provide credentials for customer: {selectedIssue.customerName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Badge className="mb-2">Service: {getServiceNameById(selectedIssue.serviceId)}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="username123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pinCode">PIN Code (optional)</Label>
                  <Input
                    id="pinCode"
                    placeholder="1234"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information about this credential"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setSelectedIssue(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleFulfillRequest}
              disabled={(!email && !username) || !password}
            >
              Fulfill Request
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {issues.map((issue) => (
            <Card key={issue.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{issue.customerName}</CardTitle>
                  <Badge>Pending</Badge>
                </div>
                <CardDescription>
                  Service: {getServiceNameById(issue.serviceId)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm">
                  <p><strong>Order ID:</strong> {issue.orderId}</p>
                  {issue.notes && (
                    <div className="mt-2">
                      <p><strong>Notes:</strong></p>
                      <p className="text-muted-foreground">{issue.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex space-x-2 ml-auto">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleCancelRequest(issue.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Fulfill
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminStockIssues;
