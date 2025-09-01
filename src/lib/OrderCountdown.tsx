// // OrderCountdown.tsx
// import React, { useEffect, useState } from "react";

// interface OrderCountdownProps {
//   expireDate: string; // ISO string จาก backend (UTC)
//   orderId?: string;   // สำหรับ log debug
// }

// const OrderCountdown: React.FC<OrderCountdownProps> = ({ expireDate, orderId }) => {
//   const [timeLeft, setTimeLeft] = useState<string>("");

//   useEffect(() => {
//     const updateCountdown = () => {
//       // แปลง expireDate → เวลาไทย (+7 ชั่วโมง)
//       const expireUTC = new Date(expireDate).getTime(); // UTC
//       const expireThai = expireUTC + 7 * 60 * 60 * 1000; // +7 ชั่วโมง
//       const now = Date.now();

//       const diff = expireThai - now;

//       if (orderId) console.log(`[Countdown] OrderId: ${orderId} diff: ${diff}`);

//       if (diff <= 0) {
//         setTimeLeft("หมดเวลา");
//         return;
//       }

//       const hours = Math.floor(diff / 1000 / 60 / 60);
//       const minutes = Math.floor((diff / 1000 / 60) % 60);
//       const seconds = Math.floor((diff / 1000) % 60);

//       setTimeLeft(
//         `${hours.toString().padStart(2, "0")} : ${minutes
//           .toString()
//           .padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`
//       );
//     };

//     // อัปเดตทันที
//     updateCountdown();

//     const interval = setInterval(updateCountdown, 1000);

//     return () => clearInterval(interval);
//   }, [expireDate, orderId]);

//   return (
//     <p className="text-red-500 font-bold mt-1">
//       ⏰ เวลาที่เหลือ: {timeLeft}
//     </p>
//   );
// };

// export default OrderCountdown;
