import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json' with { type: 'json' };

const ICONS = { 16: 'icons/icon-16.png', 32: 'icons/icon-32.png', 48: 'icons/icon-48.png', 128: 'icons/icon-128.png' };

export default defineManifest({
  manifest_version: 3,
  name: 'Reshelf',
  description: '__MSG_extDescription__',
  default_locale: 'en',
  version: pkg.version,
  icons: ICONS,
  action: { default_title: '__MSG_actionTitle__', default_icon: ICONS },
  background: { service_worker: 'src/background/index.ts', type: 'module' },
  permissions: ['bookmarks', 'favicon', 'storage', 'unlimitedStorage'],
  host_permissions: ['https://www.youtube.com/*'],
});
