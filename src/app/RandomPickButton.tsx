import type { BookmarkNode } from '@/lib/bookmarks';
import { Button } from '@/components/ui/button';
import { isFolder } from '@/lib/bookmarks';
import { Shuffle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

type RandomPickButtonProps = { folder: BookmarkNode; unavailable: Set<string> };

export function RandomPickButton({ folder, unavailable }: RandomPickButtonProps) {
  const { t } = useI18n();
  const bookmarks = (folder.children ?? []).filter((child) => !isFolder(child));

  if (bookmarks.length === 0) return null;

  const pick = () => {
    const available = bookmarks.filter((bookmark) => !unavailable.has(bookmark.id));
    const pool = available.length > 0 ? available : bookmarks;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    void chrome.tabs.create({ url: chosen.url });
  };

  return (
    <Button variant="outline" size="sm" onClick={pick} title={t.randomPickHint}>
      <Shuffle />
      {t.randomPick}
    </Button>
  );
}
