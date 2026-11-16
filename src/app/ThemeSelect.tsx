import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { readThemePreference, setThemePreference, type ThemePreference } from './theme';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useState } from 'react';

const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;
const OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];

export function ThemeSelect() {
  const { t } = useI18n();
  const [preference, setPreference] = useState(readThemePreference);
  const Icon = ICONS[preference];
  const labels: Record<ThemePreference, string> = { system: t.themeSystem, light: t.themeLight, dark: t.themeDark };

  return (
    <label className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">{t.theme}</span>
      <NativeSelect
        size="sm"
        className="w-full"
        value={preference}
        onChange={(event) => {
          const next = event.target.value as ThemePreference;
          setThemePreference(next);
          setPreference(next);
        }}
      >
        {OPTIONS.map((option) => (
          <NativeSelectOption key={option} value={option}>
            {labels[option]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
  );
}
