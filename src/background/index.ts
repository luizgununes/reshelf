import { registerAutomation } from '@/lib/automation';
import { takeBackup } from '@/lib/backup';

const APP_PATH = 'src/app/index.html';

registerAutomation();

chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL(APP_PATH);
  const [existing] = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.TAB],
    documentUrls: [url],
  });
  if (existing && existing.tabId !== -1) {
    await chrome.tabs.update(existing.tabId, { active: true });
    await chrome.windows.update(existing.windowId, { focused: true });
    return;
  }
  await takeBackup('open');
  await chrome.tabs.create({ url });
});
