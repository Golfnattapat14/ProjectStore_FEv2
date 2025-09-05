import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getOrderDetail, payOrderWithSlip } from "@/api/Buyer";
import PromptPay from "promptpay-qr";
import QRCode from "react-qr-code";
import jsQR from "jsqr";

const BuyerPayment: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [allItems, setAllItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const [qrList, setQrList] = useState<any[]>([]);
  const [showQR, setShowQR] = useState(false);

  const [pendingSlip, setPendingSlip] = useState<any>(null);
  const [qrCreatedAt, setQrCreatedAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const PAYMENT_TIMEOUT = 30 * 60; // 30 นาที (หน่วย: วินาที)

  // --- session helpers ---
  const saveSlipToSession = (orderId: string, sellerId: string, base64: string, refCode: string) => {
    sessionStorage.setItem(
      `pendingSlip_${orderId}_${sellerId}`,
      JSON.stringify({ orderId, sellerId, base64, refCode })
    );
  };
  const getSlipFromSession = (orderId: string, sellerId: string) => {
    const data = sessionStorage.getItem(`pendingSlip_${orderId}_${sellerId}`);
    return data ? JSON.parse(data) : null;
  };
  const removeSlipFromSession = (orderId: string, sellerId: string) => {
    sessionStorage.removeItem(`pendingSlip_${orderId}_${sellerId}`);
  };

  const saveQrToSession = (orderId: string, qrList: any[], createdAt: number) => {
    sessionStorage.setItem(`qrData_${orderId}`, JSON.stringify({ qrList, createdAt }));
  };
  const getQrFromSession = (orderId: string) => {
    const data = sessionStorage.getItem(`qrData_${orderId}`);
    return data ? JSON.parse(data) : null;
  };
  const removeQrFromSession = (orderId: string) => {
    sessionStorage.removeItem(`qrData_${orderId}`);
  };

  // --- fetch order ---
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderDetail(orderId!);
      setOrder(data);
      setAllItems(data.Sellers?.flatMap((s: any) => s.Items) || []);
      setTotalAmount(
        data.Sellers?.reduce((sum: number, s: any) => sum + s.TotalAmount, 0) ?? 0
      );

      if (data.Sellers?.length) {
        const savedSlip = getSlipFromSession(data.OrderId, data.Sellers[0].SellerId);
        if (savedSlip) setPendingSlip({ seller: data.Sellers[0], ...savedSlip });

        const savedQr = getQrFromSession(data.OrderId);
        if (savedQr) {
          const now = Date.now();
          const secondsLeft = Math.max(
            0,
            PAYMENT_TIMEOUT - Math.floor((now - savedQr.createdAt) / 1000)
          );
          if (secondsLeft > 0) {
            setQrList(savedQr.qrList);
            setQrCreatedAt(savedQr.createdAt);
            setTimeLeft(secondsLeft);
            setShowQR(true);
          } else {
            removeQrFromSession(data.OrderId);
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || "โหลดบิลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // --- handle pay ---
  const handlePay = async () => {
    if (!order?.Sellers?.length) return toast.error("ข้อมูลบิลไม่ครบ");

    const now = Date.now();
    const savedQr = getQrFromSession(order.OrderId);

    if (savedQr && now - savedQr.createdAt < PAYMENT_TIMEOUT * 1000) {
      setQrList(savedQr.qrList);
      setQrCreatedAt(savedQr.createdAt);
      setTimeLeft(
        Math.floor((PAYMENT_TIMEOUT * 1000 - (now - savedQr.createdAt)) / 1000)
      );
      setShowQR(true);
      return;
    }

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
      const createdAt = Date.now();
      setQrCreatedAt(createdAt);
      setTimeLeft(PAYMENT_TIMEOUT);
      saveQrToSession(order.OrderId, list, createdAt);
    } catch (err: any) {
      toast.error("สร้าง QR Code ไม่สำเร็จ");
    } finally {
      setPaying(false);
    }
  };

  // --- countdown effect ---
  useEffect(() => {
    if (!qrCreatedAt) return;
    const interval = setInterval(() => {
      const secondsLeft = Math.max(
        0,
        PAYMENT_TIMEOUT - Math.floor((Date.now() - qrCreatedAt) / 1000)
      );
      setTimeLeft(secondsLeft);

      if (secondsLeft === 15 * 60) toast.warning("เหลือเวลาอีก 15 นาทีในการชำระเงิน");
      if (secondsLeft === 5 * 60) toast.warning("เหลือเวลาอีก 5 นาทีในการชำระเงิน");

      if (secondsLeft <= 0) {
        clearInterval(interval);
        toast.info("QR code หมดอายุแล้ว กรุณาสร้างใหม่");
        setShowQR(false);
        setQrList([]);
        setPendingSlip(null);
        removeQrFromSession(order?.OrderId!);
        if (order?.Sellers?.length) removeSlipFromSession(order.OrderId, order.Sellers[0].SellerId);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [qrCreatedAt, order]);

  // --- handle file upload ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, seller: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = canvasRef.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          toast.success(`สแกน QR สำเร็จ: ${code.data}`);
          setPendingSlip({ seller, base64, refCode: code.data });
          saveSlipToSession(order.OrderId, seller.SellerId, base64, code.data);
        } else {
          toast.error("ไม่พบ QR code ในสลิป");
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // --- confirm pay ---
  const confirmPay = async () => {
    if (!pendingSlip) return toast.error("กรุณาอัปโหลดสลิปก่อน");
    if (timeLeft <= 0) return toast.error("QR code หมดอายุแล้ว กรุณาชำระเงินและแนบสลิปใหม่");
    if (!window.confirm("คุณยืนยันที่จะชำระเงินหรือไม่?")) return;

    try {
      setPaying(true);
      const result = await payOrderWithSlip({
        orderId: order.OrderId,
        paidAmount: pendingSlip.seller.TotalAmount,
        refCode: pendingSlip.refCode,
      });

      toast.success(result.message || "ชำระเงินสำเร็จ");
      removeSlipFromSession(order.OrderId, pendingSlip.seller.SellerId);
      removeQrFromSession(order.OrderId);
      setPendingSlip(null);
      setQrList([]);
      setShowQR(false);
      navigate("/buyerOrder");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "ชำระเงินล้มเหลว");
    } finally {
      setPaying(false);
    }
  };

  const cancelSlip = () => {
    if (pendingSlip?.seller) removeSlipFromSession(order!.OrderId, pendingSlip.seller.SellerId);
    setPendingSlip(null);
    toast.info("ยกเลิกการแนบสลิปแล้ว");
  };

  useEffect(() => { fetchOrder(); }, [orderId]);

  if (loading) return <p className="text-center py-10">กำลังโหลดบิล...</p>;
  if (!order) return <p className="text-center py-10 text-red-500">ไม่พบบิล</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2 flex justify-between items-center">
          <span>บิลคำสั่งซื้อ #{order.OrderId}</span>
        </h2>
        {timeLeft > 0 ? (
          <span className="text-red-500 font-semibold text-sm">
            กรุณาชำระเงินและแนบสลิป ภายใน {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")} นาที
          </span>
        ) : (
          <span className="text-gray-500 font-semibold text-sm">
            **กรุณาตรวจสอบรายการและที่อยู่ก่อนชำระเงิน**
          </span>
        )}

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
              {allItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border-b">{item.ProductName}</td>
                  <td className="p-3 border-b">{(item.UnitPrice ?? 0).toLocaleString()}</td>
                  <td className="p-3 border-b">{item.Quantity}</td>
                  <td className="p-3 border-b font-semibold">{((item.UnitPrice ?? 0) * (item.Quantity ?? 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4 font-bold text-lg">
          รวมทั้งหมด: {totalAmount.toLocaleString()} บาท
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={handlePay}
            disabled={paying}
            className="px-6 py-2 bg-green-500 text-white font-semibold rounded shadow hover:bg-green-600 disabled:opacity-50 transition"
          >
            {paying ? "กำลังสร้าง QR..." : "ชำระเงิน"}
          </button>
        </div>

        {/* QR Modal */}
        {showQR && qrList.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded shadow-lg text-center max-w-md w-full flex flex-col items-center">
              <h3 className="text-lg font-bold mb-4">สแกนจ่ายและอัปโหลดสลิป</h3>

              {qrList.map((q, idx) => {
                const seller = order.Sellers[idx];
                return (
                  <div key={idx} className="mb-6 flex flex-col items-center w-full">
                    <p className="text-sm mt-2 text-gray-500">
                      เวลาที่เหลือ: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")} นาที
                    </p>
                    <p className="font-semibold mb-2">{q.sellerName}</p>

                    {/* QR Code + Thai QR overlay */}
                    <div className="relative inline-block">
                      <QRCode value={q.qrData} size={200} />
                      <img
                        src="https://www.bot.or.th/content/dam/bot/icons/icon-thaiqr.png"
                        alt="Thai QR"
                        className="absolute top-1/2 left-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2"
                      />
                    </div>

                    <p className="mt-2 text-gray-700">ยอด: {q.totalAmount.toLocaleString()} บาท</p>

                    {seller.StatusLabel === "รอจ่าย" && (
                      <div className="mt-2 w-full flex flex-col items-center">
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={(e) => handleFileChange(e, seller)}
                          className="border px-2 py-1 w-full rounded mb-2"
                        />

                        {pendingSlip?.seller.SellerId === seller.SellerId && (
                          <div className="mt-2 flex flex-col items-center border rounded p-3 w-full bg-gray-50">
                            <img
                              src={pendingSlip.base64}
                              alt="slip preview"
                              className="w-40 h-auto mt-2 border rounded"
                            />
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={confirmPay}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                ยืนยันการชำระ
                              </button>
                              <button
                                onClick={cancelSlip}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                ลบสลิป
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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
