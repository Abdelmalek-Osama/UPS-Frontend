import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table';
import { 
  Edit, 
  Download, 
  Plus, 
  CalendarIcon, 
  Calendar
} from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '../../../components/ui/popover';
import { Input } from '../../../components/ui/input';
import type { WaterLevelReading } from '../types';
import {useReadingsData} from '../hooks/useReadingsData';


interface WaterLevelTableProps {
  readings: WaterLevelReading[];
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function WaterLevelTable({ readings,isAddDialogOpen, setIsAddDialogOpen }: WaterLevelTableProps) {
    const {handleExport, sites} = useReadingsData();
    return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>قراءات مستوى المياه ({readings.length})</CardTitle>
            <div className="flex gap-2 justify-end">
                
                <Button variant="outline" onClick={handleExport}>
                <Download className="ml-2 h-4 w-4" />
                تصدير
                </Button>
            
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                    <Button>
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة قراءة يدوية
                    </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-right">إضافة قراءة يدوية</DialogTitle>
                        <DialogDescription className="text-right">
                        أدخل بيانات القراءة الجديدة
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>الموقع</Label>
                            <Select dir="rtl" defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder="اختر الموقع" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">جميع المواقع</SelectItem>
                                {sites.map(site => (
                                <SelectItem key={site} value={site}>{site}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>التاريخ والوقت</Label>
                            <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="ml-2 h-4 w-4" />
                                اختر التاريخ
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" />
                            </PopoverContent>
                            </Popover>
                        </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>USWL (متر)</Label>
                            <Input type="number" step="0.1" placeholder="125.4" />
                        </div>
                        <div className="space-y-2">
                            <Label>DSWL (متر)</Label>
                            <Input type="number" step="0.1" placeholder="122.1" />
                        </div>
                        </div>
                        <div className="space-y-2">
                        <Label>البطارية (فولت)</Label>
                        <Input type="number" step="0.1" placeholder="12.8" />
                        </div>
                        <div className="bg-gray-50 border rounded-lg p-4">
                        <Label className="text-sm text-gray-600" >التدفق المحسوب</Label>
                        <p className="text-2xl mt-1">34.5 م³/س</p>
                        <p className="text-xs text-gray-500 mt-1">يتم الحساب تلقائياً بناءً على المعادلة المعرفة للموقع</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        إلغاء
                        </Button>
                        <Button onClick={() => setIsAddDialogOpen(false)}>
                        حفظ القراءة
                        </Button>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الموقع</TableHead>
                <TableHead className="text-right">التاريخ والوقت</TableHead>
                <TableHead className="text-right">USWL (م)</TableHead>
                <TableHead className="text-right">DSWL (م)</TableHead>
                <TableHead className="text-right">البطارية (V)</TableHead>
                <TableHead className="text-right">التدفق المحسوب</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell className="text-right font-medium">{reading.site}</TableCell>
                  <TableCell className="text-right">{reading.timestamp}</TableCell>
                  <TableCell className="text-right">{reading.uswl.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{reading.dswl.toFixed(1)}</TableCell>
                  <TableCell className={`text-right ${reading.battery < 12.5 ? 'text-yellow-600 font-medium' : ''}`}>
                    {reading.battery.toFixed(1)}
                  </TableCell>
                  <TableCell className={`text-right ${reading.calculatedFlow < 30 ? 'text-red-600 font-medium' : ''}`}>
                    <div className="flex items-center justify-start gap-2">
                      <span>{reading.calculatedFlow.toFixed(1)} م³/س</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
