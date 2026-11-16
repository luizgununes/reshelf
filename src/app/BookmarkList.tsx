import { type BookmarkNode, countBookmarks, displayHost, faviconUrl, isFolder } from '@/lib/bookmarks';
import { ChevronRight, Folder, Pencil } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TitleInput } from './TitleInput';
import { Recorder } from '@/lib/journal';
import { SESSION_SOURCE } from './hooks';
import { useI18n } from '@/lib/i18n';
import { useState } from 'react';

export type ListEntry = { node: BookmarkNode; path?: string[] };

type BookmarkListProps = {
  entries: ListEntry[];
  selected: Set<string>;
  unavailable: Set<string>;
  allSelected: boolean;
  bookmarkCount: number;
  onToggle: (id: string, checked: boolean, range: boolean) => void;
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
            <FolderRow key={node.id} folder={node} onOpen={onOpenFolder} />
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
  onToggle: (id: string, checked: boolean, range: boolean) => void;
};

function BookmarkRow({ node, path, checked, unavailable, onToggle }: BookmarkRowProps) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const title = node.title || node.url!;
  const host = displayHost(node.url!);
  const folderPath = path?.map((part) => part || t.untitledFolder).join(' / ');

  const save = (value: string) => new Recorder(SESSION_SOURCE).updateTitle(node.id, value);

  return (
    <li
      data-selected={checked}
      onDoubleClick={(event) => {
        if ((event.target as HTMLElement).closest('a, button, input')) return;
        setEditing(true);
      }}
      className="group/row flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50 data-[selected=true]:bg-muted"
    >
      <Checkbox
        checked={checked}
        onClick={(event) => {
          event.preventDefault();
          onToggle(node.id, !checked, event.shiftKey);
        }}
        aria-label={t.selectBookmark(title)}
      />
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
        <img src={faviconUrl(node.url!)} alt="" className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        {editing ? (
          <TitleInput
            value={title}
            label={t.editTitle}
            onDone={(value) => {
              setEditing(false);
              if (value) void save(value);
            }}
          />
        ) : (
          <a
            href={node.url}
            target="_blank"
            rel="noreferrer"
            title={node.url}
            className="inline-block max-w-full truncate align-top text-sm font-medium underline-offset-4 hover:underline"
          >
            {title}
          </a>
        )}
        <p className="truncate text-xs text-muted-foreground">{folderPath ? `${folderPath} · ${host}` : host}</p>
      </div>
      {!editing && (
        <Button
          size="icon-xs"
          variant="ghost"
          className="opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100"
          onClick={() => setEditing(true)}
          aria-label={t.editTitle}
          title={t.editTitle}
        >
          <Pencil />
        </Button>
      )}
      {unavailable && <Badge variant="destructive">{t.unavailableBadge}</Badge>}
    </li>
  );
}

function FolderRow({ folder, onOpen }: { folder: BookmarkNode; onOpen: (id: string) => void }) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const name = folder.title || t.untitledFolder;

  return (
    <li
      onDoubleClick={() => setEditing(true)}
      className="group/row flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50"
    >
      <span className="size-4 shrink-0" />
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Folder className="size-4 text-muted-foreground" />
      </span>
      {editing ? (
        <div className="min-w-0 flex-1">
          <TitleInput
            value={folder.title}
            label={t.renameFolder}
            onDone={(value) => {
              setEditing(false);
              if (value) void new Recorder(SESSION_SOURCE).updateTitle(folder.id, value);
            }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onOpen(folder.id)}
          className="min-w-0 flex-1 truncate text-left text-sm font-medium underline-offset-4 hover:underline"
        >
          {name}
        </button>
      )}
      {!editing && (
        <Button
          size="icon-xs"
          variant="ghost"
          className="opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100"
          onClick={() => setEditing(true)}
          aria-label={t.renameFolder}
          title={t.renameFolder}
        >
          <Pencil />
        </Button>
      )}
      <span className="text-xs text-muted-foreground">{t.bookmarkCount(countBookmarks(folder))}</span>
      <button
        type="button"
        onClick={() => onOpen(folder.id)}
        aria-label={name}
        className="rounded-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="size-4" />
      </button>
    </li>
  );
}
