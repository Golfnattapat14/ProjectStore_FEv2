import React, { useState, useEffect } from "react";
import { ProductResponse } from "@/types/product";
import { deleteProduct, getProducts } from "@/api/Admin";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FilterSearch from "@/components/layouts/SearchBar";
import { getProductTypeName } from "@/constants/productTypes";

const Admin: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [releaseDateFrom, setReleaseDateFrom] = useState<string>("");
  const [releaseDateTo, setReleaseDateTo] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const loadProducts = (
    keywordParam = searchKeyword,
    pageParam = currentPage,
    pageSizeParam = pageSize,
    filtersParam = {
      productTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
      minPrice: minPrice === null ? undefined : minPrice,
      maxPrice: maxPrice === null ? undefined : maxPrice,
      releaseDateFrom: releaseDateFrom || undefined,
      releaseDateTo: releaseDateTo || undefined,
      isActive: isActive === null ? undefined : isActive,
    }
  ) => {
    setLoading(true);
    getProducts(keywordParam, pageParam, pageSizeParam, filtersParam)
      .then((data) => {
        setProducts(data.items ?? []);
        setTotalPages(data.totalPages ?? 0);
        setError("");
      })
      .catch((err) => setError(err.message || "เกิดข้อผิดพลาด"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [
    searchKeyword,
    selectedTypes,
    minPrice,
    maxPrice,
    isActive,
    releaseDateFrom,
    releaseDateTo,
    currentPage,
    pageSize,
  ]);


  const handleDelete = async (id: string) => {
    if (!window.confirm("คุณแน่ใจว่าจะลบสินค้านี้?")) return;
    try {
      await deleteProduct(id);
      toast.success("ลบสินค้าสำเร็จ");
      loadProducts();
    } catch (err: any) {
      toast.error(err.message || "ลบสินค้าไม่สำเร็จ");
    }
  };

  const pageSizeOptions = [
    { label: "5 รายการ", value: 5 },
    { label: "10 รายการ", value: 10 },
    { label: "20 รายการ", value: 20 },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <main className="max-w-7xl mx-auto mt-6 px-4">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-6 text-gray-800">จัดการสินค้า</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Filter */}
          <section className="lg:w-80">
            <FilterSearch
              keyword={searchKeyword}
              setKeyword={setSearchKeyword}
              selectedTypes={selectedTypes}
              setSelectedTypes={setSelectedTypes}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              isActive={isActive}
              setIsActive={setIsActive}
              releaseDateFrom={releaseDateFrom}
              setReleaseDateFrom={setReleaseDateFrom}
              releaseDateTo={releaseDateTo}
              setReleaseDateTo={setReleaseDateTo}
              onSearch={() => {
                setCurrentPage(1);
                loadProducts(searchKeyword, 1, pageSize, {
                  productTypes:
                    selectedTypes.length > 0 ? selectedTypes : undefined,
                  minPrice: minPrice === null ? undefined : minPrice,
                  maxPrice: maxPrice === null ? undefined : maxPrice,
                  releaseDateFrom: releaseDateFrom || undefined,
                  releaseDateTo: releaseDateTo || undefined,
                  isActive: isActive === null ? undefined : isActive,
                });
              }}
              onReset={() => {
                setSearchKeyword("");
                setSelectedTypes([]);
                setMinPrice(null);
                setMaxPrice(null);
                setIsActive(null);
                setReleaseDateFrom("");
                setReleaseDateTo("");
                setCurrentPage(1);
                loadProducts("", 1, pageSize, {
                  productTypes: undefined,
                  minPrice: undefined,
                  maxPrice: undefined,
                  releaseDateFrom: undefined,
                  releaseDateTo: undefined,
                  isActive: undefined,
                });
              }}
            />
          </section>

          {/* Right: Products List */}
          <section className="flex-1 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">ข้อมูลสินค้า</h2>

            {loading && (
              <p className="text-center text-gray-600 py-10">กำลังโหลดข้อมูลสินค้า...</p>
            )}
            {error && (
              <p className="text-center text-red-500 py-10">{error}</p>
            )}

            {!loading && !error && products.length === 0 && (
              <p className="text-center text-gray-500 py-10">ไม่พบข้อมูลสินค้า</p>
            )}

            {products.length > 0 && (
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-full table-auto text-left text-gray-700">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="p-3 whitespace-nowrap">#</th>
                      <th className="p-3 whitespace-nowrap">รูปภาพ</th>
                      <th className="p-3 whitespace-nowrap">สินค้า</th>
                      <th className="p-3 whitespace-nowrap">ผู้ขาย</th>
                      <th className="p-3 whitespace-nowrap">วันที่วางจำหน่าย</th>
                      <th className="p-3 whitespace-nowrap">ประเภท</th>
                      <th className="p-3 whitespace-nowrap">ราคา</th>
                      <th className="p-3 whitespace-nowrap">สถานะ</th>
                      <th className="p-3 whitespace-nowrap">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr
                        key={p.id}
                        className={`border-b ${
                          p.isActive ? "" : "bg-gray-50 text-gray-400 opacity-70"
                        }`}
                      >
                        <td className="p-3">{p.index}</td>
                        <td className="p-3">
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
                              No Image
                            </div>
                          )}
                        </td>
                        <td className="p-3">{p.productName}</td>
                        <td className="p-3">{p.createdByName}</td>
                        <td className="p-3">
                          {new Date(p.createDate).toLocaleDateString()}
                        </td>
                        <td className="p-3">{getProductTypeName(p.productType ?? 0)}</td>
                        <td className="p-3">{p.productPrice} บาท</td>
                        <td
                          className={`p-3 font-semibold ${
                            p.isActive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {p.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </td>
                        <td className="p-3 space-x-2">
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                            onClick={() => navigate(`/adminManageProducts/${p.id}`)}
                          >
                            แก้ไข
                          </button>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
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
            )}

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize" className="whitespace-nowrap">
                  แสดง:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-3 py-1"
                >
                  {pageSizeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-1 border rounded disabled:opacity-50"
                >
                  ก่อนหน้า
                </button>
                <span>
                  หน้า {currentPage} จาก {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-1 border rounded disabled:opacity-50"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Admin;
