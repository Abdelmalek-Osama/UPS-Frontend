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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response: AuthResponse = await apiService.loginUser({ userName: email, password });
      const { accessToken, refreshToken, accessTokenExpiryDate } = response;
      setAuthCookies(accessToken, refreshToken, new Date(accessTokenExpiryDate));
      sessionStorage.setItem('isLogged', 'true'); // Set isLogged in sessionStorage
      navigate('/'); // Navigate directly after successful login
    } catch (error: any) {
      alert(`Login failed: ${error.message}`);
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

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              تسجيل الدخول
            </Button>

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
