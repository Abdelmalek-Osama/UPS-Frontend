import React from 'react';
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
import { Edit } from 'lucide-react';
import type { WaterLevelReading } from '../types';

interface WaterLevelTableProps {
  readings: WaterLevelReading[];
}

export function WaterLevelTable({ readings }: WaterLevelTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>قراءات مستوى المياه ({readings.length})</CardTitle>
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
