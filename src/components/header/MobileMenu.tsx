
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminAuthenticated: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, isAdminAuthenticated }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden absolute top-full left-0 right-0 bg-background shadow-md animate-fade-in">
      <div className="p-4 relative">
        <Input
          type="search"
          placeholder="Search for services..."
          className="pl-10 pr-4 py-2 w-full mb-4"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
      <nav className="flex flex-col p-4 space-y-2">
        <Link 
          to="/" 
          className={cn(
            "px-3 py-2 rounded-md text-base font-medium transition-colors",
            isActive('/') ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
          )}
          onClick={onClose}
        >
          Home
        </Link>
        <Link 
          to="/services" 
          className={cn(
            "px-3 py-2 rounded-md text-base font-medium transition-colors",
            isActive('/services') ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
          )}
          onClick={onClose}
        >
          Services
        </Link>
        <Link 
          to="/wholesale" 
          className={cn(
            "px-3 py-2 rounded-md text-base font-medium transition-colors",
            isActive('/wholesale') ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
          )}
          onClick={onClose}
        >
          Wholesale
        </Link>
        {isAdminAuthenticated ? (
          <Link 
            to="/admin" 
            className={cn(
              "px-3 py-2 rounded-md text-base font-medium transition-colors",
              isActive('/admin') ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
            )}
            onClick={onClose}
          >
            Admin
          </Link>
        ) : null}
        <Link 
          to="/login" 
          className={cn(
            "px-3 py-2 rounded-md text-base font-medium transition-colors",
            isActive('/login') ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
          )}
          onClick={onClose}
        >
          Login
        </Link>
        <Link 
          to="/register" 
          className={cn(
            "px-3 py-2 rounded-md text-base font-medium transition-colors",
            isActive('/register') ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
          )}
          onClick={onClose}
        >
          Register
        </Link>
      </nav>
    </div>
  );
};

export default MobileMenu;
