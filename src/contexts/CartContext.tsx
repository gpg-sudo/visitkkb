"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Participant } from "@/components/booking/ParticipantForm";

// Generate unique ID for cart items
const generateCartItemId = () => `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export interface CartItem {
  id: string; // Unique cart item ID
  activityId: string; // UUID from database
  activityTitle: string;
  activitySlug: string;
  activityImage?: string;
  date: string;
  participants: Participant[];
  operatorId: string;
  operatorName: string;
  pricePerPerson: number;
  insurance: boolean;
  insuranceCost: number;
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  getItemById: (id: string) => CartItem | undefined;
  totalCost: number;
  itemCount: number;
  participantCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Load cart from localStorage during initial state creation
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window !== "undefined") {
            const savedCart = localStorage.getItem("visitkkb_guest_cart");
            if (savedCart) {
                try {
                    return JSON.parse(savedCart);
                } catch (e) {
                    console.error("Failed to load cart from localStorage", e);
                }
            }
        }
        return [];
    });

  // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("visitkkb_guest_cart", JSON.stringify(items));
    }, [items]);

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: generateCartItemId(),
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<CartItem>) => {
    setItems((prev) => prev.map((item) => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemById = useCallback((id: string) => {
    return items.find((item) => item.id === id);
  }, [items]);

  const totalCost = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const itemCount = items.length;
  const participantCount = items.reduce((sum, item) => sum + item.participants.length, 0);

  return (
    <CartContext.Provider
      value={{ 
        items, 
        addItem, 
        removeItem, 
        updateItem,
        clearCart, 
        getItemById,
        totalCost, 
        itemCount,
        participantCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
