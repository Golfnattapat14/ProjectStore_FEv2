import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getOrderDetail, payOrderWithSlip } from "@/api/Buyer";
import PromptPay from "promptpay-qr";
import QRCode from "react-qr-code";
import jsQR from "jsqr";
import { useNavigate } from "react-router-dom";

interface SlipSessionData {
  sellerId: string;
  orderId: string;
  base64: string;
  refCode: string;
  expireAt: number; // timestamp สิ้นสุด QR
}

const QR_EXPIRE_MIN = 30; // นาที

const BuyerPayment: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [allItems, setAllItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const [qrList, setQrList] = useState<any[]>([]);
  const [showQR, setShowQR] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // เก็บ slip + countdown
  const [pendingSlips, setPendingSlips] = useState<SlipSessionData[]>([]);
  const [qrCountdowns, setQrCountdowns] = useState<{ [key: string]: number }>({});

  const navigate = useNavigate();

  // --- session storage helpers ---
  const saveSlipToSession = (data: SlipSessionData) => {
    sessionStorage.setItem(`pendingSlip_${data.sellerId}`, JSON.stringify(data));
  };

  const getSlipFromSession = (sellerId: string) => {
    const data = sessionStorage.getItem(`pendingSlip_${sellerId}`);
    return data ? (JSON.parse(data) as SlipSessionData) : null;
  };

  const removeSlipFromSession = (sellerId: string) => {
    sessionStorage.removeItem(`pendingSlip_${sellerId}`);
  };

  // --- โหลดบิล ---
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderDetail(orderId!);
      setOrder(data);
      setAllItems(data.Sellers?.flatMap((s: any) => s.Items) || []);
      setTotalAmount(data.Sellers?.reduce((sum: number, s: any) => sum + s.TotalAmount, 0) ?? 0);

      // โหลด slip + countdown จาก session
      const loadedSlips: SlipSessionData[] = [];
      const loadedCountdowns: { [key: string]: number } = {};
      data.Sellers?.forEach((seller: any) => {
        const slip = getSlipFromSession(seller.SellerId);
        if (slip) {
          loadedSlips.push(slip);
          const remain = Math.max(0, Math.floor((slip.expireAt - Date.now()) / 1000));
          loadedCountdowns[seller.SellerId] = remain;
        }
      });
      setPendingSlips(loadedSlips);
      setQrCountdowns(loadedCountdowns);
    } catch (err: any) {
      toast.error(err.message || "โหลดบิลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // --- สร้าง QR PromptPay ---
  const handlePay = async () => {
    if (!order?.Sellers?.length) return toast.error("ข้อมูลบิลไม่ครบ");
    try {
      setPaying(true);
      const now = Date.now();
      const list = order.Sellers.map((seller: any) => {
        const qrData = PromptPay(seller.SellerPhone, { amount: seller.TotalAmount });
        const expireAt = now + QR_EXPIRE_MIN * 60 * 1000; // 30 นาที
        const slipData: SlipSessionData = {
          sellerId: seller.SellerId,
          orderId: order.OrderId,
          base64: "",
          refCode: "",
          expireAt,
        };
        saveSlipToSession(slipData);

        // update pendingSlips
        setPendingSlips((prev) => {
          const others = prev.filter((s) => s.sellerId !== seller.SellerId);
          return [...others, slipData];
        });

        setQrCountdowns((prev) => ({ ...prev, [seller.SellerId]: QR_EXPIRE_MIN * 60 }));

        return {
          sellerName: seller.SellerName,
          sellerId: seller.SellerId,
          totalAmount: seller.TotalAmount,
          qrData,
        };
      });
      setQrList(list);
      setShowQR(true);
    } catch (err: any) {
      toast.error("สร้าง QR Code ไม่สำเร็จ");
    } finally {
      setPaying(false);
    }
  };

  // --- countdown interval ---
  useEffect(() => {
    const interval = setInterval(() => {
      setQrCountdowns((prev) => {
        const updated: { [key: string]: number } = {};
        Object.keys(prev).forEach((key) => {
          const val = prev[key] - 1;
          if (val > 0) updated[key] = val;
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- อัปโหลดสลิป + scan QR ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, seller: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;

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
          const slipData: SlipSessionData = {
            sellerId: seller.SellerId,
            orderId: order.OrderId,
            base64,
            refCode: code.data,
            expireAt: Date.now() + QR_EXPIRE_MIN * 60 * 1000, // reset countdown
          };
          saveSlipToSession(slipData);
          setPendingSlips((prev) => {
            const others = prev.filter((s) => s.sellerId !== seller.SellerId);
            return [...others, slipData];
          });
          setQrCountdowns((prev) => ({ ...prev, [seller.SellerId]: QR_EXPIRE_MIN * 60 }));
        } else {
          toast.error("ไม่พบ QR code ในสลิป");
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // --- ยืนยันจ่าย ---
  const confirmPay = async (slip: SlipSessionData) => {
    const ok = window.confirm("คุณยืนยันที่จะชำระเงินหรือไม่?");
    if (!ok) return;
    await handlePayWithSlip(slip);
    removeSlipFromSession(slip.sellerId);
    setPendingSlips((prev) => prev.filter((s) => s.sellerId !== slip.sellerId));
    setQrCountdowns((prev) => {
      const copy = { ...prev };
      delete copy[slip.sellerId];
      return copy;
    });
  };

  // --- ยกเลิก slip ---
  const cancelSlip = (slip: SlipSessionData) => {
    removeSlipFromSession(slip.sellerId);
    setPendingSlips((prev) => prev.filter((s) => s.sellerId !== slip.sellerId));
    setQrCountdowns((prev) => {
      const copy = { ...prev };
      delete copy[slip.sellerId];
      return copy;
    });
    toast.info("ยกเลิกการแนบสลิปแล้ว");
  };

  // --- ส่งสลิปไป API ---
  const handlePayWithSlip = async (slip: SlipSessionData) => {
    const seller = order.Sellers.find((s: any) => s.SellerId === slip.sellerId);
    if (!seller) return toast.error("ไม่พบผู้ขาย");

    try {
      setPaying(true);
      const result = await payOrderWithSlip({
        orderId: slip.orderId,
        paidAmount: seller.TotalAmount,
        refCode: slip.refCode,
      });

      toast.success(result.message || "ชำระเงินสำเร็จ");

      navigate("/buyerOrder");
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">บิลคำสั่งซื้อ #{order.OrderId}</h2>
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
                  <td className="p-3 border-b font-semibold">{((item.UnitPrice ?? 0) * (item.Quantity ?? 0)).toLocaleString()}</td>
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
              <h3 className="text-lg font-bold mb-4">สแกนจ่ายและอัปโหลดสลิป</h3>

              {qrList.map((q, idx) => {
                const seller = order.Sellers[idx];
                const slip = pendingSlips.find((s) => s.sellerId === seller.SellerId);
                const countdown = qrCountdowns[seller.SellerId] ?? 0;
                return (
                  <div key={idx} className="mb-6 flex flex-col items-center w-full">
                    <p className="font-semibold mb-2">{q.sellerName}</p>
                    <QRCode value={q.qrData} size={200} />
                    <p className="mt-2 text-gray-700">ยอด: {q.totalAmount.toLocaleString()} บาท</p>

                    {countdown > 0 && <p className="text-red-600 mt-1 font-semibold">เวลาที่เหลือ: {formatTime(countdown)}</p>}
                    {countdown === 0 && <p className="text-gray-500 mt-1">หมดเวลา QR</p>}

                    {seller.StatusLabel === "รอจ่าย" && countdown > 0 && (
                      <div className="mt-2 w-full flex flex-col items-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, seller)}
                          className="border px-2 py-1 w-full rounded mb-2"
                        />

                        {slip && (
                          <div className="mt-2 flex flex-col items-center border rounded p-3 w-full bg-gray-50">
                            {slip.base64 && <img src={slip.base64} alt="slip preview" className="w-40 h-auto mt-2 border rounded" />}
                            <div className="flex gap-2 mt-3">
                              <button onClick={() => confirmPay(slip)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">ยืนยันการชำระ</button>
                              <button onClick={() => cancelSlip(slip)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">ยกเลิก</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {seller.StatusLabel === "ชำระแล้ว" && <span className="text-green-600 font-semibold mt-2">ชำระแล้ว</span>}
                  </div>
                );
              })}

              <button onClick={() => setShowQR(false)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mt-4">ปิด</button>
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerPayment;
