import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import * as Slider from "@radix-ui/react-slider";

const productTypes = [
  { label: "อาหาร", value: 1 },
  { label: "เครื่องใช้", value: 2 },
  { label: "เครื่องดื่ม", value: 3 },
  { label: "ของเล่น", value: 4 },
  { label: "อื่นๆ", value: 5 },
];

export interface SearchBarData {
  keyword: string;
  priceMin?: number;
  priceMax?: number;
  category?: number[];
  releaseDateFrom?: string;
  releaseDateTo?: string;
  isActive?: boolean;
  sellerName?: string;
}

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch?: (filters: SearchBarData) => void;
  placeholder?: string;
  userRole?: string;
}

const minPrice = 0;
const maxPrice = 5000;

export const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder,
  userRole = "",
}: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [category, setCategory] = useState<number[]>([]);
  const [sellerName, setSellerName] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice,
    maxPrice,
  ]);
  const [releaseDateFrom, setReleaseDateFrom] = useState("");
  const [releaseDateTo, setReleaseDateTo] = useState("");
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  // Debounce keyword + sellerName before search
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [
    inputValue,
    sellerName,
    category,
    priceRange,
    releaseDateFrom,
    releaseDateTo,
    isActive,
  ]);

  // Check date validity and clear if invalid
  useEffect(() => {
    if (releaseDateFrom && releaseDateTo) {
      if (new Date(releaseDateTo) < new Date(releaseDateFrom)) {
        alert("วันที่สิ้นสุดต้องมากกว่าหรือเท่ากับวันที่เริ่มต้น");
        setReleaseDateTo("");
      }
    }
  }, [releaseDateFrom, releaseDateTo]);

  const handleRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const toggleCategory = (value: number) => {
    setCategory((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const triggerSearch = () => {
    onSearch?.({
      keyword: inputValue,
      priceMin: priceRange[0],
      priceMax: priceRange[1],
      category: category.length > 0 ? category : undefined,
      releaseDateFrom: releaseDateFrom || undefined,
      releaseDateTo: releaseDateTo || undefined,
      sellerName: sellerName || undefined,
      isActive,
    });
  };

  const handleReset = () => {
    setInputValue("");
    onChange("");
    setCategory([]);
    setReleaseDateFrom("");
    setReleaseDateTo("");
    setSellerName("");
    setPriceRange([minPrice, maxPrice]);
    setIsActive(undefined);

    onSearch?.({
      keyword: "",
      priceMin: minPrice,
      priceMax: maxPrice,
      category: undefined,
      releaseDateFrom: undefined,
      releaseDateTo: undefined,
      sellerName: undefined,
      isActive: undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerSearch();
    }
  };

  return (
    <aside className="w-80 bg-white rounded-xl shadow p-5 space-y-6 sticky top-24 self-start">
      {/* Keyword + Seller */}
      <div className="space-y-3">
        <Input
          type="text"
          placeholder={placeholder ?? "ค้นหาสินค้า..."}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full"
        />
        {/* <Input
          type="text"
          placeholder="ค้นหาชื่อคนขาย..."
          value={sellerName}
          onChange={(e) => setSellerName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
          className="w-full"
        /> */}
        <div className="flex gap-2">
          <button
            onClick={triggerSearch}
            className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
          >
            ค้นหา
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            รีเซ็ต
          </button>
        </div>
      </div>

      {/* Price Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ช่วงราคา (บาท)
        </label>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          min={minPrice}
          max={maxPrice}
          step={1}
          value={priceRange}
          onValueChange={handleRangeChange}
        >
          <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
            <Slider.Range className="absolute bg-orange-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-4 h-4 bg-white border border-orange-400 rounded-full shadow hover:bg-orange-300 focus:outline-none" />
          <Slider.Thumb className="block w-4 h-4 bg-white border border-orange-400 rounded-full shadow hover:bg-orange-300 focus:outline-none" />
        </Slider.Root>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>฿{priceRange[0]}</span>
          <span>฿{priceRange[1]}</span>
        </div>
      </div>

      {/* Category Checkbox */}
      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">
          ประเภทสินค้า
        </span>
        <div className="flex flex-wrap gap-2">
          {productTypes.map((type) => (
            <label
              key={type.value}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="form-checkbox accent-orange-500"
                checked={category.includes(type.value)}
                onChange={() => toggleCategory(type.value)}
              />
              <span className="text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Release Date */}
      <div className="flex gap-2">
        <label className="flex-1">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            วันที่วางขาย (เริ่มต้น)
          </span>
          <input
            type="date"
            value={releaseDateFrom}
            onChange={(e) => setReleaseDateFrom(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
        </label>

        <label className="flex-1">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            วันที่วางขาย (สิ้นสุด)
          </span>
          <input
            type="date"
            value={releaseDateTo}
            onChange={(e) => setReleaseDateTo(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
        </label>
      </div>

      {/* Active Status Selection */}
      {(userRole === "seller" || userRole === "admin") && (
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            สถานะสินค้า
          </span>
          <div className="flex flex-col space-y-2">
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="activeStatus"
                className="form-radio accent-orange-500"
                checked={isActive === undefined}
                onChange={() => setIsActive(undefined)}
              />
              <span className="text-sm text-gray-700">ทั้งหมด</span>
            </label>
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="activeStatus"
                className="form-radio accent-orange-500"
                checked={isActive === true}
                onChange={() => setIsActive(true)}
              />
              <span className="text-sm text-gray-700">เปิดใช้งาน</span>
            </label>
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="activeStatus"
                className="form-radio accent-orange-500"
                checked={isActive === false}
                onChange={() => setIsActive(false)}
              />
              <span className="text-sm text-gray-700">ปิดใช้งาน</span>
            </label>
          </div>
        </div>
      )}
    </aside>
  );
};
