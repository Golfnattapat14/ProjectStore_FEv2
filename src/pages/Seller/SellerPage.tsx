import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProductResponse } from "@/types/product";
import { getProductsSeller, deleteProduct } from "@/api/Seller";
import { toast } from "react-toastify";
import { SearchBar, SearchBarData } from "@/components/layouts/SearchBar";

const SellerPage: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const loadProducts = () => {
    setLoading(true);
    getProductsSeller()
      .then((data) => {
        setProducts(data);
        setError("");
      })
      .catch((err) => setError(err.message || "เกิดข้อผิดพลาด"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getProductsSeller()
      .then(setProducts)
      .catch((err) => toast.error(err.message));
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
      loadProducts();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert(String(err));
      }
    }
  };

  const handleSearch = async (filters: SearchBarData) => {
    try {
      setLoading(true);
      const all = await getProductsSeller();
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
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <main className="max-w-7xl mx-auto mt-6 px-4 flex gap-6">
        {/* Sidebar SearchBar */}
        <div className="hidden md:block flex-shrink-0">
          <SearchBar
            value={searchKeyword}
            onChange={setSearchKeyword}
            onSearch={handleSearch}
            placeholder="ค้นหาสินค้าของคุณ..."
          />
        </div>
        {/* Mobile SearchBar */}
        <div className="block md:hidden mb-4 w-full">
          <SearchBar
            value={searchKeyword}
            onChange={setSearchKeyword}
            onSearch={handleSearch}
            placeholder="ค้นหาสินค้าของคุณ..."
          />
        </div>
        {/* Content */}
        <div className="flex-1">
          <h1 className="text-lg font-medium text-gray-600 mb-4">
            จัดการสินค้าของคุณ / ดูออเดอร์
          </h1>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate("/sellerAdd")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              + เพิ่มสินค้าใหม่
            </button>
          </div>
          <div className="overflow-auto rounded-md border border-gray-300 bg-white">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-left font-semibold">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">รูปภาพ</th>
                  <th className="px-4 py-3">สินค้า</th>
                  <th className="px-4 py-3">วันที่วางจำหน่าย</th>
                  <th className="px-4 py-3">ประเภทสินค้า</th>
                  <th className="px-4 py-3">ราคา</th>
                  <th className="px-4 py-3">จำนวนสินค้า</th>
                  <th className="px-4 py-3">แก้ไขสินค้า</th>
                  <th className="px-4 py-3">ลบสินค้า</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, index) => {
                  const key = p.id ?? `${p.productName}-${index}`;
                  return (
                    <tr
                      key={key}
                      className={`border-t ${
                        p.isActive ? "" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <td className="px-4 py-2">{index + 1}</td>
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
                      <td className="px-4 py-2">
                        <span>{p.productName}</span>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(p.createDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        {getProductTypeName(p.productType ?? 0)}
                      </td>
                      <td>
                        {Number(p.productPrice).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} บาท
                      </td>
                      <td className="px-4 py-2">{p.quantity}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() =>
                            p.id
                              ? navigate(`/sellerManage/${p.id}`)
                              : alert("ไม่พบรหัสสินค้านี้")
                          }
                          className="text-indigo-600 hover:underline"
                        >
                          แก้ไข
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => p.id && handleDelete(p.id)}
                          className="text-red-500 hover:underline"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-6 text-gray-400 italic"
                    >
                      ไม่พบสินค้า
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerPage;
