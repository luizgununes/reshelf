import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

type UnavailableAlertProps = {
  count: number;
  filtering: boolean;
  onFilterChange: (filtering: boolean) => void;
};

export function UnavailableAlert({ count, filtering, onFilterChange }: UnavailableAlertProps) {
  const { t } = useI18n();

  if (filtering) {
    return (
      <Alert variant="destructive" className="pr-40">
        <TriangleAlert />
        <AlertTitle>{t.unavailableTitle(count)}</AlertTitle>
        <AlertDescription>{t.unavailableShowingOnly}</AlertDescription>
        <AlertAction className="top-1/2 -translate-y-1/2">
          <Button size="sm" variant="outline" onClick={() => onFilterChange(false)}>
            <X />
            {t.showAll}
          </Button>
        </AlertAction>
      </Alert>
    );
  }

  return (
    <button type="button" onClick={() => onFilterChange(true)} className="block w-full rounded-lg text-left">
      <Alert variant="destructive" className="transition-colors hover:bg-destructive/5">
        <TriangleAlert />
        <AlertTitle>{t.unavailableTitle(count)}</AlertTitle>
        <AlertDescription>{t.unavailableShowOnly}</AlertDescription>
      </Alert>
    </button>
  );
}
