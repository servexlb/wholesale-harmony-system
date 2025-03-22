
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface LogoProps {
  darkMode: boolean;
}

const Logo: React.FC<LogoProps> = ({ darkMode }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Link 
      to="/" 
      className="flex items-center transition-opacity hover:opacity-80"
    >
      {!imageLoaded && !imageError && (
        <div className="h-10 w-32 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
      
      <img 
        src="/lovable-uploads/2de39295-5e87-45c2-b1b5-0222b993cf72.png" 
        alt="Servexlb Logo" 
        className={`h-10 w-auto ${darkMode ? 'brightness-0 invert' : 'contrast-150 brightness-50'} ${imageLoaded ? 'block' : 'hidden'}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      
      {imageError && (
        <span className="font-bold text-xl">ServexLB</span>
      )}
    </Link>
  );
};

export default Logo;
