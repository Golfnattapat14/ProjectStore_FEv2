import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getBuyerOrders,
  updateOrderStatus,
  updateOrderAddress,
  cancelOrder,
} from "@/api/Buyer";
import {
  getProductTypeName,
  orderStatusColors,
} from "@/constants/productTypes";
import { useNavigate } from "react-router-dom";
import { formatThaiDateTime } from "@/lib/utils";
import OrderCountdown from "@/lib/OrderCountdown";

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
  address: string;
  items: BuyerOrderItem[];
}

interface OrderType {
  orderId: string;
  status: number;
  statusLabel: string;
  buyerName: string;
  buyerId: string;
  createDate: string;
  address: string;
  sellers: SellerGroup[];
}

const tabs = [
  "รอจ่าย",
  "จ่ายแล้ว / รอจัดส่ง",
  "กำลังจัดส่ง",
  "จัดส่งสำเร็จ",
  "ยกเลิก",
] as const;

const BuyerOrder: React.FC = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("รอจ่าย");
  const [editingOrderId, setEditingOrderId] = useState("");
  const [tempAddress, setTempAddress] = useState("");
  const navigate = useNavigate();

  // โหลดคำสั่งซื้อ
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getBuyerOrders();

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
              address: curr.address || "",
              sellers: [],
            };
            acc.push(order);
          }

          order.sellers.push({
            sellerId: curr.sellerId,
            sellerName: curr.sellerName || "ร้านค้าไม่ระบุชื่อ",
            address: curr.address || "",
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

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "จ่ายแล้ว / รอจัดส่ง")
      return o.statusLabel === "จ่ายแล้ว";
    return o.statusLabel === activeTab;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        ประวัติคำสั่งซื้อของฉัน
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-300 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-4 py-2 font-semibold transition
              ${
                activeTab === tab
                  ? "text-blue-600 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-1 after:bg-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loader / Error / Empty */}
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                  <div className="flex flex-col">
                    {order.sellers.map((seller) => (
                      <h2
                        key={seller.sellerId}
                        className="font-semibold text-lg text-gray-800 mb-1"
                      >
                        ร้านค้า: {seller.sellerName}
                      </h2>
                    ))}
                    <h3 className="font-bold text-lg text-gray-900">
                      รหัสคำสั่งซื้อ: {order.orderId}
                    </h3>
                    <span className="text-gray-600">
                      วันที่สั่งซื้อ: {thaiDate} เวลา: {thaiTime}
                    </span>

                    {/* นับถอยหลัง 48 ชั่วโมง */}
                    {order.statusLabel === "รอจ่าย" && (
                      <div className="mt-1">
                        <OrderCountdown
                          orderId={order.orderId}
                          createDate={order.createDate}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${
                        orderStatusColors[order.statusLabel] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.statusLabel}
                    </span>

                    {/* ปุ่ม Action */}
                    {order.statusLabel === "รอจ่าย" && (
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                          onClick={() => {
                            if (
                              window.confirm(
                                "กรุณาตรวจสอบรายการและที่อยู่ก่อนชำระเงิน\nคุณยืนยันที่จะชำระเงินหรือไม่?"
                              )
                            ) {
                              navigate(`/buyer/buyerPayment/${order.orderId}`);
                            }
                          }}
                        >
                          ชำระเงิน
                        </button>

                        <button
                          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
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
                      </div>
                    )}

                    {order.statusLabel === "กำลังจัดส่ง" && (
                      <button
                        className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
                        onClick={async () => {
                          if (
                            window.confirm("คุณได้รับสินค้านี้แล้วใช่หรือไม่?")
                          ) {
                            try {
                              await updateOrderStatus(order.orderId, "สำเร็จ");
                              toast.success("ยืนยันการรับสินค้าเรียบร้อยแล้ว");
                              fetchOrders();
                            } catch (err: any) {
                              toast.error(
                                err.message || "ไม่สามารถอัปเดตสถานะได้"
                              );
                            }
                          }
                        }}
                      >
                        ได้รับสินค้าแล้ว
                      </button>
                    )}
                  </div>
                </div>

                {/* รายการสินค้า */}
                {order.sellers.map((seller) => (
                  <ul
                    key={seller.sellerId}
                    className="divide-y divide-gray-200 mt-2"
                  >
                    {seller.items.map((item) => (
                      <li
                        key={item.productId}
                        className="flex gap-4 py-4 items-center"
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
                          <p className="text-sm text-gray-500 mt-1">
                            จำนวน: {item.quantity} ชิ้น
                          </p>
                          <p className="text-red-500 font-bold mt-2">
                            ราคาหน่วยละ : {item.unitPrice.toLocaleString()} บาท
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ))}

                {/* สรุปยอดรวม */}
                <div className="flex justify-end mt-4 font-bold text-gray-800">
                  รวม: {totalPrice.toLocaleString()} บาท
                </div>

                {/* ที่อยู่จัดส่ง */}
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-700 mb-1">
                    ที่อยู่จัดส่ง
                  </h4>
                  {order.statusLabel === "รอจ่าย" &&
                  editingOrderId === order.orderId ? (
                    <div className="flex flex-col gap-2 md:gap-4">
                      <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none"
                        rows={3}
                        value={tempAddress}
                        onChange={(e) => setTempAddress(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
                          onClick={async () => {
                            try {
                              await updateOrderAddress(
                                order.orderId,
                                tempAddress
                              );
                              toast.success("อัปเดตที่อยู่เรียบร้อย");
                              setEditingOrderId("");
                              fetchOrders();
                            } catch (err: any) {
                              toast.error(
                                err.response?.data?.message ||
                                  "ไม่สามารถอัปเดตที่อยู่ได้"
                              );
                            }
                          }}
                        >
                          บันทึก
                        </button>
                        <button
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-sm"
                          onClick={() => setEditingOrderId("")}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 line-clamp-2">
                      {order.address || "ไม่ระบุที่อยู่"}
                    </p>
                  )}

                  {order.statusLabel === "รอจ่าย" &&
                    editingOrderId !== order.orderId && (
                      <button
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                        onClick={() => {
                          setEditingOrderId(order.orderId);
                          setTempAddress(order.address);
                        }}
                      >
                        แก้ไข
                      </button>
                    )}
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
