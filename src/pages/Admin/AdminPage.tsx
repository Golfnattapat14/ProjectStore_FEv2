import React, { useState, useEffect } from "react";
import { ProductResponse } from "@/types/product";
import { deleteProduct, getProducts } from "@/api/Admin";

const Admin: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState("");

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      setErrorProducts(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getProductTypeName = (type: number) => {
    switch (type) {
      case 0:
        return "อาหาร";
      case 1:
        return "เครื่องใช้";
      case 2:
        return "เครื่องดื่ม";
      case 3:
        return "ของเล่น";
      default:
        return "อื่น ๆ";
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("คุณแน่ใจว่าจะลบสินค้านี้?");
    if (!confirmDelete) return;

    try {
      await deleteProduct(id);
      await fetchProducts();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-6">
      {/* <nav className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </nav> */}

      <h3 className="text-xl font-semibold mb-4">ข้อมูลสินค้า</h3>

      {loadingProducts && <p>กำลังโหลดข้อมูลสินค้า...</p>}
      {errorProducts && <p className="text-red-500">{errorProducts}</p>}

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full table-auto border border-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">รายการที่</th>
              <th className="p-2">สินค้า</th>
              <th className="p-2">จำหน่ายโดย</th>
              <th className="p-2">วันที่วางจำหน่าย</th>
              <th className="p-2">ประเภทสินค้า</th>
              <th className="p-2">ราคา</th>
              <th className="p-2">สถานะ</th>
              <th className="p-2">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, index) => (
              <tr
                key={p.id}
                className={`border-t ${
                  !p.isActive ? "bg-gray-100 opacity-60" : ""
                }`}
              >
                <td className="p-2 text-center">{index + 1}</td>
                <td className="p-2">{p.productName}</td>
                <td className="p-2">{p.createdByName}</td>
                <td className="p-2">
                  {new Date(p.createDate).toLocaleDateString()}
                </td>
                <td className="p-2">
                  {getProductTypeName(p.productType ?? 0)}
                </td>
                <td className="p-2">{p.productPrice} บาท</td>
                <td
                  className={`p-2 font-semibold ${
                    p.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {p.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </td>
                <td className="p-2 space-x-2">
                  <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                    แก้ไขสินค้า
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDelete(p.id)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
