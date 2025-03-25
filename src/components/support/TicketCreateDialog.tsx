
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

interface TicketCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceName?: string;
  serviceId?: string;
}

const TicketCreateDialog: React.FC<TicketCreateDialogProps> = ({
  open,
  onOpenChange,
  serviceName = '',
  serviceId = ''
}) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject for your ticket');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please enter a description of your issue');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to create a ticket');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the support ticket
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject,
          description,
          status: 'open',
          service_id: serviceId || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating ticket:', error);
        toast.error('Failed to create support ticket');
        return;
      }
      
      // Create admin notification
      await supabase
        .from('admin_notifications')
        .insert({
          type: 'ticket',
          user_id: user.id,
          title: 'New Support Ticket',
          message: subject,
          service_id: serviceId || null,
          service_name: serviceName || null,
          is_read: false,
          created_at: new Date().toISOString()
        });
      
      toast.success('Support ticket created successfully');
      setSubject('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error in ticket creation:', error);
      toast.error('Failed to create support ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogDescription>
            {serviceName 
              ? `Submit a support request for ${serviceName}` 
              : 'Submit a support request and we\'ll respond as soon as possible'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please provide details about your issue..."
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TicketCreateDialog;
