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
import { toast } from 'react-toastify';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSites: Site[];
}

export function AddUserDialog({ open, onOpenChange, availableSites }: AddUserDialogProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirm password
  const [fullName, setFullName] = useState(''); // New state for FullName
  const [role, setRole] = useState<'Admin' | 'Operator' | ''>('');
  const [active, setActive] = useState(true);
  const [assignedSites, setAssignedSites] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // New state for confirm password visibility
  const [apiError, setApiError] = useState<string | null>(null); // New state for API errors
  const [isSubmittingAddUser, setIsSubmittingAddUser] = useState(false); // New state for add user submission

  // Reset form fields when the dialog is opened
  React.useEffect(() => {
    if (open) {
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword(''); // Clear confirm password on dialog open
      setFullName('');
      setRole('');
      setActive(true);
      setAssignedSites([]);
      setErrors({});
      setShowPassword(false); // Clear password visibility on dialog open
      setShowConfirmPassword(false); // Clear confirm password visibility on dialog open
      setApiError(null); // Clear API error on dialog open
      setIsSubmittingAddUser(false); // Reset submitting state on dialog open
    }
  }, [open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!username) {
      newErrors.username = 'اسم المستخدم مطلوب';
    } else if (username.trim() !== username) {
      newErrors.username = 'اسم المستخدم لا يمكن أن يحتوي على مسافات بادئة أو لاحقة';
    } else if (username.includes(' ')) {
      newErrors.username = 'اسم المستخدم لا يمكن أن يحتوي على مسافات داخلية';
    } else if (username.length < 2) {
      newErrors.username = 'اسم المستخدم يجب أن يتكون من حرفين على الأقل';
    } else if (!/^[\p{L}]+$/u.test(username)) {
      newErrors.username = 'اسم المستخدم يجب أن يحتوي على حروف إنجليزية أو عربية فقط';
    } else if (/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(username)) {
      newErrors.username = 'اسم المستخدم لا يمكن أن يكون بريد إلكتروني';
    }
    if (!fullName.trim()) { // Trim here for initial check
      newErrors.fullName = 'الاسم الكامل مطلوب';
    } else if (fullName.length > 100) {
      newErrors.fullName = 'الاسم الكامل لا يمكن أن يتجاوز 100 حرف';
    } else if (!/^[\p{L}]{3,}(?:[\s-][\p{L}]{3,})+$/u.test(fullName.trim())) {
      newErrors.fullName = 'يجب أن يتكون الاسم الكامل من اسمين على الأقل، يتكون كل منهما من 3 أحرف على الأقل';
    }
    if (!email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else {

      if (email.startsWith(' ') || email.endsWith(' ')) {
        newErrors.email = 'البريد الإلكتروني لا يمكن أن يحتوي على مسافات بادئة أو لاحقة';
      } else if (email.includes(' ')) {
        newErrors.email = 'البريد الإلكتروني لا يمكن أن يحتوي على مسافات داخلية';
      } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
      }
    }
    if (!password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل';
    } else if (!/\d/.test(password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور وتأكيد كلمة المرور غير متطابقين';
    }
    if (!role) newErrors.role = 'الدور مطلوب';
    if (role === 'Operator' && assignedSites.length === 0) {
      newErrors.assignedSites = 'يجب تخصيص موقع واحد على الأقل للمشغلين';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = async () => {
    setIsSubmittingAddUser(true); // Set submitting state to true
    if (!validateForm()) {
      setIsSubmittingAddUser(false); // Reset on validation failure
      return;
    }

    try {
      const userData = {
        UserName: username.trim(), // Changed to UserName for backend compatibility and trim for validation
        email, // Removed .trim() here
        password,
        FullName: fullName.trim(), // Trim fullName before sending to backend
        Role: role, // Changed to Role for backend compatibility
        // active, // Removed, handled by backend
        // assignedSites: role === 'Admin' ? [] : assignedSites, // Removed, handled by backend
      };
      // We no longer expect tokens from the registerUser response
      await apiService.registerUser(userData);
      toast.success('تم اضافة مستخدم جديد بنجاح');
      // Clear form and close dialog
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword(''); // Clear confirm password on dialog open
      setFullName(''); // Clear fullName
      setRole('');
      setActive(true);
      setAssignedSites([]);
      setErrors({});
      setApiError(null); // Clear API error on success
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message;
      setApiError(errorMessage);
      // toast.error('Failed to register user. Please try again later.');
    } finally {
      setIsSubmittingAddUser(false); // Reset submitting state to false
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
              {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="text" // Changed from "email" to "text"
                placeholder="user@irrigation.gov.eg"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                autoComplete="off"
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
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
            {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
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
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute end-0 top-0 h-9 w-9 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
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
            {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
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
            {errors.assignedSites && <p className="text-red-600 text-xs mt-1">{errors.assignedSites}</p>}
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
          {apiError && <p className="text-red-600 text-xs mt-1 text-right w-full">{apiError}</p>}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleAddUser} disabled={isSubmittingAddUser || !username || !email || !password || !confirmPassword || !fullName || !role || (role === 'Operator' && assignedSites.length === 0)} loadingText="جاري الإضافة..." isLoading={isSubmittingAddUser}>
            إضافة المستخدم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
