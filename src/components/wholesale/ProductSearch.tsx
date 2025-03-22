
import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar, Zap, Package } from 'lucide-react';
import { Product } from '@/lib/data';

interface ProductSearchProps {
  products: Product[];
  selectedProductId: string;
  onProductSelect: (productId: string) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ 
  products, 
  selectedProductId, 
  onProductSelect 
}) => {
  const [productSearch, setProductSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter products based on search query and active tab
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.description.toLowerCase().includes(productSearch.toLowerCase());
        
      if (activeTab === 'all') return matchesSearch;
      if (activeTab === 'subscription') return matchesSearch && product.type === 'subscription';
      if (activeTab === 'recharge') return matchesSearch && product.type === 'recharge';
      if (activeTab === 'giftcard') return matchesSearch && (product.type === 'giftcard' || !product.type);
      
      return matchesSearch;
    });
  }, [products, productSearch, activeTab]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      const category = product.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [filteredProducts]);

  const renderProductIcon = (type?: string) => {
    if (type === 'subscription') return <Calendar className="h-4 w-4 text-blue-500" />;
    if (type === 'recharge') return <Zap className="h-4 w-4 text-amber-500" />;
    return <Package className="h-4 w-4 text-green-500" />;
  };

  return (
    <div>
      <label className="text-sm font-medium mb-1 block">Product</label>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
        <TabsList className="grid grid-cols-4 mb-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="subscription">Subscriptions</TabsTrigger>
          <TabsTrigger value="recharge">Recharges</TabsTrigger>
          <TabsTrigger value="giftcard">Gift Cards</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
        </div>
        
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Search products..." value={productSearch} onValueChange={setProductSearch} className="h-9" />
          <CommandList className="max-h-[200px] overflow-auto">
            <CommandEmpty>No products found.</CommandEmpty>
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <CommandGroup key={category} heading={category}>
                {categoryProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() => onProductSelect(product.id)}
                    className={`flex items-center gap-2 cursor-pointer ${selectedProductId === product.id ? 'bg-accent text-accent-foreground' : ''}`}
                  >
                    {renderProductIcon(product.type)}
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-xs text-muted-foreground">${product.wholesalePrice.toFixed(2)}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </div>
    </div>
  );
};

export default React.memo(ProductSearch);
