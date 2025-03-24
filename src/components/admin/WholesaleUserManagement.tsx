
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/lib/toast";
import ExportData from "@/components/wholesale/ExportData";
import { supabase } from "@/integrations/supabase/client";

interface WholesaleUser {
  id: string;
  username: string;
  password: string;
  company: string;
  showPassword: boolean;
}

// Define initial users as a constant, not referencing the type
const initialUsersData = [
  { id: 'w1', username: 'wholesaler1', password: 'password123', company: 'ABC Trading', showPassword: false },
  { id: 'w2', username: 'admin', password: 'admin123', company: 'XYZ Distributors', showPassword: false }
];

const WholesaleUserManagement = () => {
  // Initialize state with a direct array, not referencing initialUsers
  const [wholesaleUsers, setWholesaleUsers] = useState<WholesaleUser[]>([
    { id: 'w1', username: 'wholesaler1', password: 'password123', company: 'ABC Trading', showPassword: false },
    { id: 'w2', username: 'admin', password: 'admin123', company: 'XYZ Distributors', showPassword: false }
  ]);
  
  const [newWholesaleUser, setNewWholesaleUser] = useState({
    username: '',
    password: '',
    company: ''
  });
  
  const [showAddForm, setShowAddForm] = useState(false);

  // Load saved wholesale users on component mount
  useEffect(() => {
    const fetchWholesaleUsers = async () => {
      try {
        // First try to get users from Supabase
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'wholesaler');
          
        if (error) {
          console.error('Error fetching wholesale users:', error);
          loadUsersFromLocalStorage();
          return;
        }
        
        if (profiles && profiles.length > 0) {
          // Convert profiles to WholesaleUser format
          const formattedUsers = profiles.map(profile => ({
            id: profile.id,
            username: profile.email?.split('@')[0] || '',
            password: '••••••••', // We don't store or display actual passwords
            company: profile.company || '',
            showPassword: false
          }));
          setWholesaleUsers(formattedUsers);
        } else {
          // Fallback to localStorage
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
          // Add showPassword field if it doesn't exist
          const formattedUsers = parsedUsers.map((user: any) => ({
            ...user,
            showPassword: false
          }));
          setWholesaleUsers(formattedUsers);
        } catch (error) {
          console.error('Error parsing wholesale users:', error);
        }
      }
    };
    
    fetchWholesaleUsers();
  }, []);

  // Save wholesale users whenever they change
  useEffect(() => {
    // Remove showPassword field before saving
    const usersToSave = wholesaleUsers.map(({ showPassword, ...user }) => user);
    localStorage.setItem('wholesaleUsers', JSON.stringify(usersToSave));
  }, [wholesaleUsers]);

  const handleAddWholesaleUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newWholesaleUser.username && newWholesaleUser.password) {
      try {
        // Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: `${newWholesaleUser.username}@wholesaler.com`,
          password: newWholesaleUser.password,
          options: {
            data: {
              company: newWholesaleUser.company,
              role: 'wholesaler'
            }
          }
        });
        
        if (error) {
          console.error('Error creating user in Supabase:', error);
          toast.error(error.message || 'Error creating user');
          return;
        }
        
        // User created in Supabase
        const userId = data.user?.id;
        
        if (userId) {
          // Update the profile with company info
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
          
          // Add user to local state
          setWholesaleUsers(prev => [...prev, {
            id: userId,
            ...newWholesaleUser,
            showPassword: false
          }]);
          
          toast.success('Wholesale user added successfully');
        }
      } catch (error) {
        console.error('Error in handleAddWholesaleUser:', error);
        toast.error('Error adding user');
        
        // Fallback to local storage
        setWholesaleUsers(prev => [...prev, {
          id: `w${prev.length + 1}`,
          ...newWholesaleUser,
          showPassword: false
        }]);
      }
      
      // Reset form
      setNewWholesaleUser({
        username: '',
        password: '',
        company: ''
      });
      setShowAddForm(false);
    }
  };

  const handleRemoveWholesaleUser = async (id: string) => {
    try {
      // Delete user from Supabase - NOTE: This requires admin privileges
      // In a real app, you might want to implement this as an admin function
      // For now, we'll just remove from local state
      
      // For localStorage based users
      setWholesaleUsers(prev => prev.filter(user => user.id !== id));
      toast.success('Wholesale user removed successfully');
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Error removing user');
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setWholesaleUsers(prev => prev.map(user => 
      user.id === id ? { ...user, showPassword: !user.showPassword } : user
    ));
  };

  // Prepare data for export (without passwords)
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={newWholesaleUser.password}
                    onChange={(e) => setNewWholesaleUser(prev => ({ ...prev, password: e.target.value }))}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
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
                    <div className="flex items-center space-x-2">
                      <span>{user.showPassword ? user.password : '•••••••••••'}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => togglePasswordVisibility(user.id)}
                      >
                        {user.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
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
