import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from './cookieService';

interface JwtPayload {
  nameid: string; // User ID is in 'nameid' claim
  // Add other properties from your JWT payload if needed
}

export function getUserIdFromToken(): string | null {
  const token = getAccessToken();
  if (token) {
    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      return decodedToken.nameid;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }
  return null;
}
