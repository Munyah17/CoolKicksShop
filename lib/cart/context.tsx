"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { CartItem } from "./types";

const STORAGE_KEY = "coolkicks_cart_v1";

interface State {
  items: CartItem[];
  hydrated: boolean;
}

type Action =
  | { type: "add"; item: CartItem }
  | { type: "remove"; productId: string; size: string }
  | { type: "setQuantity"; productId: string; size: string; quantity: number }
  | { type: "chooseSize"; productId: string; currentSize: string; newSize: string }
  | { type: "clear" }
  | { type: "hydrate"; items: CartItem[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, items: action.items, hydrated: true };
    case "add": {
      const existing = state.items.find(
        (i) => i.productId === action.item.productId && i.size === action.item.size
      );
      const items = existing
        ? state.items.map((i) =>
            i === existing ? { ...i, quantity: i.quantity + action.item.quantity } : i
          )
        : [...state.items, action.item];
      return { ...state, items };
    }
    case "remove":
      return {
        ...state,
        items: state.items.filter((i) => !(i.productId === action.productId && i.size === action.size)),
      };
    case "setQuantity":
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.productId === action.productId && i.size === action.size
              ? { ...i, quantity: action.quantity }
              : i
          )
          .filter((i) => i.quantity > 0),
      };
    case "chooseSize": {
      const idx = state.items.findIndex(
        (i) => i.productId === action.productId && i.size === action.currentSize
      );
      if (idx === -1) return state;
      const chosen = state.items[idx];

      const mergeIdx = state.items.findIndex(
        (i, j) => j !== idx && i.productId === action.productId && i.size === action.newSize
      );
      if (mergeIdx !== -1) {
        const items = state.items
          .map((i, j) => (j === mergeIdx ? { ...i, quantity: i.quantity + chosen.quantity } : i))
          .filter((_, j) => j !== idx);
        return { ...state, items };
      }

      return {
        ...state,
        items: state.items.map((i, j) => (j === idx ? { ...i, size: action.newSize } : i)),
      };
    }
    case "clear":
      return { ...state, items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  chooseSize: (productId: string, currentSize: string, newSize: string) => void;
  clear: () => void;
  subtotal: number;
  itemCount: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], hydrated: false });
  const { items, hydrated } = state;
  const [isOpen, setIsOpen] = useState(false);

  // Cart starts empty (matching the server-rendered markup) and is
  // hydrated from localStorage once on mount -- `hydrated` lives inside
  // reducer state so this effect only ever calls `dispatch`, once.
  useEffect(() => {
    let stored: CartItem[] = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch {
      // Corrupt/blocked storage -- start with an empty cart.
    }
    dispatch({ type: "hydrate", items: stored });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items]
  );
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value: CartContextValue = {
    items,
    addItem: (item) => {
      dispatch({ type: "add", item });
      setIsOpen(true);
    },
    removeItem: (productId, size) => dispatch({ type: "remove", productId, size }),
    setQuantity: (productId, size, quantity) => dispatch({ type: "setQuantity", productId, size, quantity }),
    chooseSize: (productId, currentSize, newSize) =>
      dispatch({ type: "chooseSize", productId, currentSize, newSize }),
    clear: () => dispatch({ type: "clear" }),
    subtotal,
    itemCount,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
