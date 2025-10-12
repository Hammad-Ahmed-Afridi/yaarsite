"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

interface CartItem {
  id: string; // Product ID
  variantId?: string; // New: ID of the selected variant
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  storeOwnerId: string;
  stock: number; // Stock of the specific variant or product
  original_price?: number | null;
  discount_percentage?: number | null;
  discount_start_date?: string | null;
  discount_end_date?: string | null;
  selectedAttributes?: { [key: string]: string }; // New: Selected variant attributes
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void; // Updated item type
  removeFromCart: (productId: string, variantId?: string) => void; // Updated to include variantId
  updateQuantity: (productId: string, newQuantity: number, variantId?: string) => void; // Updated to include variantId
  clearCart: (suppressToast?: boolean) => void;
  cartTotal: number;
  itemCount: number;
  deliveryCharge: number;
  isLoadingDeliveryCharge: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [isLoadingDeliveryCharge, setIsLoadingDeliveryCharge] = useState(true);

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

  // Fetch delivery charge when cart items change
  useEffect(() => {
    async function fetchDeliveryCharge() {
      setIsLoadingDeliveryCharge(true);
      if (cartItems.length > 0) {
        const storeOwnerId = cartItems[0].storeOwnerId;
        const { data, error } = await supabase
          .from('profiles')
          .select('delivery_charge')
          .eq('id', storeOwnerId)
          .single();

        if (error || !data) {
          console.error("Error fetching delivery charge:", error);
          setDeliveryCharge(0); // Default to 0 on error
        } else {
          setDeliveryCharge(data.delivery_charge || 0);
        }
      } else {
        setDeliveryCharge(0);
      }
      setIsLoadingDeliveryCharge(false);
    }
    fetchDeliveryCharge();
  }, [cartItems]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantityToAdd: number = 1) => {
    setCartItems(prevItems => {
      // Check if cart is not empty and the new item is from a different store
      if (prevItems.length > 0 && prevItems[0].storeOwnerId !== item.storeOwnerId) {
        toast.error("You can only add items from one store at a time. Please clear your cart to shop from a different store.");
        return prevItems; // Do not modify cart
      }

      // For items with variants, treat different selections as distinct items in cart
      const existingItemIndex = prevItems.findIndex(cartItem =>
        cartItem.id === item.id &&
        cartItem.variantId === item.variantId // Match by variantId if present
      );

      if (existingItemIndex > -1) {
        // If item exists with same variant, update its quantity
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantityToAdd;

        if (newQuantity > item.stock) {
          toast.error(`Cannot add more than available stock (${item.stock} in stock).`);
          return prevItems; // Prevent adding if it exceeds stock
        }

        updatedItems[existingItemIndex].quantity = newQuantity;
        toast.success(`${item.name} quantity updated in cart!`);
        return updatedItems;
      } else {
        // If item is new or has different variant, add it to the cart
        if (quantityToAdd > item.stock) {
          toast.error(`Cannot add more than available stock (${item.stock} in stock).`);
          return prevItems; // Prevent adding if initial quantity exceeds stock
        }
        toast.success(`${item.name} added to cart!`);
        return [...prevItems, { ...item, quantity: quantityToAdd }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item =>
        item.id !== productId || (variantId !== undefined && item.variantId !== variantId)
      );
      toast.info("Item removed from cart.");
      return updatedItems;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, newQuantity: number, variantId?: string) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === productId && (variantId === undefined || item.variantId === variantId)) {
          if (newQuantity < 1) {
            toast.error("Quantity cannot be less than 1.");
            return item;
          }
          if (newQuantity > item.stock) {
            toast.error(`Cannot add more than available stock (${item.stock} in stock).`);
            return item;
          }
          toast.success(`${item.name} quantity updated to ${newQuantity}.`);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      return updatedItems;
    });
  }, []);

  const clearCart = useCallback((suppressToast: boolean = false) => {
    setCartItems([]);
    if (!suppressToast) {
      toast.info("Cart cleared.");
    }
  }, []);

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartTotal = subtotal + deliveryCharge;
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
        deliveryCharge,
        isLoadingDeliveryCharge,
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