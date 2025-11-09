import { useState } from 'react';
import type { WaterLevelReading, PumpStationReading } from '../types';

export function useReadingsData() {
  const [selectedReading, setSelectedReading] = useState<PumpStationReading | null>(null);
  const [selectedPumpIndex, setSelectedPumpIndex] = useState<number | null>(null); 
  const [isPumpDetailsOpen, setIsPumpDetailsOpen] = useState(false);
  const [isPumpEditOpen, setIsPumpEditOpen] = useState(false);
  
  // Edit dialog states
  const [isEditPumpStationOpen, setIsEditPumpStationOpen] = useState(false);
  const [editingPumpStation, setEditingPumpStation] = useState<PumpStationReading | null>(null);
  const [isEditWaterLevelOpen, setIsEditWaterLevelOpen] = useState(false);
  const [editingWaterLevel, setEditingWaterLevel] = useState<WaterLevelReading | null>(null);

  const waterLevelReadings: WaterLevelReading[] = [
    { id: 1, site: 'مستوى المياه - القاهرة 01', timestamp: '2025-11-03 11:00', uswl: 125.4, dswl: 122.1, battery: 12.8, calculatedFlow: 34.5, hasAlarm: false },
    { id: 2, site: 'مستوى المياه - القاهرة 01', timestamp: '2025-11-03 10:00', uswl: 125.2, dswl: 121.9, battery: 12.4, calculatedFlow: 33.8, hasAlarm: true },
    { id: 3, site: 'مستوى المياه - الإسكندرية 01', timestamp: '2025-11-03 11:00', uswl: 98.7, dswl: 95.2, battery: 13.1, calculatedFlow: 28.9, hasAlarm: false },
  ];

  const [pumpStationReadings, setPumpStationReadings] = useState<PumpStationReading[]>([
    { 
      id: 1, 
      site: 'محطة الضخ - الجيزة 01', 
      timestamp: '2025-11-03 11:00',
      pumps: [
        { time: 3.5, flow: 45.2 },
        { time: 4.2, flow: 48.1 },
        { time: 0, flow: 0 },
      ],
      totalUptime: 7.7,
      totalFlow: 93.3,
      hasAlarm: false
    },
    { 
      id: 2, 
      site: 'محطة الضخ - الدقهلية 02', 
      timestamp: '2025-11-03 11:00',
      pumps: [
        { time: 5.0, flow: 52.3 },
        { time: 4.8, flow: 50.1 },
        { time: 3.2, flow: 38.5 },
      ],
      totalUptime: 13.0,
      totalFlow: 140.9,
      hasAlarm: false
    },
  ]);

  const sites = [
    'مستوى المياه - القاهرة 01',
    'مستوى المياه - الإسكندرية 01',
    'محطة الضخ - الجيزة 01',
    'محطة الضخ - الدقهلية 02',
  ];
  const handleViewPumpDetails = (reading: PumpStationReading) => {
    setSelectedReading(reading);
    setIsPumpDetailsOpen(true);
  };
  const handleEditPump = (pumpIndex: number) => {
    setSelectedPumpIndex(pumpIndex);
    setIsPumpEditOpen(true);
    setIsPumpDetailsOpen(false);
  };
  
  const handleEditPumpStation = (reading: PumpStationReading) => {
    setEditingPumpStation(reading);
    setIsEditPumpStationOpen(true);
  };
  
  const handleEditWaterLevel = (reading: WaterLevelReading) => {
    setEditingWaterLevel(reading);
    setIsEditWaterLevelOpen(true);
  };
  
  const handleExport = () => {
    alert('سيتم تصدير البيانات إلى ملف Excel');
  };

  return {
    waterLevelReadings,
    pumpStationReadings,
    setPumpStationReadings,
    sites,
    handleViewPumpDetails,
    handleEditPump,
    handleExport,
    // Edit dialog state and handlers
    isEditPumpStationOpen,
    setIsEditPumpStationOpen,
    editingPumpStation,
    setEditingPumpStation,
    handleEditPumpStation,
    isEditWaterLevelOpen,
    setIsEditWaterLevelOpen,
    editingWaterLevel,
    setEditingWaterLevel,
    handleEditWaterLevel,
  };
}
