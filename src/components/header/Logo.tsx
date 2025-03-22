
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Store } from 'lucide-react';

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
      
      {!imageError ? (
        <img 
          src="/lovable-uploads/2de39295-5e87-45c2-b1b5-0222b993cf72.png" 
          alt="Servexlb Logo" 
          className={`h-10 w-auto ${darkMode ? 'brightness-0 invert' : 'contrast-150 brightness-50'} ${imageLoaded ? 'block' : 'hidden'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            console.log("Logo image failed to load");
            setImageError(true);
          }}
        />
      ) : (
        <div className="flex items-center">
          <Store className="h-6 w-6 mr-2" />
          <span className="font-bold text-xl">ServexLB</span>
        </div>
      )}
    </Link>
  );
};

export default Logo;
