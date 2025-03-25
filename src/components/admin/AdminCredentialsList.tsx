import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, PenLine, RefreshCw, Clipboard, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { CredentialStock } from '@/lib/types';

const AdminCredentialsList = () => {
  const [credentials, setCredentials] = useState<CredentialStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('credential_stock')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Transform the data to match CredentialStock type
        const transformedData: CredentialStock[] = (data || []).map(item => ({
          id: item.id,
          serviceId: item.service_id,
          credentials: typeof item.credentials === 'string' 
            ? JSON.parse(item.credentials) 
            : item.credentials,
          status: item.status as 'available' | 'assigned',
          createdAt: item.created_at,
          orderId: item.order_id,
          userId: item.user_id
        }));
        
        setCredentials(transformedData);
      } catch (error) {
        console.error('Error fetching credentials:', error);
        toast.error('Failed to load credentials');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCredentials();
  }, []);

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Credentials Stock</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!loading && credentials.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No credentials found.
                </TableCell>
              </TableRow>
            )}
            {credentials.map((credential) => (
              <TableRow key={credential.id}>
                <TableCell>{credential.serviceId}</TableCell>
                <TableCell>
                  {credential.credentials?.email ? (
                    <div className="flex items-center">
                      {credential.credentials.email}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => handleCopyToClipboard(credential.credentials.email, credential.id)}
                      >
                        {copied === credential.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Clipboard className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {credential.credentials?.password ? (
                    <div className="flex items-center">
                      {credential.credentials.password}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => handleCopyToClipboard(credential.credentials.password, credential.id)}
                      >
                        {copied === credential.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Clipboard className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      credential.status === "available" ? "secondary" : "default"
                    }
                  >
                    {credential.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <PenLine className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminCredentialsList;
