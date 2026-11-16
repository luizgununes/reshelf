import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type FolderSettings, saveFolderSettings } from '@/lib/settings';
import { addDurations, videoTargets } from '@/lib/videos';
import type { BookmarkNode } from '@/lib/bookmarks';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { durationsStatus } from './messages';
import { Recorder } from '@/lib/journal';
import { SESSION_SOURCE } from './hooks';
import { sortFolder } from '@/lib/sort';
import { useI18n } from '@/lib/i18n';
import { Zap } from 'lucide-react';
import { useTask } from './task';

type AutomaticPopoverProps = { folder: BookmarkNode; settings: FolderSettings };

export function AutomaticPopover({ folder, settings }: AutomaticPopoverProps) {
  const { t } = useI18n();
  const { busy, run } = useTask();
  const folderId = folder.id;

  const toggleDuration = async (checked: boolean) => {
    await saveFolderSettings(folderId, { autoDuration: checked });
    const targets = videoTargets(folder);
    if (!checked || busy || targets.length === 0) return;
    await run(async (progress) => {
      progress(t.addingDurations(0, targets.length));
      const result = await addDurations(targets, new Recorder(SESSION_SOURCE), (done) =>
        progress(t.addingDurations(done, targets.length)),
      );
      return durationsStatus(t, result);
    });
  };

  const toggleSort = async (checked: boolean) => {
    await saveFolderSettings(folderId, { autoSort: checked });
    if (!checked || busy) return;
    await run(async () => {
      const moved = await sortFolder(folderId, settings.sort, new Recorder(SESSION_SOURCE));
      return moved === 0 ? t.alreadySorted : t.sorted(moved);
    });
  };
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
              onCheckedChange={toggleDuration}
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
              onCheckedChange={toggleSort}
            />
          </Field>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
}
