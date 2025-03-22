import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, User, Mail, Phone, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import MainLayout from "@/components/MainLayout";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GoogleLogin } from '@react-oauth/google';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
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
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Generate a unique user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('currentUserId', userId);
    
    // Set initial user profile with empty fields
    const userProfile = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    };
    localStorage.setItem(`userProfile_${userId}`, JSON.stringify(userProfile));
    
    // Initialize user balance to 0
    localStorage.setItem(`userBalance_${userId}`, "0");
    
    // Initialize empty transaction history
    localStorage.setItem(`transactionHistory_${userId}`, JSON.stringify([]));
    
    // Initialize empty orders
    localStorage.setItem(`customerOrders_${userId}`, JSON.stringify([]));
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Account created!",
        description: "You have successfully registered. Welcome aboard!",
      });
      navigate("/dashboard");
    }, 1500);
  };

  const onGoogleSignUpSuccess = (credentialResponse: any) => {
    console.log("Google login successful:", credentialResponse);
    setOauthError(null);
    
    // Generate a unique user ID for the Google user
    const userId = `google_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('currentUserId', userId);
    
    // Set initial user profile with empty fields
    const userProfile = {
      name: "",
      email: "",
      phone: ""
    };
    localStorage.setItem(`userProfile_${userId}`, JSON.stringify(userProfile));
    
    // Initialize user balance to 0
    localStorage.setItem(`userBalance_${userId}`, "0");
    
    // Initialize empty transaction history
    localStorage.setItem(`transactionHistory_${userId}`, JSON.stringify([]));
    
    // Initialize empty orders
    localStorage.setItem(`customerOrders_${userId}`, JSON.stringify([]));
    
    toast({
      title: "Success!",
      description: "Your Google account has been connected.",
    });
    navigate("/dashboard");
  };

  const onGoogleSignUpError = () => {
    console.error("Google sign-up failed");
    setOauthError(
      "Google sign-up failed. This is likely because your app domain is not authorized in your Google OAuth Client settings."
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
            <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
            <CardDescription>
              Register to access our services and manage your subscriptions
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
                    <li>Add redirect URIs if needed (e.g., https://yourdomain.com/register)</li>
                    <li>Save changes and wait a few minutes for them to propagate</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={onGoogleSignUpSuccess}
                onError={onGoogleSignUpError}
                useOneTap
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
                width="300"
              />
            </div>

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white dark:bg-gray-800 px-2 text-sm text-gray-500">or register with email</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input 
                    id="name" 
                    placeholder="Enter your full name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
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
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number (Optional)
                  </Label>
                  <Input 
                    id="phone" 
                    placeholder="Enter your phone number" 
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Create a password"
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </label>
                </div>

                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Register"}
                </Button>
              </div>
            </form>

            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
};

export default Register;
