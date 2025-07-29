import React, { useEffect, useState } from "react";
import { UserCart } from "@/types/Cart";
import { getCartItems, removeCartItem } from "@/api/Buyer";

const BuyerCart: React.FC = () => {
  const [cart, setCart] = useState<UserCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCartItems();
      setCart(data);
    } catch (err: any) {
      setError(err.message || "ไม่สามารถโหลดตะกร้าได้");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      setRemovingId(id);
      await removeCartItem(id);
      setCart((prev) => prev.filter((p) => p.id !== id));
      setError("");
    } catch (err: any) {
      alert(err.message || "ลบสินค้าไม่สำเร็จ");
    } finally {
      setRemovingId(null);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🛒 ตะกร้าของคุณ</h2>

      {loading ? (
        <p className="text-gray-500">กำลังโหลด...</p>
      ) : error ? (
        <p className="text-red-500 mb-4">{error}</p>
      ) : cart.length === 0 ? (
        <p className="text-gray-600">ยังไม่มีสินค้าในตะกร้า</p>
      ) : (
        <>
          <ul className="space-y-4 mb-4">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    {item.productPrice} บาท × {item.quantity}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={removingId === item.id}
                  className={`text-red-500 hover:underline ${
                    removingId === item.id
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {removingId === item.id ? "กำลังลบ..." : "ลบ"}
                </button>
              </li>
            ))}
          </ul>
          <div className="text-right font-semibold text-lg">
            รวมทั้งหมด: {totalPrice} บาท
          </div>
        </>
      )}
    </div>
  );
};

export default BuyerCart;
