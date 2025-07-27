export interface ProductResponse {
  id: string;
  productName: string;
  productPrice: number;
  productType?: number;
  quantity: number;
  createDate: string;
  createBy: string;
  updateDate?: string;
  updateBy?: string;
  isActive?: boolean;
  createdByName: string;
}

export interface ProductRequest {
  Id?: string;
  ProductName: string;
  ProductPrice: number;
  ProductType: number;
  Quantity: number;
  CreateBy?: string;
  IsActive?: boolean;
}