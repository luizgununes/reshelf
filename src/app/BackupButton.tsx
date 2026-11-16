import { type Backup, backupToHtml, latestBackup } from '@/lib/backup';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Download } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

function fileName(at: number) {
  const date = new Date(at);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `reshelf-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}.html`;
}

export function BackupButton() {
  const { t } = useI18n();

  const download = async () => {
    let backup = await latestBackup();
    if (!backup) {
      const [root] = await chrome.bookmarks.getTree();
      backup = { at: Date.now(), reason: 'open', roots: root.children ?? [] } satisfies Backup;
    }
    const url = URL.createObjectURL(new Blob([backupToHtml(backup)], { type: 'text/html' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName(backup.at);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SidebarMenuButton onClick={download} title={t.downloadBackupHint}>
      <Download />
      {t.downloadBackup}
    </SidebarMenuButton>
  );
}
