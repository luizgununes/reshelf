import { FOLDER_SETTINGS_KEY, type FolderSettingsMap, loadFolderSettings } from '@/lib/settings';
import { AUTO_SOURCE, countBySource, forgetSources, newSessionSource } from '@/lib/journal';
import { useEffect, useState } from 'react';

export const SESSION_SOURCE = newSessionSource();

export function useJournalCounts() {
  const [counts, setCounts] = useState({ session: 0, auto: 0 });

  useEffect(() => {
    let active = true;
    const refresh = () =>
      countBySource().then((bySource) => {
        if (active) setCounts({ session: bySource.get(SESSION_SOURCE) ?? 0, auto: bySource.get(AUTO_SOURCE) ?? 0 });
      });

    forgetSources((source) => source.startsWith('session-') && source !== SESSION_SOURCE).then(refresh);

    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && Object.keys(changes).some((key) => key.startsWith('journal|'))) refresh();
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      active = false;
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  return counts;
}

export function useFolderSettingsMap() {
  const [map, setMap] = useState<FolderSettingsMap>({});

  useEffect(() => {
    let active = true;
    loadFolderSettings().then((loaded) => {
      if (active) setMap(loaded);
    });

    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      const change = changes[FOLDER_SETTINGS_KEY];
      if (area === 'local' && change) setMap((change.newValue as FolderSettingsMap | undefined) ?? {});
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      active = false;
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  return map;
}
