
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { checkWholesaleCredentials } from '@/lib/data';
import { toast } from '@/lib/toast';

interface WholesaleLoginProps {
  onSuccess: () => void;
}

const WholesaleLogin: React.FC<WholesaleLoginProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    // Simulate network request
    setTimeout(() => {
      if (checkWholesaleCredentials(username, password)) {
        // Store credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('wholesaleAuthenticated', 'true');
          localStorage.setItem('wholesaleUsername', username);
        } else {
          sessionStorage.setItem('wholesaleAuthenticated', 'true');
          sessionStorage.setItem('wholesaleUsername', username);
        }
        
        toast.success('Welcome to wholesale portal', {
          description: 'You now have access to wholesale features'
        });
        onSuccess();
      } else {
        setError(true);
        toast.error('Authentication failed', {
          description: 'Please check your username and password and try again'
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full mx-auto"
    >
      <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-lg p-8 border border-border">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-6">
          <Lock className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-center text-2xl font-semibold tracking-tight mb-2">
          Wholesale Access
        </h2>
        <p className="text-center text-muted-foreground mb-6">
          Enter your wholesale credentials to access exclusive pricing and customer management
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="sr-only">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={error ? "pr-10 border-destructive" : ""}
                  disabled={isLoading}
                  autoComplete="username"
                />
                {error && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="password" className="sr-only">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={error ? "pr-10 border-destructive" : ""}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                {error && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
                  </div>
                )}
              </div>
              {error && (
                <p className="mt-2 text-sm text-destructive">
                  Incorrect username or password
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember-wholesale" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label 
                htmlFor="remember-wholesale" 
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Keep me signed in
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full group" 
              disabled={isLoading || !username || !password}
            >
              <span>Access Wholesale Portal</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Don't have wholesale access? Contact our sales team.</p>
          <a 
            href="https://wa.me/96178991908" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-4 h-4 mr-1"
            >
              <path 
                fillRule="evenodd" 
                d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" 
                clipRule="evenodd" 
              />
            </svg>
            +961 78 991 908
          </a>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Button variant="ghost" size="sm" asChild>
          <a href="/">
            Return to shop
          </a>
        </Button>
      </div>
    </motion.div>
  );
};

export default WholesaleLogin;
