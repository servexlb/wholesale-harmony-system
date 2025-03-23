
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Settings, User, ShoppingBag, MessageCircle, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface NavigationLinksProps {
  isAdminAuthenticated: boolean;
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({ isAdminAuthenticated }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem('currentUserId');
    const wholesalerAuth = localStorage.getItem('wholesaleAuthenticated');
    
    setIsAuthenticated(!!(userId || wholesalerAuth === 'true'));
  }, []);

  const handleWhatsAppRedirect = () => {
    window.open(`https://wa.me/96178991908`, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUserId');
    window.location.href = '/';
  };

  return (
    <nav className="hidden md:flex items-center space-x-4">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-green-500 hover:text-white hover:bg-green-500"
        onClick={handleWhatsAppRedirect}
        title="Contact us on WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
      
      <Link to="/wholesale">
        <Button variant="outline" size="sm" className="flex gap-2 items-center">
          <Briefcase className="h-4 w-4" />
          <span>Wholesale</span>
        </Button>
      </Link>
      
      {isAdminAuthenticated ? (
        <Link to="/admin">
          <Button variant="outline" size="sm" className="flex gap-2 items-center">
            <Settings className="h-4 w-4" />
            <span>Admin</span>
          </Button>
        </Link>
      ) : null}
      
      {isAuthenticated ? (
        <>
          <Link to="/account">
            <Button variant="outline" size="sm" className="flex gap-2 items-center">
              <User className="h-4 w-4" />
              <span>Account</span>
            </Button>
          </Link>
        </>
      ) : (
        <>
          <Link to="/login">
            <Button variant="outline" size="sm" className="flex gap-2 items-center">
              <User className="h-4 w-4" />
              <span>Login</span>
            </Button>
          </Link>
          
          <Link to="/register">
            <Button variant="outline" size="sm">Register</Button>
          </Link>
        </>
      )}
      
      <Link to="/checkout">
        <Button variant="default" size="sm" className="flex gap-2 items-center">
          <ShoppingBag className="h-4 w-4" />
          <span>Cart</span>
        </Button>
      </Link>
    </nav>
  );
};

export default NavigationLinks;
