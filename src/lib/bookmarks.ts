export type BookmarkNode = chrome.bookmarks.BookmarkTreeNode;

export const ROOT_ID = '0';
export const BOOKMARKS_BAR_ID = '1';

export function isFolder(node: BookmarkNode) {
  return node.url === undefined;
}

export function findNode(nodes: BookmarkNode[], id: string): BookmarkNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = node.children && findNode(node.children, id);
    if (found) return found;
  }
  return undefined;
}

export function countBookmarks(node: BookmarkNode): number {
  return (node.children ?? []).reduce((total, child) => total + (isFolder(child) ? countBookmarks(child) : 1), 0);
}

export type FlatBookmark = { node: BookmarkNode; path: string[] };

export function flattenBookmarks(nodes: BookmarkNode[], path: string[] = []): FlatBookmark[] {
  return nodes.flatMap((node) =>
    isFolder(node) ? flattenBookmarks(node.children ?? [], [...path, node.title]) : [{ node, path }],
  );
}

export type FlatFolder = { node: BookmarkNode; path: string[] };

export function flattenFolders(nodes: BookmarkNode[], path: string[] = []): FlatFolder[] {
  return nodes.filter(isFolder).flatMap((node) => {
    const own = [...path, node.title];
    return [{ node, path: own }, ...flattenFolders(node.children ?? [], own)];
  });
}

export function faviconUrl(pageUrl: string, size = 32) {
  const url = new URL(chrome.runtime.getURL('/_favicon/'));
  url.searchParams.set('pageUrl', pageUrl);
  url.searchParams.set('size', String(size));
  return url.toString();
}

export function displayHost(pageUrl: string) {
  try {
    return new URL(pageUrl).host.replace(/^www\./, '');
  } catch {
    return pageUrl;
  }
}

export async function getNode(id: string): Promise<BookmarkNode | null> {
  try {
    const [node] = await chrome.bookmarks.get(id);
    return node ?? null;
  } catch {
    return null;
  }
}

export async function runPool<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
  let next = 0;
  const worker = async () => {
    while (next < items.length) await task(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}
