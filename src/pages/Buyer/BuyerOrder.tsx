import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { cancelOrder, getBuyerOrders } from "@/api/Buyer";
import { getProductTypeName } from "@/constants/productTypes";
import { useNavigate } from "react-router-dom";
import { formatThaiDateTime } from "@/lib/utils";

interface BuyerOrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  productType: number;
  productTypeLabel: string;
  filePath?: string;
}

interface SellerGroup {
  sellerId: string;
  sellerName: string;
  items: BuyerOrderItem[];
}

interface OrderType {
  orderId: string;
  status: number;
  statusLabel: string;
  buyerName: string;
  buyerId: string;
  createDate: string;
  sellers: SellerGroup[];
}

const tabs = ["รอจ่าย", "จ่ายแล้ว", "ยกเลิก"] as const;

const BuyerOrder: React.FC = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("รอจ่าย");
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getBuyerOrders();

      // รวม orderId เดียวกันเป็น order เดียว
      const mergedOrders: OrderType[] = data.reduce(
        (acc: OrderType[], curr: any) => {
          let order = acc.find((o) => o.orderId === curr.orderId);
          if (!order) {
            order = {
              orderId: curr.orderId,
              status: curr.status,
              statusLabel: curr.statusLabel ?? "ไม่ระบุสถานะ",
              buyerName: curr.buyerName,
              buyerId: curr.buyerId,
              createDate: curr.createDate,
              sellers: [],
            };
            acc.push(order);
          }

          // เพิ่ม seller ปัจจุบันเข้า order
          order.sellers.push({
            sellerId: curr.sellerId,
            sellerName: curr.sellerName || "ร้านค้าไม่ระบุชื่อ",
            items: (curr.items ?? []).map((i: any) => ({
              productId: i.productId,
              productName: i.productName,
              unitPrice: i.unitPrice ?? 0,
              quantity: i.quantity ?? 1,
              productType: i.productType,
              productTypeLabel:
                i.productTypeLabel ?? getProductTypeName(i.productType),
              filePath: i.filePath ?? "",
            })),
          });

          return acc;
        },
        []
      );

      setOrders(mergedOrders);
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

  const filteredOrders = orders.filter((o) => o.statusLabel === activeTab);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        ประวัติคำสั่งซื้อของฉัน
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-semibold ${
              activeTab === tab
                ? "bg-white border-t border-l border-r border-gray-300"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">กำลังโหลด...</p>
      ) : error ? (
        <p className="text-red-500 mb-4 p-4 bg-white rounded-lg">{error}</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-600 text-center py-10 text-lg bg-white rounded-lg">
          ไม่มีคำสั่งซื้อในหมวดนี้
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredOrders.map((order) => {
            const { thaiDate, thaiTime } = formatThaiDateTime(order.createDate);
            const totalPrice = order.sellers.reduce(
              (sum, seller) =>
                sum +
                seller.items.reduce((a, i) => a + i.unitPrice * i.quantity, 0),
              0
            );

            return (
              <div
                key={order.orderId}
                className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-4"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-lg">
                      รหัสคำสั่งซื้อ: {order.orderId}
                    </h3>
                    <span className="text-gray-600">
                      วันที่สั่งซื้อ: {thaiDate} เวลา: {thaiTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${
                        order.statusLabel === "รอจ่าย"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.statusLabel === "จ่ายแล้ว"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.statusLabel}
                    </span>

                    {order.statusLabel === "รอจ่าย" && (
                      <>
                        <button
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          onClick={() =>
                            navigate(`/buyer/buyerPayment/${order.orderId}`)
                          }
                        >
                          ชำระเงิน
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          onClick={async () => {
                            if (
                              window.confirm(
                                "คุณต้องการยกเลิกคำสั่งซื้อนี้หรือไม่?"
                              )
                            ) {
                              try {
                                await cancelOrder(order.orderId);
                                toast.success("ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว");
                                fetchOrders();
                              } catch (err: any) {
                                toast.error(
                                  err.message || "ไม่สามารถยกเลิกคำสั่งซื้อได้"
                                );
                              }
                            }
                          }}
                        >
                          ยกเลิก
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* รายการสินค้า per seller */}
                {(order.sellers ?? []).map((seller) => (
                  <div key={seller.sellerId}>
                    <h4 className="font-semibold mt-2">{seller.sellerName}</h4>
                    <ul className="divide-y divide-gray-200">
                      {(seller.items ?? []).map((item) => (
                        <li
                          key={item.productId}
                          className="flex gap-4 py-4 items-center"
                        >
                          {/* รูปภาพ */}
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

                          {/* รายละเอียด */}
                          <div className="flex-grow flex flex-col justify-between">
                            <p className="font-semibold text-gray-900 line-clamp-2">
                              {item.productName}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              ประเภท: {item.productTypeLabel}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              จำนวน: {item.quantity} ชิ้น
                            </p>
                            {/* ใส่ mt-2 เพื่อเพิ่มระยะห่างกับบรรทัดบน */}
                            <p className="text-red-500 font-bold mt-2">
                              ราคาชิ้นละ: {item.unitPrice.toLocaleString()} บาท
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

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
