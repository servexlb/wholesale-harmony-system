
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { checkWholesaleCredentials } from '@/lib/data';

const formSchema = z.object({
  username: z.string().min(3, "Username must contain at least 3 characters"),
  password: z.string().min(6, "Password must contain at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface WholesaleLoginProps {
  onSuccess: (username: string) => void;
}

const WholesaleLogin: React.FC<WholesaleLoginProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isValid = checkWholesaleCredentials(values.username, values.password);
      
      if (isValid) {
        // Clear any previous wholesaler data first
        localStorage.removeItem('wholesalerUsername');
        
        // Store the wholesaler information in localStorage
        localStorage.setItem('wholesalerUsername', values.username);
        
        // If remember me is checked, save login details
        if (values.rememberMe) {
          localStorage.setItem('wholesaleRememberMe', 'true');
          localStorage.setItem('wholesaleUsername', values.username);
        } else {
          // Clean up any previously saved login details
          localStorage.removeItem('wholesaleRememberMe');
          localStorage.removeItem('wholesaleUsername');
        }
        
        toast.success("Login successful", {
          description: "Welcome to the wholesale portal"
        });
        onSuccess(values.username);
      } else {
        toast.error("Login failed", {
          description: "Invalid username or password"
        });
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle>Wholesale Login</CardTitle>
        <CardDescription>
          Enter your wholesale credentials to access exclusive wholesale pricing and services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-1">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Remember me
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center text-center text-sm text-muted-foreground">
        <p>Not a wholesale customer yet?</p>
        <p>Contact us at <a href="tel:+96178991908" className="text-primary hover:underline">+961 7 899 1908</a> to apply for a wholesale account.</p>
      </CardFooter>
    </Card>
  );
};

export default WholesaleLogin;
