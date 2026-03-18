import html2canvas from 'html2canvas-pro';

/**
 * Get current timestamp in format: YYYY-MM-DD HH:mm:ss
 */
const getExportTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Export table data to CSV format with UTF-8 BOM for proper Arabic text display
 */
export const exportTableToCSV = (
  data: any[],
  columns: { key: string; header: string }[],
  filename: string,
  title?: string
) => {
  const timestamp = getExportTimestamp();
  
  // Combine title info if exists
  const headerSection = (title && title.trim()) 
    ? [`"${title.replace(/"/g, '""')}"`, `"Exported At: ${timestamp}"`, ''] 
    : [];

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
  
  // Combine everything
  const csv = [...headerSection, headers, ...rows].join('\r\n');
  
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
  filename: string,
  title?: string
) => {
  const timestamp = getExportTimestamp();
  
  // Create HTML table with proper meta tags for UTF-8 encoding
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .report-title { 
          font-size: 16px; 
          font-weight: bold; 
          text-align: center; 
          border: none;
        }
        .report-time { 
          font-size: 11px; 
          font-style: italic; 
          text-align: center; 
          border: none;
        }
        .empty-row { border: none; }
      </style>
    </head>
    <body>
    <table>`;
  
  const colCount = columns.length;
  
  // Add Header Section if title exists
  if (title && title.trim()) {
    html += `
      <tr><td colspan="${colCount}" style="font-size: 16px; font-weight: bold; text-align: center; border: none;">${escapeHtml(title)}</td></tr>
      <tr><td colspan="${colCount}" style="font-size: 11px; font-style: italic; text-align: center; border: none;">Exported At: ${escapeHtml(timestamp)}</td></tr>
      <tr><td colspan="${colCount}" style="border: none; height: 10px;"></td></tr>
    `;
  }
  
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
 * Helper function to download a blob as a file
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export chart/graph as PNG image using html2canvas-pro (supports oklch colors)
 */
export const exportChartAsPNG = async (
  elementId: string,
  filename: string,
  title?: string
): Promise<void> => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }
  
  try {
    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.background = '#ffffff';
    tempContainer.style.padding = '20px';
    tempContainer.style.display = 'flex';
    tempContainer.style.flexDirection = 'column';
    tempContainer.style.alignItems = 'center';

    // Create a wrapper for the clone
    const cloneWrapper = document.createElement('div');
    const width = element.offsetWidth || 800;
    const height = element.offsetHeight || 400;
    
    cloneWrapper.style.width = width + 'px';
    cloneWrapper.style.height = height + 'px';
    cloneWrapper.style.position = 'relative';
    cloneWrapper.style.backgroundColor = '#ffffff';
    
    // Force dimensions on all SVGs in the clone
    const svgs = clone.querySelectorAll('svg');
    svgs.forEach(svg => {
      if (!svg.getAttribute('width')) svg.setAttribute('width', width.toString());
      if (!svg.getAttribute('height')) svg.setAttribute('height', height.toString());
    });
    
    cloneWrapper.appendChild(clone);
    tempContainer.appendChild(cloneWrapper);
    
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

    // Add header if needed
    if (title) {
      const headerDiv = document.createElement('div');
      headerDiv.style.textAlign = 'center';
      headerDiv.style.marginBottom = '20px';
      headerDiv.style.width = '100%';
      
      const titleSpan = document.createElement('h3');
      titleSpan.style.margin = '0 0 5px 0';
      titleSpan.style.fontSize = '16px';
      titleSpan.style.fontWeight = 'bold';
      titleSpan.style.color = '#333333';
      titleSpan.style.fontFamily = 'Arial, sans-serif';
      titleSpan.textContent = title;
      
      const timeSpan = document.createElement('span');
      timeSpan.style.fontSize = '11px';
      timeSpan.style.fontStyle = 'italic';
      timeSpan.style.color = '#6b7280';
      timeSpan.style.fontFamily = 'Arial, sans-serif';
      timeSpan.textContent = getExportTimestamp();
      
      headerDiv.appendChild(titleSpan);
      headerDiv.appendChild(timeSpan);
      tempContainer.insertBefore(headerDiv, tempContainer.firstChild);
    }

    // Wait for layout stability
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const captureWidth = tempContainer.scrollWidth || tempContainer.offsetWidth;
    const captureHeight = tempContainer.scrollHeight || tempContainer.offsetHeight;

    // Use html2canvas-pro which supports oklch colors
    const canvas = await html2canvas(tempContainer, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      allowTaint: true,
      useCORS: true,
      imageTimeout: 10000,
      width: captureWidth,
      height: captureHeight,
      // html2canvas-pro specific options
      imageSmoothing: true,
    });
    
    // Clean up
    document.body.removeChild(tempContainer);
    
    // Convert canvas to blob and download
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        downloadBlob(blob, `${filename}.png`);
      } else {
        console.error('Failed to generate image blob');
      }
    }, 'image/png', 1.0);
    
  } catch (error) {
    console.error('Error exporting chart:', error);
    // Fallback to SVG export if html2canvas fails
    exportChartAsSVG(elementId, filename, title);
  }
};

/**
 * Export chart/graph as SVG (for recharts)
 */
export const exportChartAsSVG = (
  elementId: string,
  filename: string,
  title?: string
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

  let finalSvgString = '';

  if (title) {
    // Compute dimensions and inject header directly into an SVG wrapping string or group
    let width = svgElement.clientWidth || svgElement.getBoundingClientRect().width || 800;
    let height = svgElement.clientHeight || svgElement.getBoundingClientRect().height || 400;
    
    // Scale viewBox if exists
    let scaledWidth = width;
    let originalHeight = height;
    const viewBox = clonedSvg.getAttribute('viewBox');
    if (viewBox) {
      const viewBoxValues = viewBox.split(/\s+/).map(Number);
      if (viewBoxValues.length === 4) {
        scaledWidth = viewBoxValues[2];
        originalHeight = viewBoxValues[3];
      }
    }

    const headerHeight = 60;
    const scaledHeaderHeight = (headerHeight / height) * originalHeight || headerHeight;

    const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    newSvg.setAttribute('viewBox', `0 0 ${scaledWidth} ${originalHeight + scaledHeaderHeight}`);
    newSvg.setAttribute('width', width.toString());
    newSvg.setAttribute('height', (height + headerHeight).toString());
    newSvg.style.backgroundColor = '#ffffff';

    if (clonedSvg.className.baseVal) {
      newSvg.setAttribute('class', clonedSvg.className.baseVal);
    }

    // Add Title and Timestamp
    const headerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const headerBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    headerBg.setAttribute('width', scaledWidth.toString());
    headerBg.setAttribute('height', scaledHeaderHeight.toString());
    headerBg.setAttribute('fill', '#ffffff');
    headerGroup.appendChild(headerBg);
    
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', (scaledWidth / 2).toString());
    titleText.setAttribute('y', (scaledHeaderHeight * 0.4).toString());
    titleText.setAttribute('font-size', '16');
    titleText.setAttribute('font-weight', 'bold');
    titleText.setAttribute('fill', '#333333');
    titleText.setAttribute('font-family', 'Arial, sans-serif');
    titleText.setAttribute('text-anchor', 'middle');
    titleText.textContent = title;
    headerGroup.appendChild(titleText);
    
    const timeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    timeText.setAttribute('x', (scaledWidth / 2).toString());
    timeText.setAttribute('y', (scaledHeaderHeight * 0.8).toString());
    timeText.setAttribute('font-size', '11');
    timeText.setAttribute('font-style', 'italic');
    timeText.setAttribute('fill', '#6b7280');
    timeText.setAttribute('font-family', 'Arial, sans-serif');
    timeText.setAttribute('text-anchor', 'middle');
    timeText.textContent = getExportTimestamp();
    headerGroup.appendChild(timeText);

    newSvg.appendChild(headerGroup);

    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(0, ${scaledHeaderHeight})`);
    while (clonedSvg.firstChild) {
      chartGroup.appendChild(clonedSvg.firstChild);
    }
    newSvg.appendChild(chartGroup);

    const serializer = new XMLSerializer();
    finalSvgString = serializer.serializeToString(newSvg);
  } else {
    // Serialize SVG to string directly
    const serializer = new XMLSerializer();
    finalSvgString = serializer.serializeToString(clonedSvg);
  }
  
  // Create blob and download
  const blob = new Blob([finalSvgString], { type: 'image/svg+xml;charset=utf-8' });
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

