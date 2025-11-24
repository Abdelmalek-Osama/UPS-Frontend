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
import { Eye, EyeOff } from 'lucide-react';
import apiService from '../../../shared/utils/apiService';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import type { User } from '../types';

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function ResetPasswordDialog({ open, onOpenChange, user }: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmittingResetPassword, setIsSubmittingResetPassword] = useState(false); // New state for reset password submission

  React.useEffect(() => {
    if (!open) {
      setNewPassword('');
      setConfirmPassword('');
      setErrors([]);
      setIsSubmittingResetPassword(false); // Reset submitting state on dialog close
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsSubmittingResetPassword(true); // Set submitting state to true
    const currentErrors: string[] = [];

    if (!newPassword) {
      currentErrors.push('كلمة المرور الجديدة مطلوبة');
    } else {
      if (newPassword.length < 8) {
        currentErrors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      }
      if (!/[A-Z]/.test(newPassword)) {
        currentErrors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل');
      }
      if (!/\d/.test(newPassword)) {
        currentErrors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');
      }
      if (!/[a-z]/.test(newPassword)) {
        currentErrors.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل');
      }
    }

    if (currentErrors.length === 0) {
      if (!confirmPassword) {
        currentErrors.push('تأكيد كلمة المرور مطلوب');
      } else if (newPassword !== confirmPassword) {
        currentErrors.push('كلمة المرور وتأكيدها غير متطابقين');
      }
    }

    setErrors(currentErrors);

    if (currentErrors.length > 0) {
      setIsSubmittingResetPassword(false); // Reset on validation failure
      return;
    }

    if (!user) {
      // toast.error("تعذر إعادة تعيين كلمة المرور: لم يتم تحديد المستخدم.");
      setIsSubmittingResetPassword(false); // Reset if user is not defined
      return;
    }

    try {
      await apiService.post('/v1/Auth/reset-password', {
        email: user.email,
        newPassword,
      });
      // toast.success("تمت إعادة تعيين كلمة المرور بنجاح.");
      onOpenChange(false);
    } catch (error: any) {
      // toast.error( "حدث خطأ أثناء إعادة تعيين كلمة المرور.");
    } finally {
      setIsSubmittingResetPassword(false); // Reset submitting state to false
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إعادة تعيين كلمة المرور</DialogTitle>
          <DialogDescription className="text-right">
            إعادة تعيين كلمة المرور للمستخدم: {user?.userName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10" // Padding at the end (visual left in RTL) to make room for icon
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute end-0 top-0 h-9 w-9 hover:bg-transparent" // Positioned at the start
                onClick={() => setShowNewPassword((prev) => !prev)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10" // Padding at the end (visual left in RTL) to make room for icon
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute end-0 top-0 h-9 w-9 hover:bg-transparent" // Positioned at the start
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
            {errors.length > 0 && (
              <div className="mt-1">
                {errors.map((error, index) => (
                  <p key={index} className="text-red-600 text-xs text-right">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmittingResetPassword || !newPassword || !confirmPassword} loadingText="جاري إعادة التعيين..." isLoading={isSubmittingResetPassword}>
            إعادة تعيين
          </Button>
        </DialogFooter>
      </DialogContent>
      {/* <ToastContainer 
        position="bottom-right" 
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      /> */}
    </Dialog>
  );
}
