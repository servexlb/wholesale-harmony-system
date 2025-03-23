
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/lib/toast";
import ExportData from "@/components/wholesale/ExportData";

interface WholesaleUser {
  id: string;
  username: string;
  password: string;
  company: string;
  showPassword: boolean;
}

const WholesaleUserManagement = () => {
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
  }, []);

  // Save wholesale users whenever they change
  useEffect(() => {
    // Remove showPassword field before saving
    const usersToSave = wholesaleUsers.map(({ showPassword, ...user }) => user);
    localStorage.setItem('wholesaleUsers', JSON.stringify(usersToSave));
  }, [wholesaleUsers]);

  const handleAddWholesaleUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWholesaleUser.username && newWholesaleUser.password) {
      setWholesaleUsers(prev => [...prev, {
        id: `w${prev.length + 1}`,
        ...newWholesaleUser,
        showPassword: false
      }]);
      setNewWholesaleUser({
        username: '',
        password: '',
        company: ''
      });
      setShowAddForm(false);
      toast.success('Wholesale user added successfully');
    }
  };

  const handleRemoveWholesaleUser = (id: string) => {
    setWholesaleUsers(prev => prev.filter(user => user.id !== id));
    toast.success('Wholesale user removed successfully');
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
