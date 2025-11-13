import Cookies from 'js-cookie';

export const setAuthCookies = (accessToken: string, refreshToken: string, accessTokenExpiry: Date) => {
  Cookies.set('accessToken', accessToken, { expires: accessTokenExpiry });
  Cookies.set('refreshToken', refreshToken, { expires: 7 }); // Refresh token typically has a longer expiry, e.g., 7 days
};

export const getAccessToken = () => {
  const token = Cookies.get('accessToken');
  return token;
};
export const getRefreshToken = () => {
  const token = Cookies.get('refreshToken');
  return token;
};

export const removeAuthCookies = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
};
