export const hexToHsl = (hex: string) => {
  let r = 0, g = 0, b = 0;
  // Handle 3-digit hex
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

export const getColorCategory = (hexColor: string) => {
  const hsl = hexToHsl(hexColor);
  const hue = hsl.h;
  const saturation = hsl.s;
  const lightness = hsl.l;

  // Define broad ranges for red and yellow hues
  // Red: 0-20 and 330-360
  // Yellow: 40-80

  // Consider saturation and lightness to avoid gray/white/black being categorized
  if (saturation > 20 && lightness > 20 && lightness < 80) { // Avoid very desaturated or very light/dark colors
    if ((hue >= 0 && hue <= 20) || (hue >= 330 && hue <= 360)) {
      return 'red';
    }
    if (hue >= 40 && hue <= 80) {
      return 'yellow';
    }
  }
  return 'other';
};

export const formatDateTimeForAPI = (date: Date | undefined, endOfDay: boolean = false): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  let hours = date.getHours().toString().padStart(2, '0');
  let minutes = date.getMinutes().toString().padStart(2, '0');
  let seconds = date.getSeconds().toString().padStart(2, '0');

  if (endOfDay) {
    hours = '23';
    minutes = '59';
    seconds = '59';
  }

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};