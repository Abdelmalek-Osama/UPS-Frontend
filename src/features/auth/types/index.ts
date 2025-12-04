export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Operator';
}

export interface LoginCredentials {
  email: string;
  password: string;
}
