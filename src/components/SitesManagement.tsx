import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Search, MapPin, Droplets, Power } from 'lucide-react';

interface Site {
  id: number;
  name: string;
  type: 'WaterLevel' | 'PumpStation';
  directorate: string;
  location: string;
  status: 'online' | 'offline';
  flowCalcMethod?: 'Formula' | 'HQCurve';
}

export function SitesManagement() {
  const [sites, setSites] = useState<Site[]>([
    { id: 1, name: 'مستوى المياه - القاهرة 01', type: 'WaterLevel', directorate: 'القاهرة', location: '30.0444, 31.2357', status: 'online', flowCalcMethod: 'Formula' },
    { id: 2, name: 'محطة الضخ - الجيزة 01', type: 'PumpStation', directorate: 'الجيزة', location: '30.0131, 31.2089', status: 'online' },
    { id: 3, name: 'مستوى المياه - الإسكندرية 01', type: 'WaterLevel', directorate: 'الإسكندرية', location: '31.2001, 29.9187', status: 'offline', flowCalcMethod: 'HQCurve' },
    { id: 4, name: 'محطة الضخ - الدقهلية 02', type: 'PumpStation', directorate: 'الدقهلية', location: '31.0409, 31.3785', status: 'online' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDirectorate, setFilterDirectorate] = useState<string>('all');

  const directorates = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الفيوم', 'المنيا'];

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.location.includes(searchTerm);
    const matchesType = filterType === 'all' || site.type === filterType;
    const matchesDirectorate = filterDirectorate === 'all' || site.directorate === filterDirectorate;
    return matchesSearch && matchesType && matchesDirectorate;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">إدارة المواقع</h2>
          <p className="text-gray-500 mt-1">إدارة مواقع مستويات المياه ومحطات الضخ</p>
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
                <SelectItem value="WaterLevel">مستوى المياه</SelectItem>
                <SelectItem value="PumpStation">محطة الضخ</SelectItem>
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

      {/* Sites Table */}
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
                      {site.type === 'WaterLevel' ? 'مستوى المياه' : 'محطة ضخ'}
                    </Badge>
                  </TableCell>
                  <TableCell>{site.directorate}</TableCell>
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
    </div>
  );
}
