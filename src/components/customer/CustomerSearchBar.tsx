
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CustomerSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const CustomerSearchBar: React.FC<CustomerSearchBarProps> = ({ 
  searchTerm, 
  setSearchTerm 
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="relative flex-1 px-2 py-2">
      <div className="absolute inset-y-0 left-3 flex items-center pl-2 pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder="Search products..."
        value={searchTerm}
        onChange={handleInputChange}
        className="pl-9 w-full"
      />
    </div>
  );
};

export default CustomerSearchBar;
