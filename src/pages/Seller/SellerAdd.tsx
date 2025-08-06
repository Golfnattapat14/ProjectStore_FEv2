import React, { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { addNewProduct } from "@/api/Seller";
import { ProductRequest } from "@/types/product";

const SellerAdd: React.FC = () => {
  const navigate = useNavigate();

  const savedUser = localStorage.getItem("user");
  const currentUser = savedUser ? JSON.parse(savedUser) : null;
  const [product, setProduct] = useState<ProductRequest>({
    ProductName: "",
    ProductPrice: 0,
    ProductType: 5,
    Quantity: 0,
    IsActive: true,
    CreateBy: currentUser?.username || "",
    FilePath: null,
  });

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

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
      product.ProductType > 5
    ) {
      setMessage(
        "กรุณากรอกข้อมูลให้ถูกต้อง และประเภทสินค้าต้องอยู่ระหว่าง 1 ถึง 5"
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("กำลังบันทึก...");

      await addNewProduct(product);

      setMessage("เพิ่มสินค้าเรียบร้อยแล้ว");
      setTimeout(() => navigate("/seller"), 1500);
    } catch (err : any) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(`เกิดข้อผิดพลาดในการบันทึก: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const productTypes = [
    { label: "อาหาร", value: 1 },
    { label: "เครื่องใช้", value: 2 },
    { label: "เครื่องดื่ม", value: 3 },
    { label: "ของเล่น", value: 4 },
    { label: "อื่นๆ", value: 5 },
  ];

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        เพิ่มสินค้าใหม่
      </h2>

      <label htmlFor="productName" className="block mb-4">
        <span className="block mb-1 font-medium">ชื่อสินค้า:</span>
        <input
          id="productName"
          type="text"
          name="ProductName"
          maxLength={30}
          value={product.ProductName}
          onChange={handleChange}
          aria-required="true"
          disabled={saving}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </label>

      <label htmlFor="productPrice" className="block mb-4">
        <span className="block mb-1 font-medium">ราคา: {Number(product.ProductPrice).toFixed(2)} บาท</span>
        <input
          id="productPrice"
          type="number"
          name="ProductPrice"
          value={product.ProductPrice}
          onChange={handleChange}
          min={0}
          step="0.01"
          aria-required="true"
          disabled={saving}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </label>

      <label htmlFor="productType" className="block mb-4">
        <span className="block mb-1 font-medium">ประเภทสินค้า:</span>
        <select
          id="productType"
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

      <label htmlFor="quantity" className="block mb-4">
        <span className="block mb-1 font-medium">จำนวน:</span>
        <input
          id="quantity"
          type="number"
          name="Quantity"
          value={product.Quantity}
          onChange={handleChange}
          min={0}
          aria-required="true"
          disabled={saving}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </label>

      {/* เพิ่ม input ไฟล์ */}
      <label htmlFor="filePath" className="block mb-6">
        <span className="block mb-1 font-medium">รูปภาพสินค้า:</span>
        <input
          id="filePath"
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

      <label
        htmlFor="isActive"
        className="flex items-center mb-6 cursor-pointer select-none"
      >
        <input
          id="isActive"
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
          onClick={() => navigate("/seller")}
          disabled={saving}
          className="px-6 py-2 rounded-md border border-gray-400 hover:bg-gray-100 disabled:opacity-50"
        >
          ยกเลิก
        </button>
      </div>

      {message && (
        <p className="mt-4 text-center text-red-600 font-medium select-none">
          {message}
        </p>
      )}
    </div>
  );
};

export default SellerAdd;
