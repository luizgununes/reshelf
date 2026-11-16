import {
  BOOKMARKS_BAR_ID,
  type BookmarkNode,
  countBookmarks,
  findNode,
  flattenBookmarks,
  isFolder,
  ROOT_ID,
} from '@/lib/bookmarks';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SESSION_SOURCE, useFolderSettingsMap, useJournalCounts } from './hooks';
import { Check, FolderOpen, Pencil, Search, SearchX, Undo2 } from 'lucide-react';
import { resolveFolderSettings, type SortRule } from '@/lib/settings';
import { forgetSources, Recorder, undoSource } from '@/lib/journal';
import { BookmarkList, type ListEntry } from './BookmarkList';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useBookmarkTree } from '@/lib/useBookmarkTree';
import { AutoChangesBanner } from './AutoChangesBanner';
import { UnavailableAlert } from './UnavailableAlert';
import { Separator } from '@/components/ui/separator';
import { AutomaticPopover } from './AutomaticPopover';
import { RandomPickButton } from './RandomPickButton';
import { I18nProvider, useI18n } from '@/lib/i18n';
import { SearchSortMenu } from './SearchSortMenu';
import { Button } from '@/components/ui/button';
import { TaskProvider, useTask } from './task';
import { compareBookmarks } from '@/lib/sort';
import { SelectionBar } from './SelectionBar';
import { StatusAlert } from './StatusAlert';
import { SortControl } from './SortControl';
import { YouTubeMenu } from './YouTubeMenu';
import { TitleInput } from './TitleInput';
import { FolderTree } from './FolderTree';
import { useState } from 'react';

