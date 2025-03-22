
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole, User } from "@/lib/types";
import { toast } from "sonner";
import { Search, Plus, Minus } from "lucide-react";

// Mock users data - in a real app, this would come from your API/database
const mockUsers: User[] = [
  {
    id: "u1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 555-123-4567",
    role: "customer",
    balance: 125.50,
    createdAt: "2023-01-15T08:30:00Z"
  },
  {
    id: "u2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 555-987-6543",
    role: "wholesale",
    balance: 350.75,
    createdAt: "2023-02-20T10:15:00Z"
  },
  {
    id: "u3",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    balance: 0,
    createdAt: "2023-01-01T00:00:00Z"
  }
];

const AdminBalanceManagement = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState(0);
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setAmount(0);
  };
  
  const handleAddBalance = () => {
    if (!selectedUser || amount <= 0) return;
    
    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, balance: user.balance + amount } 
        : user
    ));
    
    setSelectedUser(prev => prev ? { ...prev, balance: prev.balance + amount } : null);
    toast.success(`Added $${amount.toFixed(2)} to ${selectedUser.name}'s balance`);
    setAmount(0);
  };
  
  const handleRemoveBalance = () => {
    if (!selectedUser || amount <= 0) return;
    
    if (selectedUser.balance < amount) {
      toast.error("Cannot remove more than the current balance");
      return;
    }
    
    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, balance: user.balance - amount } 
        : user
    ));
    
    setSelectedUser(prev => prev ? { ...prev, balance: prev.balance - amount } : null);
    toast.success(`Removed $${amount.toFixed(2)} from ${selectedUser.name}'s balance`);
    setAmount(0);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Balance Management</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select User</CardTitle>
            <CardDescription>Find a user to manage their balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="border rounded-md h-[300px] overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  <div className="divide-y">
                    {filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        className={`p-3 cursor-pointer hover:bg-accent ${selectedUser?.id === user.id ? 'bg-accent' : ''}`}
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-sm mt-1">
                          Balance: <span className="font-medium">${user.balance.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No users found
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Manage Balance</CardTitle>
            <CardDescription>Add or remove funds from the selected user's account</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="mt-2 text-2xl font-bold">
                    Current Balance: ${selectedUser.balance.toFixed(2)}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount || ''}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      placeholder="Enter amount"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <Button
                      onClick={handleAddBalance}
                      disabled={!amount || amount <= 0}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Funds
                    </Button>
                    <Button
                      onClick={handleRemoveBalance}
                      disabled={!amount || amount <= 0 || selectedUser.balance < amount}
                      variant="outline"
                      className="flex-1"
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Remove Funds
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                Please select a user from the list
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBalanceManagement;
