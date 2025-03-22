
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Key, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MainLayout from "@/components/MainLayout";
import { toast } from "@/lib/toast";

const ADMIN_ACCESS_CODE = "salim76349522hage";

const AdminAuth: React.FC = () => {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!accessCode) {
      setError("Please enter the access code");
      return;
    }
    
    setIsLoading(true);
    
    // Simple timeout to simulate verification
    setTimeout(() => {
      if (accessCode === ADMIN_ACCESS_CODE) {
        // Store in session storage that admin is authenticated
        sessionStorage.setItem("adminAuthenticated", "true");
        toast.success("Access granted!");
        navigate("/admin");
      } else {
        setError("Invalid access code");
      }
      setIsLoading(false);
    }, 800);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Enter the access code to continue
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode">Access Code</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="accessCode"
                  type="password"
                  placeholder="Enter access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
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
              {isLoading ? (
                <>Verifying...</>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Verify Access
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default AdminAuth;
