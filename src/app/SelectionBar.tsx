import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { type BookmarkNode, flattenFolders } from '@/lib/bookmarks';
import { FolderInput, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Recorder } from '@/lib/journal';
import { useI18n } from '@/lib/i18n';
import { SESSION_SOURCE } from './hooks';
import { useState } from 'react';
import { useTask } from './task';

type SelectionBarProps = {
  roots: BookmarkNode[];
  selected: string[];
  currentFolderId: string | null;
  onClear: () => void;
};

export function SelectionBar({ roots, selected, currentFolderId, onClear }: SelectionBarProps) {
  const { t } = useI18n();
  const { busy, run } = useTask();
  const folders = flattenFolders(roots).filter(({ node }) => node.id !== currentFolderId);
  const [destination, setDestination] = useState('');

  const move = () =>
    run(async () => {
      const recorder = new Recorder(SESSION_SOURCE);
      let moved = 0;
      for (const id of selected) if (await recorder.move(id, { parentId: destination })) moved++;
      setDestination('');
      onClear();
      return t.moved(moved);
    });

  const remove = () =>
    run(async () => {
      const recorder = new Recorder(SESSION_SOURCE);
      let removed = 0;
      for (const id of selected) if (await recorder.remove(id)) removed++;
      onClear();
      return t.deleted(removed);
    });

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-full flex-wrap items-center gap-2 rounded-xl border bg-popover p-2 pl-4 text-popover-foreground shadow-lg">
        <span className="text-sm font-medium tabular-nums">{t.selectedCount(selected.length)}</span>
        <span className="mx-1 h-5 w-px bg-border" />
        <NativeSelect
          size="sm"
          aria-label={t.moveTo}
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          className="max-w-64"
        >
          <NativeSelectOption value="" disabled>
          {t.chooseFolder}
        </NativeSelectOption>
        {folders.map(({ node, path }) => (
            <NativeSelectOption key={node.id} value={node.id}>
              {path.map((part) => part || t.untitledFolder).join(' / ')}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Button size="sm" variant="outline" disabled={busy || !destination} onClick={move}>
          <FolderInput />
          {t.move}
        </Button>
        <Button size="sm" variant="destructive" disabled={busy} onClick={remove}>
          <Trash2 />
          {t.deleteSelected}
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={onClear} aria-label={t.clearSelection} title={t.clearSelection}>
          <X />
        </Button>
      </div>
    </div>
  );
}
