import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from './cookieService';

interface JwtPayload {
  nameid: string; // User ID is in 'nameid' claim
  // Add other properties from your JWT payload if needed
}

export function getUserIdFromToken(): string | null {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  // Add a check to ensure the token has at least two dots (header.payload.signature)
  if (token.split('.').length < 3) {
    console.error('Error decoding JWT token: Invalid token format (missing parts)');
    return null;
  }

  try {
    const decodedToken = jwtDecode<JwtPayload>(token);
    return decodedToken.nameid;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}
