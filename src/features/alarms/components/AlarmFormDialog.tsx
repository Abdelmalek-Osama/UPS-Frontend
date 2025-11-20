import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { RecipientInput } from './RecipientInput';
import {
  mapNumberToField,
  mapNumberToOperator,
  FIELDS,
  OPERATORS
} from '../utils/alarm-utils';
import { AlarmForm } from '../types';

interface AlarmFormDialogProps {
  alarmForm: AlarmForm;
  setAlarmForm: React.Dispatch<React.SetStateAction<AlarmForm>>;
  sites: any[]; // Consider a more specific type for sites
  isEdit: boolean;
  onClose: () => void;
  onSubmit: () => void;
  type: 'threshold' | 'communication';
}

export const AlarmFormDialog = ({
  alarmForm,
  setAlarmForm,
  sites,
  isEdit,
  onClose,
  onSubmit,
  type,
}: AlarmFormDialogProps) => {
  const isThreshold = type === 'threshold';

  return (
    <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto" dir="rtl">
      <DialogHeader>
        <DialogTitle className="text-right">{isEdit ? 'تعديل' : 'إضافة'} تنبيه {isThreshold ? 'قيمة حدية' : 'فقدان اتصال'}</DialogTitle>
        <DialogDescription className="text-right">
          {isEdit ? 'تعديل تكوين التنبيه الحالي' : `تكوين تنبيه جديد عند ${isThreshold ? 'تجاوز قيمة معينة' : 'انقطاع البيانات لفترة محددة'}`}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>الموقع</Label>
          {isEdit && alarmForm.site ? (
            <Input type="text" value={alarmForm.site} disabled />
          ) : (
            <Select 
              onValueChange={(value) => setAlarmForm(prev => ({ 
                ...prev, 
                siteId: parseInt(value) 
              }))} 
              value={alarmForm.siteId?.toString() || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الموقع" />
              </SelectTrigger>
              <SelectContent>
                {sites.map(site => (
                  <SelectItem key={site.id} value={site.id.toString()}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label>اسم التنبيه</Label>
          <Input 
            type="text" 
            placeholder="اسم التنبيه" 
            value={alarmForm.alarmName} 
            onChange={(e) => setAlarmForm(prev => ({ 
              ...prev, 
              alarmName: e.target.value 
            }))} 
          />
        </div>

        {isThreshold && (
          <>
            <div className="space-y-2">
              <Label>الحقل</Label>
              <Select 
                onValueChange={(value) => setAlarmForm(prev => ({ 
                  ...prev, 
                  field: value 
                }))} 
                value={alarmForm.field || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحقل" />
                </SelectTrigger>
                <SelectContent>
                  {FIELDS.map(field => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المعامل</Label>
                <Select 
                  onValueChange={(value) => setAlarmForm(prev => ({ 
                    ...prev, 
                    operator: value 
                  }))} 
                  value={alarmForm.operator || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المعامل" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map(op => (
                      <SelectItem key={op} value={op}>{op}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>القيمة الحدية</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="12.5" 
                  value={alarmForm.threshold || 0} 
                  onChange={(e) => setAlarmForm(prev => ({ 
                    ...prev, 
                    threshold: parseFloat(e.target.value) || 0
                  }))} 
                />
              </div>
            </div>
          </>
        )}

        {!isThreshold && (
          <div className="space-y-2">
            <Label>عدد الساعات</Label>
            <Input 
              type="number" 
              placeholder="2" 
              value={alarmForm.hours || 0} 
              onChange={(e) => setAlarmForm(prev => ({ 
                ...prev, 
                hours: parseInt(e.target.value) || 0 
              }))} 
            />
            <p className="text-xs text-gray-500">
              سيتم إرسال تنبيه إذا لم تصل بيانات لهذا العدد من الساعات
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>مستوى الخطورة</Label>
          <Select 
            onValueChange={(value: 'Warning' | 'Critical') => setAlarmForm(prev => ({ 
              ...prev, 
              severity: value 
            }))} 
            value={alarmForm.severity}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المستوى" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Warning">تحذير</SelectItem>
              <SelectItem value="Critical">حرج</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isThreshold && (
          <div className="space-y-2">
            <Label>اللون</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                className="w-20" 
                value={alarmForm.color || '#fbbf24'} 
                onChange={(e) => setAlarmForm(prev => ({ 
                  ...prev, 
                  color: e.target.value 
                }))} 
              />
              <Input 
                type="text" 
                className="flex-1" 
                value={alarmForm.color || '#fbbf24'} 
                onChange={(e) => setAlarmForm(prev => ({ 
                  ...prev, 
                  color: e.target.value 
                }))} 
              />
            </div>
          </div>
        )}

        <RecipientInput 
          type="email" 
          forAlarmType={type} 
          recipients={alarmForm.recipients} 
          setRecipients={(newRecipients) => setAlarmForm(prev => ({...prev, recipients: newRecipients}))}
        />
        
        <RecipientInput 
          type="phone" 
          forAlarmType={type} 
          recipients={alarmForm.recipients} 
          setRecipients={(newRecipients) => setAlarmForm(prev => ({...prev, recipients: newRecipients}))}
        />
      </div>

      <DialogFooter>
        <div className="w-full flex justify-start gap-2">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={onSubmit}>
            {isEdit ? 'حفظ التغييرات' : 'إضافة التنبيه'}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
};
