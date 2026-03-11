import html2canvas from 'html2canvas';

/**
 * Export table data to CSV format with UTF-8 BOM for proper Arabic text display
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
  
  // Add UTF-8 BOM (Byte Order Mark) to ensure Excel recognizes UTF-8 encoding
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csv;
  
  // Create blob and download
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
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
 * Export table data to Excel format with proper UTF-8 encoding for Arabic text
 */
export const exportTableToExcel = (
  data: any[],
  columns: { key: string; header: string }[],
  filename: string
) => {
  // Create HTML table with proper meta tags for UTF-8 encoding
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Sheet1</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
      </style>
    </head>
    <body>
    <table>`;
  
  // Add header
  html += '<thead><tr>';
  columns.forEach(col => {
    html += `<th>${escapeHtml(col.header)}</th>`;
  });
  html += '</tr></thead>';
  
  // Add rows
  html += '<tbody>';
  data.forEach(row => {
    html += '<tr>';
    columns.forEach(col => {
      const value = row[col.key] ?? '';
      html += `<td>${escapeHtml(String(value))}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></body></html>';
  
  // Add UTF-8 BOM (Byte Order Mark) to ensure Excel recognizes UTF-8 encoding
  const BOM = '\uFEFF';
  const htmlWithBOM = BOM + html;
  
  // Create blob and download
  const blob = new Blob([htmlWithBOM], { type: 'application/vnd.ms-excel;charset=utf-8;' });
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
 * Helper function to escape HTML special characters
 */
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Inject CSS overrides to replace oklch colors with hex equivalents
 */
const injectColorOverrides = (): HTMLStyleElement => {
  const style = document.createElement('style');
  style.id = 'export-color-overrides';
  style.textContent = `
    * {
      --color-primary: #3b82f6 !important;
      --color-secondary: #ef4444 !important;
      --color-success: #10b981 !important;
      --color-warning: #f59e0b !important;
      --color-error: #ef4444 !important;
      --color-info: #3b82f6 !important;
      --color-neutral: #6b7280 !important;
      --color-background: #ffffff !important;
      --color-foreground: #000000 !important;
      --color-border: #e5e7eb !important;
      background-color: var(--color-background) !important;
      color: var(--color-foreground) !important;
      border-color: var(--color-border) !important;
    }
    
    body, html {
      background-color: #ffffff !important;
      color: #000000 !important;
    }
  `;
  document.head.appendChild(style);
  return style;
};

/**
 * Remove the injected color overrides
 */
const removeColorOverrides = (styleEl: HTMLStyleElement): void => {
  if (styleEl && styleEl.parentNode) {
    styleEl.parentNode.removeChild(styleEl);
  }
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
  
  // Inject color overrides
  const styleOverride = injectColorOverrides();
  
  try {
    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);
    
    // Wait for images to load
    const images = clone.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) resolve(null);
        else {
          img.onload = () => resolve(null);
          img.onerror = () => resolve(null);
        }
      });
    }));
    
    const canvas = await html2canvas(clone, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      allowTaint: true,
      useCORS: true,
      imageTimeout: 5000,
      width: clone.offsetWidth,
      height: clone.offsetHeight,
    });
    
    // Clean up
    document.body.removeChild(tempContainer);
    removeColorOverrides(styleOverride);
    
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
  } catch (error) {
    console.error('Error exporting chart:', error);
    removeColorOverrides(styleOverride);
    // Fallback to SVG export if html2canvas fails
    exportChartAsSVG(elementId, filename);
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

/**
 * Export the entire page/element as PNG image (full page screenshot)
 * Note: Requires html2canvas library. Install with: npm install html2canvas
 */
export const exportPageAsPNG = async (
  filename: string = "page-export",
  elementId?: string
): Promise<void> => {
  // Inject color overrides
  const styleOverride = injectColorOverrides();
  
  try {
    // Get the element to export
    const sourceElement = elementId ? document.getElementById(elementId) : document.documentElement;
    
    if (!sourceElement) {
      console.error(`Element not found for export`);
      removeColorOverrides(styleOverride);
      return;
    }

    // Clone the element to avoid modifying the original
    const clone = sourceElement.cloneNode(true) as HTMLElement;
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = sourceElement.offsetWidth + 'px';
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);
    
    // Hide export buttons in the clone
    const exportButtons = clone.querySelectorAll('[class*="export"]');
    exportButtons.forEach(btn => {
      (btn as HTMLElement).style.display = 'none';
    });
    
    // Wait for images to load
    const images = clone.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) resolve(null);
        else {
          img.onload = () => resolve(null);
          img.onerror = () => resolve(null);
        }
      });
    }));
    
    const canvas = await html2canvas(clone, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      allowTaint: true,
      useCORS: true,
      imageTimeout: 5000,
      width: clone.offsetWidth,
      height: clone.offsetHeight,
    });
    
    // Clean up
    document.body.removeChild(tempContainer);
    removeColorOverrides(styleOverride);
    
    // Convert canvas to blob and download
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
  } catch (error) {
    console.error('Error exporting page:', error);
    removeColorOverrides(styleOverride);
  }
};
