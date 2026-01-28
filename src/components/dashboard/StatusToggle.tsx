
'use client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap, ZapOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusToggleProps {
  isOnline: boolean;
  onToggle: (isOnline: boolean) => void;
  disabled?: boolean;
}

const StatusToggle = ({ isOnline, onToggle, disabled = false }: StatusToggleProps) => {
  const labelClasses = cn(
    "flex items-center gap-2 text-primary-foreground font-semibold text-lg drop-shadow",
    disabled && "opacity-50 cursor-not-allowed"
  );
  
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="online-status-toggle" className={labelClasses}>
        {isOnline ? <Zap className="text-green-400 neon-green"/> : <ZapOff />}
        <span>{isOnline ? "Online" : "Offline"}</span>
      </Label>
      <Switch
        id="online-status-toggle"
        checked={isOnline}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-slate-500"
      />
    </div>
  );
};

export default StatusToggle;
