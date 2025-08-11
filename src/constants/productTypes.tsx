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
