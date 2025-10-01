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
  cartItems: Record<string, CartItem[]>; // Changed to Record<storeOwnerId, CartItem[]>
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (storeOwnerId: string, productId: string) => void; // Added storeOwnerId
  updateQuantity: (storeOwnerId: string, productId: string, quantity: number) => void; // Added storeOwnerId
  clearCart: () => void;
  cartTotal: number; // Overall total across all stores
  itemCount: number; // Overall item count across all stores
  getStoreCartTotal: (storeOwnerId: string) => number; // New helper for store-specific total
  getStoreItemCount: (storeOwnerId: string) => number; // New helper for store-specific item count
  getStoreIdsInCart: () => string[]; // New helper to get all store IDs currently in cart
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<Record<string, CartItem[]>>({}); // Initialize as empty object

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        // Ensure parsedCart is a Record<string, CartItem[]>
        if (typeof parsedCart === 'object' && parsedCart !== null && !Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          // If old format or invalid, clear it
          setCartItems({});
        }
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        setCartItems({});
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantityToAdd: number = 1) => {
    setCartItems(prevItems => {
      const storeId = item.storeOwnerId;
      const storeCart = prevItems[storeId] ? [...prevItems[storeId]] : []; // Get existing cart for this store

      const existingItemIndex = storeCart.findIndex(cartItem => cartItem.id === item.id);

      if (existingItemIndex > -1) {
        // If item exists in this store's cart, update its quantity
        storeCart[existingItemIndex].quantity += quantityToAdd;
        toast.success(`${item.name} quantity updated in cart!`);
      } else {
        // If item is new for this store, add it
        storeCart.push({ ...item, quantity: quantityToAdd });
        toast.success(`${item.name} added to cart!`);
      }

      return {
        ...prevItems,
        [storeId]: storeCart, // Update the specific store's cart
      };
    });
  }, []);

  const removeFromCart = useCallback((storeOwnerId: string, productId: string) => {
    setCartItems(prevItems => {
      const updatedStoreCart = prevItems[storeOwnerId]?.filter(item => item.id !== productId) || [];
      toast.info("Item removed from cart.");

      if (updatedStoreCart.length === 0) {
        // If this store's cart is now empty, remove the store entry entirely
        const newItems = { ...prevItems };
        delete newItems[storeOwnerId];
        return newItems;
      }

      return {
        ...prevItems,
        [storeOwnerId]: updatedStoreCart,
      };
    });
  }, []);

  const updateQuantity = useCallback((storeOwnerId: string, productId: string, quantity: number) => {
    setCartItems(prevItems => {
      const updatedStoreCart = prevItems[storeOwnerId]?.map(item =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      ) || [];

      if (updatedStoreCart.length === 0) {
        // If updating quantity results in 0 and item is removed, remove store entry
        const newItems = { ...prevItems };
        delete newItems[storeOwnerId];
        return newItems;
      }

      return {
        ...prevItems,
        [storeOwnerId]: updatedStoreCart,
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems({});
    toast.info("All carts cleared.");
  }, []);

  // Helper to get total for a specific store
  const getStoreCartTotal = useCallback((storeOwnerId: string) => {
    return (cartItems[storeOwnerId] || []).reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  // Helper to get item count for a specific store
  const getStoreItemCount = useCallback((storeOwnerId: string) => {
    return (cartItems[storeOwnerId] || []).reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Helper to get all store IDs currently in the cart
  const getStoreIdsInCart = useCallback(() => {
    return Object.keys(cartItems);
  }, [cartItems]);

  // Calculate overall cart total and item count by flattening all store carts
  const allCartItemsFlat = Object.values(cartItems).flat();
  const cartTotal = allCartItemsFlat.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = allCartItemsFlat.reduce((count, item) => count + item.quantity, 0);

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
        getStoreCartTotal,
        getStoreItemCount,
        getStoreIdsInCart,
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