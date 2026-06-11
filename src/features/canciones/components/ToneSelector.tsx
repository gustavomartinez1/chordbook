'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';

const TONOS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab'];

interface ToneSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

/**
 * Selector de tonalidad para transposición.
 * Muestra los 12 tonos mayores en un dropdown oscuro.
 */
export default function ToneSelector({
  value,
  onChange,
  label = 'Tonalidad',
}: ToneSelectorProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={(v) => {
          if (v) onChange(v);
        }}
      >
        <SelectTrigger className="w-28 font-mono">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TONOS.map((tono) => (
            <SelectItem key={tono} value={tono} className="font-mono">
              {tono}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
