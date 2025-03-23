
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface WholesaleLoginProps {
  onSuccess: (username: string) => void;
  isLoggedOut?: boolean;
}

const WholesaleLogin: React.FC<WholesaleLoginProps> = ({ onSuccess, isLoggedOut = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const isAuthenticated = localStorage.getItem('wholesaleAuthenticated') === 'true';
    if (isAuthenticated && !isLoggedOut) {
      const username = localStorage.getItem('wholesalerId') || '';
      onSuccess(username);
    }
  }, [onSuccess, isLoggedOut]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // For demonstration purposes, we'll check for hardcoded credentials
    // and also check against any wholesale users added via admin
    setTimeout(() => {
      // Check for default credentials
      if ((username === 'admin' && password === 'admin123') || 
          (username === 'wholesaler1' && password === 'password123')) {
        toast({
          title: "Login successful!",
          description: "Welcome to the wholesale portal."
        });
        onSuccess(username);
        return;
      }

      // Get any additional wholesale users added by the admin
      const savedWholesaleUsers = localStorage.getItem('wholesaleUsers');
      if (savedWholesaleUsers) {
        const users = JSON.parse(savedWholesaleUsers);
        const user = users.find((u: any) => u.username === username && u.password === password);
        
        if (user) {
          toast({
            title: "Login successful!",
            description: "Welcome to the wholesale portal."
          });
          onSuccess(username);
          return;
        }
      }

      setError('Invalid username or password');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Wholesale Login</CardTitle>
        <CardDescription className="text-center">
          {isLoggedOut 
            ? "You've been signed out. Please login again to access the wholesale portal."
            : "Enter your credentials to access the wholesale portal"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm bg-destructive/15 text-destructive rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="username" 
                className="pl-10" 
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                type="password" 
                className="pl-10" 
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          <p>For demo purposes:</p>
          <p>Username: <code className="bg-muted px-1 py-0.5 rounded">wholesaler1</code> Password: <code className="bg-muted px-1 py-0.5 rounded">password123</code></p>
          <p>Or</p>
          <p>Username: <code className="bg-muted px-1 py-0.5 rounded">admin</code> Password: <code className="bg-muted px-1 py-0.5 rounded">admin123</code></p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default WholesaleLogin;
