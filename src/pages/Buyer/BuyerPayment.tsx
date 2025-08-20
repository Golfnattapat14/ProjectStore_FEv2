import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getOrderDetail, payOrderWithSlip } from "@/api/Buyer";
import PromptPay from "promptpay-qr";
import QRCode from "react-qr-code";
import jsQR from "jsqr";

const BuyerPayment: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [allItems, setAllItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const [qrList, setQrList] = useState<any[]>([]);
  const [showQR, setShowQR] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // โหลดบิล
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderDetail(orderId!);
      setOrder(data);
      setAllItems(data.Sellers?.flatMap((s: any) => s.Items) || []);
      setTotalAmount(
        data.Sellers?.reduce((sum: number, s: any) => sum + s.TotalAmount, 0) ?? 0
      );
    } catch (err: any) {
      toast.error(err.message || "โหลดบิลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // สร้าง QR PromptPay
  const handlePay = async () => {
    if (!order?.Sellers?.length) return toast.error("ข้อมูลบิลไม่ครบ");
    try {
      setPaying(true);
      const list = order.Sellers.map((seller: any) => ({
        sellerName: seller.SellerName,
        sellerId: seller.SellerId,
        totalAmount: seller.TotalAmount,
        qrData: PromptPay(seller.SellerPhone, { amount: seller.TotalAmount }),
      }));
      setQrList(list);
      setShowQR(true);
    } catch (err: any) {
      toast.error("สร้าง QR Code ไม่สำเร็จ");
    } finally {
      setPaying(false);
    }
  };

  // อัปโหลดสลิป + scan QR → ส่ง API อัตโนมัติ
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, seller: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      sessionStorage.setItem(`slipBase64_${seller.SellerId}`, base64);

      const img = new Image();
      img.src = base64;
      img.onload = async () => {
        const canvas = canvasRef.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          toast.success(`สแกน QR สำเร็จ: ${code.data}`);
          await handlePayWithSlip(seller, code.data);
        } else {
          toast.error("ไม่พบ QR code ในสลิป");
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // ส่งสลิป / refCode ไป API
  const handlePayWithSlip = async (seller: any, refCode: string) => {
    const sellerId = seller.SellerId;
    const paidAmount = seller.TotalAmount;

    try {
      setPaying(true);
      const result = await payOrderWithSlip({
        orderId: order.OrderId,
        paidAmount,
        refCode,
      });

      toast.success(result.message || "ชำระเงินสำเร็จ");

      setOrder((prev: any) => ({
        ...prev,
        Sellers: prev.Sellers.map((s: any) =>
          s.SellerId === sellerId ? { ...s, StatusLabel: "ชำระแล้ว" } : s
        ),
      }));

      sessionStorage.removeItem(`slipBase64_${sellerId}`);
    } catch (error: any) {
      toast.error(error.message || "ชำระเงินล้มเหลว");
    } finally {
      setPaying(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading) return <p className="text-center py-10">กำลังโหลดบิล...</p>;
  if (!order) return <p className="text-center py-10 text-red-500">ไม่พบบิล</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">บิลคำสั่งซื้อ #{order.OrderId}</h2>
        <p className="text-gray-600 mb-4">
          สถานะ:{" "}
          <span
            className={`px-2 py-1 rounded text-sm font-semibold ${
              order.Sellers?.some((s: any) => s.StatusLabel === "รอจ่าย")
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {order.Sellers?.[0]?.StatusLabel || "รอจ่าย"}
          </span>
        </p>

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
              {allItems.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border-b">{item.ProductName}</td>
                  <td className="p-3 border-b">{(item.UnitPrice ?? 0).toLocaleString()}</td>
                  <td className="p-3 border-b">{item.Quantity}</td>
                  <td className="p-3 border-b font-semibold">
                    {(item.UnitPrice ?? 0) * (item.Quantity ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4 font-bold text-lg">
          รวมทั้งหมด: {totalAmount.toLocaleString()} บาท
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handlePay}
            disabled={paying}
            className="px-6 py-2 bg-green-500 text-white font-semibold rounded shadow hover:bg-green-600 disabled:opacity-50 transition"
          >
            {paying ? "กำลังสร้าง QR..." : "ชำระเงิน"}
          </button>
        </div>

        {/* Modal QR + Slip */}
        {showQR && qrList.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded shadow-lg text-center max-w-md w-full flex flex-col items-center">
              <h3 className="text-lg font-bold mb-4">สแกนจ่ายหรืออัปโหลดสลิป</h3>

              {qrList.map((q, idx) => {
                const seller = order.Sellers[idx];
                return (
                  <div key={idx} className="mb-6 flex flex-col items-center w-full">
                    <p className="font-semibold mb-2">{q.sellerName}</p>
                    <QRCode value={q.qrData} size={200} />
                    <p className="mt-2 text-gray-700">
                      ยอด: {q.totalAmount.toLocaleString()} บาท
                    </p>

                    {seller.StatusLabel === "รอจ่าย" && (
                      <div className="mt-2 w-full flex flex-col items-center">
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={(e) => handleFileChange(e, seller)}
                          className="border px-2 py-1 w-full rounded mb-2"
                        />
                      </div>
                    )}

                    {seller.StatusLabel === "ชำระแล้ว" && (
                      <span className="text-green-600 font-semibold mt-2">
                        ชำระแล้ว
                      </span>
                    )}
                  </div>
                );
              })}

              <button
                onClick={() => setShowQR(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mt-4"
              >
                ปิด
              </button>

              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerPayment;
