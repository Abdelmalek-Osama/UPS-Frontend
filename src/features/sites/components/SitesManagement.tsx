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

export function SitesManagement() {
  const { sites, directorates, loading, error } = useSitesData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDirectorate, setFilterDirectorate] = useState<string>('all');

  const filteredSites = useFilteredSites(sites, { searchTerm, type: filterType, directorate: filterDirectorate });

  return (
    <div className="space-y-6">
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
                <SelectItem value="PumpStation">محطة رفع</SelectItem>
                <SelectItem value="Hybrid">مختلط</SelectItem>
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
                        {site.type === 'WaterLevel' ? (
                          <Droplets className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Power className="h-4 w-4 text-green-600" />
                        )}
                        {site.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {site.type === 'WaterLevel' ? 'القناطر' : site.type === 'PumpStation' ? 'محطة ضخ' : site.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{site.code}</TableCell>
                    <TableCell>{site.canal}</TableCell>
                    <TableCell>{site.directorateName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {site.location}
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
