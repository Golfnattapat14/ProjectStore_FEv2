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
}

const minPrice = 0;
const maxPrice = 1000;

export const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder,
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

  // เมื่อ checkbox เปลี่ยน ให้ update category array แล้วค้นหาใหม่เลย
  useEffect(() => {
    handleSearch();
  }, [category]);

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

  const handleSearch = () => {
    onSearch?.({
      keyword: inputValue,
      priceMin: priceRange[0],
      priceMax: priceRange[1],
      category: category.length > 0 ? category : undefined,
      releaseDateFrom: releaseDateFrom || undefined,
      releaseDateTo: releaseDateTo || undefined,
      sellerName: sellerName || undefined,
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
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-xl mb-6 space-y-3">
      {/* Keyword + Seller */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder ?? "ค้นหาสินค้า..."}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow"
        />
        {/* <Input
          type="text"
          placeholder="ค้นหาชื่อคนขาย..."
          value={sellerName}
          onChange={(e) => setSellerName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-grow"
        /> */}
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          ค้นหา
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-400 text-white px-4 rounded hover:bg-gray-500"
        >
          รีเซ็ต
        </button>
      </div>

      {/* Price Slider */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
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
            <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-4 h-4 bg-white border border-gray-400 rounded-full shadow hover:bg-blue-300 focus:outline-none" />
          <Slider.Thumb className="block w-4 h-4 bg-white border border-gray-400 rounded-full shadow hover:bg-blue-300 focus:outline-none" />
        </Slider.Root>
        <div className="flex justify-between text-sm text-gray-600">
          <span>฿{priceRange[0]}</span>
          <span>฿{priceRange[1]}</span>
        </div>
      </div>

      {/* Category Checkbox */}
      <div>
        <span className="text-sm font-medium text-gray-700">ประเภทสินค้า</span>
        <div className="flex flex-wrap gap-3 mt-2">
          {productTypes.map((type) => (
            <label
              key={type.value}
              className="inline-flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="form-checkbox"
                checked={category.includes(type.value)}
                onChange={() => toggleCategory(type.value)}
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
  <label className="block">
    <span className="text-sm font-medium text-gray-700">วันที่เริ่มต้น</span>
    <input
      type="date"
      value={releaseDateFrom}
      onChange={(e) => setReleaseDateFrom(e.target.value)}
      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    />
  </label>
  <label className="block">
    <span className="text-sm font-medium text-gray-700">วันที่สิ้นสุด</span>
    <input
      type="date"
      value={releaseDateTo}
      onChange={(e) => setReleaseDateTo(e.target.value)}
      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    />
  </label>
</div>

    </div>
  );
};
