
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import ExportData from "@/components/wholesale/ExportData";
import { supabase } from "@/integrations/supabase/client";

interface WholesaleUser {
  id: string;
  username: string;
  company: string;
}

// Define initial wholesale users as a constant to avoid recursive type definition
const initialUsers = [
  { id: 'w1', username: 'wholesaler1', company: 'ABC Trading' },
  { id: 'w2', username: 'admin', company: 'XYZ Distributors' }
];

const WholesaleUserManagement = () => {
  // Use the constant directly to avoid the deep type instantiation error
  const [wholesaleUsers, setWholesaleUsers] = useState<WholesaleUser[]>(initialUsers);
  
  const [newWholesaleUser, setNewWholesaleUser] = useState({
    username: '',
    company: ''
  });
  
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const fetchWholesaleUsers = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('company', 'wholesaler');
          
        if (error) {
          console.error('Error fetching wholesale users:', error);
          loadUsersFromLocalStorage();
          return;
        }
        
        if (profiles && profiles.length > 0) {
          const formattedUsers = profiles.map(profile => ({
            id: profile.id,
            username: profile.email?.split('@')[0] || '',
            company: profile.company || ''
          }));
          setWholesaleUsers(formattedUsers);
        } else {
          loadUsersFromLocalStorage();
        }
      } catch (error) {
        console.error('Error in fetchWholesaleUsers:', error);
        loadUsersFromLocalStorage();
      }
    };
    
    const loadUsersFromLocalStorage = () => {
      const savedUsers = localStorage.getItem('wholesaleUsers');
      if (savedUsers) {
        try {
          const parsedUsers = JSON.parse(savedUsers);
          const formattedUsers = parsedUsers.map((user: any) => ({
            id: user.id,
            username: user.username,
            company: user.company || ''
          }));
          setWholesaleUsers(formattedUsers);
        } catch (error) {
          console.error('Error parsing wholesale users:', error);
        }
      }
    };
    
    fetchWholesaleUsers();
  }, []);

  useEffect(() => {
    const usersToSave = wholesaleUsers;
    localStorage.setItem('wholesaleUsers', JSON.stringify(usersToSave));
  }, [wholesaleUsers]);

  const handleAddWholesaleUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newWholesaleUser.username) {
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: `${newWholesaleUser.username}@wholesaler.com`,
          email_confirm: true,
          user_metadata: {
            company: newWholesaleUser.company,
            role: 'wholesaler'
          }
        });
        
        if (error) {
          console.error('Error creating user in Supabase:', error);
          toast.error(error.message || 'Error creating user');
          return;
        }
        
        const userId = data.user?.id;
        
        if (userId) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              company: newWholesaleUser.company,
              role: 'wholesaler'
            })
            .eq('id', userId);
            
          if (profileError) {
            console.error('Error updating user profile:', profileError);
          }
          
          setWholesaleUsers(prev => [...prev, {
            id: userId,
            username: newWholesaleUser.username,
            company: newWholesaleUser.company
          }]);
          
          toast.success('Wholesale user added successfully');
        }
      } catch (error) {
        console.error('Error in handleAddWholesaleUser:', error);
        toast.error('Error adding user');
        
        // Fallback to local storage if Supabase fails
        setWholesaleUsers(prev => [...prev, {
          id: `w${prev.length + 1}`,
          username: newWholesaleUser.username,
          company: newWholesaleUser.company
        }]);
      }
      
      setNewWholesaleUser({
        username: '',
        company: ''
      });
      setShowAddForm(false);
    }
  };

  const handleRemoveWholesaleUser = async (id: string) => {
    try {
      setWholesaleUsers(prev => prev.filter(user => user.id !== id));
      toast.success('Wholesale user removed successfully');
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Error removing user');
    }
  };

  const exportData = wholesaleUsers.map(user => ({
    ID: user.id,
    Username: user.username,
    Company: user.company || 'N/A'
  }));

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Wholesale User Management</h3>
        <div className="flex gap-2">
          <ExportData 
            data={exportData} 
            filename="wholesale-users" 
            disabled={wholesaleUsers.length === 0}
          />
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Wholesale User
          </Button>
        </div>
      </div>
      
      {showAddForm && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleAddWholesaleUser}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={newWholesaleUser.username}
                    onChange={(e) => setNewWholesaleUser(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input 
                    id="company" 
                    value={newWholesaleUser.company}
                    onChange={(e) => setNewWholesaleUser(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add User
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wholesaleUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.company || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => handleRemoveWholesaleUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
};

export default WholesaleUserManagement;
