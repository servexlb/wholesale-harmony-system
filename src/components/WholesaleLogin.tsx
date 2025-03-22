
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { checkWholesalePassword } from '@/lib/data';
import { toast } from '@/components/ui/sonner';

interface WholesaleLoginProps {
  onSuccess: () => void;
}

const WholesaleLogin: React.FC<WholesaleLoginProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    // Simulate network request
    setTimeout(() => {
      if (checkWholesalePassword(password)) {
        toast.success('Welcome to wholesale portal', {
          description: 'You now have access to wholesale features'
        });
        onSuccess();
      } else {
        setError(true);
        toast.error('Authentication failed', {
          description: 'Please check your password and try again'
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
          Enter your wholesale password to access exclusive pricing and customer management
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
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
                  Incorrect password
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full group" 
              disabled={isLoading || !password}
            >
              <span>Access Wholesale Portal</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Don't have wholesale access? Contact our sales team.</p>
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
