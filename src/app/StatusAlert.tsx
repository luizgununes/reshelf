import { CircleAlert, CircleCheck, LoaderCircle, X } from 'lucide-react';
import { Alert, AlertAction, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useTask } from './task';

export function StatusAlert() {
  const { t } = useI18n();
  const { busy, status, clear } = useTask();

  if (!status) return null;

  const error = status.tone === 'error';
  const Icon = busy ? LoaderCircle : error ? CircleAlert : CircleCheck;

  return (
    <Alert role="status" variant={error ? 'destructive' : 'default'} className={busy ? undefined : 'pr-12'}>
      <Icon className={busy ? 'animate-spin' : undefined} />
      <AlertTitle className="font-normal">{status.text}</AlertTitle>
      {!busy && (
        <AlertAction className="top-1/2 -translate-y-1/2">
          <Button size="icon-xs" variant="ghost" onClick={clear} aria-label={t.dismiss} title={t.dismiss}>
            <X />
          </Button>
        </AlertAction>
      )}
    </Alert>
  );
}
