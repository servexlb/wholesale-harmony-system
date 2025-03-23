
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomerForm from './CustomerForm';
import { Customer } from '@/lib/data';

interface AddCustomerButtonProps {
  onAddCustomer?: (customer: Customer) => void;
  wholesalerId: string;
}

const AddCustomerButton: React.FC<AddCustomerButtonProps> = ({ 
  onAddCustomer,
  wholesalerId
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddCustomer = (customer: Customer) => {
    if (onAddCustomer) {
      onAddCustomer(customer);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button className="subtle-focus-ring" onClick={() => setIsDialogOpen(true)}>
        <UserPlus className="h-4 w-4 mr-2" />
        Add Customer
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          
          <CustomerForm 
            onAddCustomer={handleAddCustomer} 
            wholesalerId={wholesalerId} 
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCustomerButton;
