// Buyer.tsx
import React, { useState, useEffect } from "react";
import { getProducts } from "@/api/Buyer";
import { ProductResponse } from "@/types/product";
import { useCart } from "@/components/layouts/CartContext";
import CartIcon from "@/components/layouts/CartIcon";

const BuyerPage: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  // เก็บตะกร้าพร้อมจำนวนสินค้า
  const { addToCart, totalCount } = useCart();



  useEffect(() => {
    setLoading(true);
    getProducts()
      .then((data) => {
        setProducts(data);
        setError("");
      })
      .catch((err) => setError(err.message || "เกิดข้อผิดพลาด"))
      .finally(() => setLoading(false));
  }, []);

  const getProductTypeName = (type: number) => {
    switch (type) {
      case 0:
        return "อาหาร";
      case 1:
        return "เครื่องใช้";
      case 2:
        return "เครื่องดื่ม";
      case 3:
        return "ของเล่น";
      default:
        return "อื่น ๆ";
    }
  };


  const handleAddToCart = async (productId: string) => {
    try {
      setAddingToCartId(productId);
      await addToCart(productId, 1);
    } catch (error) {
      console.error(error);
    } finally {
      setAddingToCartId(null);
    }
  };

  

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ไอคอนตะกร้าแบบลอย */}
      <CartIcon count={totalCount} />

      <main className="max-w-6xl mx-auto mt-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">
            เลือกซื้อสินค้า
          </h2>
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md">
            ตะกร้า: {totalCount} รายการ
          </div>
        </div>


        {loading && <p className="text-gray-500 mb-4">กำลังโหลดข้อมูล...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {message && <p className="text-blue-600 mb-4">{message}</p>}

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  #
                </th>
                 <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  รูปภาพสินค้า
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  ชื่อสินค้า
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  วันที่วางจำหน่าย
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  จำหน่ายโดย
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  ประเภทสินค้า
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  สินค้าคงเหลือ
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  ราคา
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p, index) => (
                <tr
                  key={p.id ?? `${p.productName}-${index}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">
                  {p.filePath ? (
                    <img
                      src={
                        p.filePath.includes("dropbox.com")
                          ? p.filePath.replace("?dl=0", "?raw=1")
                          : p.filePath
                      }
                      alt={p.productName}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded">
                      No Image!
                    </div>
                  )}
                </td>
                  <td className="px-4 py-2">{p.productName}</td>
                  <td className="px-4 py-2">
                    {new Date(p.createDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{p.createdByName}</td>
                  <td className="px-4 py-2">
                    {getProductTypeName(p.productType ?? 0)}
                  </td>
                  <td className="px-4 py-2">{p.quantity}</td>
                  <td className="px-4 py-2">{p.productPrice} บาท</td>
                  <td className="px-4 py-2">
                    <button
                      disabled={addingToCartId === p.id}
                      className={`bg-green-500 text-white px-3 py-1 rounded transition ${
                        addingToCartId === p.id
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-green-600"
                      }`}
                      onClick={() => handleAddToCart(p.id)}
                    >
                      {addingToCartId === p.id
                        ? "กำลังเพิ่ม..."
                        : "เพิ่มใส่ตะกร้า"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default BuyerPage;
