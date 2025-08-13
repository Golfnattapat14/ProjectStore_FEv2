import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-md gap-3">
      <div className="flex items-center gap-2">
        <label htmlFor="pageSize" className="whitespace-nowrap">
          แสดง:
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-gray-300 rounded px-3 py-1"
        >
          {[5, 10, 20].map((size) => (
            <option key={size} value={size}>
              {size} รายการ
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-1 border rounded disabled:opacity-50"
        >
          ก่อนหน้า
        </button>
        <span>
          หน้า {currentPage} จาก {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-1 border rounded disabled:opacity-50"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
};

export default Pagination;
