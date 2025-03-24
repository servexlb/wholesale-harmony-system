
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getStockIssues, getAvailableCredentials, resolveStockIssue } from "@/lib/credentialService";
import { AlertCircle, Check, RefreshCw, User } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const StockIssueManager = () => {
  const [stockIssues, setStockIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [credentialOptions, setCredentialOptions] = useState<{ [key: string]: any[] }>({});
  const [selectedCredentials, setSelectedCredentials] = useState<{ [key: string]: string }>({});
  const [processingIssues, setProcessingIssues] = useState<string[]>([]);

  const loadStockIssues = async () => {
    setIsLoading(true);
    const issues = await getStockIssues();
    setStockIssues(issues);
    
    // Load available credentials for each service
    const credentialMap: { [key: string]: any[] } = {};
    for (const issue of issues) {
      const serviceId = issue.service_id;
      if (!credentialMap[serviceId]) {
        const availableCredentials = await getAvailableCredentials(serviceId);
        credentialMap[serviceId] = availableCredentials;
      }
    }
    setCredentialOptions(credentialMap);
    setIsLoading(false);
  };

  useEffect(() => {
    loadStockIssues();
    
    // Listen for stock issue resolution events
    const handleStockIssueResolved = () => {
      loadStockIssues();
    };
    
    window.addEventListener('stock-issue-resolved', handleStockIssueResolved);
    
    return () => {
      window.removeEventListener('stock-issue-resolved', handleStockIssueResolved);
    };
  }, []);

  const handleCredentialChange = (issueId: string, credentialId: string) => {
    setSelectedCredentials(prev => ({
      ...prev,
      [issueId]: credentialId
    }));
  };

  const handleResolveIssue = async (issueId: string) => {
    const credentialId = selectedCredentials[issueId];
    if (!credentialId) {
      toast.error("Please select a credential to assign");
      return;
    }

    setProcessingIssues(prev => [...prev, issueId]);
    
    try {
      const success = await resolveStockIssue(issueId, credentialId);
      
      if (success) {
        toast.success("Stock issue resolved successfully");
        // Remove from processing list
        setProcessingIssues(prev => prev.filter(id => id !== issueId));
        // Remove from stock issues
        setStockIssues(prev => prev.filter(issue => issue.id !== issueId));
        // Remove from selected credentials
        const newSelected = { ...selectedCredentials };
        delete newSelected[issueId];
        setSelectedCredentials(newSelected);
      } else {
        toast.error("Failed to resolve stock issue");
        setProcessingIssues(prev => prev.filter(id => id !== issueId));
      }
    } catch (error) {
      console.error("Error resolving stock issue:", error);
      toast.error("An error occurred while resolving the stock issue");
      setProcessingIssues(prev => prev.filter(id => id !== issueId));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Stock Issues</CardTitle>
          <CardDescription>
            Resolve stock issues by assigning credentials to users
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadStockIssues}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {stockIssues.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No stock issues</AlertTitle>
            <AlertDescription>
              There are currently no pending stock issues to resolve.
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Assign Credential</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockIssues.map((issue) => {
                const isProcessing = processingIssues.includes(issue.id);
                const availableCredentials = credentialOptions[issue.service_id] || [];
                const userName = issue.profiles?.name || "Unknown User";
                const canResolve = availableCredentials.length > 0 && selectedCredentials[issue.id];
                
                return (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{issue.service_id}</TableCell>
                    <TableCell>{format(new Date(issue.created_at), 'PPP')}</TableCell>
                    <TableCell>{issue.order_id || 'N/A'}</TableCell>
                    <TableCell>
                      {availableCredentials.length === 0 ? (
                        <span className="text-red-500 text-sm">No credentials available</span>
                      ) : (
                        <Select
                          value={selectedCredentials[issue.id] || ''}
                          onValueChange={(value) => handleCredentialChange(issue.id, value)}
                          disabled={isProcessing}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select credential" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCredentials.map((credential) => (
                              <SelectItem key={credential.id} value={credential.id}>
                                {credential.credentials.email || 'No Email'} 
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        disabled={!canResolve || isProcessing}
                        onClick={() => handleResolveIssue(issue.id)}
                      >
                        {isProcessing ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default StockIssueManager;
