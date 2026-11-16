const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com']);
const VIDEO_ID = /^[\w-]{11}$/;
const DURATION_PREFIX = /^\[(?:(\d+):)?(\d{1,2}):(\d{2})\]\s*/;

export function youtubeVideoId(pageUrl: string | undefined): string | null {
  if (!pageUrl) return null;
  let url: URL;
  try {
    url = new URL(pageUrl);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  let id: string | null = null;

  if (host === 'youtu.be') {
    id = url.pathname.split('/')[1] ?? null;
  } else if (YOUTUBE_HOSTS.has(host)) {
    const [, section, value] = url.pathname.split('/');
    if (section === 'watch') id = url.searchParams.get('v');
    else if (['shorts', 'live', 'embed', 'v'].includes(section)) id = value ?? null;
  }

  return id && VIDEO_ID.test(id) ? id : null;
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

export function durationFromTitle(title: string): number | null {
  const match = DURATION_PREFIX.exec(title);
  if (!match) return null;
  const [, hours = '0', minutes, seconds] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

export function hasDuration(title: string) {
  return DURATION_PREFIX.test(title);
}

export function stripDuration(title: string) {
  return title.replace(DURATION_PREFIX, '');
}

export function withDuration(title: string, totalSeconds: number) {
  return `[${formatDuration(totalSeconds)}] ${stripDuration(title)}`;
}

export type VideoInfo = { kind: 'ok'; seconds: number | null } | { kind: 'unavailable' } | { kind: 'unknown' };

export async function fetchVideoInfo(videoId: string): Promise<VideoInfo> {
  let html: string;
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, { credentials: 'include' });
    if (!response.ok) return { kind: 'unknown' };
    html = await response.text();
  } catch {
    return { kind: 'unknown' };
  }

  const status = /"playabilityStatus":\{"status":"([A-Z_]+)"(?:,"reason":"([^"]*)")?/.exec(html);
  if (status) {
    const [, code, reason = ''] = status;
    if (code === 'ERROR') return { kind: 'unavailable' };
    if (code === 'LOGIN_REQUIRED' && /private/i.test(reason)) return { kind: 'unavailable' };
  }

  const detailsStart = html.indexOf(`"videoDetails":{"videoId":"${videoId}"`);
  if (detailsStart === -1) return { kind: 'unknown' };

  const match = /"lengthSeconds":"(\d+)"/.exec(html.slice(detailsStart, detailsStart + 20000));
  const seconds = match ? Number(match[1]) : 0;
  return { kind: 'ok', seconds: seconds > 0 ? seconds : null };
}
