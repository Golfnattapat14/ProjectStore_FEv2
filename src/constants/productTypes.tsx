export const productTypes = [
  { label: "อาหาร", value: 1 },
  { label: "เครื่องใช้", value: 2 },
  { label: "เครื่องดื่ม", value: 3 },
  { label: "ของเล่น", value: 4 },
  { label: "อื่นๆ", value: 5 },
];

export function getProductTypeName(type: number): string {
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
}

export enum OrderStatus {
  Pending = 1,      // รอจ่าย
  Paid = 2,         // จ่ายแล้ว
  ReadyToShip = 3,  // กำลังจัดส่ง
  Shipped = 4,      // จัดส่งสำเร็จ
  Cancelled = 5     // ยกเลิก
}

export function getOrderStatusLabel(status: number): string {
  switch (status) {
    case OrderStatus.Pending: return "รอจ่าย";
    case OrderStatus.Paid: return "จ่ายแล้ว";
    case OrderStatus.ReadyToShip: return "กำลังจัดส่ง";
    case OrderStatus.Shipped: return "จัดส่งสำเร็จ";
    case OrderStatus.Cancelled: return "ยกเลิก";
    default: return "ไม่ทราบสถานะ";
  }
}

// เพิ่ม status type
// สีของแต่ละสถานะ
export const orderStatusColors: Record<string, string> = {
  "รอจ่าย": "bg-yellow-100 text-yellow-800",
  "จ่ายแล้ว": "bg-green-100 text-green-800",
  "กำลังจัดส่ง": "bg-blue-100 text-blue-800",
  "จัดส่งสำเร็จ": "bg-green-700 text-white",
  "ยกเลิก": "bg-gray-100 text-gray-800",
};

// ปุ่ม action ต่อสถานะ (label คือข้อความปุ่ม, apiStatus คือค่าที่ส่งไปอัปเดต)
export const statusNextAction: Record<string, { label: string; apiStatus: string } | null> = {
  "จ่ายแล้ว": { label: "จัดส่งสินค้า", apiStatus: "กำลังจัดส่ง" },       // Seller
  "กำลังจัดส่ง": { label: "ได้รับสินค้าแล้ว", apiStatus: "จัดส่งสำเร็จ" }, // Buyer หรือ Seller
  "รอจ่าย": null,
  "จัดส่งสำเร็จ": null,
  "ยกเลิก": null,
};


