import { type BookmarkNode, isFolder } from './bookmarks';

const PREFIX = 'backup|';
const KEEP = 5;
const AUTO_INTERVAL = 60 * 1000;

export type Backup = { at: number; reason: 'open' | 'auto'; roots: BookmarkNode[] };

async function backupKeys() {
  return (await chrome.storage.local.getKeys()).filter((key) => key.startsWith(PREFIX)).sort();
}

export async function takeBackup(reason: Backup['reason']) {
  const keys = await backupKeys();
  const latest = keys.at(-1);
  if (reason === 'auto' && latest && Date.now() - Number(latest.slice(PREFIX.length)) < AUTO_INTERVAL) return;

  const [root] = await chrome.bookmarks.getTree();
  const at = Date.now();
  const key = `${PREFIX}${String(at).padStart(15, '0')}`;
  await chrome.storage.local.set({ [key]: { at, reason, roots: root.children ?? [] } satisfies Backup });

  const stale = keys.slice(0, Math.max(0, keys.length + 1 - KEEP));
  if (stale.length > 0) await chrome.storage.local.remove(stale);
}

export async function latestBackup(): Promise<Backup | null> {
  const latest = (await backupKeys()).at(-1);
  if (!latest) return null;
  const stored = await chrome.storage.local.get(latest);
  return (stored[latest] as Backup | undefined) ?? null;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function seconds(value: number | undefined) {
  return value === undefined ? '' : String(Math.floor(value / 1000));
}

function renderNodes(nodes: BookmarkNode[], depth: number): string {
  const indent = '    '.repeat(depth);
  return nodes
    .map((node) => {
      if (isFolder(node)) {
        return [
          `${indent}<DT><H3 ADD_DATE="${seconds(node.dateAdded)}">${escapeHtml(node.title)}</H3>`,
          `${indent}<DL><p>`,
          renderNodes(node.children ?? [], depth + 1),
          `${indent}</DL><p>`,
        ].join('\n');
      }
      return `${indent}<DT><A HREF="${escapeHtml(node.url!)}" ADD_DATE="${seconds(node.dateAdded)}">${escapeHtml(node.title)}</A>`;
    })
    .join('\n');
}

export function backupToHtml(backup: Backup) {
  return [
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    '<TITLE>Bookmarks</TITLE>',
    '<H1>Bookmarks</H1>',
    '<DL><p>',
    renderNodes(backup.roots, 1),
    '</DL><p>',
    '',
  ].join('\n');
}
