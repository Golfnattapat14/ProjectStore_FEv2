export interface CartItem {
  id: string;
  userId?: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  createDate: string;
}


export interface AddCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}
