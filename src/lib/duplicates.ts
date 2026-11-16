import { type BookmarkNode, type FlatBookmark, flattenBookmarks } from './bookmarks';
import { youtubeVideoId } from './youtube';

export type DuplicateGroup = { key: string; keep: FlatBookmark; remove: FlatBookmark[] };

function duplicateKey(url: string) {
  const videoId = youtubeVideoId(url);
  return videoId ? `youtube:${videoId}` : `url:${url}`;
}

function age(entry: FlatBookmark) {
  return entry.node.dateAdded ?? Number.MAX_SAFE_INTEGER;
}

export function findDuplicates(roots: BookmarkNode[]): DuplicateGroup[] {
  const groups = new Map<string, FlatBookmark[]>();
  for (const entry of flattenBookmarks(roots)) {
    const key = duplicateKey(entry.node.url!);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }

  return [...groups.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([key, entries]) => {
      const [keep, ...remove] = [...entries].sort((a, b) => age(a) - age(b));
      return { key, keep, remove };
    });
}
