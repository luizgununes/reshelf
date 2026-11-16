import { getNode } from './bookmarks';

const PREFIX = 'journal|';
const PAUSE_KEY = 'automationPausedUntil';

export const AUTO_SOURCE = 'auto';

export type JournalOp =
  | { type: 'title'; bookmarkId: string; before: string; after: string }
  | { type: 'move'; bookmarkId: string; fromParentId: string; fromIndex: number }
  | { type: 'remove'; bookmarkId: string; parentId: string; index: number; title: string; url: string };

type ParsedKey = { key: string; source: string; at: number; seq: number; action: string };

let sequence = 0;

function makeKey(source: string, action: string) {
  const at = String(Date.now()).padStart(15, '0');
  const seq = String(sequence++).padStart(8, '0');
  return `${PREFIX}${source}|${at}|${seq}|${action}`;
}

function newActionId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function parseKey(key: string): ParsedKey | null {
  if (!key.startsWith(PREFIX)) return null;
  const [, source, at, seq, action] = key.split('|');
  return { key, source, at: Number(at), seq: Number(seq), action };
}

const SESSION_KEY = 'reshelfSession';

export function tabSessionSource() {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = `session-${Date.now()}`;
    sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return `session-${Date.now()}`;
  }
}

export class Recorder {
  private readonly action = newActionId();

  constructor(private readonly source: string) {}

  private async record(op: JournalOp) {
    await chrome.storage.local.set({ [makeKey(this.source, this.action)]: op });
  }

  async updateTitle(id: string, title: string) {
    const node = await getNode(id);
    if (!node || node.title === title) return false;
    await chrome.bookmarks.update(id, { title });
    await this.record({ type: 'title', bookmarkId: id, before: node.title, after: title });
    return true;
  }

  async move(id: string, destination: { parentId: string; index?: number }) {
    const node = await getNode(id);
    if (!node || node.parentId === undefined || node.index === undefined) return false;
    await chrome.bookmarks.move(id, destination);
    await this.record({ type: 'move', bookmarkId: id, fromParentId: node.parentId, fromIndex: node.index });
    return true;
  }

  async remove(id: string) {
    const node = await getNode(id);
    if (!node?.url || node.parentId === undefined || node.index === undefined) return false;
    await chrome.bookmarks.remove(id);
    await this.record({
      type: 'remove',
      bookmarkId: id,
      parentId: node.parentId,
      index: node.index,
      title: node.title,
      url: node.url,
    });
    return true;
  }
}

async function journalKeys() {
  const keys = await chrome.storage.local.getKeys();
  return keys.map(parseKey).filter((entry): entry is ParsedKey => entry !== null);
}

export async function countBySource() {
  const actions = new Map<string, Set<string>>();
  for (const { source, action } of await journalKeys()) {
    actions.set(source, (actions.get(source) ?? new Set()).add(action));
  }
  return new Map([...actions].map(([source, ids]) => [source, ids.size]));
}

export async function forgetSources(match: (source: string) => boolean) {
  const keys = (await journalKeys()).filter((entry) => match(entry.source)).map((entry) => entry.key);
  if (keys.length > 0) await chrome.storage.local.remove(keys);
}

export async function isAutomationPaused() {
  const stored = await chrome.storage.local.get(PAUSE_KEY);
  return Number(stored[PAUSE_KEY] ?? 0) > Date.now();
}

async function childCount(parentId: string) {
  try {
    return (await chrome.bookmarks.getChildren(parentId)).length;
  } catch {
    return null;
  }
}

async function revert(op: JournalOp, ids: Map<string, string>) {
  const id = ids.get(op.bookmarkId) ?? op.bookmarkId;

  if (op.type === 'title') {
    if (await getNode(id)) await chrome.bookmarks.update(id, { title: op.before });
    return;
  }

  if (op.type === 'move') {
    const node = await getNode(id);
    const parentId = ids.get(op.fromParentId) ?? op.fromParentId;
    const size = await childCount(parentId);
    if (!node || size === null) return;
    const sameParent = node.parentId === parentId;
    let index = op.fromIndex;
    if (sameParent && node.index !== undefined && index > node.index) index += 1;
    await chrome.bookmarks.move(id, { parentId, index: Math.min(index, size) });
    return;
  }

  const parentId = ids.get(op.parentId) ?? op.parentId;
  const size = await childCount(parentId);
  const created = await chrome.bookmarks.create({
    parentId: size === null ? '2' : parentId,
    index: size === null ? undefined : Math.min(op.index, size),
    title: op.title,
    url: op.url,
  });
  ids.set(op.bookmarkId, created.id);
}

export async function undoSource(source: string) {
  const entries = (await journalKeys())
    .filter((entry) => entry.source === source)
    .sort((a, b) => b.at - a.at || b.seq - a.seq);
  if (entries.length === 0) return 0;
  const actionCount = new Set(entries.map((entry) => entry.action)).size;

  const stored = await chrome.storage.local.get(entries.map((entry) => entry.key));
  const ids = new Map<string, string>();

  await chrome.storage.local.set({ [PAUSE_KEY]: Date.now() + 5 * 60 * 1000 });
  try {
    for (const entry of entries) {
      const op = stored[entry.key] as JournalOp | undefined;
      if (!op) continue;
      try {
        await revert(op, ids);
      } catch {
        continue;
      }
    }
  } finally {
    await chrome.storage.local.remove(entries.map((entry) => entry.key));
    await chrome.storage.local.set({ [PAUSE_KEY]: Date.now() + 3000 });
  }

  return actionCount;
}
