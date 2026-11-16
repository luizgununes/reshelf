import type { BookmarkNode } from './bookmarks';
import { useEffect, useState } from 'react';

const events = [
  chrome.bookmarks.onCreated,
  chrome.bookmarks.onRemoved,
  chrome.bookmarks.onChanged,
  chrome.bookmarks.onMoved,
  chrome.bookmarks.onChildrenReordered,
  chrome.bookmarks.onImportEnded,
] as const;

export function useBookmarkTree() {
  const [roots, setRoots] = useState<BookmarkNode[] | null>(null);

  useEffect(() => {
    let active = true;
    let scheduled = false;
    const load = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        chrome.bookmarks.getTree().then(([root]) => {
          if (active) setRoots(root.children ?? []);
        });
      });
    };

    load();
    events.forEach((event) => event.addListener(load));
    return () => {
      active = false;
      events.forEach((event) => event.removeListener(load));
    };
  }, []);

  return roots;
}
