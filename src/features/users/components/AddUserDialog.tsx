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
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirm password
  const [fullName, setFullName] = useState(''); // New state for FullName
  const [role, setRole] = useState<'Admin' | 'Operator' | ''>('');
  const [active, setActive] = useState(true);
  const [assignedSites, setAssignedSites] = useState<number[]>([]);
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
      newErrors.username = t('validation.usernameRequired');
    } else if (username.trim() !== username) {
      newErrors.username = t('validation.usernameTrimmed');
    } else if (username.includes(' ')) {
      newErrors.username = t('validation.usernameNoSpaces');
    } else if (username.length < 2) {
      newErrors.username = t('validation.usernameMinLength');
    } else if (!/^[\p{L}]+$/u.test(username)) {
      newErrors.username = t('validation.usernameLettersOnly');
    } else if (/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(username)) {
      newErrors.username = t('validation.usernameNotEmail');
    }
    if (!fullName.trim()) { // Trim here for initial check
      newErrors.fullName = t('validation.fullNameRequired');
    } else if (fullName.length > 100) {
      newErrors.fullName = t('validation.fullNameMaxLength');
    } else if (!/^[\p{L}]{2,}(?:[\s-][\p{L}]{2,})+$/u.test(fullName.trim())) {
      newErrors.fullName = t('validation.fullNameFormat');
    }
    if (!email) {
      newErrors.email = t('validation.emailRequired');
    } else {

      if (email.startsWith(' ') || email.endsWith(' ')) {
        newErrors.email = t('validation.emailTrimmed');
      } else if (email.includes(' ')) {
        newErrors.email = t('validation.emailNoSpaces');
      } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        newErrors.email = t('validation.emailInvalid');
      }
    }
    if (!password) {
      newErrors.password = t('validation.passwordRequired');
    } else if (password.length < 8) {
      newErrors.password = t('validation.passwordMinLength');
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = t('validation.passwordNeedsUppercase');
    } else if (!/\d/.test(password)) {
      newErrors.password = t('validation.passwordNeedsNumber');
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = t('validation.passwordNeedsLowercase');
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMismatch');
    }
    if (!role) newErrors.role = t('validation.roleRequired');
    if (role === 'Operator' && assignedSites.length === 0) {
      newErrors.assignedSites = t('validation.siteAssignmentRequired');
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
        sitesIds: role === 'Operator' ? assignedSites : [], // Add sitesIds to the payload
      };
      // We no longer expect tokens from the registerUser response
      await apiService.registerUser(userData);
      toast.success(t('users.addUserSuccessMessage'));
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
      // Rely on apiService.ts to provide the most specific error message
      let errorMessage = t('errors.unexpectedError'); // Ultimate fallback
      if (error instanceof Error && error.message.trim() !== '') {
        errorMessage = error.message;
      }
      setApiError(errorMessage);
    } finally {
      setIsSubmittingAddUser(false); // Reset submitting state to false
    }
  };

  const toggleSiteAssignment = (siteId: number) => {
    if (assignedSites.includes(siteId)) {
      setAssignedSites(assignedSites.filter(s => s !== siteId));
    } else {
      setAssignedSites([...assignedSites, siteId]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('users.addNewUser')}</DialogTitle>
          <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
            {t('users.userDataDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('auth.username')}</Label>
              <Input
                id="username"
                placeholder={t('placeholders.fullName')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
              />
              {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="text" // Changed from "email" to "text"
                placeholder={t('placeholders.email')}
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
            <Label htmlFor="fullName">{t('users.fullName')}</Label>
            <Input
              id="fullName"
              placeholder={t('placeholders.fullName')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="off"
            />
            {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
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
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
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
            <Label htmlFor="role">{t('users.role')}</Label>
            <Select onValueChange={(value: 'Admin' | 'Operator') => setRole(value)} value={role} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
              <SelectTrigger id="role" className="rtl:flex-row-reverse">
                <SelectValue placeholder={t('placeholders.selectRole')} />
              </SelectTrigger>
              <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <SelectItem value="Admin">{t('users.admin')} (Admin)</SelectItem>
                <SelectItem value="Operator">{t('users.operator')} (Operator)</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
          </div>
        </div>
        {role === 'Operator' && (
          <div className="space-y-2">
            <Label>{t('users.sitesForOperators')}</Label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
              {availableSites.map(site => (
                <div key={site.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`site-${site.id}`}
                    checked={assignedSites.includes(site.id)}
                    onCheckedChange={() => toggleSiteAssignment(site.id)}
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
              {t('users.adminsHaveAllAccess')}
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
            {t('common.cancel')}
          </Button>
          <Button onClick={handleAddUser} disabled={isSubmittingAddUser || !username || !email || !password || !confirmPassword || !fullName || !role || (role === 'Operator' && assignedSites.length === 0)} loadingText={t('users.addingUser')} isLoading={isSubmittingAddUser}>
            {t('users.addNewUser')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
