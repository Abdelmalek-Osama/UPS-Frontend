// Format date strings
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ar-EG');
}

// Format timestamp strings
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('ar-EG');
}

// Format numbers with locale
export function formatNumber(num: number, decimals: number = 1): string {
  return num.toFixed(decimals);
}
