import React, { useEffect, useState } from "react";
import { UserCart } from "@/types/Cart";
import { getCartItems, removeCartItem } from "@/api/Buyer";

const BuyerCart: React.FC = () => {
  const [cart, setCart] = useState<UserCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);


   const getProductTypeName = (type: number) => {
  switch (type) {
    case 1:
      return "อาหาร";
    case 2:
      return "เครื่องใช้";
    case 3:
      return "เครื่องดื่ม";
    case 4:
      return "ของเล่น";
    default:
      return "อื่น ๆ";
  }
};

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
      className="flex items-center border-b pb-4 gap-4"
    >
      <div className="w-20 h-20 flex-shrink-0">
        {item.filePath ? (
          <img
            src={
              item.filePath.includes("dropbox.com")
                ? item.filePath.replace("?dl=0", "?raw=1")
                : item.filePath
            }
            alt={item.productName}
            className="w-20 h-20 object-cover rounded"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded">
            No Image
          </div>
        )}
      </div>

      <div className="flex-grow">
        <p className="font-semibold text-base">{item.productName}</p>
        <p className="text-sm text-gray-600">
          ราคา: {item.productPrice} บาท × {item.quantity}
        </p>
        <p className="text-sm text-gray-600">
          ประเภท: {getProductTypeName(item.productType)}
        </p>
        <p className="text-sm text-gray-600">
          ผู้ขาย: {item.createByName}
        </p>
        <p className="text-sm text-gray-600">
          วันที่วางจำหน่าย: {new Date(item.createDate).toLocaleDateString()}
        </p>
      </div>

      <button
        onClick={() => handleRemove(item.id)}
        disabled={removingId === item.id}
        className={`text-red-500 hover:underline ${
          removingId === item.id ? "opacity-50 cursor-not-allowed" : ""
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
