
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';
import { Eye, EyeOff, Lock, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

const WholesaleSecuritySettings = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    // For this demo, we'll just show a success message
    toast.success("Password changed successfully");
    
    // Reset form
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handle2FAToggle = () => {
    toast.success("Two-factor authentication enabled");
  };

  const handleSessionClear = () => {
    toast.success("All other sessions have been logged out");
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <h3 className="text-lg font-medium">Change Password</h3>
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />
        </div>
        
        <Button type="submit">Update Password</Button>
      </form>
      
      <div className="border-t my-6 pt-6">
        <div className="flex items-center gap-4 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Security Options</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline" size="sm" onClick={handle2FAToggle}>
              <Lock className="mr-2 h-4 w-4" />
              Enable 2FA
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Active Sessions</h4>
              <p className="text-sm text-muted-foreground">Log out from all devices except this one</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSessionClear}>
              Log Out Other Devices
            </Button>
          </div>
        </div>
      </div>
      
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-destructive/80 mb-4">
            These actions are irreversible. Please proceed with caution.
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => toast.error("Account deletion requires admin approval. Please contact support.")}
            >
              Delete Account
            </Button>
            <Button 
              variant="outline" 
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => toast.success("Your data has been downloaded.")}
            >
              Export My Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WholesaleSecuritySettings;
