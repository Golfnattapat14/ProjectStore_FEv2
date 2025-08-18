import React, { useState, useEffect } from "react";
import { ProductResponse } from "@/types/product";
import { deleteProduct, getProducts } from "@/api/Admin";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FilterSearch from "@/components/layouts/SearchBar";
import Pagination from "@/components/layouts/Pagination";
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

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <main className="max-w-7xl mx-auto mt-6 px-4">
        <h1 className="text-lg font-medium text-gray-600 mb-4">
          จัดการสินค้าทั้งหมด
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filter */}
          <aside className="lg:w-80">
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
          </aside>

          {/* Products Table + Pagination */}
          <section className="flex-1 flex flex-col overflow-auto rounded-md border border-gray-300 bg-white">
            {loading && (
              <p className="text-center py-6 text-gray-500">กำลังโหลดข้อมูล...</p>
            )}
            {error && (
              <p className="text-center py-6 text-red-600 font-semibold">{error}</p>
            )}
            {!loading && products.length === 0 && (
              <p className="text-center py-20 text-gray-400 italic">ไม่พบสินค้า</p>
            )}

            {products.length > 0 && (
              <>
                <table className="min-w-full text-sm text-gray-700">
                  <thead className="bg-gray-100 text-left font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-center">#</th>
                      <th className="px-4 py-3 text-center">รูปภาพ</th>
                      <th className="px-4 py-3 text-center">สินค้า</th>
                      <th className="px-4 py-3 text-center">ผู้ขาย</th>
                      <th className="px-4 py-3 text-center">วันที่วางจำหน่าย</th>
                      <th className="px-4 py-3 text-center">ประเภทสินค้า</th>
                      <th className="px-4 py-3 text-center">ราคา</th>
                      <th className="px-4 py-3 text-center">สถานะ</th>
                      <th className="px-4 py-3 text-center">จำนวนสินค้า</th>
                      <th className="px-4 py-3 text-center">จัดการสินค้า</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, index) => {
                      const key = p.id ?? `${p.productName}-${index}`;
                      return (
                        <tr
                          key={key}
                          className={`border-t ${p.isActive ? "" : "bg-gray-100 text-gray-400"}`}
                        >
                          <td className="px-4 py-2 text-center">
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
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
                          <td className="px-4 py-2">{p.productName}</td>
                          <td className="px-4 py-2">{p.createdByName ?? "-"}</td>
                          <td className="px-4 py-2 text-center">
                            {p.createDate ? new Date(p.createDate).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {getProductTypeName(p.productType ?? 0)}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {Number(p.productPrice).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })} บาท
                          </td>
                          <td className={`px-4 py-2 font-semibold text-center ${p.isActive ? "text-green-600" : "text-red-600"}`}>
                            {p.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                          </td>
                          <td className="px-4 py-2 text-center">{p.quantity ?? "-"}</td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() =>
                                  p.id ? navigate(`/adminManageProducts/${p.id}`) : toast.error("ไม่พบรหัสสินค้า")
                                }
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                              >
                                แก้ไข
                              </button>
                              <button
                                onClick={() => p.id && handleDelete(p.id)}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                              >
                                ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Admin;
