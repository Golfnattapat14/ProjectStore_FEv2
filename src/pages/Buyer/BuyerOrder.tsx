import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { getBuyerOrders, BuyerOrder as OrderType } from "@/api/Buyer";
import { getProductTypeName } from "@/constants/productTypes";
import { useNavigate } from "react-router-dom";

const BuyerOrder: React.FC = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getBuyerOrders();

      const mapped = data.map((item) => ({
        ...item,
        productPrice: item.productPrice ?? 0,
        sellerName: item.sellerName ?? "ร้านค้าไม่ระบุชื่อ",
        productTypeLabel:
          item.productTypeLabel ?? getProductTypeName(item.productType),
        filePath: item.filePath ?? "",
      }));
      setOrders(mapped);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
      toast.error(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: OrderType[] } = {};
    orders.forEach((item) => {
      if (!groups[item.orderId]) groups[item.orderId] = [];
      groups[item.orderId].push(item);
    });
    return groups;
  }, [orders]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        ประวัติคำสั่งซื้อของฉัน
      </h2>

      {loading ? (
        <p className="text-gray-500">กำลังโหลด...</p>
      ) : error ? (
        <p className="text-red-500 mb-4 p-4 bg-white rounded-lg">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600 text-center py-10 text-lg bg-white rounded-lg">
          ยังไม่มีคำสั่งซื้อ
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(groupedOrders).map(([orderId, items]) => {
            const sellerName = items[0].sellerName || "ร้านค้าไม่ระบุชื่อ";
            const statusLabel = items[0].statusLabel || "ไม่ระบุสถานะ";
            const totalPrice = items.reduce(
              (sum, i) => sum + (i.productPrice ?? 0),
              0
            );

            return (
              <div key={orderId} className="bg-white rounded-lg shadow-sm p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">
                    {sellerName} - รหัสคำสั่งซื้อ: {orderId}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${
                        statusLabel === "รอจ่าย"
                          ? "bg-yellow-100 text-yellow-800"
                          : statusLabel === "ชำระเงินแล้ว"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusLabel}
                    </span>

                    {statusLabel === "รอจ่าย" && (
                      <button
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        onClick={() => navigate(`/buyer/buyerPayment/${orderId}`)}
                      >
                        ชำระเงิน
                      </button>
                    )}
                  </div>
                </div>

                {/* รายการสินค้า */}
                <ul className="divide-y divide-gray-200">
                  {items.map((item, idx) => (
                    <li
                      key={`${orderId}-${item.productId}-${idx}`}
                      className="flex gap-4 py-4"
                    >
                      <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden border border-gray-200">
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
                        <p className="font-semibold text-gray-900 line-clamp-2">
                          {item.productName}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          ประเภท: {item.productTypeLabel}
                        </p>
                        <p className="text-red-500 font-bold mt-1">
                          {(item.productPrice ?? 0).toLocaleString()} บาท
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* สรุปยอดรวม */}
                <div className="flex justify-end mt-4 font-bold text-gray-800">
                  รวม: {totalPrice.toLocaleString()} บาท
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BuyerOrder;
