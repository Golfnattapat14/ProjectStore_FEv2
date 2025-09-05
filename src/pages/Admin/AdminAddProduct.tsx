import React, { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProductRequest } from "@/types/product";
import { productTypes } from "@/constants/productTypes";
import { User } from "@/types/adminDashborad";
import { createProductByAdmin, getSellers } from "@/api/Admin";

const AdminAddProduct: React.FC = () => {
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductRequest & { SellerId?: string }>({
    ProductName: "",
    ProductPrice: 0,
    ProductType: 5,
    Quantity: 0,
    IsActive: true,
    FilePath: null,
  });

  const [sellers, setSellers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // ดึงรายชื่อ seller
    getSellers()
      .then(setSellers)
      .catch((err) => console.error("Failed to fetch sellers:", err));
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;

    if (type === "file") {
      setProduct((prev) => ({
        ...prev,
        FilePath: files && files.length > 0 ? files[0] : null,
      }));
      return;
    }

    let newValue: string | number | boolean;

    if (type === "checkbox") {
      newValue = checked;
    } else if (["ProductPrice", "Quantity", "ProductType"].includes(name)) {
      newValue = Number(value);
      if (name === "Quantity" && newValue < 0) newValue = 0;
    } else {
      newValue = value;
    }

    setProduct((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSave = async (e?: React.MouseEvent) => {
    e?.preventDefault();

    if (
      !product.ProductName.trim() ||
      product.ProductPrice <= 0 ||
      product.Quantity <= 0 ||
      product.ProductType < 1 ||
      product.ProductType > 5 ||
      !product.SellerId
    ) {
      toast.error(
        "กรุณากรอกข้อมูลให้ถูกต้อง และเลือก seller และประเภทสินค้าต้องอยู่ระหว่าง 1 ถึง 5"
      );
      return;
    }

    try {
      setSaving(true);
      toast.info("กำลังบันทึก...");

      await createProductByAdmin(product as ProductRequest & { SellerId: string });

      toast.success("เพิ่มสินค้าเรียบร้อยแล้ว");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          เพิ่มสินค้าใหม่
        </h2>

        <label className="block mb-4">
          <span className="block mb-1 font-medium">Seller:</span>
          <select
            name="SellerId"
            value={product.SellerId ?? ""}
            onChange={handleChange}
            disabled={saving}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="" disabled>
              -- กรุณาเลือก seller --
            </option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.username}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-4">
          <span className="block mb-1 font-medium">ชื่อสินค้า:</span>
          <input
            type="text"
            name="ProductName"
            maxLength={30}
            value={product.ProductName}
            onChange={handleChange}
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </label>

        <label className="block mb-4">
          <span className="block mb-1 font-medium">
            ราคา: {Number(product.ProductPrice).toFixed(2)} บาท
          </span>
          <input
            type="number"
            name="ProductPrice"
            value={product.ProductPrice}
            onChange={handleChange}
            min={0}
            step="0.01"
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </label>

        <label className="block mb-4">
          <span className="block mb-1 font-medium">ประเภทสินค้า:</span>
          <select
            name="ProductType"
            value={product.ProductType ?? 0}
            onChange={handleChange}
            disabled={saving}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value={0} disabled>
              -- กรุณาเลือกประเภทสินค้า --
            </option>
            {productTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-4">
          <span className="block mb-1 font-medium">จำนวน:</span>
          <input
            type="number"
            name="Quantity"
            value={product.Quantity}
            onChange={handleChange}
            min={0}
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </label>

        <label className="block mb-6">
          <span className="block mb-1 font-medium">รูปภาพสินค้า:</span>
          <input
            type="file"
            name="FilePath"
            onChange={handleChange}
            disabled={saving}
            accept="image/*"
            className="w-full"
          />
          {product.FilePath && typeof product.FilePath !== "string" && (
            <p className="mt-2 text-sm text-gray-600">
              ไฟล์ที่เลือก: {(product.FilePath as File).name}
            </p>
          )}
        </label>

        <label className="flex items-center mb-6 cursor-pointer select-none">
          <input
            type="checkbox"
            name="IsActive"
            checked={product.IsActive}
            onChange={handleChange}
            disabled={saving}
            className="mr-2 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span>เปิดใช้งาน</span>
        </label>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-md text-white font-semibold ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "เพิ่มสินค้า"}
          </button>

          <button
            onClick={() => navigate("/admin")}
            disabled={saving}
            className="px-6 py-2 rounded-md border border-gray-400 hover:bg-gray-100 disabled:opacity-50"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminAddProduct;
