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
import { Checkbox } from '../../../components/ui/checkbox';
import apiService, { UserDto } from '../../../shared/utils/apiService';
import { toast } from 'react-toastify';
import type { Site } from '../../sites/types';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDto | null;
  onEditSuccess: () => void;
  loggedInUserId: string | null;
  onUserRoleChange: (userId: string) => void;
  availableSites?: Site[];
}

interface UpdateUserResponse {
  message: string;
  user: UserDto;
}

export function EditUserDialog({ open, onOpenChange, user, onEditSuccess, loggedInUserId, onUserRoleChange, availableSites = [] }: EditUserDialogProps) {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Admin' | 'Operator'>('Operator');
  const [isActive, setIsActive] = useState(true);
  const [assignedSites, setAssignedSites] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setRole(user.role);
      setIsActive(user.isActive);
      // Initialize assignedSites based on user's role and existing sites
      setAssignedSites(
        user.role === 'Operator' && user.sites
          ? user.sites.map(site => site.id)
          : []
      );
      setErrors({});
      setSubmissionError(null); // Clear submission error on dialog open
      setIsSubmitting(false); // Reset submitting state on dialog open
    }
  }, [user, availableSites]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) { // Trim here for initial check
      newErrors.fullName = 'الاسم الكامل مطلوب';
    } else if (fullName.length > 100) {
      newErrors.fullName = 'الاسم الكامل لا يمكن أن يتجاوز 100 حرف';
    } else if (!/^[\p{L}]{2,}(?:[\s-][\p{L}]{2,})+$/u.test(fullName.trim())) {
      newErrors.fullName = 'يجب أن يتكون الاسم الكامل من اسمين على الأقل، يتكون كل منهما من 3 أحرف إنجليزية أو عربية على الأقل';
    }
    if (!role) {
      newErrors.role = 'الدور مطلوب';
    }
    if (role === 'Operator' && assignedSites.length === 0) {
      newErrors.assignedSites = 'يجب تخصيص موقع واحد على الأقل للمشغلين';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleSiteAssignment = (siteId: number) => {
    setAssignedSites(prev => {
      if (prev.includes(siteId)) {
        return prev.filter(id => id !== siteId);
      } else {
        return [...prev, siteId];
      }
    });
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
        sitesIds: role === 'Operator' ? assignedSites : [],
      };

      const response = await apiService.patch<UpdateUserResponse>(
        `/v1/Users/${user.id}`,
        updateData
      );

      toast.success('تم تحديث بيانات المستخدم بنجاح');
      onEditSuccess();
      if (user.id === loggedInUserId) {
        onUserRoleChange(user.id);
      }
      onOpenChange(false);
    } catch (error: any) {
      setSubmissionError((error as Error).message);
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
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && submissionError) {
        return; // Prevent closing if there's a submission error
      }
      handleClose();
    }}>
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
              <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>
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

          {role === 'Operator' && availableSites && availableSites.length > 0 && (
            <div className="space-y-2">
              <Label>تخصيص المواقع (للمشغلين فقط)</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {availableSites.map(site => (
                  <div key={site.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`site-${site.id}`}
                      checked={assignedSites.includes(site.id)}
                      onCheckedChange={() => toggleSiteAssignment(site.id)}
                      disabled={isSubmitting}
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
          {submissionError && (
            <p className="text-red-600 text-sm text-center w-full mb-4">{submissionError}</p>
          )}
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
            loadingText="جاري الحفظ..." 
            isLoading={isSubmitting}
          >
            حفظ التغييرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

