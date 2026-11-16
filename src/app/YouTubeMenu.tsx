import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { addDurations, checkVideos, countWithDuration, removeDurations, videoTargets } from '@/lib/videos';
import { ChevronDown, Clock, ListVideo, ScanSearch, TimerOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BookmarkNode } from '@/lib/bookmarks';
import { Recorder } from '@/lib/journal';
import { useI18n } from '@/lib/i18n';
import { SESSION_SOURCE } from './hooks';
import { useTask } from './task';

type YouTubeMenuProps = {
  folder: BookmarkNode;
  unavailable: Set<string>;
  onUnavailableChange: (ids: Set<string>) => void;
};

export function YouTubeMenu({ folder, unavailable, onUnavailableChange }: YouTubeMenuProps) {
  const { t } = useI18n();
  const { busy, run } = useTask();
  const targets = videoTargets(folder);
  const withDuration = countWithDuration(folder);

  const add = () =>
    run(async (progress) => {
      progress(t.addingDurations(0, targets.length));
      const result = await addDurations(targets, new Recorder(SESSION_SOURCE), (done) =>
        progress(t.addingDurations(done, targets.length)),
      );
      if (result.unavailable.length > 0) onUnavailableChange(new Set([...unavailable, ...result.unavailable]));
      const parts = [t.durationsUpdated(result.updated)];
      if (result.failed > 0) parts.push(t.durationsFailed(result.failed));
      return { text: parts.join(' · '), tone: result.failed > 0 ? 'error' : 'muted' };
    });

  const strip = () =>
    run(async () => t.durationsRemoved(await removeDurations(folder, new Recorder(SESSION_SOURCE))));

  const check = () =>
    run(async (progress) => {
      progress(t.checkingVideos(0, targets.length));
      const result = await checkVideos(targets, (done) => progress(t.checkingVideos(done, targets.length)));
      onUnavailableChange(new Set(result.unavailable));
      const unknown = result.unknown > 0 ? t.unknownVideos(result.unknown) : null;
      if (result.unavailable.length > 0) return unknown ? unknown.charAt(0).toUpperCase() + unknown.slice(1) : undefined;
      return unknown ? `${t.allAvailable} · ${unknown}` : t.allAvailable;
    });

  const removeUnavailable = () =>
    run(async () => {
      const recorder = new Recorder(SESSION_SOURCE);
      let removed = 0;
      for (const id of unavailable) if (await recorder.remove(id)) removed++;
      onUnavailableChange(new Set());
      return t.unavailableRemoved(removed);
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={busy || targets.length === 0} title={targets.length === 0 ? t.noYoutubeVideos : undefined}>
          <ListVideo />
          {t.youtube}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={add}>
            <Clock />
            {t.addDurations}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={strip} disabled={withDuration === 0}>
            <TimerOff />
            {t.removeDurations}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={check}>
            <ScanSearch />
            {t.checkVideos}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {unavailable.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onSelect={removeUnavailable}>
                <Trash2 />
                {t.removeUnavailable(unavailable.size)}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
