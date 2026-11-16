import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import { useI18n } from '@/lib/i18n';

export type TaskStatus = { text: string; tone: 'muted' | 'error' };

type Progress = (text: string) => void;
type TaskResult = string | TaskStatus | void;

type TaskContextValue = {
  busy: boolean;
  status: TaskStatus | null;
  run: (task: (progress: Progress) => Promise<TaskResult>) => Promise<void>;
  clear: () => void;
};

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<TaskStatus | null>(null);

  const run = useCallback<TaskContextValue['run']>(
    async (task) => {
      setBusy(true);
      setStatus(null);
      try {
        const result = await task((text) => setStatus({ text, tone: 'muted' }));
        if (typeof result === 'string') setStatus({ text: result, tone: 'muted' });
        else setStatus(result ?? null);
      } catch {
        setStatus({ text: t.genericError, tone: 'error' });
      } finally {
        setBusy(false);
      }
    },
    [t],
  );

  const clear = useCallback(() => setStatus(null), []);

  return <TaskContext.Provider value={{ busy, status, run, clear }}>{children}</TaskContext.Provider>;
}

export function useTask() {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTask must be used inside TaskProvider');
  return context;
}
