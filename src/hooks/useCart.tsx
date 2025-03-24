
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Service } from '@/lib/types';
import { toast } from 'sonner';

interface CartItem {
  service: Service;
  quantity: number;
  duration?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (service: Service, quantity?: number, duration?: number) => void;
  removeItem: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  updateDuration: (serviceId: string, duration: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [itemCount, setItemCount] = useState<number>(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse stored cart:', error);
      }
    }
  }, []);

  // Update localStorage when cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    
    // Calculate total
    const newTotal = items.reduce((sum, item) => {
      const itemPrice = item.service.price;
      const quantity = item.quantity || 1;
      const duration = item.duration || 1;
      
      if (item.service.type === 'subscription') {
        return sum + (itemPrice * duration * quantity);
      } else {
        return sum + (itemPrice * quantity);
      }
    }, 0);
    
    setTotal(newTotal);
    
    // Calculate item count
    const newItemCount = items.reduce((count, item) => count + item.quantity, 0);
    setItemCount(newItemCount);
  }, [items]);

  const addItem = (service: Service, quantity: number = 1, duration: number = 1) => {
    setItems((prevItems) => {
      // Check if item already exists
      const existingItemIndex = prevItems.findIndex(
        (item) => item.service.id === service.id
      );

      if (existingItemIndex > -1) {
        // Update existing item
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + quantity,
        };
        
        toast.success('Added to cart', {
          description: `${service.name} quantity updated in cart`
        });
        
        return updatedItems;
      } else {
        // Add new item
        toast.success('Added to cart', {
          description: `${service.name} added to your cart`
        });
        
        return [...prevItems, { service, quantity, duration }];
      }
    });
  };

  const removeItem = (serviceId: string) => {
    setItems((prevItems) => {
      const serviceToRemove = prevItems.find(item => item.service.id === serviceId);
      if (serviceToRemove) {
        toast.info('Removed from cart', {
          description: `${serviceToRemove.service.name} removed from your cart`
        });
      }
      
      return prevItems.filter((item) => item.service.id !== serviceId);
    });
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(serviceId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.service.id === serviceId ? { ...item, quantity } : item
      )
    );
  };

  const updateDuration = (serviceId: string, duration: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.service.id === serviceId ? { ...item, duration } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.info('Cart cleared', {
      description: 'All items have been removed from your cart'
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateDuration,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
