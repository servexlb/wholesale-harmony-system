
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle, LogIn, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MainLayout from "@/components/MainLayout";
import { loginUser } from "@/lib/mockData";
import { toast } from "@/lib/toast";
import { Separator } from "@/components/ui/separator";
import { GoogleLogin } from '@react-oauth/google';
import SubscriptionAlert from "@/components/SubscriptionAlert";
import { Subscription } from "@/lib/types";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  
  // For subscription alert
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);
  const [expiredSubscription, setExpiredSubscription] = useState<Subscription | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = loginUser(email, password);
      
      if (user) {
        toast.success("Login successful!");
        
        // Check for expired subscriptions
        const today = new Date();
        // In a real app, this would come from an API call
        const userSubscriptions = (window as any).mockUserSubscriptions || [];
        const expired = userSubscriptions.find((sub: Subscription) => 
          sub.userId === user.id && 
          sub.status === "expired" && 
          new Date(sub.endDate) < today
        );
        
        if (expired) {
          setExpiredSubscription(expired);
          setShowSubscriptionAlert(true);
        }
        
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleLoginSuccess = (credentialResponse: any) => {
    console.log("Google login successful:", credentialResponse);
    setOauthError(null);
    toast.success("Google sign-in successful!");
    
    // In a real implementation, you would verify the Google token on your backend
    // and check for expired subscriptions there
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
        className="max-w-md mx-auto"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Sign in to your Servexlb account
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {oauthError && (
            <Alert className="mb-6 border-amber-500 text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20">
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                <a 
                  href="#" 
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Reset password functionality will be available soon!");
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative my-4">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white dark:bg-gray-800 px-2 text-sm text-gray-500">or</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={onGoogleLoginSuccess}
                onError={onGoogleLoginError}
                useOneTap
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="300"
              />
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Don't have an account yet?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
          
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              By continuing, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Subscription Alert Dialog */}
      {expiredSubscription && (
        <SubscriptionAlert 
          subscription={expiredSubscription}
          open={showSubscriptionAlert}
          onOpenChange={setShowSubscriptionAlert}
        />
      )}
    </MainLayout>
  );
};

export default Login;
