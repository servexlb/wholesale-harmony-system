
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-12",
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-medium tracking-tight transition-opacity hover:opacity-80"
        >
          <span className="font-light">Wholesale</span>
          <span className="font-semibold">System</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={cn(
              "text-sm font-medium hover:text-primary/80 transition-colors subtle-focus-ring",
              isActive('/') ? "text-primary" : "text-primary/70"
            )}
          >
            Products
          </Link>
          <Link 
            to="/about" 
            className={cn(
              "text-sm font-medium hover:text-primary/80 transition-colors subtle-focus-ring",
              isActive('/about') ? "text-primary" : "text-primary/70"
            )}
          >
            About
          </Link>
          <Link 
            to="/wholesale" 
            className={cn(
              "text-sm font-medium hover:text-primary/80 transition-colors subtle-focus-ring",
              isActive('/wholesale') ? "text-primary" : "text-primary/70"
            )}
          >
            Wholesale
          </Link>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="ml-4 text-sm hover:bg-secondary subtle-focus-ring"
          >
            <ShoppingBag className="h-4 w-4 mr-2" /> Cart
          </Button>
        </nav>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm animate-fade-in">
          <nav className="flex flex-col p-6 space-y-4">
            <Link 
              to="/" 
              className={cn(
                "px-2 py-2 rounded-md text-base font-medium transition-colors",
                isActive('/') ? "bg-secondary text-primary" : "text-primary/70 hover:bg-secondary/50"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              to="/about" 
              className={cn(
                "px-2 py-2 rounded-md text-base font-medium transition-colors",
                isActive('/about') ? "bg-secondary text-primary" : "text-primary/70 hover:bg-secondary/50"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/wholesale" 
              className={cn(
                "px-2 py-2 rounded-md text-base font-medium transition-colors",
                isActive('/wholesale') ? "bg-secondary text-primary" : "text-primary/70 hover:bg-secondary/50"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Wholesale
            </Link>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-sm w-full justify-start"
            >
              <ShoppingBag className="h-4 w-4 mr-2" /> Cart
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
