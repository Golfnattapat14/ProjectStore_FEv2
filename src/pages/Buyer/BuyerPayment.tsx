import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getOrderDetail, payOrder } from "@/api/Buyer";

const BuyerPayment: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderDetail(orderId!);
      setOrder(data);
    } catch (err: any) {
      toast.error(err.message || "โหลดบิลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!order) return;
    try {
      setPaying(true);
      await payOrder(order.Id, order.TotalAmount, "PromptPay");
      toast.success("ชำระเงินเรียบร้อยแล้ว");
      fetchOrder(); // refresh
    } catch (err: any) {
      toast.error(err.message || "ชำระเงินไม่สำเร็จ");
    } finally {
      setPaying(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading)
    return (
      <p className="text-gray-500 text-center py-10 text-lg">กำลังโหลดบิล...</p>
    );
  if (!order)
    return (
      <p className="text-red-500 text-center py-10 text-lg">ไม่พบบิล</p>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow rounded-lg p-6">
        {/* Header */}
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          บิลคำสั่งซื้อ #{order.Id}
        </h2>
        <p className="text-gray-600 mb-4">
          สถานะ:{" "}
          <span
            className={`px-2 py-1 rounded text-sm font-semibold ${
              order.StatusLabel === "รอจ่าย"
                ? "bg-yellow-100 text-yellow-800"
                : order.StatusLabel === "ชำระเงินแล้ว"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {order.StatusLabel}
          </span>
        </p>

        {/* ตารางสินค้า */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 border-b">สินค้า</th>
                <th className="p-3 border-b">ราคา/หน่วย</th>
                <th className="p-3 border-b">จำนวน</th>
                <th className="p-3 border-b">รวม</th>
              </tr>
            </thead>
            <tbody>
              {order.Items && order.Items.length > 0 ? (
                order.Items.map((item: any) => (
                  <tr
                    key={item.ProductId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 border-b">{item.ProductName}</td>
                    <td className="p-3 border-b">
                      {(item.UnitPrice ?? 0).toLocaleString()} บาท
                    </td>
                    <td className="p-3 border-b">{item.Quantity}</td>
                    <td className="p-3 border-b font-semibold text-gray-800">
                      {((item.UnitPrice ?? 0) * (item.Quantity ?? 0)).toLocaleString()} บาท
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-gray-500">
                    ไม่มีสินค้าในบิล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ยอดรวม */}
        <div className="flex justify-end mt-4 text-lg font-bold text-gray-800">
          รวมทั้งหมด: {(order.TotalAmount ?? 0).toLocaleString()} บาท
        </div>

        {/* ปุ่มชำระเงิน */}
        {order.Status === 1 && (
          <div className="flex justify-end mt-6">
            <button
              onClick={handlePay}
              disabled={paying}
              className="px-6 py-2 bg-green-500 text-white font-semibold rounded shadow hover:bg-green-600 disabled:opacity-50 transition"
            >
              {paying ? "กำลังชำระเงิน..." : "ชำระเงิน"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerPayment;
