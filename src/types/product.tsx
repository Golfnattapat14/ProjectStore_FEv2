export interface ProductResponse {
  FilePath: any;
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
  filePath?: string;
  index?: number;
}

export interface ProductRequest {
  Id?: string;
  ProductName: string;
  ProductPrice: number;
  ProductType: number;
  Quantity: number;
  CreateBy?: string;
  IsActive?: boolean;
  FilePath? :File | null;
  SellerId?: string;
}

