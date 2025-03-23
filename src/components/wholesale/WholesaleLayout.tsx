
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MenuIcon, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/Header';
import WholesaleSidebar from '@/components/wholesale/WholesaleSidebar';

interface WholesaleLayoutProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
  children: React.ReactNode;
}

const WholesaleLayout: React.FC<WholesaleLayoutProps> = ({
  sidebarOpen,
  toggleSidebar,
  activeTab,
  setActiveTab,
  handleLogout,
  children
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex pt-16">
        <WholesaleSidebar 
          sidebarOpen={sidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
        />
        
        <div className="fixed bottom-4 right-4 z-40 md:hidden">
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-md"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </Button>
        </div>

        <motion.main
          className={`flex-1 p-4 sm:p-6 pt-6 sm:pt-8 transition-all duration-300 ${sidebarOpen && !isMobile ? 'md:ml-[250px]' : ''}`}
          initial={false}
          layout
        >
          <div className="container mx-auto max-w-6xl">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default WholesaleLayout;
