import { Plus, Edit3, Trash2, FileText } from 'lucide-react';

export function getActionIcon(action: string) {
  switch (action) {
    case 'create':
      return <Plus className="h-4 w-4" />;
    case 'update':
      return <Edit3 className="h-4 w-4" />;
    case 'delete':
      return <Trash2 className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

export function getActionLabel(action: string): string {
  switch (action) {
    case 'create':
      return 'إضافة';
    case 'update':
      return 'تحديث';
    case 'delete':
      return 'حذف';
    default:
      return action;
  }
}

export function getActionColor(action: string): string {
  switch (action) {
    case 'create':
      return 'bg-green-100 text-green-700';
    case 'update':
      return 'bg-blue-100 text-blue-700';
    case 'delete':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