export function App() {
  return (
    <I18nProvider>
      <TaskProvider>
        <TooltipProvider>
          <Shelf />
        </TooltipProvider>
      </TaskProvider>
    </I18nProvider>
  );
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function sortEntries(entries: ListEntry[], rule: SortRule | null) {
  return rule ? [...entries].sort((a, b) => compareBookmarks(a.node, b.node, rule)) : entries;
}

function searchEntries(roots: BookmarkNode[], query: string): ListEntry[] {
  const needle = normalize(query.trim());
  return flattenBookmarks(roots).filter(
    ({ node }) => normalize(node.title).includes(needle) || normalize(node.url ?? '').includes(needle),
  );
}

function Shelf() {
  const { t } = useI18n();
  const { busy, run, clear } = useTask();
  const roots = useBookmarkTree();
  const settingsMap = useFolderSettingsMap();
  const counts = useJournalCounts();
  const [folderId, setFolderId] = useState(BOOKMARKS_BAR_ID);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [onlyUnavailable, setOnlyUnavailable] = useState(false);
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [searchSort, setSearchSort] = useState<SortRule | null>(null);

  if (!roots) return null;

  const folder = findNode(roots, folderId) ?? roots[0];
  const settings = resolveFolderSettings(settingsMap, folder.id);
  const searching = query.trim().length > 0;
  const renamable = !searching && folder.parentId !== ROOT_ID;
  const presentUnavailable = (folder.children ?? []).filter((node) => unavailable.has(node.id));
  const filtering = !searching && onlyUnavailable && presentUnavailable.length > 0;
  const entries: ListEntry[] = searching
    ? sortEntries(searchEntries(roots, query), searchSort)
    : (filtering ? presentUnavailable : (folder.children ?? [])).map((node) => ({ node }));
  const visibleIds = new Set(entries.filter(({ node }) => !isFolder(node)).map(({ node }) => node.id));
  const selectedIds = [...selected].filter((id) => visibleIds.has(id));
  const allSelected = visibleIds.size > 0 && selectedIds.length === visibleIds.size;

  const openFolder = (id: string) => {
    setFolderId(id);
    setQuery('');
    setSelected(new Set());
    setUnavailable(new Set());
    setOnlyUnavailable(false);
    setRenaming(false);
    clear();
  };

  const orderedIds = entries.filter(({ node }) => !isFolder(node)).map(({ node }) => node.id);

  const toggle = (id: string, checked: boolean, range: boolean) => {
    const from = range && anchorId ? orderedIds.indexOf(anchorId) : -1;
    const to = orderedIds.indexOf(id);
    const ids = from === -1 || to === -1 ? [id] : orderedIds.slice(Math.min(from, to), Math.max(from, to) + 1);
    setSelected((current) => {
      const next = new Set(current);
      for (const target of ids) {
        if (checked) next.add(target);
        else next.delete(target);
      }
      return next;
    });
    setAnchorId(id);
  };

  const toggleAll = (checked: boolean) => setSelected(checked ? new Set(visibleIds) : new Set());

  const undoSession = () => run(async () => t.changesUndone(await undoSource(SESSION_SOURCE)));
  const reorder = (id: string, insertIndex: number) =>
    run(async () => {
      const from = (folder.children ?? []).findIndex((node) => node.id === id);
      if (from === -1 || insertIndex === from || insertIndex === from + 1) return;
      await new Recorder(SESSION_SOURCE).move(id, { parentId: folder.id, index: insertIndex });
    });

  const keepSession = () => forgetSources((source) => source === SESSION_SOURCE);

  return (
    <SidebarProvider>
      <FolderTree roots={roots} selectedId={searching ? '' : folder.id} onSelect={openFolder} />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
          <InputGroup className="max-w-md">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelected(new Set());
              }}
            />
          </InputGroup>
          {counts.session > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={busy} onClick={undoSession} title={t.undoSessionHint}>
                <Undo2 />
                {t.undoSession(counts.session)}
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={keepSession} title={t.keepSessionHint}>
                <Check />
                {t.keepAuto}
              </Button>
            </div>
          )}
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-6 pt-6 pb-28">
          {counts.auto > 0 && <AutoChangesBanner count={counts.auto} />}

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              {renaming ? (
                <TitleInput
                  value={folder.title}
                  label={t.renameFolder}
                  className="h-9 text-2xl font-semibold tracking-tight md:text-2xl"
                  onDone={(value) => {
                    setRenaming(false);
                    if (value) void new Recorder(SESSION_SOURCE).updateTitle(folder.id, value);
                  }}
                />
              ) : (
                <div className="group/title flex items-center gap-1">
                  <h1
                    className="truncate text-2xl font-semibold tracking-tight"
                    onDoubleClick={() => renamable && setRenaming(true)}
                  >
                    {searching ? t.searchResults(entries.length) : folder.title || t.untitledFolder}
                  </h1>
                  {renamable && (
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      className="opacity-0 transition-opacity group-hover/title:opacity-100 focus-visible:opacity-100"
                      onClick={() => setRenaming(true)}
                      aria-label={t.renameFolder}
                      title={t.renameFolder}
                    >
                      <Pencil />
                    </Button>
                  )}
                </div>
              )}
              {!searching && (
                <p className="mt-1 text-sm text-muted-foreground">{t.bookmarkCount(countBookmarks(folder))}</p>
              )}
            </div>
            {searching && entries.length > 1 && <SearchSortMenu rule={searchSort} onChange={setSearchSort} />}
            {!searching && (
              <div className="flex flex-wrap items-center gap-2">
                <SortControl folder={folder} settings={settings} />
                <YouTubeMenu folder={folder} unavailable={unavailable} onUnavailableChange={setUnavailable} />
                <RandomPickButton folder={folder} unavailable={unavailable} />
                <AutomaticPopover folder={folder} settings={settings} />
              </div>
            )}
          </div>

          {!searching && presentUnavailable.length > 0 && (
            <UnavailableAlert
              count={presentUnavailable.length}
              filtering={filtering}
              onFilterChange={(value) => {
                setOnlyUnavailable(value);
                setSelected(new Set());
              }}
            />
          )}

          <StatusAlert />

          {entries.length === 0 ? (
            <Empty className="flex-1 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">{searching ? <SearchX /> : <FolderOpen />}</EmptyMedia>
                <EmptyTitle>{searching ? t.noResultsTitle : t.emptyTitle}</EmptyTitle>
                <EmptyDescription>
                  {searching ? t.noResultsDescription(query.trim()) : t.emptyDescription}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <BookmarkList
              entries={entries}
              selected={selected}
              unavailable={unavailable}
              allSelected={allSelected}
              bookmarkCount={visibleIds.size}
              onToggle={toggle}
              onToggleAll={toggleAll}
              onOpenFolder={openFolder}
              onReorder={searching || filtering ? undefined : reorder}
            />
          )}
        </main>

        {selectedIds.length > 0 && (
          <SelectionBar
            roots={roots}
            selected={selectedIds}
            currentFolderId={searching ? null : folder.id}
            onClear={() => setSelected(new Set())}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
