import { productTypes } from "@/constants/productTypes";
import React from "react";
import "rc-slider/assets/index.css";
import { Range } from "rc-slider";

interface FilterSearchProps {
  keyword: string;
  setKeyword: (value: string) => void;
  selectedTypes: number[];
  setSelectedTypes: React.Dispatch<React.SetStateAction<number[]>>;
  minPrice?: number | null;
  setMinPrice?: (value: number | null) => void;
  maxPrice?: number | null;
  setMaxPrice?: (value: number | null) => void;
  isActive?: boolean | null;
  setIsActive?: (value: boolean | null) => void;
  releaseDateFrom?: string;
  setReleaseDateFrom?: (value: string) => void;
  releaseDateTo?: string;
  setReleaseDateTo?: (value: string) => void;
  onSearch: () => void;
  onReset?: () => void;
}

export default function FilterSearch({
  keyword,
  setKeyword,
  selectedTypes,
  setSelectedTypes,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  isActive,
  setIsActive,
  releaseDateFrom,
  setReleaseDateFrom,
  releaseDateTo,
  setReleaseDateTo,
  onSearch,
  onReset,
}: FilterSearchProps) {
  const handleTypeToggle = (value: number) => {
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <aside className="bg-white rounded-lg shadow p-4 space-y-6 mb-4 w-full max-w-4xl mx-auto">
      {/* 🔍 Keyword Search */}
      <div>
        <label className="block mb-1 font-semibold text-gray-700">
          ค้นหาชื่อสินค้า หรือผู้ขาย
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="พิมพ์คำค้น..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 🏷 ประเภทสินค้า */}
      <div>
        <label className="block mb-1 font-semibold text-gray-700">ประเภทสินค้า</label>
        <div className="flex flex-wrap gap-3">
          {productTypes.map((type) => (
            <label
              key={type.value}
              className="flex items-center space-x-2 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={selectedTypes.includes(type.value)}
                onChange={() => handleTypeToggle(type.value)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 💰 ช่วงราคา */}
      {setMinPrice && setMaxPrice && (
        <div>
          <label className="block mb-2 font-semibold text-gray-700">ช่วงราคา</label>
          <Range
            min={0}
            max={5000}
            step={100}
            value={[minPrice ?? 0, maxPrice ?? 5000]}
            onChange={([min, max]: number[]) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
            allowCross={false}
            trackStyle={[{ backgroundColor: "#2563eb", height: 6, borderRadius: 9999 }]}
            handleStyle={[
              {
                borderColor: "#2563eb",
                height: 20,
                width: 20,
                marginTop: -7,
                backgroundColor: "white",
                boxShadow: "0 0 2px rgba(37, 99, 235, 0.8)",
                cursor: "grab",
                borderRadius: 9999,
              },
              {
                borderColor: "#2563eb",
                height: 20,
                width: 20,
                marginTop: -7,
                backgroundColor: "white",
                boxShadow: "0 0 2px rgba(37, 99, 235, 0.8)",
                cursor: "grab",
                borderRadius: 9999,
              },
            ]}
            railStyle={{ backgroundColor: "#e5e7eb", height: 6, borderRadius: 9999 }}
          />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>฿{minPrice ?? 0}</span>
            <span>฿{maxPrice ?? 5000}</span>
          </div>
        </div>
      )}

      {/* 📅 วันที่วางขาย */}
      {setReleaseDateFrom && setReleaseDateTo && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">วันที่เริ่มวางขาย</label>
            <input
              type="date"
              value={releaseDateFrom ?? ""}
              onChange={(e) => setReleaseDateFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">ถึงวันที่</label>
            <input
              type="date"
              value={releaseDateTo ?? ""}
              onChange={(e) => setReleaseDateTo(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* ✅ สถานะสินค้า */}
      {setIsActive && (
        <div>
          <label className="block mb-1 font-semibold text-gray-700">สถานะสินค้า</label>
          <select
            value={isActive === null ? "" : isActive ? "true" : "false"}
            onChange={(e) =>
              setIsActive(
                e.target.value === "" ? null : e.target.value === "true"
              )
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทั้งหมด</option>
            <option value="true">เปิดใช้งาน</option>
            <option value="false">ปิดใช้งาน</option>
          </select>
        </div>
      )}

      {/* 🔘 ปุ่มค้นหา/รีเซ็ต */}
      <div className="flex justify-end gap-3 pt-2">
        {onReset && (
          <button
            onClick={onReset}
            className="bg-gray-300 hover:bg-gray-400 text-black px-5 py-2 rounded-md transition"
          >
            รีเซ็ต
          </button>
        )}
        <button
          onClick={onSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition"
        >
          ค้นหา
        </button>
      </div>
    </aside>
  );
}
