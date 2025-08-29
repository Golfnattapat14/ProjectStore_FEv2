import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatThaiDateTime = (dateString: string) => {
  const date = new Date(dateString);

  // แปลงเป็นเวลาไทย (UTC+7)
  const thaiDateObj = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  // วันที่ภาษาไทย
  const thaiDate = thaiDateObj.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // เวลาแบบ 24 ชั่วโมง พร้อม "น."
  const hours = thaiDateObj.getHours().toString().padStart(2, "0");
  const minutes = thaiDateObj.getMinutes().toString().padStart(2, "0");
  const thaiTime = `${hours}:${minutes} น.`;

  return { thaiDate, thaiTime };
};


