import { Input } from '@/components/ui/input';
import { cn } from 'cn';

type TitleInputProps = {
  value: string;
  label: string;
  className?: string;
  onDone: (value: string | null) => void;
};

export function TitleInput({ value, label, className, onDone }: TitleInputProps) {
  return (
    <Input
      autoFocus
      defaultValue={value}
      aria-label={label}
      className={cn('h-7 text-sm font-medium', className)}
      onFocus={(event) => event.currentTarget.select()}
      onBlur={(event) => {
        const trimmed = event.currentTarget.value.trim();
        onDone(trimmed && trimmed !== value ? trimmed : null);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
        if (event.key === 'Escape') {
          event.currentTarget.value = value;
          event.currentTarget.blur();
        }
      }}
    />
  );
}
