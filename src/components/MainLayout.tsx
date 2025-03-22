
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Home, Package, LifeBuoy, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Mock authentication state (in real app, use a proper auth system)
  const isLoggedIn = false;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">Servexlb</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className={`text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary ${
                location.pathname === "/" ? "text-primary dark:text-primary font-medium" : ""
              }`}>
                Home
              </Link>
              <Link to="/services" className={`text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary ${
                location.pathname.includes("/services") ? "text-primary dark:text-primary font-medium" : ""
              }`}>
                Services
              </Link>
              <Link to="/dashboard" className={`text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary ${
                location.pathname.includes("/dashboard") ? "text-primary dark:text-primary font-medium" : ""
              }`}>
                Dashboard
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
              )}
              
              <Link to="/checkout">
                <Button variant="default" size="sm">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-top z-50">
        <div className="flex justify-around py-2">
          <Link to="/" className="flex flex-col items-center p-2">
            <Home className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Home</span>
          </Link>
          <Link to="/services" className="flex flex-col items-center p-2">
            <Package className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Services</span>
          </Link>
          <Link to="/dashboard" className="flex flex-col items-center p-2">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Account</span>
          </Link>
          <Link to="/support" className="flex flex-col items-center p-2">
            <LifeBuoy className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <span className="text-xs mt-1 text-gray-600 dark:text-gray-300">Support</span>
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-300">© 2023 Servexlb. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">Terms</a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">Privacy</a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
