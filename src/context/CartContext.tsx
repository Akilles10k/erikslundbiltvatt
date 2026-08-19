"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { Service } from "@/data/site";

export type CartItem = {
  service: Service;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (service: Service) => void;
  removeFromCart: (serviceId: number) => void;
  clearCart: () => void;
  isInCart: (serviceId: number) => boolean;
  totalCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "glansbilvatt-cart";
const STORAGE_EVENT = "glansbilvatt-cart-change";

function getCartSnapshot() {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function subscribeToCart(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", listener);
  window.addEventListener(STORAGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(STORAGE_EVENT, listener);
  };
}

function parseCart(raw: string): CartItem[] {
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cartSnapshot = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    () => "[]"
  );
  const items = useMemo(() => parseCart(cartSnapshot), [cartSnapshot]);

  const setItems = useCallback((updater: (prev: CartItem[]) => CartItem[]) => {
    const nextItems = updater(parseCart(getCartSnapshot()));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, []);

  const addToCart = useCallback((service: Service) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.service.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { service, quantity: 1 }];
    });
  }, [setItems]);

  const removeFromCart = useCallback((serviceId: number) => {
    setItems((prev) => prev.filter((item) => item.service.id !== serviceId));
  }, [setItems]);

  const clearCart = useCallback(() => setItems(() => []), [setItems]);

  const isInCart = useCallback(
    (serviceId: number) => items.some((item) => item.service.id === serviceId),
    [items]
  );

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
      totalCount,
    }),
    [items, addToCart, removeFromCart, clearCart, isInCart, totalCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
