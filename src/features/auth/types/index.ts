export interface User {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'Operator';
}

export interface LoginCredentials {
  email: string;
  password: string;
}
