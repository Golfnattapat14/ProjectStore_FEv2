import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface OrderCountdownProps {
  orderId: string;
  createDate: string; // ISO string
}

const OrderCountdown: React.FC<OrderCountdownProps> = ({ orderId, createDate }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0); // วินาที

  useEffect(() => {
    const expiryTime = new Date(createDate).getTime() + 48 * 60 * 60 * 1000; // 48 ชั่วโมง
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(diff);

      // แจ้งเตือนถ้าเหลือเวลาน้อยกว่า 1 ชั่วโมง
      if (diff === 3600) {
        toast.warning(`คำสั่งซื้อ ${orderId} เหลือเวลาเพียง 1 ชั่วโมงในการชำระเงิน!`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [createDate, orderId]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  };

  if (timeLeft <= 0) return <span className="text-red-500 font-bold">สลิปหมดอายุแล้ว</span>;
  return <span className="text-yellow-600 font-semibold">กรุณาชำระเงินก่อน: {formatTime(timeLeft)}</span>;
};

export default OrderCountdown;
