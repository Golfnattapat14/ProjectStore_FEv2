import React, { useState, useEffect } from "react";
import { ProductResponse } from "@/types/product";
import { deleteProduct, getProducts } from "@/api/Admin";
import { useNavigate } from "react-router-dom";
import { SearchBar, SearchBarData } from "@/components/layouts/SearchBar";
import { toast } from "react-toastify";
const Admin: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState("");
  const [, setLoading] = useState(false);
  const navigate = useNavigate();
  //search
  const [searchKeyword, setSearchKeyword] = useState("");

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

  const handleSearch = async (filters: SearchBarData) => {
    try {
      setLoading(true);
      const all = await getProducts();
      const filtered = all.filter((p) => {
        const kw = filters.keyword?.toLowerCase() || "";
        const matchKeyword =
          !kw ||
          p.productName.toLowerCase().includes(kw) ||
          (p.createdByName?.toLowerCase().includes(kw) ?? false);

        const matchMin =
          filters.priceMin == null || p.productPrice >= filters.priceMin;
        const matchMax =
          filters.priceMax == null || p.productPrice <= filters.priceMax;
        const matchCategory =
          !filters.category ||
          filters.category.length === 0 ||
          (p.productType !== undefined &&
            filters.category.includes(p.productType));

        const matchDate =
          (!filters.releaseDateFrom ||
            new Date(p.createDate) >= new Date(filters.releaseDateFrom)) &&
          (!filters.releaseDateTo ||
            new Date(p.createDate) <= new Date(filters.releaseDateTo));

        const matchStatus =
          filters.isActive === undefined || p.isActive === filters.isActive;
        const matchSeller =
          !filters.sellerName ||
          p.createdByName
            .toLowerCase()
            .includes(filters.sellerName.toLowerCase());
        return (
          matchKeyword &&
          matchMin &&
          matchMax &&
          matchCategory &&
          matchDate &&
          matchStatus &&
          matchSeller
        );
      });

      setProducts(filtered);
    } catch (err: any) {
      toast.error(err.message || "ค้นหาไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">ข้อมูลสินค้า</h3>
      {loadingProducts && <p>กำลังโหลดข้อมูลสินค้า...</p>}
      {errorProducts && <p className="text-red-500">{errorProducts}</p>}
      <div className="overflow-x-auto mb-6">
        {/* SearchBar */}
        <SearchBar
          value={searchKeyword}
          onChange={setSearchKeyword}
          onSearch={handleSearch}
          placeholder="ค้นหาสินค้าและชื่อของคนขาย..."
        />
        <table className="min-w-full table-auto border border-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">รายการที่</th>
              <th className="p-2">รูปภาพสินค้า</th>
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
                <td className="px-4 py-2">
                  {p.filePath ? (
                    <img
                      src={
                        p.filePath.includes("dropbox.com")
                          ? p.filePath.replace("?dl=0", "?raw=1")
                          : p.filePath
                      }
                      alt={p.productName}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded">
                      No Image!
                    </div>
                  )}
                </td>

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
                <td className="py-2 px-4 space-x-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={() => navigate(`/adminManageProducts/${p.id}`)}
                  >
                    แก้ไข
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
