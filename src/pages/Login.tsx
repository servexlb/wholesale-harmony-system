
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import MainLayout from "@/components/MainLayout";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    // Get the registered users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find the user with matching email and password
    const user = users.find((u: any) => 
      u.email === formData.email && u.password === formData.password
    );
    
    if (user) {
      // Get the user ID associated with this email
      const userEmailToId = JSON.parse(localStorage.getItem('userEmailToId') || '{}');
      const userId = userEmailToId[formData.email];
      
      if (userId) {
        // Set the current user ID
        localStorage.setItem('currentUserId', userId);
        
        setTimeout(() => {
          setIsSubmitting(false);
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate("/dashboard");
        }, 1000);
      } else {
        setIsSubmitting(false);
        setError("User ID not found. Please register again.");
      }
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        setError("Invalid email or password. Please try again.");
      }, 1000);
    }
  };

  const onGoogleLoginSuccess = (credentialResponse: any) => {
    console.log("Google login successful:", credentialResponse);
    setOauthError(null);
    
    // Generate a temporary user ID for Google users if they haven't logged in before
    const googleUserId = `google_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('currentUserId', googleUserId);
    
    // Initialize user data if it doesn't exist
    if (!localStorage.getItem(`userProfile_${googleUserId}`)) {
      const userProfile = {
        name: "",
        email: "",
        phone: ""
      };
      localStorage.setItem(`userProfile_${googleUserId}`, JSON.stringify(userProfile));
      localStorage.setItem(`userBalance_${googleUserId}`, "0");
      localStorage.setItem(`transactionHistory_${googleUserId}`, JSON.stringify([]));
      localStorage.setItem(`customerOrders_${googleUserId}`, JSON.stringify([]));
    }
    
    toast({
      title: "Success!",
      description: "You've been logged in with Google.",
    });
    navigate("/dashboard");
  };

  const onGoogleLoginError = () => {
    console.error("Google sign-in failed");
    setOauthError(
      "Google sign-in failed. This is likely because your app domain is not authorized in your Google OAuth Client settings."
    );
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="flex justify-center items-center py-12 px-4"
      >
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-2">
                <Info className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {oauthError && (
              <Alert className="mb-4 border-amber-500 text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20">
                <Info className="h-4 w-4" />
                <AlertDescription className="flex flex-col gap-2">
                  <p>{oauthError}</p>
                  <ol className="list-decimal pl-4 text-xs space-y-1">
                    <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="underline">Google Cloud Console</a></li>
                    <li>Select your OAuth 2.0 Client ID</li>
                    <li>Add your app domain to the Authorized JavaScript origins</li>
                    <li>Add redirect URIs if needed (e.g., https://yourdomain.com/login)</li>
                    <li>Save changes and wait a few minutes for them to propagate</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={onGoogleLoginSuccess}
                onError={onGoogleLoginError}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="300"
              />
            </div>

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white dark:bg-gray-800 px-2 text-sm text-gray-500">or continue with email</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Password
                    </Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>

            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
};

export default Login;
