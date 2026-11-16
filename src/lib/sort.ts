import { durationFromTitle, stripDuration } from './youtube';
import { type BookmarkNode, isFolder } from './bookmarks';
import type { SortRule } from './settings';
import type { Recorder } from './journal';

const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

function compare(a: BookmarkNode, b: BookmarkNode, rule: SortRule) {
  const sign = rule.direction === 'asc' ? 1 : -1;

  if (rule.key === 'duration') {
    const left = durationFromTitle(a.title);
    const right = durationFromTitle(b.title);
    if (left === null || right === null) return left === right ? 0 : left === null ? 1 : -1;
    return sign * (left - right);
  }

  const left = stripDuration(a.title).trim();
  const right = stripDuration(b.title).trim();
  if (rule.key === 'length') return sign * (left.length - right.length);
  return sign * collator.compare(left, right);
}

export async function sortFolder(folderId: string, rule: SortRule, recorder: Recorder) {
  const children = await chrome.bookmarks.getChildren(folderId);
  const folders = children.filter(isFolder);
  const bookmarks = children.filter((child) => !isFolder(child)).sort((a, b) => compare(a, b, rule));
  const target = [...folders, ...bookmarks].map((node) => node.id);
  const current = children.map((node) => node.id);
  let moved = 0;

  for (let index = 0; index < target.length; index++) {
    const id = target[index];
    const from = current.indexOf(id);
    if (from === index) continue;
    await recorder.move(id, { parentId: folderId, index });
    current.splice(from, 1);
    current.splice(index, 0, id);
    moved++;
  }

  return moved;
}
