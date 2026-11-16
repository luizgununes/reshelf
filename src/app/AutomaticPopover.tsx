import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type FolderSettings, saveFolderSettings } from '@/lib/settings';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import { Zap } from 'lucide-react';

type AutomaticPopoverProps = { folderId: string; settings: FolderSettings };

export function AutomaticPopover({ folderId, settings }: AutomaticPopoverProps) {
  const { t } = useI18n();
  const enabled = settings.autoDuration || settings.autoSort;
  const rule = `${t.sortKeys[settings.sort.key]} · ${t.sortDirection(settings.sort.key, settings.sort.direction)}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <Zap />
          {t.automatic}
          {enabled && <Badge variant="secondary">{t.automaticOn}</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <FieldGroup>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="auto-duration">{t.autoDurationLabel}</FieldLabel>
              <FieldDescription>{t.autoDurationDescription}</FieldDescription>
            </FieldContent>
            <Switch
              id="auto-duration"
              checked={settings.autoDuration}
              onCheckedChange={(checked) => saveFolderSettings(folderId, { autoDuration: checked })}
            />
          </Field>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="auto-sort">{t.autoSortLabel}</FieldLabel>
              <FieldDescription>{t.autoSortDescription(rule)}</FieldDescription>
            </FieldContent>
            <Switch
              id="auto-sort"
              checked={settings.autoSort}
              onCheckedChange={(checked) => saveFolderSettings(folderId, { autoSort: checked })}
            />
          </Field>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
}
