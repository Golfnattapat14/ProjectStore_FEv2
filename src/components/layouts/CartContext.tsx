import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem } from "@/types/UserCart";
import { getCartItems, addToCart as apiAddToCart, removeCartItem, updateCartItem } from "@/api/Buyer";

interface CartContextProps {
  cart: CartItem[];
  refreshCart: () => void;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (cartId: string) => void;
  updateCartQuantity: (cartId: string, quantity: number) => void;
  totalCount: number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const refreshCart = async () => {
    try {
      const data = await getCartItems();
      setCart(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("โหลดตะกร้าล้มเหลว", err);
      setCart([]);
    }
  };

  // รีเฟรชตะกร้าทุกครั้งที่ token เปลี่ยน (login/logout)
  useEffect(() => {
    if (token) {
      refreshCart();
    } else {
      setCart([]);
    }
  }, [token]);

  // ฟัง event storage (ถ้า token เปลี่ยนในแท็บอื่น)
  useEffect(() => {
    const onStorage = () => {
      const newToken = localStorage.getItem("token");
      setToken(newToken);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addToCart = async (productId: string, quantity = 1) => {
    try {
      await apiAddToCart(productId, quantity);
      await refreshCart();
    } catch (error) {
      console.error("เพิ่มสินค้าในตะกร้าไม่สำเร็จ", error);
    }
  };

  const removeFromCart = async (cartId: string) => {
    try {
      await removeCartItem(cartId);
      await refreshCart();
    } catch (error) {
      console.error("ลบสินค้าในตะกร้าไม่สำเร็จ", error);
    }
  };

  const updateCartQuantity = async (cartId: string, quantity: number) => {
    try {
      await updateCartItem(cartId, quantity);
      await refreshCart();
    } catch (error) {
      console.error("อัปเดตจำนวนสินค้าไม่สำเร็จ", error);
    }
  };

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
