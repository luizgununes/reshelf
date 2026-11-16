import { fetchVideoInfo, hasDuration, stripDuration, type VideoInfo, withDuration, youtubeVideoId } from './youtube';
import { type BookmarkNode, isFolder, runPool } from './bookmarks';
import type { Recorder } from './journal';

const CONCURRENCY = 4;
const SLOW_START = 2000;
const SLOW_MAX = 15000;
const GIVE_UP_AFTER = 8;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type Progress = (done: number, slowed: boolean) => void;

function createPacedFetcher(onSlow: () => void) {
  let slowed = false;
  let delay = 0;
  let gate: Promise<unknown> = Promise.resolve();

  const wait = async () => {
    if (!slowed) return;
    const turn = gate.then(() => sleep(delay));
    gate = turn;
    await turn;
  };

  const slowDown = () => {
    delay = slowed ? Math.min(delay * 2, SLOW_MAX) : SLOW_START;
    if (!slowed) {
      slowed = true;
      onSlow();
    }
  };

  let failuresInRow = 0;

  const settle = (info: VideoInfo) => {
    if (info.kind === 'unknown') failuresInRow++;
    else {
      failuresInRow = 0;
      if (slowed) delay = Math.max(SLOW_START, delay / 2);
    }
    return info;
  };

  const fetch = async (videoId: string): Promise<VideoInfo> => {
    if (failuresInRow >= GIVE_UP_AFTER) return { kind: 'unknown' };
    await wait();
    const first = await fetchVideoInfo(videoId);
    if (first.kind !== 'unknown') return settle(first);
    slowDown();
    await wait();
    return settle(await fetchVideoInfo(videoId));
  };

  return { fetch, isSlowed: () => slowed };
}

export type VideoTarget = { bookmark: BookmarkNode; videoId: string };

export function videoTargets(folder: BookmarkNode): VideoTarget[] {
  return (folder.children ?? []).flatMap((child) => {
    if (isFolder(child)) return [];
    const videoId = youtubeVideoId(child.url);
    return videoId ? [{ bookmark: child, videoId }] : [];
  });
}

export type DurationResult = {
  updated: number;
  failed: number;
  noDuration: number;
  unavailable: string[];
  slowed: boolean;
};

export async function addDurations(
  targets: VideoTarget[],
  recorder: Recorder,
  onProgress: Progress = () => {},
): Promise<DurationResult> {
  const result: DurationResult = { updated: 0, failed: 0, noDuration: 0, unavailable: [], slowed: false };
  let done = 0;
  const pacer = createPacedFetcher(() => onProgress(done, true));

  await runPool(targets, CONCURRENCY, async ({ bookmark, videoId }) => {
    try {
      const info = await pacer.fetch(videoId);
      if (info.kind === 'unavailable') result.unavailable.push(bookmark.id);
      if (info.kind !== 'ok') result.failed++;
      else if (info.seconds === null) result.noDuration++;
      else if (await recorder.updateTitle(bookmark.id, withDuration(bookmark.title, info.seconds))) result.updated++;
    } catch {
      result.failed++;
    }
    onProgress(++done, pacer.isSlowed());
  });

  result.slowed = pacer.isSlowed();
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

export type CheckResult = { unavailable: string[]; unknown: number; slowed: boolean };

export async function checkVideos(targets: VideoTarget[], onProgress: Progress): Promise<CheckResult> {
  const result: CheckResult = { unavailable: [], unknown: 0, slowed: false };
  let done = 0;
  const pacer = createPacedFetcher(() => onProgress(done, true));

  await runPool(targets, CONCURRENCY, async ({ bookmark, videoId }) => {
    const info = await pacer.fetch(videoId);
    if (info.kind === 'unavailable') result.unavailable.push(bookmark.id);
    if (info.kind === 'unknown') result.unknown++;
    onProgress(++done, pacer.isSlowed());
  });

  result.slowed = pacer.isSlowed();
  return result;
}
