
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  darkMode: boolean;
}

const Logo: React.FC<LogoProps> = ({ darkMode }) => {
  return (
    <Link 
      to="/" 
      className="flex items-center transition-opacity hover:opacity-80"
    >
      {darkMode ? (
        <img 
          src="/lovable-uploads/2de39295-5e87-45c2-b1b5-0222b993cf72.png" 
          alt="Servexlb Logo" 
          className="h-10 w-auto brightness-0 invert" // Makes the logo white in dark mode
        />
      ) : (
        <img 
          src="/lovable-uploads/2de39295-5e87-45c2-b1b5-0222b993cf72.png" 
          alt="Servexlb Logo" 
          className="h-10 w-auto contrast-150 brightness-50" // Darkens most of the logo while keeping some color contrast
        />
      )}
    </Link>
  );
};

export default Logo;
