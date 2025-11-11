import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Lock, Mail, Droplets } from 'lucide-react';
import apiService, { AuthResponse } from '../../../shared/utils/apiService';
import { setAuthCookies } from '../../../shared/utils/cookieService';
import { useNavigate } from 'react-router-dom';

interface LoginPageProps {
  // onLogin: (authResponse: AuthResponse) => void; // No longer needed
}

export function LoginPage({ /* onLogin */ }: LoginPageProps) { // Removed onLogin from destructuring
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Re-introducing navigate here
  const [loading, setLoading] = useState(false); // Add loading state
  const [loginError, setLoginError] = useState<string | null>(null); // New state for login error message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when submission starts
    setLoginError(null); // Clear any previous errors
    try {
      const response = await apiService.loginUser({ userName: email, password });
      if (response.isSuccess) {
        const { accessToken, refreshToken, accessTokenExpiryDate } = response.data;
        setAuthCookies(accessToken, refreshToken, new Date(accessTokenExpiryDate));
        sessionStorage.setItem('isLogged', 'true');
        navigate('/');
      } else {
        if (response.message === 'invalid credentials') {
          setLoginError('البريد الإلكتروني أو كلمة المرور غير صحيحة.'); // Arabic for 'Invalid email or password.'
        } else if (response.message === 'user is not active') {
          setLoginError('هذا المستخدم غير نشط. يرجى الاتصال بالمسؤول.'); // Arabic for 'This user is not active. Please contact the administrator.'
        } else {
          setLoginError(response.message || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.'); // Generic error message
        }
      }
    } catch (error: any) {
      let errorMessage = 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.'; // Default generic error
      if (error.isAxiosError && error.response && error.response.data) {
        // Attempt to extract a more specific message from the error response data
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50" dir="rtl">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-4 rounded-full">
              <Droplets className="w-12 h-12 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">نظام مراقبة الري</CardTitle>
            <CardDescription className="mt-2">
              وزارة الموارد المائية والري - جمهورية مصر العربية
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="أدخل البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <a href="#" className="text-blue-600 hover:underline">
                نسيت كلمة المرور؟
              </a>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}> {/* Disable button when loading */}
              تسجيل الدخول
            </Button>

            {loginError && (
              <p className="text-red-500 text-sm text-center">{loginError}</p>
            )}

            <div className="pt-4 border-t text-center text-sm text-gray-500">
              <div className="flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                <span>اتصال آمن ومشفر</span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
