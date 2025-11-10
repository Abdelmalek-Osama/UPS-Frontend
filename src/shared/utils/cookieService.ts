import Cookies from 'js-cookie';

export const setAuthCookies = (accessToken: string, refreshToken: string, accessTokenExpiry: Date) => {
  Cookies.set('accessToken', accessToken, { expires: accessTokenExpiry });
  Cookies.set('refreshToken', refreshToken, { expires: 7 }); // Refresh token typically has a longer expiry, e.g., 7 days
};

export const getAccessToken = () => Cookies.get('accessToken');
export const getRefreshToken = () => Cookies.get('refreshToken');

export const removeAuthCookies = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
};
