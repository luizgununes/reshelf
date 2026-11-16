import { fetchVideoInfo, hasDuration, stripDuration, withDuration, youtubeVideoId } from './youtube';
import { type BookmarkNode, isFolder, runPool } from './bookmarks';
import type { Recorder } from './journal';

const CONCURRENCY = 4;

export type VideoTarget = { bookmark: BookmarkNode; videoId: string };

export function videoTargets(folder: BookmarkNode): VideoTarget[] {
  return (folder.children ?? []).flatMap((child) => {
    if (isFolder(child)) return [];
    const videoId = youtubeVideoId(child.url);
    return videoId ? [{ bookmark: child, videoId }] : [];
  });
}

export type DurationResult = { updated: number; failed: number; unavailable: string[] };

export async function addDurations(
  targets: VideoTarget[],
  recorder: Recorder,
  onProgress: (done: number) => void = () => {},
): Promise<DurationResult> {
  const result: DurationResult = { updated: 0, failed: 0, unavailable: [] };
  let done = 0;

  await runPool(targets, CONCURRENCY, async ({ bookmark, videoId }) => {
    try {
      const info = await fetchVideoInfo(videoId);
      if (info.kind === 'unavailable') result.unavailable.push(bookmark.id);
      if (info.kind !== 'ok' || info.seconds === null) result.failed++;
      else if (await recorder.updateTitle(bookmark.id, withDuration(bookmark.title, info.seconds))) result.updated++;
    } catch {
      result.failed++;
    }
    onProgress(++done);
  });

  return result;
}

export async function removeDurations(folder: BookmarkNode, recorder: Recorder) {
  let updated = 0;
  for (const child of folder.children ?? []) {
    if (isFolder(child) || !hasDuration(child.title)) continue;
    if (await recorder.updateTitle(child.id, stripDuration(child.title))) updated++;
  }
  return updated;
}

export function countWithDuration(folder: BookmarkNode) {
  return (folder.children ?? []).filter((child) => !isFolder(child) && hasDuration(child.title)).length;
}

export type CheckResult = { unavailable: string[]; unknown: number };

export async function checkVideos(targets: VideoTarget[], onProgress: (done: number) => void): Promise<CheckResult> {
  const result: CheckResult = { unavailable: [], unknown: 0 };
  let done = 0;

  await runPool(targets, CONCURRENCY, async ({ bookmark, videoId }) => {
    const info = await fetchVideoInfo(videoId);
    if (info.kind === 'unavailable') result.unavailable.push(bookmark.id);
    if (info.kind === 'unknown') result.unknown++;
    onProgress(++done);
  });

  return result;
}
