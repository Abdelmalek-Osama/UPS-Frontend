import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Checkbox } from '../../../components/ui/checkbox';
import { Plus, Mail, Eye, EyeOff } from 'lucide-react';
import apiService from '../../../shared/utils/apiService';
import type { Site } from '../../sites/types';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSites: Site[];
}

export function AddUserDialog({ open, onOpenChange, availableSites }: AddUserDialogProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // New state for FullName
  const [role, setRole] = useState<'Admin' | 'Operator' | ''>('');
  const [active, setActive] = useState(true);
  const [assignedSites, setAssignedSites] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

  // Reset form fields when the dialog is opened
  React.useEffect(() => {
    if (open) {
      setUsername('');
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('');
      setActive(true);
      setAssignedSites([]);
      setErrors({});
    }
  }, [open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!username) newErrors.username = 'اسم المستخدم مطلوب';
    if (!fullName) newErrors.fullName = 'الاسم الكامل مطلوب'; // Validation for FullName
    if (!email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }
    if (!password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل';
    } else if (!/\d/.test(password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل';
    }
    if (!role) newErrors.role = 'الدور مطلوب';
    if (role === 'Operator' && assignedSites.length === 0) {
      newErrors.assignedSites = 'يجب تخصيص موقع واحد على الأقل للمشغلين';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;

    try {
      const userData = {
        UserName: username, // Changed to UserName for backend compatibility
        email,
        password,
        FullName: fullName, // Added FullName
        Role: role, // Changed to Role for backend compatibility
        // active, // Removed, handled by backend
        // assignedSites: role === 'Admin' ? [] : assignedSites, // Removed, handled by backend
      };
      // We no longer expect tokens from the registerUser response
      await apiService.registerUser(userData);
      alert('User registered successfully!');
      // Clear form and close dialog
      setUsername('');
      setEmail('');
      setPassword('');
      setFullName(''); // Clear fullName
      setRole('');
      setActive(true);
      setAssignedSites([]);
      setErrors({});
      onOpenChange(false);
    } catch (error: any) {
      alert(`Failed to register user: ${error.message}`);
    }
  };

  const toggleSiteAssignment = (siteName: string) => {
    if (assignedSites.includes(siteName)) {
      setAssignedSites(assignedSites.filter(s => s !== siteName));
    } else {
      setAssignedSites([...assignedSites, siteName]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة مستخدم جديد</DialogTitle>
          <DialogDescription className="text-right">
            أدخل بيانات المستخدم الجديد
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                placeholder="أحمد محمود"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@irrigation.gov.eg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input
              id="fullName"
              placeholder="أحمد محمود السيد"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="off"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
              <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pr-10" // Padding at the end (visual left in RTL) to make room for icon
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute end-0 top-0 h-9 w-9 hover:bg-transparent" // Positioned at the start
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">الدور</Label>
              <Select onValueChange={(value: 'Admin' | 'Operator') => setRole(value)} value={role}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">مسؤول (Admin)</SelectItem>
                  <SelectItem value="Operator">مشغل (Operator)</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>
          </div>
        </div>
        {role === 'Operator' && (
          <div className="space-y-2">
            <Label>تخصيص المواقع (للمشغلين فقط)</Label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
              {availableSites.map(site => (
                <div key={site.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={`site-${site.id}`}
                    checked={assignedSites.includes(site.name)}
                    onCheckedChange={() => toggleSiteAssignment(site.name)}
                  />
                  <label 
                    htmlFor={`site-${site.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {site.name}
                  </label>
                </div>
              ))}
            </div>
            {errors.assignedSites && <p className="text-red-500 text-xs mt-1">{errors.assignedSites}</p>}
            <p className="text-xs text-gray-500">
              المسؤولون لديهم وصول لجميع المواقع تلقائياً
            </p>
          </div>
        )}
        {/* <div className="flex items-center gap-2 justify-end" dir="ltr">
          <Switch id="active" checked={active} onCheckedChange={setActive} />
          <Label htmlFor="active">الحساب نشط</Label>
        </div> */}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleAddUser}>
            إضافة المستخدم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
