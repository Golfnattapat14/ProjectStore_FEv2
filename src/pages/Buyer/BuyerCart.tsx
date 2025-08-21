import React, { useEffect, useState } from "react";
import { UserCart } from "@/types/Cart";
import {
  checkout,
  CheckoutItem,
  CheckoutRequest,
  getCartItems,
  removeCartItem,
  updateCartItem,
} from "@/api/Buyer";
import { toast } from "react-toastify";
import { getProductTypeName } from "@/constants/productTypes";
import { useNavigate } from "react-router-dom";

type CartStore = {
  sellerId: string;
  sellerName: string;
  items: UserCart[];
};

const BuyerCart: React.FC = () => {
  const [cartData, setCartData] = useState<CartStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // ดึงข้อมูลตะกร้า
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCartItems();
      setCartData(data);
    } catch (err: any) {
      setError(err.message || "ไม่สามารถโหลดตะกร้าได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    const handleFocus = () => fetchCart();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // เลือกสินค้า
  const handleSelectOne = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleSelectStore = (storeName: string) => {
    const store = cartData.find((s) => s.sellerName === storeName);
    if (!store) return;
    const allSelected = store.items.every((item) => selectedItems.has(item.id));
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      allSelected
        ? store.items.forEach((item) => newSet.delete(item.id))
        : store.items.forEach((item) => newSet.add(item.id));
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allItems = cartData.flatMap((store) => store.items);
    const allSelected = allItems.every((item) => selectedItems.has(item.id));
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      allSelected
        ? newSet.clear()
        : allItems.forEach((item) => newSet.add(item.id));
      return newSet;
    });
  };

  // ลบสินค้า
  const handleRemove = async (id: string) => {
    try {
      setRemovingId(id);
      await removeCartItem(id);
      setCartData((prev) =>
        prev.map((store) => ({
          ...store,
          items: store.items.filter((item) => item.id !== id),
        }))
      );
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast.success("ลบสินค้าออกจากตะกร้าเรียบร้อย");
    } catch (err: any) {
      toast.error(err.message || "ลบสินค้าไม่สำเร็จ");
    } finally {
      setRemovingId(null);
    }
  };

  // อัปเดตจำนวนสินค้า
  const handleUpdateQuantity = async (cartItemId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      await updateCartItem(cartItemId, newQty);
      setCartData((prev) =>
        prev.map((store) => ({
          ...store,
          items: store.items.map((item) =>
            item.id === cartItemId ? { ...item, quantity: newQty } : item
          ),
        }))
      );
    } catch (err: any) {
      toast.error(err.message || "อัปเดตจำนวนสินค้าไม่สำเร็จ");
    }
  };

  const isAllSelected =
    cartData.length > 0 &&
    cartData
      .flatMap((store) => store.items)
      .every((item) => selectedItems.has(item.id));

  // สั่งซื้อ
  const handleCheckout = async () => {
    if (selectedItems.size === 0) return;

    if (
      !confirm(`คุณต้องการสั่งซื้อสินค้าที่เลือก (${selectedItems.size} ชิ้น)?`)
    )
      return;

    try {
      const payload: CheckoutRequest[] = cartData
        .map((store) => {
          const items: CheckoutItem[] = store.items
            .filter((item) => selectedItems.has(item.id))
            .map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.productPrice ?? 0,
            }));

          if (!items.length) return null;

          return {
            sellerId: store.sellerId || "",
            items,
          };
        })
        .filter((x): x is CheckoutRequest => x !== null); // Type guard

      console.log("Checkout payload:", JSON.stringify(payload, null, 2));

      const res = await checkout(payload);

      toast.success(
        `สร้างคำสั่งซื้อเรียบร้อย รหัส: ${res.orderIds?.join(", ")}`
      );

      setSelectedItems(new Set());
      fetchCart();
      navigate("/buyerOrder");
    } catch (err: any) {
      toast.error(err.message || "สั่งซื้อไม่สำเร็จ");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        ตะกร้าสินค้าของฉัน
      </h2>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* สินค้า */}
        <div className="flex-grow">
          {loading ? (
            <p className="text-gray-500">กำลังโหลด...</p>
          ) : error ? (
            <p className="text-red-500 mb-4 p-4 bg-white rounded-lg">{error}</p>
          ) : cartData.flatMap((s) => s.items).length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg">
              <p className="text-gray-600 text-lg mb-4">
                ยังไม่มีสินค้าในตะกร้า
              </p>
              <button
                onClick={() => {
                  navigate("/buyer");
                  setTimeout(() => window.location.reload(), 100); // รีเฟรชเล็กน้อยหลัง navigate
                }}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
              >
                เลือกชมสินค้า
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm">
              {/* Header เลือกทั้งหมด */}
              <div className="p-4 border-b flex items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-orange-500 rounded focus:ring-0"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                  <span className="font-semibold text-gray-700">
                    เลือกสินค้าทั้งหมด (
                    {cartData.flatMap((s) => s.items).length})
                  </span>
                </div>
                <button
                  type="button"
                  disabled={selectedItems.size === 0}
                  onClick={async () => {
                    if (
                      !confirm(
                        `ลบสินค้าที่เลือกทั้งหมด (${selectedItems.size}) รายการ?`
                      )
                    )
                      return;
                    try {
                      for (const id of selectedItems) await removeCartItem(id);
                      setCartData((prev) =>
                        prev.map((store) => ({
                          ...store,
                          items: store.items.filter(
                            (item) => !selectedItems.has(item.id)
                          ),
                        }))
                      );
                      setSelectedItems(new Set());
                      toast.success("ลบสินค้าที่เลือกทั้งหมดเรียบร้อยแล้ว");
                    } catch (error: any) {
                      toast.error(error.message || "ลบสินค้าทั้งหมดไม่สำเร็จ");
                    }
                  }}
                  className={`px-3 py-1 rounded text-white font-semibold transition ${
                    selectedItems.size === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  ลบทั้งหมด ({selectedItems.size})
                </button>
              </div>

              {/* รายการสินค้าแยกร้าน */}
              {cartData.map((store, storeIndex) => (
                <div
                  key={store.sellerName ?? `store-${storeIndex}`}
                  className="border-b last:border-b-0"
                >
                  <div className="p-4 flex items-center gap-4 bg-gray-50">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-orange-500 rounded focus:ring-0"
                      checked={store.items.every((item) =>
                        selectedItems.has(item.id)
                      )}
                      onChange={() => handleSelectStore(store.sellerName)}
                    />
                    <span className="font-bold text-gray-800">
                      จำหน่ายโดย : {store.sellerName || "ร้านค้าไม่ระบุชื่อ"}
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {store.items.map((item) => (
                      <li key={item.id} className="flex p-4 gap-4">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 mt-7 text-orange-500 rounded focus:ring-0"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleSelectOne(item.id)}
                        />
                        <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden border border-gray-200">
                          {item.filePath ? (
                            <img
                              src={
                                item.filePath.includes("dropbox.com")
                                  ? item.filePath.replace("?dl=0", "?raw=1")
                                  : item.filePath
                              }
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center p-2">
                              ไม่มีรูปภาพ
                            </div>
                          )}
                        </div>
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <p className="font-semibold text-lg text-gray-900 line-clamp-2">
                              {item.productName}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              ประเภท: {getProductTypeName(item.productType)}
                            </p>
                            <div className="text-xs text-gray-400 mt-1">
                              เหลือในสต็อก: {item.productStock} ชิ้น
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-red-500 font-bold text-xl">
                              {(item.productPrice ?? 0).toLocaleString()} บาท
                            </p>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-600">
                                x{item.quantity}
                              </span>
                              <button
                                onClick={() => handleRemove(item.id)}
                                disabled={removingId === item.id}
                                className={`text-red-500 hover:text-red-700 transition font-medium ${
                                  removingId === item.id
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                {removingId === item.id ? "กำลังลบ..." : "ลบ"}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 bg-gray-200 rounded-l text-lg font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => {
                                let val = parseInt(e.target.value);
                                if (isNaN(val) || val < 1) val = 1;
                                handleUpdateQuantity(item.id, val);
                              }}
                              className="w-12 text-center border-t border-b"
                            />
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.productStock}
                              className="w-8 h-8 bg-gray-200 rounded-r text-lg font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* สรุปตะกร้า */}
        <div className="w-full lg:w-96">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              สรุปยอดชำระ
            </h3>
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-600">
                สินค้าที่เลือก ({selectedItems.size} ชิ้น)
              </p>
              {/* <p className="font-semibold text-gray-800">
                {selectedTotalPrice.toLocaleString()} บาท
              </p> */}
            </div>
            <hr className="my-4" />
            {/* <div className="flex justify-between items-center text-xl font-bold text-gray-900">
              <p>รวมทั้งหมด</p>
              <p>{selectedTotalPrice.toLocaleString()} บาท</p>
            </div> */}
            <button
              disabled={selectedItems.size === 0}
              className={`w-full mt-6 py-3 rounded-lg text-white font-bold transition ${
                selectedItems.size === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
              onClick={handleCheckout}
            >
              สั่งซื้อ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerCart;
