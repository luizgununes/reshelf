export type SortKey = 'duration' | 'title' | 'length';
export type SortDirection = 'asc' | 'desc';
export type SortRule = { key: SortKey; direction: SortDirection };

export type FolderSettings = {
  sort: SortRule;
  autoDuration: boolean;
  autoSort: boolean;
};

export const DEFAULT_FOLDER_SETTINGS: FolderSettings = {
  sort: { key: 'duration', direction: 'asc' },
  autoDuration: false,
  autoSort: false,
};

export const FOLDER_SETTINGS_KEY = 'folderSettings';

export type FolderSettingsMap = Record<string, Partial<FolderSettings>>;

export async function loadFolderSettings(): Promise<FolderSettingsMap> {
  const stored = await chrome.storage.local.get(FOLDER_SETTINGS_KEY);
  return (stored[FOLDER_SETTINGS_KEY] as FolderSettingsMap | undefined) ?? {};
}

export function resolveFolderSettings(map: FolderSettingsMap, folderId: string): FolderSettings {
  const own = map[folderId] ?? {};
  return { ...DEFAULT_FOLDER_SETTINGS, ...own, sort: { ...DEFAULT_FOLDER_SETTINGS.sort, ...own.sort } };
}

export async function saveFolderSettings(folderId: string, patch: Partial<FolderSettings>) {
  const map = await loadFolderSettings();
  map[folderId] = { ...resolveFolderSettings(map, folderId), ...patch };
  await chrome.storage.local.set({ [FOLDER_SETTINGS_KEY]: map });
}
