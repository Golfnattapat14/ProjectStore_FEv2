export interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  createDate: string;       
  createBy: string;
  updateDate?: string | null;
  updateBy?: string | null;
  isDeleted?: boolean | null;
  token?: string | null;
  tokenExpiredDate?: string | null;
}

export interface UserResponse{
    id : string;
    username : string;
    role : string;
    isDeleted : boolean;
}

export interface UpdateUserRequest{
    username : string;
    role : string;
    isDeleted:boolean;
}