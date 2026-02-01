import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { toast } from 'react-toastify';
import type { User } from '../types';

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function ResetPasswordDialog({ open, onOpenChange, user }: ResetPasswordDialogProps) {
  const { t, i18n } = useTranslation();
  const isRTL = t('_rtl') === 'rtl';
  
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmittingResetPassword, setIsSubmittingResetPassword] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setNewPassword('');
      setConfirmPassword('');
      setErrors([]);
      setSubmissionError(null);
      setIsSubmittingResetPassword(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsSubmittingResetPassword(true);
    setErrors([]);
    setSubmissionError(null);
    const currentErrors: string[] = [];

    if (!newPassword) {
      currentErrors.push(t('validation.passwordNewRequired'));
    } else {
      if (newPassword.length < 8) {
        currentErrors.push(t('validation.passwordMinLength'));
      }
      if (!/[A-Z]/.test(newPassword)) {
        currentErrors.push(t('validation.passwordNeedsUppercase'));
      }
      if (!/\d/.test(newPassword)) {
        currentErrors.push(t('validation.passwordNeedsNumber'));
      }
      if (!/[a-z]/.test(newPassword)) {
        currentErrors.push(t('validation.passwordNeedsLowercase'));
      }
    }

    if (currentErrors.length === 0) {
      if (!confirmPassword) {
        currentErrors.push(t('validation.confirmPasswordRequired'));
      } else if (newPassword !== confirmPassword) {
        currentErrors.push(t('validation.confirmPasswordMismatch'));
      }
    }

    setErrors(currentErrors);

    if (currentErrors.length > 0) {
      setIsSubmittingResetPassword(false);
      return;
    }

    if (!user) {
      setSubmissionError(t('errors.userNotSelected'));
      setIsSubmittingResetPassword(false);
      return;
    }

    try {
      const response = await apiService.post<any>('/v1/Auth/reset-password', {
        email: user.email,
        newPassword,
      });
      
      toast.success(t('users.resetPasswordSuccessMessage'));
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = (error as Error).message || t('errors.resetPasswordError');
      setSubmissionError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmittingResetPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && (errors.length > 0 || submissionError)) {
        return;
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>{t('dialogs.resetPassword')}</DialogTitle>
          <DialogDescription className={isRTL ? 'text-right' : 'text-left'}>
            {user?.userName && `${t('dialogs.resetPasswordFor')}: ${user?.userName}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">{t('users.newPassword')}</Label>
            <div className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder={t('placeholders.password')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  paddingRight: !isRTL ? '2.5rem' : undefined,
                  paddingLeft: isRTL ? '2.5rem' : undefined
                }}
                
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                style={{
                  position: 'absolute',
                  top: 0,
                  [isRTL ? 'left' : 'right']: 0,
                  height: '2.25rem',
                  width: '2.25rem',
                }}
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
            <Label htmlFor="confirm-password">{t('auth.confirmPassword')}</Label>
            <div className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t('placeholders.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  paddingRight: !isRTL ? '2.5rem' : undefined,
                  paddingLeft: isRTL ? '2.5rem' : undefined
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                style={{
                  position: 'absolute',
                  top: 0,
                  [isRTL ? 'left' : 'right']: 0,
                  height: '2.25rem',
                  width: '2.25rem',
                }}
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
                  <p key={index} className={`text-red-600 text-xs ${isRTL ? 'text-right' : 'text-left'}`}>
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          {submissionError && (
            <p className="text-red-600 text-sm text-center w-full mb-4">{submissionError}</p>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmittingResetPassword || !newPassword || !confirmPassword} loadingText={t('users.resettingPassword')} isLoading={isSubmittingResetPassword}>
            {t('buttons.reset')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}