'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

// Function to convert HSL string "h s% l%" to hex
const hslStringToHex = (hslStr: string): string => {
  if (!hslStr || typeof hslStr !== 'string') return '#000000';
  const parts = hslStr.split(' ');
  if (parts.length !== 3) return '#000000';
  
  const h = parseInt(parts[0], 10);
  const s = parseInt(parts[1], 10);
  const l = parseInt(parts[2], 10);

  if (isNaN(h) || isNaN(s) || isNaN(l)) return '#000000';


  const sNorm = s / 100;
  const lNorm = l / 100;
  
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};


// Function to convert hex to HSL string "h s% l%"
const hexToHslString = (hex: string): string => {
  let r = 0, g = 0, b = 0;
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
  let h = 0, s = 0;
  let l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
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

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
};


export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
    const [hexColor, setHexColor] = React.useState(hslStringToHex(color));

    const handleHexChange = (newHexColor: string) => {
        setHexColor(newHexColor);
        onChange(hexToHslString(newHexColor));
    };

    React.useEffect(() => {
        setHexColor(hslStringToHex(color));
    }, [color]);

  const colorPalette = [
    '51 100% 50%',   // Default Primary (Yellow)
    '339 100% 63%',  // Default Accent (Pink)
    '210 40% 98%',   // Slate
    '0 84% 60%',     // Red
    '142 76% 36%',   // Green
    '221 83% 53%',   // Blue
    '48 96% 53%',    // Orange
    '262 84% 58%',   // Violet
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !color && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex w-full items-center gap-2">
            {color ? (
              <div
                className="h-4 w-4 rounded !bg-center !bg-cover transition-all"
                style={{ background: `hsl(${color})` }}
              />
            ) : (
              <div className="h-4 w-4 rounded border" />
            )}
            <div className="flex-1 truncate">{color ? `hsl(${color})` : 'Pick a color'}</div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <HexColorPicker color={hexColor} onChange={handleHexChange} />

        <div className="mt-4 grid grid-cols-4 gap-2">
          {colorPalette.map((paletteColor) => (
            <Button
              key={paletteColor}
              variant={'outline'}
              size="icon"
              className="h-8 w-8"
              onClick={() => onChange(paletteColor)}
            >
              <div
                className={cn(
                  'h-5 w-5 rounded-sm border',
                  color === paletteColor && 'ring-2 ring-ring ring-offset-2'
                )}
                style={{ backgroundColor: `hsl(${paletteColor})` }}
              />
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
