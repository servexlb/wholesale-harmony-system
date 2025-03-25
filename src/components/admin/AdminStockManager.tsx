
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Service } from '@/lib/types';
import { toast } from '@/lib/toast';

interface AdminStockManagerProps {
  services: Service[];
  isLoading: boolean;
  fetchServices: () => void;
}

export function AdminStockManager({ services, isLoading, fetchServices }: AdminStockManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtered services based on search term
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle stock update
  const handleRefresh = () => {
    fetchServices();
    toast.success('Stock data refreshed');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Stock Management</CardTitle>
          <CardDescription>
            Manage available stock for services
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Available Stock</TableHead>
              <TableHead>Pending Requests</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No services found.
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.type}</TableCell>
                  <TableCell>{Math.floor(Math.random() * 10)}</TableCell> {/* Placeholder for available stock */}
                  <TableCell>{Math.floor(Math.random() * 5)}</TableCell> {/* Placeholder for pending requests */}
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
