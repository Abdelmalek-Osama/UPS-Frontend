export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Operator';
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}
