import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Calendar } from '../../../components/ui/calendar';
import { 
  Plus, 
  Download, 
  Upload, 
  CalendarIcon,
  AlertCircle,
  Edit
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../../components/ui/dialog';
import { useReadingsData } from '../hooks/useReadingsData';
import { WaterLevelTable } from './WaterLevelTable';
import { PumpStationTable } from './PumpStationTable';
import type { PumpStationReading } from '../types';
import { DatePicker } from '../../../components/ui/datepicker';

export function ReadingsManagement() {
  const { handleExport, waterLevelReadings, pumpStationReadings, sites, handleEditPump } = useReadingsData();
  const [activeTab, setActiveTab] = useState('waterLevel');
  const [selectedSite, setSelectedSite] = useState('القناطر - القاهرة 01');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isPumpDetailsOpen, setIsPumpDetailsOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<PumpStationReading | null>(null);
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  

  const handleViewPumpDetails = (reading: PumpStationReading) => {
    setSelectedReading(reading);
    setIsPumpDetailsOpen(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة القراءات</h2>
          <p className="text-gray-500 mt-1">عرض وتحرير قراءات المواقع</p>
        </div>
    
        
      </div>
      

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedSite} onValueChange={setSelectedSite} defaultValue="all">
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
            <DatePicker
            placeholder="من تاريخ"
            value={fromDate}
            onChange={setFromDate}
            />
            <DatePicker
            placeholder="الى تاريخ"
            value={toDate}
            onChange={setToDate}
            />
          </div>
        </CardContent>
      </Card>
      

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="waterLevel">قراءات القناطر</TabsTrigger>
          <TabsTrigger value="pumpStation">قراءات محطات رفع</TabsTrigger>
        </TabsList>

        <TabsContent value="waterLevel" className="mt-6">

          <WaterLevelTable 
            readings={waterLevelReadings} 
            isAddDialogOpen={isAddDialogOpen} 
            setIsAddDialogOpen={setIsAddDialogOpen} 
          />

        </TabsContent>


        <TabsContent value="pumpStation" className="mt-6">
            
          <PumpStationTable 
            readings={pumpStationReadings} 
            onViewDetails={handleViewPumpDetails}
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
          />
        </TabsContent>
      </Tabs>
      
    
      {/* Pump Details Dialog */}
      <Dialog open={isPumpDetailsOpen} onOpenChange={setIsPumpDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تفاصيل قراءات المضخات</DialogTitle>
            <DialogDescription className="text-right">
              {selectedReading?.site} - {selectedReading?.timestamp}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم المضخة</TableHead>
                  <TableHead className="text-right">وقت التشغيل (ساعة)</TableHead>
                  <TableHead className="text-right">التدفق (م³/س)</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedReading?.pumps.map((pump, index) => (
                  <TableRow key={index}>
                    <TableCell>مضخة {index + 1}</TableCell>
                    <TableCell>{pump.time.toFixed(1)}</TableCell>
                    <TableCell>{pump.flow.toFixed(1)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditPump(index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">إجمالي وقت التشغيل</p>
                  <p className="text-xl mt-1">{selectedReading?.totalUptime.toFixed(1)} ساعة</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">إجمالي التدفق</p>
                  <p className="text-xl mt-1">{selectedReading?.totalFlow.toFixed(1)} م³/س</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPumpDetailsOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
