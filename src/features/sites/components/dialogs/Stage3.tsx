import { useState, useMemo } from 'react';
import { Site, DataMapping } from '../../types';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Button } from '../../../../components/ui/button';
import { Trash2 } from 'lucide-react';

interface TabProps {
  data: Partial<Site>;
  onChange: (field: string, value: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Static database column names for Water Level
const WATER_LEVEL_COLUMNS = ['USWL', 'DSWL', 'Battery'];

const TABLE_OPTIONS = {
  'waterLevel': 'sites.stage3.tableWaterLevel',
  'pumpStation': 'sites.stage3.tablePumpStation',
  'pumpStatus': 'sites.stage3.tablePumpStatus',
};

const TABLE_OPTION_KEYS = Object.keys(TABLE_OPTIONS) as Array<keyof typeof TABLE_OPTIONS>;
const ALL_TABLE_OPTIONS_KEYS = TABLE_OPTION_KEYS;

// Generate dynamic pump columns based on number of pumps
const generatePumpColumns = (numPumps: number, prefix: string): string[] => {
  const columns: string[] = [];
  for (let i = 1; i <= numPumps; i++) {
    columns.push(`${prefix}${i}`);
  }
  return columns;
};

// Get columns for a specific table based on site configuration
const getTableColumns = (tableKey: string, numPumps: number = 0): string[] => {
  switch (tableKey) {
    case 'waterLevel':
      return WATER_LEVEL_COLUMNS;
    case 'pumpStation':
      return numPumps > 0 ? generatePumpColumns(numPumps, 'P') : [];
    case 'pumpStatus':
      return numPumps > 0 ? generatePumpColumns(numPumps, 'PS') : [];
    default:
      return [];
  }
};

export default function Stage3({ data, onChange }: TabProps) {
  const { t } = useTranslation();
  const dir = t('_rtl') === 'rtl' ? 'rtl' : 'ltr';

  // Get translated table names
  const tableOptionsMap = {
    'waterLevel': t('sites.stage3.tableWaterLevel'),
    'pumpStation': t('sites.stage3.tablePumpStation'),
    'pumpStatus': t('sites.stage3.tablePumpStatus'),
  };

  const dataMappings = data.dataMappings || [];
  const [selectedTableForForm, setSelectedTableForForm] = useState<string>('');
  const [mappingForm, setMappingForm] = useState<Partial<DataMapping>>({});
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});

  // Get available table options based on site type and already mapped tables
  const availableTableOptions = useMemo(() => {
    let options = ALL_TABLE_OPTIONS_KEYS;

    // Filter based on site type
    if (data.siteType === 'WaterLevel') {
      options = ['waterLevel'];
    }
    // If 'Pumps', all 3 options are available

    // Filter out already mapped tables
    const mappedTableNames = dataMappings.map(m => m.tableName);
    return options.filter(opt => !mappedTableNames.includes(opt));
  }, [data.siteType, dataMappings]);

  // Get columns for the currently selected table based on numPumps
  const currentTableColumns = useMemo(() => {
    if (!selectedTableForForm) return [];
    return getTableColumns(selectedTableForForm, data.numPumps || 0);
  }, [selectedTableForForm, data.numPumps]);

  // Initialize column mappings when table is selected
  const handleTableSelect = (table: string) => {
    setSelectedTableForForm(table);
    // Initialize column mappings with empty user field values
    const cols = getTableColumns(table, data.numPumps || 0);
    const newColumnMappings: Record<string, string> = {};
    cols.forEach(col => {
      newColumnMappings[col] = '';
    });
    setColumnMappings(newColumnMappings);
    // Reset form fields
    setMappingForm({ folder: '', filename: '' });
  };

  const handleColumnMappingChange = (dbColumn: string, userField: string) => {
    setColumnMappings(prev => ({
      ...prev,
      [dbColumn]: userField,
    }));
  };

  const handleAddMapping = () => {
    if (!selectedTableForForm || !mappingForm.folder || !mappingForm.filename) {
      alert('Please fill in table name, folder, and filename');
      return;
    }

    // Check if all column mappings are filled
    const allFilled = Object.values(columnMappings).every(val => val.trim() !== '');
    if (!allFilled) {
      alert('Please fill in all column mappings');
      return;
    }

    const newMapping: DataMapping = {
      tableName: selectedTableForForm,
      folder: mappingForm.folder,
      filename: mappingForm.filename,
      columnMapping: JSON.stringify(columnMappings),
    };

    const updatedMappings = [...dataMappings, newMapping];
    onChange('dataMappings', updatedMappings);

    // Reset form
    setSelectedTableForForm('');
    setMappingForm({});
    setColumnMappings({});
  };

  const handleDeleteMapping = (index: number) => {
    const updatedMappings = dataMappings.filter((_, i) => i !== index);
    onChange('dataMappings', updatedMappings);
  };

  // Check if max mappings reached - can add more if there are available table options
  const canAddMore = availableTableOptions.length > 0;

