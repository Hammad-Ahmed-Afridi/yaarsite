"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  storeOwnerId: string; // To link cart items to a specific store owner
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantityToAdd: number = 1) => {
    setCartItems(prevItems => {
      // If cart is not empty and the new item is from a different store
      if (prevItems.length > 0 && prevItems[0].storeOwnerId !== item.storeOwnerId) {
        toast.warning(
          `Your cart contains items from another store. Do you want to clear your cart and add this item?`,
          {
            action: {
              label: 'Clear & Add',
              onClick: () => {
                setCartItems([{ ...item, quantity: quantityToAdd }]); // Clear and add new item
                toast.success(`${item.name} added to cart (previous cart cleared)!`);
              },
            },
            cancel: {
              label: 'Cancel',
              onClick: () => toast.info('Action cancelled.'),
            },
            duration: 10000, // Give user time to react
          }
        );
        return prevItems; // Return previous items for now, actual update happens in toast action
      }

      const existingItemIndex = prevItems.findIndex(cartItem => cartItem.id === item.id);

      if (existingItemIndex > -1) {
        // If item exists, update its quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantityToAdd;
        toast.success(`${item.name} quantity updated in cart!`);
        return updatedItems;
      } else {
        // If item is new, add it to the cart
        toast.success(`${item.name} added to cart!`);
        return [...prevItems, { ...item, quantity: quantityToAdd }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== productId);
      toast.info("Item removed from cart.");
      return updatedItems;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      );
      return updatedItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast.info("Cart cleared.");
  }, []);

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
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
    throw new Error('useCart must be used within a CartContextProvider');
  }
  return context;
};