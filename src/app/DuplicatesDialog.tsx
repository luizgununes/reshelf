import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { type BookmarkNode, type FlatBookmark, faviconUrl } from '@/lib/bookmarks';
import { CopyX, ExternalLink, Trash2, X } from 'lucide-react';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Checkbox } from '@/components/ui/checkbox';
import { findDuplicates } from '@/lib/duplicates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recorder } from '@/lib/journal';
import { SESSION_SOURCE } from './hooks';
import { useI18n } from '@/lib/i18n';
import { useState } from 'react';
import { useTask } from './task';

export function DuplicatesDialog({ roots }: { roots: BookmarkNode[] }) {
  const { t } = useI18n();
  const { busy, run } = useTask();
  const [open, setOpen] = useState(false);
  const [kept, setKept] = useState<Set<string>>(new Set());
  const groups = open ? findDuplicates(roots) : [];
  const toRemove = groups.flatMap((group) => group.remove).filter(({ node }) => !kept.has(node.id));

  const changeOpen = (value: boolean) => {
    setOpen(value);
    if (value) setKept(new Set());
  };

  const toggle = (id: string, remove: boolean) =>
    setKept((current) => {
      const next = new Set(current);
      if (remove) next.delete(id);
      else next.add(id);
      return next;
    });

  const removeAll = async () => {
    setOpen(false);
    await run(async () => {
      const recorder = new Recorder(SESSION_SOURCE);
      let removed = 0;
      for (const { node } of toRemove) if (await recorder.remove(node.id)) removed++;
      return t.duplicatesRemoved(removed);
    });
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <SidebarMenuButton disabled={busy}>
          <CopyX />
          {t.findDuplicates}
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.duplicatesTitle}</DialogTitle>
          <DialogDescription>{t.duplicatesDescription}</DialogDescription>
        </DialogHeader>
        {groups.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t.noDuplicates}</p>
        ) : (
          <div className="-mx-4 max-h-[60vh] overflow-y-auto px-4">
            <ul className="flex flex-col gap-4">
              {groups.map((group) => (
                <li key={group.key} className="flex flex-col gap-1 rounded-lg border p-2">
                  <DuplicateRow entry={group.keep} />
                  {group.remove.map((entry) => (
                    <DuplicateRow
                      key={entry.node.id}
                      entry={entry}
                      checked={!kept.has(entry.node.id)}
                      onCheckedChange={(checked) => toggle(entry.node.id, checked)}
                    />
                  ))}
                </li>
              ))}
            </ul>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              <X />
              {t.cancel}
            </Button>
          </DialogClose>
          {toRemove.length > 0 && (
            <Button variant="destructive" disabled={busy} onClick={removeAll}>
              <Trash2 />
              {t.removeDuplicates(toRemove.length)}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type DuplicateRowProps = {
  entry: FlatBookmark;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

function DuplicateRow({ entry, checked, onCheckedChange }: DuplicateRowProps) {
  const { t } = useI18n();
  const removable = onCheckedChange !== undefined;
  const removing = removable && checked;

  return (
    <div className="flex min-w-0 items-center gap-3">
      {removable ? (
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          aria-label={t.removeThisCopy}
        />
      ) : (
        <span className="size-4 shrink-0" />
      )}
      <Badge variant={removing ? 'destructive' : 'secondary'} className="w-20 shrink-0 justify-center">
        {removing ? t.removes : t.keeps}
      </Badge>
      <a
        href={entry.node.url}
        target="_blank"
        rel="noreferrer"
        className="group/link flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 transition-colors hover:bg-muted"
      >
        <img src={faviconUrl(entry.node.url!)} alt="" className="size-4 shrink-0" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="truncate group-hover/link:underline">{entry.node.title || entry.node.url}</p>
          <p className="truncate text-xs text-muted-foreground">{entry.node.url}</p>
          <p className="truncate text-xs text-muted-foreground">
            {entry.path.map((part) => part || t.untitledFolder).join(' / ')}
          </p>
        </div>
        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/link:opacity-100" />
      </a>
    </div>
  );
}
