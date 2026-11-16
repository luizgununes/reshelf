import { type BookmarkNode, countBookmarks, displayHost, faviconUrl, isFolder } from '@/lib/bookmarks';
import { durationFromTitle, formatDuration, stripDuration } from '@/lib/youtube';
import { ChevronRight, Folder } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';

export type ListEntry = { node: BookmarkNode; path?: string[] };

type BookmarkListProps = {
  entries: ListEntry[];
  selected: Set<string>;
  unavailable: Set<string>;
  allSelected: boolean;
  bookmarkCount: number;
  onToggle: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onOpenFolder: (id: string) => void;
};

export function BookmarkList({
  entries,
  selected,
  unavailable,
  allSelected,
  bookmarkCount,
  onToggle,
  onToggleAll,
  onOpenFolder,
}: BookmarkListProps) {
  const { t } = useI18n();
  const someSelected = !allSelected && entries.some(({ node }) => selected.has(node.id));

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      {bookmarkCount > 0 && (
        <label className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
          <Checkbox
            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
            onCheckedChange={(checked) => onToggleAll(checked === true)}
          />
          {t.selectAll}
        </label>
      )}
      <ul className="divide-y">
        {entries.map(({ node, path }) =>
          isFolder(node) ? (
            <li key={node.id}>
              <button
                type="button"
                onClick={() => onOpenFolder(node.id)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
              >
                <span className="size-4 shrink-0" />
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Folder className="size-4 text-muted-foreground" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{node.title || t.untitledFolder}</span>
                <span className="text-xs text-muted-foreground">{t.bookmarkCount(countBookmarks(node))}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            </li>
          ) : (
            <BookmarkRow
              key={node.id}
              node={node}
              path={path}
              checked={selected.has(node.id)}
              unavailable={unavailable.has(node.id)}
              onToggle={onToggle}
            />
          ),
        )}
      </ul>
    </div>
  );
}

type BookmarkRowProps = {
  node: BookmarkNode;
  path?: string[];
  checked: boolean;
  unavailable: boolean;
  onToggle: (id: string, checked: boolean) => void;
};

function BookmarkRow({ node, path, checked, unavailable, onToggle }: BookmarkRowProps) {
  const { t } = useI18n();
  const seconds = durationFromTitle(node.title);
  const title = stripDuration(node.title) || node.url!;
  const host = displayHost(node.url!);
  const folderPath = path?.map((part) => part || t.untitledFolder).join(' / ');

  return (
    <li
      data-selected={checked}
      className="group/row flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50 data-[selected=true]:bg-muted"
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onToggle(node.id, value === true)}
        aria-label={t.selectBookmark(title)}
      />
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
        <img src={faviconUrl(node.url!)} alt="" className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <a
          href={node.url}
          target="_blank"
          rel="noreferrer"
          title={node.url}
          className="block truncate text-sm font-medium underline-offset-4 hover:underline"
        >
          {title}
        </a>
        <p className="truncate text-xs text-muted-foreground">{folderPath ? `${folderPath} · ${host}` : host}</p>
      </div>
      {unavailable && <Badge variant="destructive">{t.unavailableBadge}</Badge>}
      {seconds !== null && (
        <Badge variant="secondary" className="font-mono tabular-nums">
          {formatDuration(seconds)}
        </Badge>
      )}
    </li>
  );
}
