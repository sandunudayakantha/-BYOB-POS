export interface BranchModel {
  id: string;
  _id?: string;
  name: string;
  address?: string;
  phone?: string;
  logo?: string;
  coverImage?: string;
  isMain: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}
