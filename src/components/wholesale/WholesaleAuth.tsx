
import React from 'react';
import Header from '@/components/Header';
import WholesaleLogin from '@/components/WholesaleLogin';

interface WholesaleAuthProps {
  onLoginSuccess: (username: string) => void;
  isLoggedOut?: boolean;
}

const WholesaleAuth: React.FC<WholesaleAuthProps> = ({ onLoginSuccess, isLoggedOut = false }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 container mx-auto max-w-7xl px-6 min-h-[80vh] flex items-center justify-center">
        <WholesaleLogin onSuccess={onLoginSuccess} isLoggedOut={isLoggedOut} />
      </main>
    </div>
  );
};

export default WholesaleAuth;
