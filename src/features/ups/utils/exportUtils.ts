/**
 * Export table data to CSV format
 */
export const exportTableToCSV = (
  data: any[],
  columns: { key: string; header: string }[],
  filename: string
) => {
  // Create CSV header
  const headers = columns.map(col => col.header).join(',');
  
  // Create CSV rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key];
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });
  
  // Combine header and rows
  const csv = [headers, ...rows].join('\n');
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export table data to Excel format using simple HTML table method
 */
export const exportTableToExcel = (
  data: any[],
  columns: { key: string; header: string }[],
  filename: string
) => {
  // Create HTML table
  let html = '<table>';
  
  // Add header
  html += '<thead><tr>';
  columns.forEach(col => {
    html += `<th>${col.header}</th>`;
  });
  html += '</tr></thead>';
  
  // Add rows
  html += '<tbody>';
  data.forEach(row => {
    html += '<tr>';
    columns.forEach(col => {
      const value = row[col.key] ?? '';
      html += `<td>${value}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  
  // Create blob and download
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export chart/graph as PNG image
 * Note: Requires html2canvas library. Install with: npm install html2canvas
 */
export const exportChartAsPNG = async (
  elementId: string,
  filename: string
): Promise<void> => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }
  
  try {
    // Check if html2canvas is available
    if (typeof window !== 'undefined' && (window as any).html2canvas) {
      const html2canvas = (window as any).html2canvas;
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false,
      });
      
      // Convert canvas to blob
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `${filename}.png`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
    } else {
      // Fallback to SVG export if html2canvas is not available
      console.warn('html2canvas not available, falling back to SVG export');
      exportChartAsSVG(elementId, filename);
    }
  } catch (error) {
    console.error('Error exporting chart:', error);
  }
};

/**
 * Export chart/graph as SVG (for recharts)
 */
export const exportChartAsSVG = (
  elementId: string,
  filename: string
): void => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }
  
  // Find SVG element within the container
  const svgElement = element.querySelector('svg');
  
  if (!svgElement) {
    console.error('SVG element not found');
    return;
  }
  
  // Clone the SVG to avoid modifying the original
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  
  // Add XML namespace if not present
  if (!clonedSvg.getAttribute('xmlns')) {
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  
  // Serialize SVG to string
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clonedSvg);
  
  // Create blob and download
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.svg`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
