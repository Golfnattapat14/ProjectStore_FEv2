import React, { useState, useEffect } from "react";
import { getProducts } from "@/api/Buyer";
import { ProductResponse } from "@/types/product";
import { useCart } from "@/components/layouts/CartContext";
import CartIcon from "@/components/layouts/CartIcon";
import { toast } from "react-toastify";
import { SearchBar, SearchBarData } from "@/components/layouts/SearchBar";

const BuyerPage: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [message] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState<{ [id: string]: number }>(
    {}
  );

  const { addToCart, totalCount } = useCart();

  const [searchKeyword, setSearchKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    getProducts(searchKeyword, currentPage, pageSize)
      .then((data) => {
        setProducts(data.items); // หรือ data.products แล้วแต่ backend
        setTotalPages(data.totalPages);
      })
      .catch((err) => toast.error(err.message));
  }, [searchKeyword, currentPage, pageSize]);

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

  const handleQuantityChange = (id: string, delta: number, max: number) => {
    setQuantityToAdd((prev) => {
      const current = prev[id] ?? 1;
      let next = current + delta;
      if (next < 1) next = 1;
      if (next > max) next = max;
      return { ...prev, [id]: next };
    });
  };

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingToCartId(productId);
      const qty = quantityToAdd[productId] ?? 1;
      await addToCart(productId, qty);
      toast.success("เพิ่มสินค้าในตะกร้าเรียบร้อย");
      setQuantityToAdd((prev) => ({ ...prev, [productId]: 1 }));

      // ✅ โหลดข้อมูลใหม่ โดยยังอยู่ใน context ของหน้าเดิม
      setLoading(true);
      const data = await getProducts(searchKeyword, currentPage, pageSize);
      setProducts(data.items);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("เพิ่มสินค้าในตะกร้าไม่สำเร็จ");
      setLoading(false);
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleSearch = async (filters: SearchBarData) => {
    try {
      setLoading(true);
      const all = await getProducts();

      const filtered = all.items.filter((p: any) => {
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

  const pageSizeOptions = [
    { label: "5 รายการ", value: 5 },
    { label: "10 รายการ", value: 10 },
    { label: "20 รายการ", value: 20 },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-20 bg-white shadow-md border-b border-orange-200">
        <div className="max-w-7xl mx-auto flex items-center px-4 py-3 gap-4">
          {/* <h2 className="text-2xl font-bold text-orange-500 tracking-wide">
            อำนวย Shop
          </h2> */}
          <div className="flex-1" />
          <div className="relative ml-4">
            <CartIcon count={totalCount} />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto mt-6 px-4 flex gap-6">
        {/* Sidebar SearchBar */}
        <div className="hidden md:block flex-shrink-0">
          <SearchBar
            value={searchKeyword}
            onChange={setSearchKeyword}
            onSearch={handleSearch}
            placeholder="ค้นหาสินค้าและชื่อของคนขาย..."
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          {loading && (
            <p className="text-gray-500 text-center py-20 text-lg">
              กำลังโหลดข้อมูล...
            </p>
          )}
          {error && (
            <p className="text-red-500 text-center py-20 text-lg">{error}</p>
          )}
          {message && (
            <p className="text-blue-600 text-center py-20 text-lg">{message}</p>
          )}

          {/* Grid แสดงสินค้า */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.length > 0
              ? products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-orange-100 rounded-xl shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full cursor-pointer group"
                    title={p.productName}
                  >
                    <div className="relative pb-[100%] overflow-hidden rounded-t-xl">
                      {p.filePath ? (
                        <img
                          src={
                            p.filePath.includes("dropbox.com")
                              ? p.filePath.replace("?dl=0", "?raw=1")
                              : p.filePath
                          }
                          alt={p.productName}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          ไม่มีรูปภาพ
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-grow">
                      <h3 className="text-base font-semibold text-gray-900 break-words mb-1">
                        {p.productName}
                      </h3>
                      <p
                        className="text-xs text-gray-500 mb-1 break-words"
                        title={p.createdByName}
                      >
                        โดย: {p.createdByName || "-"}
                      </p>
                      <p className="text-xs text-gray-400 mb-1">
                        โพสต์เมื่อ:{" "}
                        {new Date(p.createDate).toLocaleDateString("th-TH")}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        ประเภทสินค้า : {getProductTypeName(p.productType ?? 0)}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        คงเหลือ:{" "}
                        {p.quantity > 0
                          ? p.quantity.toLocaleString()
                          : "หมดสต็อก"}{" "}
                        ชิ้น
                      </p>
                      <div className="mt-auto flex flex-col gap-2">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-base sm:text-lg font-semibold text-orange-500">
                            {p.productPrice.toLocaleString()} บาท
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              className="min-w-[28px] h-7 px-2 rounded-full bg-gray-200 text-sm font-bold text-gray-700 hover:bg-orange-100"
                              onClick={() =>
                                handleQuantityChange(p.id, -1, p.quantity)
                              }
                              disabled={(quantityToAdd[p.id] ?? 1) <= 1}
                              type="button"
                            >
                              -
                            </button>

                            <span className="min-w-[32px] text-center text-sm">
                              {quantityToAdd[p.id] ?? 1}
                            </span>

                            <button
                              className="min-w-[28px] h-7 px-2 rounded-full bg-gray-200 text-sm font-bold text-gray-700 hover:bg-orange-100"
                              onClick={() =>
                                handleQuantityChange(p.id, 1, p.quantity)
                              }
                              disabled={
                                (quantityToAdd[p.id] ?? 1) >= p.quantity
                              }
                              type="button"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          disabled={addingToCartId === p.id || p.quantity === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(p.id);
                          }}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
                        >
                          {addingToCartId === p.id
                            ? "กำลังเพิ่ม..."
                            : "ใส่ตะกร้า"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              : !loading && (
                  <p className="col-span-full text-center text-gray-400 text-lg py-20">
                    ไม่พบสินค้า
                  </p>
                )}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <div>
              <label className="mr-2">แสดง:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1); // รีหน้าเมื่อเปลี่ยน pageSize
                }}
                className="border rounded px-2 py-1"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                ก่อนหน้า
              </button>
              <span className="px-2 py-1">
                หน้า {currentPage} จาก {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyerPage;
