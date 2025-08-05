export interface UserCart {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  createDate: string;
  productType: number;
  filePath?: string;
  Createby: string;
  createByName?: string;
}



export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}
