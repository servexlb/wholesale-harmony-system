
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Settings, User, ShoppingBag } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface NavigationLinksProps {
  isAdminAuthenticated: boolean;
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({ isAdminAuthenticated }) => {
  return (
    <nav className="hidden md:flex items-center space-x-4">
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
      
      <Link to="/login">
        <Button variant="outline" size="sm" className="flex gap-2 items-center">
          <User className="h-4 w-4" />
          <span>Login</span>
        </Button>
      </Link>
      
      <Link to="/register">
        <Button variant="outline" size="sm">Register</Button>
      </Link>
      
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
