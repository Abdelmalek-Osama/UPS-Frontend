import React, { useState } from 'react';
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
import { Search, MapPin, Droplets, Power } from 'lucide-react';
import { useSitesData, useFilteredSites } from '../hooks/useSitesData';
import { Skeleton } from '../../../components/ui/skeleton';
import Loader from '../../../components/ui/Loader';

export function SitesManagement() {
  const { sites, directorates, loading, error } = useSitesData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDirectorate, setFilterDirectorate] = useState<string>('all');
  const [filterCanal, setFilterCanal] = useState<string>('all');

  const filteredSites = useFilteredSites(sites, { searchTerm, type: filterType, directorate: filterDirectorate, canal: filterCanal });

  return (
    <div className="space-y-6">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
          <Loader />
        </div>
      )}
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">إدارة المواقع</h2>
          <p className="text-gray-500 mt-1">إدارة مواقع مستويات المياه ومحطات رفع</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث عن موقع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الموقع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="WaterLevel">القناطر</SelectItem>
                <SelectItem value="Pumps">محطة رفع</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDirectorate} onValueChange={setFilterDirectorate}>
              <SelectTrigger>
                <SelectValue placeholder="المديرية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المديريات</SelectItem>
                {directorates.map(dir => (
                  <SelectItem key={dir} value={dir}>{dir}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* New Select for Canal Filter */}
            <Select value={filterCanal} onValueChange={setFilterCanal}>
              <SelectTrigger>
                <SelectValue placeholder="الترعة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الترع</SelectItem>
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
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">Error: {error}</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>المواقع ({filteredSites.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم الموقع</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">الكود</TableHead>
                  <TableHead className="text-right">الترعة</TableHead>
                  <TableHead className="text-right">المديرية</TableHead>
                  <TableHead className="text-right">الموقع</TableHead>
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
                        {site.siteType === 'WaterLevel' ? 'القناطر' : site.siteType === 'Pumps' ? 'محطة رفع' : site.siteType}
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
