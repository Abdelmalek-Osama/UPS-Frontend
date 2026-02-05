export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Operator' | 'Viewer' | 'Governorate' | 'SuperAdmin';
  governorateId?: number;
  governorateName?: string;
  siteIds?: number[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}
