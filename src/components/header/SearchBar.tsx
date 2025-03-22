
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

const SearchBar: React.FC = () => {
  return (
    <div className="relative mx-4 flex-1 max-w-md">
      <Input
        type="search"
        placeholder="Search for services..."
        className="pl-10 pr-4 py-2 w-full"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  );
};

export default SearchBar;
