export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Operator';
  isActive: boolean;
  createdAt: string;
  updatedAt?: Date;
  lastLoginAt?: Date;
}
