export interface BuyerOrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  productType: number;
  productTypeLabel: string;
  filePath?: string;
}

export interface SellerGroup {
  sellerId: string;
  sellerName: string;
  items: BuyerOrderItem[];
}

export interface BuyerOrder {
  orderId: string;
  status: number;
  statusLabel: string;
  buyerName: string;
  buyerId: string;
  createDate: string;
  sellers: SellerGroup[];
}
