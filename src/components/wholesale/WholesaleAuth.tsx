
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import WholesaleLogin from '@/components/WholesaleLogin';

interface WholesaleAuthProps {
  onLoginSuccess: (username: string) => void;
  isLoggedOut?: boolean;
}

const WholesaleAuth: React.FC<WholesaleAuthProps> = ({ onLoginSuccess, isLoggedOut = false }) => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    // Check if a regular user is logged in
    const checkAuth = () => {
      const userId = localStorage.getItem('currentUserId');
      setIsUserAuthenticated(!!userId);
    };

    checkAuth();
    
    // Listen for authentication state changes
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authStateChanged', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', checkAuth);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 container mx-auto max-w-7xl px-6 min-h-[80vh] flex items-center justify-center">
        {isUserAuthenticated ? (
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md">
            <h2 className="text-xl font-semibold mb-4">Already Logged In</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You're currently logged in as a regular user. You don't need to sign up or register again.
            </p>
            <WholesaleLogin onSuccess={onLoginSuccess} isLoggedOut={isLoggedOut} />
          </div>
        ) : (
          <WholesaleLogin onSuccess={onLoginSuccess} isLoggedOut={isLoggedOut} />
        )}
      </main>
    </div>
  );
};

export default WholesaleAuth;
