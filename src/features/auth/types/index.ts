import type { Site } from '../../sites/types';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Operator';
  sites?: Site[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}
