
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

const SearchBar: React.FC = () => {
  return (
    <div className="relative mx-4 flex-1 max-w-md">
      <div className="relative">
        <Input
          type="search"
          placeholder="Search for services..."
          className="pl-10 pr-4 py-2 w-full"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
