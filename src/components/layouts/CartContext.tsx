// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { getCartItems, addToCart as apiAddToCart, removeCartItem, updateCartItem } from "@/api/Buyer";

export interface CartProduct {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  createDate: string;
  productType: number;
  filePath?: string;
  createBy: string;
  createByName: string;
  productStock: number;
}

export interface CartStore {
  sellerName: string;
  items: CartProduct[];
}

interface CartContextProps {
  cart: CartStore[];
  refreshCart: () => void;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (cartId: string) => void;
  updateCartQuantity: (cartId: string, quantity: number) => void;
  totalCount: number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartStore[]>([]);

  const refreshCart = async () => {
    try {
      const data = await getCartItems();
      setCart(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("โหลดตะกร้าล้มเหลว", err);
      setCart([]);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (productId: string, quantity = 1) => {
    await apiAddToCart(productId, quantity);
    await refreshCart();
  };

  const removeFromCart = async (cartId: string) => {
    await removeCartItem(cartId);
    await refreshCart();
  };

  const updateCartQuantity = async (cartId: string, quantity: number) => {
    await updateCartItem(cartId, quantity);
    await refreshCart();
  };

  const totalCount = cart.reduce(
    (sum, store) => sum + store.items.reduce((s, item) => s + item.quantity, 0),
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, refreshCart, addToCart, removeFromCart, updateCartQuantity, totalCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart ต้องใช้ภายใน <CartProvider>");
  return context;
};
