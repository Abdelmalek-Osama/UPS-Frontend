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
import { Plus, Mail } from 'lucide-react';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSites: string[];
}

export function AddUserDialog({ open, onOpenChange, availableSites }: AddUserDialogProps) {
  const [assignedSites, setAssignedSites] = useState<string[]>([]);

  const toggleSiteAssignment = (site: string) => {
    if (assignedSites.includes(site)) {
      setAssignedSites(assignedSites.filter(s => s !== site));
    } else {
      setAssignedSites([...assignedSites, site]);
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
              <Input id="username" placeholder="أحمد محمود" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" placeholder="user@irrigation.gov.eg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">الدور</Label>
              <Select>
                <SelectTrigger id="role">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">مسؤول (Admin)</SelectItem>
                  <SelectItem value="Operator">مشغل (Operator)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>تخصيص المواقع (للمشغلين فقط)</Label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
              {availableSites.map(site => (
                <div key={site} className="flex items-center gap-2">
                  <Checkbox 
                    id={`site-${site}`}
                    checked={assignedSites.includes(site)}
                    onCheckedChange={() => toggleSiteAssignment(site)}
                  />
                  <label 
                    htmlFor={`site-${site}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {site}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              المسؤولون لديهم وصول لجميع المواقع تلقائياً
            </p>
          </div>
          <div className="flex items-center gap-2 justify-end" dir="ltr">
            <Switch id="active" defaultChecked />
            <Label htmlFor="active">الحساب نشط</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            إضافة المستخدم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
