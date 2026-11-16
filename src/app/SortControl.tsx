import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type FolderSettings, saveFolderSettings, type SortDirection, type SortKey } from '@/lib/settings';
import { ButtonGroup } from '@/components/ui/button-group';
import { ArrowDownUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BookmarkNode } from '@/lib/bookmarks';
import { Recorder } from '@/lib/journal';
import { sortFolder } from '@/lib/sort';
import { useI18n } from '@/lib/i18n';
import { SESSION_SOURCE } from './hooks';
import { useTask } from './task';

const SORT_KEYS: SortKey[] = ['duration', 'title', 'length'];
const DIRECTIONS: SortDirection[] = ['asc', 'desc'];

export function SortControl({ folder, settings }: { folder: BookmarkNode; settings: FolderSettings }) {
  const { t } = useI18n();
  const { busy, run } = useTask();
  const { sort } = settings;
  const bookmarkCount = (folder.children ?? []).filter((child) => child.url).length;

  const updateSort = (patch: Partial<FolderSettings['sort']>) =>
    saveFolderSettings(folder.id, { sort: { ...sort, ...patch } });

  const sortNow = () =>
    run(async () => {
      const moved = await sortFolder(folder.id, sort, new Recorder(SESSION_SOURCE));
      return moved === 0 ? t.alreadySorted : t.sorted(moved);
    });

  return (
    <ButtonGroup>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="font-normal text-muted-foreground">
            {t.sortKeys[sort.key]} · {t.sortDirection(sort.key, sort.direction)}
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t.sortBy}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sort.key} onValueChange={(key) => updateSort({ key: key as SortKey })}>
              {SORT_KEYS.map((key) => (
                <DropdownMenuRadioItem key={key} value={key}>
                  {t.sortKeys[key]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t.order}</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={sort.direction}
              onValueChange={(direction) => updateSort({ direction: direction as SortDirection })}
            >
              {DIRECTIONS.map((direction) => (
                <DropdownMenuRadioItem key={direction} value={direction}>
                  {t.sortDirection(sort.key, direction)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" size="sm" disabled={busy || bookmarkCount < 2} onClick={sortNow}>
        <ArrowDownUp />
        {t.sortNow}
      </Button>
    </ButtonGroup>
  );
}
