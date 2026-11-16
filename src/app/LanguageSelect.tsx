import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { type Language, LANGUAGES, useI18n } from '@/lib/i18n';
import { Languages } from 'lucide-react';

export function LanguageSelect() {
  const { language, setLanguage, t } = useI18n();

  return (
    <label className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
      <Languages className="size-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">{t.language}</span>
      <NativeSelect
        size="sm"
        className="w-full"
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
      >
        {LANGUAGES.map((option) => (
          <NativeSelectOption key={option.code} value={option.code}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
  );
}
