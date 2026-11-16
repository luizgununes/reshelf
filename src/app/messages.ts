import type { DurationResult } from '@/lib/videos';
import type { useI18n } from '@/lib/i18n';
import type { TaskStatus } from './task';

type Messages = ReturnType<typeof useI18n>['t'];

export function durationsStatus(t: Messages, result: DurationResult): TaskStatus {
  const parts = [t.durationsUpdated(result.updated)];
  if (result.noDuration > 0) parts.push(t.durationsNoLength(result.noDuration));
  if (result.failed > 0) parts.push(t.durationsFailed(result.failed));
  if (result.slowed) parts.push(t.slowedDown);
  return { text: parts.join(' · '), tone: result.failed > 0 ? 'error' : 'muted' };
}

export function withSlowNote(t: Messages, text: string, slowed: boolean) {
  return slowed ? `${text} · ${t.slowingDown}` : text;
}
