import { loadFolderSettings, resolveFolderSettings } from './settings';
import { AUTO_SOURCE, isAutomationPaused, Recorder } from './journal';
import { addDurations, type VideoTarget } from './videos';
import { getNode, isFolder } from './bookmarks';
import { youtubeVideoId } from './youtube';
import { takeBackup } from './backup';
import { sortFolder } from './sort';

const DEBOUNCE = 1500;

const pending = new Map<string, Set<string>>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
let importing = false;
let queue: Promise<void> = Promise.resolve();

async function processFolder(folderId: string, bookmarkIds: string[]) {
  const settings = resolveFolderSettings(await loadFolderSettings(), folderId);
  if (!settings.autoDuration && !settings.autoSort) return;

  const recorder = new Recorder(AUTO_SOURCE);
  await takeBackup('auto');

  if (settings.autoDuration) {
    const targets: VideoTarget[] = [];
    for (const id of bookmarkIds) {
      const node = await getNode(id);
      const videoId = youtubeVideoId(node?.url);
      if (node && node.parentId === folderId && videoId) targets.push({ bookmark: node, videoId });
    }
    if (targets.length > 0) await addDurations(targets, recorder);
  }

  if (settings.autoSort) await sortFolder(folderId, settings.sort, recorder);
}

async function schedule(folderId: string | undefined, bookmarkId: string) {
  if (!folderId || importing || (await isAutomationPaused())) return;

  const ids = pending.get(folderId) ?? new Set<string>();
  ids.add(bookmarkId);
  pending.set(folderId, ids);

  clearTimeout(timers.get(folderId));
  timers.set(
    folderId,
    setTimeout(() => {
      timers.delete(folderId);
      const batch = [...(pending.get(folderId) ?? [])];
      pending.delete(folderId);
      queue = queue.then(() => processFolder(folderId, batch)).catch(() => {});
    }, DEBOUNCE),
  );
}

export function registerAutomation() {
  chrome.bookmarks.onCreated.addListener((id, node) => {
    if (!isFolder(node)) void schedule(node.parentId, id);
  });

  chrome.bookmarks.onMoved.addListener((id, info) => {
    if (info.parentId !== info.oldParentId) void schedule(info.parentId, id);
  });

  chrome.bookmarks.onImportBegan.addListener(() => {
    importing = true;
  });

  chrome.bookmarks.onImportEnded.addListener(() => {
    importing = false;
  });
}
