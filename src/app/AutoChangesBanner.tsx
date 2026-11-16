import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AUTO_SOURCE, forgetSources, undoSource } from '@/lib/journal';
import { Check, Undo2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useTask } from './task';

export function AutoChangesBanner({ count }: { count: number }) {
  const { t } = useI18n();
  const { busy, run } = useTask();

  const undo = () => run(async () => t.changesUndone(await undoSource(AUTO_SOURCE)));
  const keep = () => forgetSources((source) => source === AUTO_SOURCE);

  return (
    <Alert className="pr-56">
      <Zap />
      <AlertTitle>{t.autoChanges(count)}</AlertTitle>
      <AlertDescription>{t.autoChangesHint}</AlertDescription>
      <AlertAction className="top-1/2 flex -translate-y-1/2 gap-2">
        <Button size="sm" variant="outline" disabled={busy} onClick={undo}>
          <Undo2 />
          {t.undoAuto}
        </Button>
        <Button size="sm" variant="ghost" disabled={busy} onClick={keep}>
          <Check />
          {t.keepAuto}
        </Button>
      </AlertAction>
    </Alert>
  );
}
