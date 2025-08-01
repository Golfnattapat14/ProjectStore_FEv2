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
  category?: number;
  releaseDate?: string;
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
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [category, setCategory] = useState("");
  const [releaseDate, setReleaseDate] = useState("");

  const [sellerName, setSellerName] = useState("");
  

  // ควบคุมช่วงราคา
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice,
    maxPrice,
  ]);

  const handleRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const handleSearch = () => {
  onSearch?.({
    keyword: inputValue,
    priceMin: priceRange[0],
    priceMax: priceRange[1],
    category: category ? Number(category) : undefined,
    releaseDate: releaseDate || undefined,
    sellerName: sellerName || undefined,
  });
};

 useEffect(() => {
    handleSearch();
  }, [category]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  useEffect(() => {
    if (priceMin && Number(priceMin) < minPrice) {
      setPriceMin(minPrice.toString());
    }
  }, [priceMin]);

  // ควบคุมช่วงสูงสุด
  useEffect(() => {
    if (priceMax && Number(priceMax) > maxPrice) {
      setPriceMax(maxPrice.toString());
    }
  }, [priceMax]);

  return (
    <div className="w-full max-w-xl mb-6 space-y-3">
      {/* Keyword Search */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder ?? "ค้นหาสินค้า..."}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          ค้นหา
        </button>
      </div>

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

        {/* ✅ Category Dropdown */}
        <label className="block">
          <span className="text-sm font-medium text-gray-700">ประเภทสินค้า</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">ทุกประเภท</option>
            {productTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        {/* <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">ทุกประเภท</option>
          {productTypes.map((type) => (
            <option key={type.value} value={type.value.toString()}>
              {type.label}
            </option>
          ))}
        </select> */}

        <Input
          type="date"
          placeholder="วันที่วางจำหน่าย"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
        />
      </div>
    </div>
  );
};
