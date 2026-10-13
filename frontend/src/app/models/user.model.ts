export interface UserModel {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'RESTAURANT_OWNER' | 'STAFF';
  restaurantId?: string;
  restaurant_id?: string;
  branchId?: string;
  branch_id?: string;
}

export interface AuthTokensModel {
  accessToken: string;
  refreshToken?: string;
  user: UserModel;
}
