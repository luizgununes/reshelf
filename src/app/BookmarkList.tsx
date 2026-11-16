import { type BookmarkNode, countBookmarks, displayHost, faviconUrl, isFolder } from '@/lib/bookmarks';
import { ChevronRight, Folder, GripVertical, Pencil } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TitleInput } from './TitleInput';
import { Recorder } from '@/lib/journal';
import { SESSION_SOURCE } from './hooks';
import { useI18n } from '@/lib/i18n';
import { useState } from 'react';

export type ListEntry = { node: BookmarkNode; path?: string[] };

type DropEdge = 'before' | 'after';

type RowDrag = {
  enabled: boolean;
  edge?: DropEdge;
  handlers: Pick<
    React.HTMLAttributes<HTMLLIElement>,
    'onDragStart' | 'onDragOver' | 'onDragLeave' | 'onDrop' | 'onDragEnd'
  >;
};

type BookmarkListProps = {
  entries: ListEntry[];
  onReorder?: (id: string, insertIndex: number) => void;
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
  onReorder,
}: BookmarkListProps) {
  const { t } = useI18n();
  const someSelected = !allSelected && entries.some(({ node }) => selected.has(node.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [drop, setDrop] = useState<{ index: number; edge: DropEdge } | null>(null);

  const dragFor = (id: string, index: number): RowDrag => ({
    enabled: onReorder !== undefined,
    edge: drop?.index === index && draggingId !== id ? drop.edge : undefined,
    handlers: onReorder
      ? {
          onDragStart: (event) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', id);
            setDraggingId(id);
          },
          onDragOver: (event) => {
            if (!draggingId) return;
            event.preventDefault();
            const box = event.currentTarget.getBoundingClientRect();
            const edge: DropEdge = event.clientY < box.top + box.height / 2 ? 'before' : 'after';
            if (drop?.index !== index || drop.edge !== edge) setDrop({ index, edge });
          },
          onDrop: (event) => {
            event.preventDefault();
            if (draggingId && drop) onReorder(draggingId, drop.edge === 'before' ? drop.index : drop.index + 1);
            setDraggingId(null);
            setDrop(null);
          },
          onDragEnd: () => {
            setDraggingId(null);
            setDrop(null);
          },
        }
      : {},
  });

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
        {entries.map(({ node, path }, index) =>
          isFolder(node) ? (
            <FolderRow key={node.id} folder={node} onOpen={onOpenFolder} drag={dragFor(node.id, index)} />
          ) : (
            <BookmarkRow
              key={node.id}
              node={node}
              path={path}
              drag={dragFor(node.id, index)}
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
  drag: RowDrag;
  onToggle: (id: string, checked: boolean, range: boolean) => void;
};

const ROW_CLASS =
  'group/row flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50 data-[drop=after]:shadow-[inset_0_-2px_0_0_var(--color-primary)] data-[drop=before]:shadow-[inset_0_2px_0_0_var(--color-primary)]';

function DragHandle({ drag }: { drag: RowDrag }) {
  if (!drag.enabled) return null;
  return (
    <GripVertical className="-mr-1 -ml-2 size-4 shrink-0 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100" />
  );
}

function BookmarkRow({ node, path, checked, unavailable, drag, onToggle }: BookmarkRowProps) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const title = node.title || node.url!;
  const host = displayHost(node.url!);
  const folderPath = path?.map((part) => part || t.untitledFolder).join(' / ');

  const save = (value: string) => new Recorder(SESSION_SOURCE).updateTitle(node.id, value);

  return (
    <li
      data-selected={checked}
      data-drop={drag.edge}
      draggable={drag.enabled && !editing}
      {...drag.handlers}
      onDoubleClick={(event) => {
        if ((event.target as HTMLElement).closest('a, button, input')) return;
        setEditing(true);
      }}
      className={`${ROW_CLASS} data-[selected=true]:bg-muted`}
    >
      <DragHandle drag={drag} />
      <Checkbox
        checked={checked}
        onClick={(event) => {
          event.preventDefault();
          onToggle(node.id, !checked, event.shiftKey);
        }}
        aria-label={t.selectBookmark(title)}
      />
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
        <img src={faviconUrl(node.url!)} alt="" draggable={false} className="size-4" />
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
            draggable={false}
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

type FolderRowProps = { folder: BookmarkNode; drag: RowDrag; onOpen: (id: string) => void };

function FolderRow({ folder, drag, onOpen }: FolderRowProps) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const name = folder.title || t.untitledFolder;

  return (
    <li
      data-drop={drag.edge}
      draggable={drag.enabled && !editing}
      {...drag.handlers}
      onDoubleClick={() => setEditing(true)}
      className={ROW_CLASS}
    >
      <DragHandle drag={drag} />
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
