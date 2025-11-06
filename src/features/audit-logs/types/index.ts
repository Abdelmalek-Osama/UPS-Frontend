export interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: 'create' | 'update' | 'delete';
  site: string;
  field: string;
  oldValue: string;
  newValue: string;
  readingId: number;
}

export interface AuditLogFilters {
  searchTerm: string;
  user: string;
  site: string;
  action: string;
}
