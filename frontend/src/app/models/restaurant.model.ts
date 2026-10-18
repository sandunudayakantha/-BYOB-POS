export interface RestaurantModel {
  id: string;
  _id?: string;
  name: string;
  ownerName?: string;
  ownerEmail?: string;
  maxBranches: number;
  branchesCount?: number;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformStatsModel {
  totalRestaurants?: number;
  totalBranches?: number;
  totalProducts?: number;
  totalMenus?: number;
  totalQRCodes?: number;
  activeRestaurants?: number;
  suspendedRestaurants?: number;
}
