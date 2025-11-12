import React, { useState, useEffect } from 'react';
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
import apiService, { UserDto } from '../../../shared/utils/apiService';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDto | null;
  onEditSuccess: () => void;
}

interface UpdateUserResponse {
  message: string;
  user: UserDto;
}

export function EditUserDialog({ open, onOpenChange, user, onEditSuccess }: EditUserDialogProps) {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Admin' | 'Operator'>('Operator');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setRole(user.role);
      setIsActive(user.isActive);
      setErrors({});
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName || fullName.trim() === '') {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    }
    if (!role) {
      newErrors.role = 'الدور مطلوب';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditUser = async () => {
    if (!user) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        fullName: fullName.trim(),
        role,
        isActive,
      };

      const response = await apiService.patch<UpdateUserResponse>(
        `/v1/Users/${user.id}`,
        updateData
      );

      alert(response.message || 'تم تحديث المستخدم بنجاح');
      onEditSuccess();
      onOpenChange(false);
    } catch (error: any) {
      alert(`فشل تحديث المستخدم: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onOpenChange(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل بيانات المستخدم</DialogTitle>
          <DialogDescription className="text-right">
            تعديل معلومات المستخدم: {user.userName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input
              id="fullName"
              placeholder="الاسم الكامل"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">الدور</Label>
            <Select 
              onValueChange={(value: 'Admin' | 'Operator') => setRole(value)} 
              value={role}
              disabled={isSubmitting}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">مسؤول (Admin)</SelectItem>
                <SelectItem value="Operator">مشغل (Operator)</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role}</p>
            )}
          </div>

          {/* Active Status */}
          {/* <div className="flex items-center justify-between">
            <Label htmlFor="isActive">حالة الحساب</Label>
            <div className="flex items-center gap-2" dir="ltr">
              <Switch 
                id="isActive" 
                checked={isActive} 
                onCheckedChange={setIsActive}
                disabled={isSubmitting}
              />
              <span className="text-sm">
                {isActive ? 'نشط' : 'معطل'}
              </span>
            </div>
          </div> */}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleEditUser}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