// Additional export functions for compatibility
export const exportChartCardAsPNG = exportChartAsPNG;
export const exportChartCardAsSVG = exportChartAsSVG;

/**
 * Export the entire page/element as PNG image (full page screenshot)
 * Uses html2canvas-pro which supports modern CSS color functions including oklch()
 */
export const exportPageAsPNG = async (
  filename: string = "page-export",
  elementId?: string
): Promise<void> => {
  try {
    // Get the element to export
    const sourceElement = elementId ? document.getElementById(elementId) : document.documentElement;
    
    if (!sourceElement) {
      console.error(`Element not found for export`);
      return;
    }

    // Wait for any images to load
    const images = sourceElement.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) resolve(null);
        else {
          img.onload = () => resolve(null);
          img.onerror = () => resolve(null);
        }
      });
    }));
    
    // Configure html2canvas-pro options for best quality and oklch support
    const canvas = await html2canvas(sourceElement, {
      backgroundColor: '#ffffff',
      scale: 2, // High DPI for crisp images
      logging: false,
      allowTaint: true,
      useCORS: true,
      imageTimeout: 10000,
      width: sourceElement.scrollWidth,
      height: sourceElement.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      // html2canvas-pro specific options
      imageSmoothing: true, // Better image quality
    });
    
    // Convert canvas to blob and download
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        downloadBlob(blob, `${filename}.png`);
      } else {
        console.error('Failed to generate image blob');
      }
    }, 'image/png', 1.0);
    
  } catch (error) {
    console.error('Error exporting page:', error);
    
    // Show user-friendly error message with alternatives
    alert(`Page export failed: ${error instanceof Error ? error.message : 'Unknown error'}

Recommended alternatives:
• Export individual charts using the chart export buttons
• Use browser Print (Ctrl+P) → Save as PDF
• Use browser screenshot tools (Print Screen)

If the issue persists, please try refreshing the page and trying again.`);
  }
};
