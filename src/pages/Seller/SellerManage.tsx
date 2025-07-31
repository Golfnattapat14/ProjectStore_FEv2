import React, { useState, useEffect, type ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deleteProductFile, updateProduct } from "@/api/Seller";
import { ProductRequest, ProductResponse } from "@/types/product";
import { getAuthHeadersJSON } from "@/api/Token";

const SellerManage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filePath, setFilePath] = useState<string | undefined>("");

  const [product, setProduct] = useState<Partial<ProductRequest>>({
    ProductName: "",
    ProductPrice: 0,
    ProductType: 0,
    Quantity: 0,
    IsActive: true,
    FilePath: null,
  });

  const [message, setMessage] = useState("");
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      setMessage("ไม่พบรหัสสินค้า");
      return;
    }

    fetch(`http://localhost:5260/api/products/${id}`, {
      headers: getAuthHeadersJSON(),
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("ไม่พบสินค้ารายการนี้");
          }
          throw new Error("โหลดข้อมูลไม่สำเร็จ");
        }
        return res.json();
      })
      .then((data: ProductResponse) => {
        setFilePath(data.filePath);
        setProduct({
          Id: data.id,
          ProductName: data.productName,
          ProductPrice: data.productPrice,
          ProductType: data.productType ?? 0,
          Quantity: data.quantity,
          IsActive: data.isActive ?? true,
        });
        setMessage("");
      })
      .catch((err) => setMessage(err.message || "โหลดข้อมูลไม่สำเร็จ"));
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "ProductPrice" ||
            name === "Quantity" ||
            name === "ProductType"
          ? Number(value)
          : value,
    }));
  };

 const handleSave = async (e?: React.MouseEvent) => {
  e?.preventDefault();

  if (!id) return;

  if (
    !product.ProductName ||
    (product.ProductPrice ?? 0) <= 0 ||
    (product.Quantity ?? 0) < 0 ||
    product.ProductType! < 1 ||
    product.ProductType! > 5
  ) {
    setMessage(
      "กรุณากรอกข้อมูลให้ถูกต้อง และประเภทสินค้าต้องอยู่ระหว่าง 1 ถึง 5"
    );
    return;
  }

  const confirmSave = window.confirm("คุณต้องการบันทึกการแก้ไขนี้หรือไม่?");
  if (!confirmSave) return; // ถ้ากดยกเลิก หยุดการทำงาน

  try {
    setSaving(true);
    setMessage("กำลังบันทึก...");

    await updateProduct(id, product as ProductRequest);

    setMessage("บันทึกเรียบร้อยแล้ว");
    setTimeout(() => navigate("/seller"), 1500);
  } catch (err) {
    setMessage("เกิดข้อผิดพลาดในการบันทึก");
  } finally {
    setSaving(false);
  }
};



 const handleDeleteFile = async () => {
  if (!id) return;

  const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้?");
  if (!confirmDelete) return; // ถ้ากดยกเลิก ให้หยุด

  try {
    setMessage("กำลังลบรูปภาพ...");
    await deleteProductFile(id);
    setFilePath("");
    setMessage("ลบรูปภาพเรียบร้อยแล้ว");
    alert("ลบรูปภาพเรียบร้อยแล้ว");
  } catch (err) {
    setMessage("ไม่สามารถลบรูปภาพได้");
    alert("ไม่สามารถลบรูปภาพได้");
  }
};



  if (loading)
    return (
      <p className="text-center mt-6 text-gray-700">กำลังโหลดข้อมูลสินค้า...</p>
    );

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-center">แก้ไขสินค้า</h2>

      {message && (
        <p
          className={`mb-4 text-center ${
            message.includes("ผิดพลาด") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      <form>
        <label htmlFor="productName" className="block mb-4">
          <span className="block mb-1 font-medium">ชื่อสินค้า:</span>
          <input
            id="productName"
            type="text"
            name="ProductName"
            value={product.ProductName ?? ""}
            onChange={handleChange}
            aria-required="true"
            disabled={saving}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </label>

        <label htmlFor="productPrice" className="block mb-4">
          <span className="block mb-1 font-medium">ราคา:</span>
          <input
            id="productPrice"
            type="number"
            name="ProductPrice"
            value={product.ProductPrice ?? 0}
            onChange={handleChange}
            min={0}
            aria-required="true"
            disabled={saving}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </label>

        <label htmlFor="productType" className="block mb-4">
          <span className="block mb-1 font-medium text-center">
            ประเภทสินค้า (1=อาหาร, 2=เครื่องใช้, 3=เครื่องดื่ม, 4=ของเล่น,
            5=อื่นๆ)
          </span>
          <input
            id="productType"
            type="number"
            name="ProductType"
            value={product.ProductType ?? 0}
            onChange={handleChange}
            min={1}
            max={5}
            disabled={saving}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-center"
          />
        </label>

        <label htmlFor="quantity" className="block mb-4">
          <span className="block mb-1 font-medium">จำนวน:</span>
          <input
            id="quantity"
            type="number"
            name="Quantity"
            value={product.Quantity ?? 0}
            onChange={handleChange}
            min={0}
            aria-required="true"
            disabled={saving}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </label>

        <label htmlFor="isActive" className="flex items-center mb-6">
          <input
            id="isActive"
            type="checkbox"
            name="IsActive"
            checked={product.IsActive ?? false}
            onChange={handleChange}
            disabled={saving}
            className="mr-2 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:bg-gray-100"
          />
          <span>เปิดใช้งาน</span>
        </label>

        {filePath && (
          <div className="mb-4 text-center">
            <img
              src={filePath}
              alt="รูปสินค้า"
              className="mx-auto mb-2 max-h-60 object-contain rounded-md border"
            />
            <button
              type="button"
              onClick={handleDeleteFile}
              disabled={saving}
              className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
            >
              ลบรูปภาพ
            </button>
          </div>
        )}
       
       <div className="mb-4">
    <label htmlFor="filePath" className="block mb-1 font-medium">อัปโหลดรูปภาพใหม่:</label>
    <input
      type="file"
      id="filePath"
      name="FilePath"
      accept="image/*"
      disabled={saving}
      className="w-full"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          setProduct((prev) => ({ ...prev, FilePath: file }));
          setFilePath(""); // ล้าง URL รูปเก่า เพราะมีรูปใหม่ที่ยังไม่อัปโหลด
        }
      }}
    />
  </div>


        <div className="flex justify-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-md text-white font-semibold ${
              saving
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          <button
            onClick={() => navigate("/seller")}
            disabled={saving}
            className="px-6 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerManage;
