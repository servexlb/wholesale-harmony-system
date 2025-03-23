
import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { 
  Search, 
  Trash2, 
  Ban, 
  User as UserIcon,
  Mail,
  AlertTriangle
} from "lucide-react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  email: string;
  name: string;
  registrationDate: string;
  isActive: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Get user data from localStorage
  useEffect(() => {
    const loadUsers = () => {
      const usersList: User[] = [];
      const userIds = Object.values(JSON.parse(localStorage.getItem('userEmailToId') || '{}'));
      const registeredUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      registeredUsers.forEach((user: any, index: number) => {
        const userId = userIds[index] || `unknown_${index}`;
        const userProfileData = localStorage.getItem(`userProfile_${userId}`);
        let name = "Unknown";
        
        if (userProfileData) {
          const profile = JSON.parse(userProfileData);
          name = profile.name || "Unknown";
        }
        
        usersList.push({
          id: userId,
          email: user.email,
          name: name,
          registrationDate: new Date().toISOString(), // In a real app, this would be stored
          isActive: true
        });
      });
      
      setUsers(usersList);
      setFilteredUsers(usersList);
    };
    
    loadUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    
    // Remove from users array
    const updatedUsers = users.filter(u => u.id !== userToDelete.id);
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers.filter(u => 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));
    
    // Get all registered users
    const registeredUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedRegisteredUsers = registeredUsers.filter((u: any) => u.email !== userToDelete.email);
    localStorage.setItem('users', JSON.stringify(updatedRegisteredUsers));
    
    // Update email to ID mapping
    const userEmailToId = JSON.parse(localStorage.getItem('userEmailToId') || '{}');
    delete userEmailToId[userToDelete.email];
    localStorage.setItem('userEmailToId', JSON.stringify(userEmailToId));
    
    // Clean up user data
    localStorage.removeItem(`userProfile_${userToDelete.id}`);
    localStorage.removeItem(`userBalance_${userToDelete.id}`);
    localStorage.removeItem(`transactionHistory_${userToDelete.id}`);
    localStorage.removeItem(`customerOrders_${userToDelete.id}`);
    
    toast.success(`User ${userToDelete.email} has been removed`);
    setShowDeleteDialog(false);
    setUserToDelete(null);
  };

  const toggleUserStatus = (user: User) => {
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers.filter(u => 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));
    
    toast.success(`User ${user.email} has been ${user.isActive ? 'deactivated' : 'activated'}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">User Management</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by email or name"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">
                {searchQuery ? 'Try adjusting your search query' : 'No users have registered yet'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        {user.name}
                      </TableCell>
                      <TableCell className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {new Date(user.registrationDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user)}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              {userToDelete && ` for ${userToDelete.email}`} and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
