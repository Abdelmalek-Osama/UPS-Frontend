import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../shared/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Search, MapPin, Droplets, Power, Plus, Edit, Trash2 } from 'lucide-react';
import { useSitesData, useFilteredSites } from '../hooks/useSitesData';
import { Site } from '../types';
import { Skeleton } from '../../../components/ui/skeleton';
import Loader from '../../../components/ui/Loader';
import SitesDialog from './dialogs/SitesDialog';
import apiService from '../../../shared/utils/apiService';
import { AlertDialog } from '../../../shared/components/AlertDialog';
import { toast } from 'react-toastify';

export function SitesManagement() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { sites, setSites, directorates, loading, error, refetch } = useSitesData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDirectorate, setFilterDirectorate] = useState<string>('all');
  const [filterCanal, setFilterCanal] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Site>>({});
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<number | null>(null);

  const filteredSites = useFilteredSites(sites, { searchTerm, type: filterType, directorate: filterDirectorate, canal: filterCanal });

  const handleEditSite = (site: Site) => {
    setEditingSite(site);
    setFormData(site);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (siteId: number) => {
    setSiteToDelete(siteId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (siteToDelete) {
      try {
        await apiService.delete(`/v1/Sites/${siteToDelete}`);
        setSites((prevSites) => prevSites.filter((site) => site.id !== siteToDelete));
        setDeleteDialogOpen(false);
        setSiteToDelete(null);
        toast.success(t('notifications.deleted'));
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete site');
        setDeleteDialogOpen(false);
        setSiteToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">{t('sites.title')}</h2>
          <p className="text-gray-500 mt-1">{t('sites.subtitle')}</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('sites.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
              <SelectTrigger className="rtl:flex-row-reverse">
                <SelectValue placeholder={t('sites.siteType')} />
              </SelectTrigger>
              <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <SelectItem value="all">{t('sites.allTypes')}</SelectItem>
                <SelectItem value="WaterLevel">{t('sites.waterLevel')}</SelectItem>
                <SelectItem value="Pumps">{t('sites.pumpStation')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDirectorate} onValueChange={setFilterDirectorate} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
              <SelectTrigger className="rtl:flex-row-reverse">
                <SelectValue placeholder={t('sites.directorate')} />
              </SelectTrigger>
              <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <SelectItem value="all">{t('sites.allDirectorates')}</SelectItem>
                {directorates.map((directorate) => (
                  <SelectItem key={directorate.id} value={directorate.id.toString()}>
                    {t('_rtl') === 'rtl' ? directorate.arabicName : directorate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* New Select for Canal Filter */}
            <Select value={filterCanal} onValueChange={setFilterCanal} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
              <SelectTrigger className="rtl:flex-row-reverse">
                <SelectValue placeholder={t('sites.canal')} />
              </SelectTrigger>
              <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <SelectItem value="all">{t('sites.allCanals')}</SelectItem>
                {Array.from(new Set(sites.map(site => site.canal).filter(Boolean) as string[])).map(canal => (
                  <SelectItem key={canal} value={canal}>{canal}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading, Error, or Sites Table */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-48">
              <Loader />
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{t('errors.loadingFailed')}</div>
      ) : sites.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-48 text-gray-500 text-lg">
              {t('sites.noSitesToShow')}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between">
              <CardTitle>{t('sites.sitesCount')} ({filteredSites.length})</CardTitle>
              {currentUser?.role === 'Admin' && (
                <button
                  onClick={() => {
                    setFormData({});
                    setIsAddDialogOpen(true);
                  }}
                  className="flex items-center gap-2 px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  {t('sites.addNewSite')}
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
              <TableHeader>
                <TableRow>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('sites.siteName')}</TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('sites.siteType')}</TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('sites.simId')}</TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('sites.dataLoggerType')}</TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('sites.canal')}</TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('sites.directorate')}</TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('sites.location')}</TableHead>
                  <TableHead className="text-center">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {site.siteType === 'WaterLevel' ? (
                          <Droplets className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Power className="h-4 w-4 text-green-600" />
                        )}
                        {t('_rtl') === 'rtl' ? site.arabicName : site.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {site.siteType === 'WaterLevel' ? t('sites.waterLevel') : site.siteType === 'Pumps' ? t('sites.pumpStation') : site.siteType}
                      </Badge>
                    </TableCell>
                    <TableCell>{site.simCardIP || site.simId}</TableCell>
                    <TableCell>{site.dataLoggerType}</TableCell>
                    <TableCell>{site.canal}</TableCell>
                    <TableCell>
                      {t('_rtl') === 'rtl' 
                        ? site.directorateArabicName 
                        : site.directorateName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <a
                          href={`https://www.google.com/maps?q=${site.latitude},${site.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          <MapPin className="h-4 w-4" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSite(site)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {currentUser?.role === 'Admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(site.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialogs - Rendered outside conditional blocks */}
      <SitesDialog
        mode="create"
        siteData={formData}
        isOpen={isAddDialogOpen}
        onCancel={() => setIsAddDialogOpen(false)}
        onSave={(data) => {
          setIsAddDialogOpen(false);
          setFormData({});
        }}
        onSiteCreated={() => {
          refetch();
        }}
        directorates={directorates}
        isLoadingDirectorates={loading}
        userRole={currentUser?.role}
      />

      <SitesDialog
        key={editingSite?.id}
        mode="edit"
        siteData={editingSite || {}}
        isOpen={isEditDialogOpen}
        onCancel={() => {
          setIsEditDialogOpen(false);
          setEditingSite(null);
          setFormData({});
        }}
        onSave={(data) => {
          setIsEditDialogOpen(false);
          setEditingSite(null);
          setFormData({});
        }}
        directorates={directorates}
        isLoadingDirectorates={loading}
        userRole={currentUser?.role}
      />

      <AlertDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('sites.deleteSite')}
        description={t('sites.deleteConfirmation') || 'Are you sure you want to delete this site?'}
        type="error"
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
}