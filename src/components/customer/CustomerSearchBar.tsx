
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
  return (
    <div className="relative flex-1 max-w-md">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder="Search customers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default CustomerSearchBar;
