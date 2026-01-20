import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
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
import { Search, MapPin, Droplets, Power, Plus } from 'lucide-react';
import { useSitesData, useFilteredSites } from '../hooks/useSitesData';
import { Site } from '../types';
import { Skeleton } from '../../../components/ui/skeleton';
import Loader from '../../../components/ui/Loader';
import SitesDialog from './dialogs/SitesDialog';

export function SitesManagement() {
  const { t } = useTranslation();
  const { sites, directorates, loading, error } = useSitesData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDirectorate, setFilterDirectorate] = useState<string>('all');
  const [filterCanal, setFilterCanal] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Site>>({});

  const filteredSites = useFilteredSites(sites, { searchTerm, type: filterType, directorate: filterDirectorate, canal: filterCanal });

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
                {directorates.map(dir => (
                  <SelectItem key={dir} value={dir}>{dir}</SelectItem>
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
      ) : (
        <Card>
          <CardHeader className={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between">
              <CardTitle>{t('sites.sitesCount')} ({filteredSites.length})</CardTitle>
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
              <SitesDialog
                mode="create"
                siteData={formData}
                isOpen={isAddDialogOpen}
                onCancel={() => setIsAddDialogOpen(false)}
                onSave={(data) => {
                  console.log('Saving site:', data);
                  setIsAddDialogOpen(false);
                  setFormData({});
                }}
              />

            </div>
          </CardHeader>
          <CardContent>
            <Table className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
              <TableHeader>
                <TableRow>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('sites.siteName')}</TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('sites.siteType')}</TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('sites.code')}</TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('sites.canal')}</TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('sites.directorate')}</TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('sites.location')}</TableHead>
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
                        {site.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {site.siteType === 'WaterLevel' ? t('sites.waterLevel') : site.siteType === 'Pumps' ? t('sites.pumpStation') : site.siteType}
                      </Badge>
                    </TableCell>
                    <TableCell>{site.code}</TableCell>
                    <TableCell>{site.canal}</TableCell>
                    <TableCell>{site.directorateName}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
