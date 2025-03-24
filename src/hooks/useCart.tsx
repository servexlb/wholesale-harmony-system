
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Service } from '@/lib/types';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  price: number;
  service: Service;
  quantity: number;
  duration?: number;
}

interface CartContextType {
  cartItems: CartItem[];
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [itemCount, setItemCount] = useState<number>(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse stored cart:', error);
      }
    }
  }, []);

  // Update localStorage when cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Calculate total
    const newTotal = cartItems.reduce((sum, item) => {
      const itemPrice = item.price;
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
    const newItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    setItemCount(newItemCount);
  }, [cartItems]);

  const addItem = (service: Service, quantity: number = 1, duration: number = 1) => {
    setCartItems((prevItems) => {
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
        
        return [...prevItems, { 
          id: service.id,
          name: service.name,
          price: service.price,
          service, 
          quantity, 
          duration 
        }];
      }
    });
  };

  const removeItem = (serviceId: string) => {
    setCartItems((prevItems) => {
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

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.service.id === serviceId ? { ...item, quantity } : item
      )
    );
  };

  const updateDuration = (serviceId: string, duration: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.service.id === serviceId ? { ...item, duration } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.info('Cart cleared', {
      description: 'All items have been removed from your cart'
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
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
