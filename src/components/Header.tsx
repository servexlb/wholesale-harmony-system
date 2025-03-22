
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check for user preference in localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-4 md:px-8",
        scrolled ? "bg-background/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-medium tracking-tight transition-opacity hover:opacity-80"
        >
          <span className="font-light">Servexlb</span>
          <span className="font-semibold text-primary">.com</span>
        </Link>

        {/* Search bar */}
        <div className="hidden md:flex relative mx-4 flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search for services..."
            className="pl-10 pr-4 py-2 w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode} 
            className="mr-2"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
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

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Link to="/checkout">
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </Link>
          
          <button 
            className="p-2 rounded-md"
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
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background shadow-md animate-fade-in">
          <div className="p-4">
            <Input
              type="search"
              placeholder="Search for services..."
              className="pl-10 pr-4 py-2 w-full relative mb-4"
              prefix={<Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />}
            />
          </div>
          <nav className="flex flex-col p-4 space-y-2">
            <Link 
              to="/" 
              className={cn(
                "px-3 py-2 rounded-md text-base font-medium transition-colors",
                isActive('/') ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className={cn(
                "px-3 py-2 rounded-md text-base font-medium transition-colors",
                isActive('/services') ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              to="/login" 
              className={cn(
                "px-3 py-2 rounded-md text-base font-medium transition-colors",
                isActive('/login') ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className={cn(
                "px-3 py-2 rounded-md text-base font-medium transition-colors",
                isActive('/register') ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Register
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
