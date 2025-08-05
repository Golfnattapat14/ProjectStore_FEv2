import React, { useEffect, useState, useMemo } from "react";
import { UserCart } from "@/types/Cart";
import { getCartItems, removeCartItem, updateCartItem } from "@/api/Buyer";
import { toast } from "react-toastify";

const BuyerCart: React.FC = () => {
  const [cart, setCart] = useState<UserCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
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
      toast.success("ลบสินค้าออกจากตะกร้าเรียบร้อย");
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setError("");
    } catch (err: any) {
      toast.error(err.message || "ลบสินค้าไม่สำเร็จ");
    } finally {
      setRemovingId(null);
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, newQty: number) => {
    try {
      await updateCartItem(cartItemId, newQty);
      setCart((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQty } : item
        )
      );
    } catch (err: any) {
      toast.error(err.message || "อัปเดตจำนวนสินค้าไม่สำเร็จ");
    }
  };
  

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchCart();
    };
    window.addEventListener("focus", handleFocus);
    // เรียก fetchCart ครั้งแรกด้วย
    handleFocus();
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const groupedCart = useMemo(() => {
    const groups: { [key: string]: UserCart[] } = {};
    cart.forEach((item) => {
      const sellerName = item.createByName || "ร้านค้าไม่ระบุชื่อ";
      if (!groups[sellerName]) {
        groups[sellerName] = [];
      }
      groups[sellerName].push(item);
    });
    return groups;
  }, [cart]);

  const handleSelectOne = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectStore = (storeName: string) => {
    const storeItems = groupedCart[storeName] || [];
    const allSelected = storeItems.every((item) => selectedItems.has(item.id));
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (allSelected) {
        storeItems.forEach((item) => newSet.delete(item.id));
      } else {
        storeItems.forEach((item) => newSet.add(item.id));
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allSelected = cart.every((item) => selectedItems.has(item.id));
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (allSelected) {
        newSet.clear();
      } else {
        cart.forEach((item) => newSet.add(item.id));
      }
      return newSet;
    });
  };

  const selectedTotalPrice = useMemo(() => {
    return cart.reduce((sum, item) => {
      if (selectedItems.has(item.id)) {
        return sum + item.productPrice * item.quantity;
      }
      return sum;
    }, 0);
  }, [cart, selectedItems]);

  const isAllSelected = cart.length > 0 && cart.every(item => selectedItems.has(item.id));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">ตะกร้าสินค้าของฉัน</h2>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow">
          {loading ? (
            <p className="text-gray-500">กำลังโหลด...</p>
          ) : error ? (
            <p className="text-red-500 mb-4 p-4 bg-white rounded-lg">{error}</p>
          ) : cart.length === 0 ? (
            <p className="text-gray-600 text-center py-10 text-lg bg-white rounded-lg">
              ยังไม่มีสินค้าในตะกร้า
            </p>
          ) : (
            <div className="bg-white rounded-lg shadow-sm">
              {/* Select All Header */}
              <div className="p-4 border-b flex items-center gap-4">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-orange-500 rounded focus:ring-0"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
                <span className="font-semibold text-gray-700">เลือกสินค้าทั้งหมด ({cart.length})</span>
              </div>
              {/* --- */}
              {Object.entries(groupedCart).map(([storeName, items]) => (
                <div key={storeName} className="border-b last:border-b-0">
                  <div className="p-4 flex items-center gap-4 bg-gray-50">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-orange-500 rounded focus:ring-0"
                      checked={items.every((item) => selectedItems.has(item.id))}
                      onChange={() => handleSelectStore(storeName)}
                    />
                    <span className="font-bold text-gray-800">{storeName}</span>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {items.map((item) => (
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
                              {`เหลือในสต็อก: ${item.productStock} ชิ้น`}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-red-500 font-bold text-xl">
                              {(item.productPrice).toLocaleString()} บาท
                            </p>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-600">x{item.quantity}</span>
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
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 bg-gray-200 rounded-l text-lg font-bold"
                            >-</button>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={e => {
                                let val = parseInt(e.target.value);
                                if (isNaN(val) || val < 1) val = 1;
                                handleUpdateQuantity(item.id, val);
                              }}
                              className="w-12 text-center border-t border-b"
                            />
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.productStock}
                              className="w-8 h-8 bg-gray-200 rounded-r text-lg font-bold"
                            >+</button>
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
        {/* Cart Summary and Checkout */}
        <div className="w-full lg:w-96">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800">สรุปยอดชำระ</h3>
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-600">สินค้าที่เลือก ({selectedItems.size} ชิ้น)</p>
              <p className="font-semibold text-gray-800">
                {selectedTotalPrice.toLocaleString()} บาท
              </p>
            </div>
            {/* สามารถเพิ่มส่วนลดหรือค่าส่งได้ที่นี่ */}
            <hr className="my-4" />
            <div className="flex justify-between items-center text-xl font-bold text-gray-900">
              <p>รวมทั้งหมด</p>
              <p>{selectedTotalPrice.toLocaleString()} บาท</p>
            </div>
            <button
              disabled={selectedItems.size === 0}
              className={`w-full mt-6 py-3 rounded-lg text-white font-bold transition ${
                selectedItems.size === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
              onClick={() =>
                alert(
                  `ระบบสั่งซื้อยังไม่พร้อมใช้งาน\nจำนวนสินค้าที่เลือก: ${selectedItems.size}\nยอดรวม: ${selectedTotalPrice.toLocaleString()} บาท`
                )
              }
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