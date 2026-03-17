import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Trash2, Edit } from 'lucide-react';
import { Checkbox } from '../../../components/ui/checkbox';
import { useReadingsReportSchedulerData } from '../hooks/useReadingsReportSchedulerData';
import { useDirectoratesList } from '../hooks/useDirectoratesList';
import type { ReadingsReportSchedulerConfigRequest, ReadingsReportSchedulerResponse } from '../types/readingReportsScheduler';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { useEffect } from 'react';
import { getDashboardSites } from '../api/upsApi';
import { SiteMultiSelectDropdown } from '../../sites/components/SiteMultiSelectDropdown';
import { RecipientInput } from '../../alarms/components/RecipientInput';

export function ReadingsReportScheduler() {
  const { t } = useTranslation();
  const {
    schedulers,
    isLoading,
    isFetching,
    addScheduler,
    updateScheduler,
    deleteScheduler,
  } = useReadingsReportSchedulerData();

  const { directorates } = useDirectoratesList();

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [directorateId, setDirectorateId] = useState<string>('');
  const [siteIds, setSiteIds] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('08:00');
  const [intervalHours, setIntervalHours] = useState('24');
  const [isEnabled, setIsEnabled] = useState(true);
  
  const [availableSites, setAvailableSites] = useState<any[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);

  // Fetch Dashboard Sites
  useEffect(() => {
    const fetchSites = async () => {
      setLoadingSites(true);
      try {
        const sites = await getDashboardSites();
        const siteOptions = sites.map((site) => ({
          id: site.siteId,
          name: site.siteName,
          arabicName: site.siteArabicName
        }));
        setAvailableSites(siteOptions);
      } catch (error) {
        console.error("Failed to fetch dashboard sites:", error);
      } finally {
        setLoadingSites(false);
      }
    };
    
    fetchSites();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setRecipients([]);
    setDirectorateId('');
    setSiteIds([]);
    setStartTime('08:00');
    setIntervalHours('24');
    setIsEnabled(true);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (scheduler: ReadingsReportSchedulerResponse) => {
    setEditingId(scheduler.id);
    setName(scheduler.name || '');
    setRecipients(scheduler.recipients && scheduler.recipients.length > 0 ? scheduler.recipients : []);
    setDirectorateId(scheduler.directorateId ? scheduler.directorateId.toString() : '');
    
    setSiteIds(scheduler.siteIds || []);

    setStartTime(scheduler.startTime || '08:00');
    setIntervalHours(scheduler.intervalHours ? scheduler.intervalHours.toString() : '24');
    setIsEnabled(scheduler.isEnabled ?? true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const validRecipients = recipients.map(r => r.trim()).filter(r => r !== '');
    if (!name.trim() || validRecipients.length === 0 || !directorateId) return;

    // siteIds is already number[]
    const parsedSiteIds = siteIds;

    const payload: ReadingsReportSchedulerConfigRequest = {
      name: name.trim(),
      isEnabled,
      directorateId: parseInt(directorateId, 10),
      siteIds: parsedSiteIds,
      startTime,
      intervalHours: parseInt(intervalHours, 10) || 24,
      recipients: validRecipients,
    };

    let success = false;
    if (editingId) {
      payload.id = editingId;
      success = await updateScheduler(editingId, payload);
    } else {
      success = await addScheduler(payload);
    }

    if (success) {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const getStatusBadge = (active: boolean) => (
    <Badge variant={active ? 'default' : 'secondary'}>
      {active ? t('common.active') || 'Active' : t('common.inactive') || 'Inactive'}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{t('ups.readingReportsScheduler.title')}</h2>
          <p className="text-gray-500 mt-1">{t('ups.readingReportsScheduler.subtitle')}</p>
        </div>
        <Button onClick={handleOpenAdd} disabled={isLoading}>
          {t('ups.readingReportsScheduler.addScheduler')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('ups.readingReportsScheduler.tableTitle')}</CardTitle>
          <CardDescription>{t('ups.readingReportsScheduler.tableSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">{t('ups.readingReportsScheduler.name')}</TableHead>
                  <TableHead className="text-center">{t('ups.readingReportsScheduler.emails')}</TableHead>
                  <TableHead className="text-center">{t('common.startTime') || "Start Time"}</TableHead>
                  <TableHead className="text-center">{t('common.interval') || "Interval (Hours)"}</TableHead>
                  <TableHead className="text-center">{t('ups.readingReportsScheduler.status')}</TableHead>
                  <TableHead className="text-center">{t('ups.readingReportsScheduler.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      {t('ups.readingReportsScheduler.loading')}
                    </TableCell>
                  </TableRow>
                ) : schedulers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      {t('ups.readingReportsScheduler.noSchedulers')}
                    </TableCell>
                  </TableRow>
                ) : (
                  schedulers.map((scheduler) => (
                    <TableRow key={scheduler.id}>
                      <TableCell className="font-medium text-center">{scheduler.name}</TableCell>
                      <TableCell className="max-w-xs truncate text-center" title={scheduler.recipients?.join(', ')}>{scheduler.recipients?.join(', ')}</TableCell>
                      <TableCell className="text-center">{scheduler.startTime}</TableCell>
                      <TableCell className="text-center">{scheduler.intervalHours}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(scheduler.isEnabled)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(scheduler)} title={t('ups.readingReportsScheduler.edit')} disabled={isLoading}>
                            <Edit className="w-4 h-4 text-orange-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteScheduler(scheduler.id)} title={t('ups.readingReportsScheduler.delete')} disabled={isLoading}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* DialogContent base is `grid` in our UI component, so use a 3-row grid to keep size fixed */}
        <DialogContent
          className="sm:max-w-[500px] h-[80vh] max-h-[80vh] overflow-hidden grid"
          style={{ gridTemplateRows: "auto minmax(0, 1fr) auto" }}
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>{editingId ? t('ups.readingReportsScheduler.editTitle') : t('ups.readingReportsScheduler.addTitle')}</DialogTitle>
            <DialogDescription>
              {editingId ? t('ups.readingReportsScheduler.editDescription') : t('ups.readingReportsScheduler.addDescription')}
            </DialogDescription>
          </DialogHeader>
          {/* Scrollable form area (keeps header + footer fixed) */}
          <div className="min-h-0 overflow-y-auto pr-1">
            <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('ups.readingReportsScheduler.name')}</Label>
              <Input
                placeholder={t('ups.readingReportsScheduler.placeholderName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <RecipientInput
                type="email"
                forAlarmType="threshold"
                recipients={recipients}
                setRecipients={(newRecipients) => setRecipients(newRecipients)}
                setHasChanges={() => {}}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('sites.directorate')}</Label>
              <Select value={directorateId} onValueChange={setDirectorateId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('sites.stage1.directorateNamePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {directorates.map(d => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('ups.master.selectSites')}</Label>
              <SiteMultiSelectDropdown
                sites={availableSites}
                selectedSiteIds={siteIds}
                onSiteToggle={(siteId) => {
                  setSiteIds(prev => 
                    prev.includes(siteId) 
                      ? prev.filter(id => id !== siteId) 
                      : [...prev, siteId]
                  );
                }}
                sitesLoading={loadingSites}
                placeholder={t('ups.master.selectSites') + "..."}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('common.startTime')}</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('common.interval')}</Label>
                <Input
                  type="number"
                  min="1"
                  value={intervalHours}
                  onChange={(e) => setIntervalHours(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Checkbox 
                id="isEnabled" 
                checked={isEnabled} 
                onCheckedChange={(checked: boolean | 'indeterminate') => setIsEnabled(checked === true)} 
              />
              <Label htmlFor="isEnabled" className="cursor-pointer">
                {t('ups.readingReportsScheduler.active')}
              </Label>
            </div>
            </div>
          </div>
          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !name.trim() || recipients.length === 0 || !directorateId}
            >
              {isLoading ? t('ups.readingReportsScheduler.saving') : editingId ? t('ups.readingReportsScheduler.update') : t('ups.readingReportsScheduler.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
