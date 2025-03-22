
import React from 'react';
import Header from '@/components/Header';
import WholesaleLogin from '@/components/WholesaleLogin';

interface WholesaleAuthProps {
  onLoginSuccess: (username: string) => void;
}

const WholesaleAuth: React.FC<WholesaleAuthProps> = ({ onLoginSuccess }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 container mx-auto max-w-7xl px-6 min-h-[80vh] flex items-center justify-center">
        <WholesaleLogin onSuccess={onLoginSuccess} />
      </main>
    </div>
  );
};

export default WholesaleAuth;
