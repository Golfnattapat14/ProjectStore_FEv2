// // src/hooks/useSearchProduct.ts
// import { useState } from "react";
// import { getProducts } from "@/api/Buyer";

// export function useSearchProduct() {
//   const [searchResults, setSearchResults] = useState([]);
//   const [loadingSearch, setLoadingSearch] = useState(false);
//   const [errorSearch, setErrorSearch] = useState<string | null>(null);

//   const handleSearch = async (query: string) => {
//     if (!query) return;

//     setLoadingSearch(true);
//     setErrorSearch(null);
//     try {
//       const products = await getProducts(query);
//       setSearchResults(products);
//     } catch (err) {
//       setErrorSearch("เกิดข้อผิดพลาดในการค้นหา");
//     } finally {
//       setLoadingSearch(false);
//     }
//   };

//   return {
//     searchResults,
//     loadingSearch,
//     errorSearch,
//     handleSearch,
//   };
// }