  return (
    <div className="space-y-6">
      {/* Form for adding new mappings */}
      {canAddMore && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
          <h3 className="font-semibold text-lg text-gray-900">
            {t('sites.stage3.addDataMappingTitle', 'Add Data Mapping')}
          </h3>

          {/* Table Name Selection */}
          <div className="space-y-2">
            <Label htmlFor="tableName">
              {t('sites.stage3.tableNameLabel', 'Table Name')}
            </Label>
            <Select value={selectedTableForForm} onValueChange={handleTableSelect} dir={dir}>
              <SelectTrigger id="tableName" disabled={availableTableOptions.length === 0}>
                <SelectValue
                  placeholder={t('sites.stage3.tableNamePlaceholder', 'Select table')}
                />
              </SelectTrigger>
              <SelectContent dir={dir}>
                {availableTableOptions.map(tableKey => (
                  <SelectItem key={tableKey} value={tableKey}>
                    {tableOptionsMap[tableKey as keyof typeof tableOptionsMap]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Folder Input */}
          <div className="space-y-2">
            <Label htmlFor="folder">{t('sites.stage3.folderLabel', 'Folder')}</Label>
            <Input
              id="folder"
              placeholder={t('sites.stage3.folderPlaceholder', 'e.g., /data/water_level')}
              value={mappingForm.folder || ''}
              onChange={(e) => setMappingForm(prev => ({ ...prev, folder: e.target.value }))}
              className={dir === 'rtl' ? 'text-right' : 'text-left'}
            />
          </div>

          {/* Filename Input */}
          <div className="space-y-2">
            <Label htmlFor="filename">{t('sites.stage3.filenameLabel', 'Filename')}</Label>
            <Input
              id="filename"
              placeholder={t('sites.stage3.filenamePlaceholder', 'e.g., water_level_data.csv')}
              value={mappingForm.filename || ''}
              onChange={(e) => setMappingForm(prev => ({ ...prev, filename: e.target.value }))}
              className={dir === 'rtl' ? 'text-right' : 'text-left'}
            />
          </div>

          {/* Column Mappings */}
          {selectedTableForForm && currentTableColumns.length > 0 && (
            <div className="space-y-3">
              <Label className="font-semibold">
                {t('sites.stage3.columnMappingLabel', 'Column Mappings')}
              </Label>

              <div className="space-y-2 bg-white p-3 rounded border">
                {currentTableColumns.map(dbColumn => (
                  <div key={dbColumn} className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-gray-600">
                        {t('sites.stage3.databaseFieldLabel', 'Database Field')}
                      </Label>
                      <Input
                        disabled
                        value={dbColumn}
                        className="bg-gray-100 text-gray-700"
                      />
                    </div>
                    <span className="text-gray-400">→</span>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-gray-600">
                        {t('sites.stage3.userFieldLabel', 'Name from File')}
                      </Label>
                      <Input
                        placeholder={t('sites.stage3.userFieldPlaceholder', 'Enter field name')}
                        value={columnMappings[dbColumn] || ''}
                        onChange={(e) =>
                          handleColumnMappingChange(dbColumn, e.target.value)
                        }
                        className={dir === 'rtl' ? 'text-right' : 'text-left'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Mapping Button */}
          <Button
            type="button"
            onClick={handleAddMapping}
            disabled={!selectedTableForForm}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white"
          >
            {t('sites.stage3.addMappingButton', 'Add Mapping')}
          </Button>
        </div>
      )}

      {/* Display added mappings */}
      {dataMappings.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-900">
            {t('sites.stage3.addedMappingsTitle', 'Data Mappings')} ({dataMappings.length})
          </h3>

          <div className="space-y-2">
            {dataMappings.map((mapping, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {tableOptionsMap[mapping.tableName as keyof typeof tableOptionsMap]}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {mapping.filename}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {t('sites.stage3.folderLabel', 'Folder')}: {mapping.folder}
                    </p>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                        {t('sites.stage3.viewColumnsButton', 'View column mappings')}
                      </summary>
                      <div className="mt-2 pl-4 space-y-1 bg-gray-50 p-2 rounded text-gray-700">
                        {(() => {
                          try {
                            const cols = JSON.parse(mapping.columnMapping) as Record<string, string>;
                            return Object.entries(cols).map(([db, user]) => (
                              <div key={db} className="text-xs">
                                <span className="font-mono">{db}</span>
                                <span className="text-gray-400"> → </span>
                                <span className="font-mono">{String(user)}</span>
                              </div>
                            ));
                          } catch {
                            return <div className="text-xs text-red-600">Invalid mapping data</div>;
                          }
                        })()}
                      </div>
                    </details>
                  </div>
                  <Button
                    type="button"
                    onClick={() => handleDeleteMapping(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {dataMappings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>{t('sites.stage3.noMappingsMessage', 'No data mappings added yet')}</p>
        </div>
      )}

      {/* Max mappings reached message */}
      {!canAddMore && dataMappings.length > 0 && (
        <div className="rounded-lg p-3 bg-green-50 border border-green-200">
          <p className="text-sm text-green-800">
            {t('sites.stage3.allMappingsAddedMessage', 'All available data mappings have been added')}
          </p>
        </div>
      )}
    </div>
  );
}
