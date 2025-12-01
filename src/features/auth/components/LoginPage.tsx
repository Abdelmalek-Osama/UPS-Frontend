import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Lock, Mail, Droplets, Eye, EyeOff } from 'lucide-react';
import apiService, { AuthResponse, ApiResponse } from '../../../shared/utils/apiService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';

interface LoginPageProps {
  // onLogin: (authResponse: AuthResponse) => void; // No longer needed
}

export function LoginPage({ /* onLogin */ }: LoginPageProps) { // Removed onLogin from destructuring
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Re-introducing navigate here
  const [loading, setLoading] = useState(false); // Add loading state
  const [loginError, setLoginError] = useState<string | null>(null); // New state for login error message
  const [loginSuccessful, setLoginSuccessful] = useState(false); // New state to track successful login
  const { login, userLoaded } = useAuth(); // Use login and userLoaded from AuthContext

  // Effect to navigate after successful login and user data is loaded
  useEffect(() => {
    if (loginSuccessful && userLoaded) {
      navigate('/');
    }
  }, [loginSuccessful, userLoaded, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when submission starts
    setLoginError(null); // Clear any previous errors
    try {
      const response: ApiResponse<AuthResponse> = await apiService.loginUser({ userName: email, password });
      if (response.isSuccess) {
        const { accessToken, refreshToken, accessTokenExpiryDate } = response.data;
        // Use the login function from AuthContext to handle cookies and state update
        login(accessToken, refreshToken, new Date(accessTokenExpiryDate));
        setLoginSuccessful(true); // Set login successful instead of navigating immediately
      } else {
        // Prioritize displaying the backend's error message if available, otherwise use a generic one.
        const errorMessage = response.message || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.';
        setLoginError(errorMessage);
        setLoading(false); // Re-enable button on unsuccessful login response
      }
    } catch (error: any) {
      setLoading(false); // Re-enable button on any error
      // Handle network errors or errors thrown before the response interceptor
      let errorMessage = 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.'; // Default generic error for catch block

      if (error.isAxiosError) {
        if (error.response && error.response.data && typeof error.response.data.message === 'string') {
          // Use the backend's error message directly
          errorMessage = error.response.data.message;
        } else if (error.message && error.message.toLowerCase().includes('network error')) {
          errorMessage = 'خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت.'; // Network error.
        } else {
          // Fallback for non-Axios or unknown errors or if specific message is not available
          errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
        }
      } else if (typeof error === 'string' && error.toLowerCase().includes('network error')) {
        errorMessage = 'خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت.';
      } else {
        // Fallback for non-Axios or unknown errors.
        errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
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
              <div className="relative">                {/* <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" /> */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 top-3 h-4 w-2 flex items-center pr-3 text-gray-400 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-1 w-2" /> : <Eye className="h-1 w-2" />}
                </button>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </div>

            

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading} loadingText="جاري تسجيل الدخول..." isLoading={loading}> {/* Disable button when loading */}
              تسجيل الدخول
            </Button>

            {loginError && (
              <p className="text-red-600 text-sm text-center">{loginError}</p>
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
