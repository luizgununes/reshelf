<p align="center">
  <img src="assets/icon.svg" alt="" width="96" height="96" />
</p>

<h1 align="center">Reshelf</h1>

<p align="center">See and reorganize your Chrome bookmarks in a full page. Every change lands in your real bookmarks.</p>

---

Reshelf is a Chrome extension that opens your bookmarks in a full tab with tools Chrome's own bookmark manager doesn't have. Nothing is kept in a separate list. What you rename, move, sort or delete in Reshelf is written straight to Chrome's bookmarks, so the bookmarks bar and your synced devices see it right away.

It started from a "To Watch" folder full of YouTube videos: put each video's length in its title, then watch the shortest first.

## Features

**YouTube**
- **Durations in titles:** adds the video length to the start of each title, like `[12:30] Video title` or `[1:02:05] Long talk`. One click removes them again.
- **Unavailable videos:** finds videos that were deleted or made private, shows only those if you want, and removes them when you say so.
- **Gentle on YouTube:** if YouTube starts refusing requests, Reshelf slows down, retries and tells you.

**Organizing**
- **Sorting:** by duration, title or title length, in either direction. Subfolders stay on top.
- **Drag to reorder** any bookmark or subfolder.
- **Rename** bookmarks and folders in place, by double-click or the pencil.
- **Multi-select** with Shift+click ranges, then move or delete.
- **Search** every folder by title or link, and order the results.
- **Duplicates:** finds the same link saved more than once across all folders. A YouTube video counts as the same even with a different link (timestamp, playlist, `youtu.be`). The oldest copy stays, and you can untick any copy before removing.
- **Random pick:** opens a random bookmark from the folder.

**Automatic mode, per folder**
- Add durations to new videos as they arrive.
- Keep the folder sorted whenever a bookmark lands in it.
- Works in the background, even with the Reshelf tab closed.

**Safety**
- **Undo:** everything Reshelf changes in a tab can be undone, even after reloading the page. Automatic changes made in the background can be reviewed and undone the next time you open Reshelf.
- **Backup:** a full copy of your bookmarks is saved every time the icon opens a new Reshelf tab. Download it as an HTML file that Chrome can import.

**Everything else**
- English, Portuguese (Brazil) and Spanish, switchable inside the extension.
- Light and dark theme, following your system.

## Install from source

Reshelf is not on the Chrome Web Store yet. To try it:

1. Install [Node.js](https://nodejs.org) 24 or newer.
2. Clone and build:
   ```sh
   git clone https://github.com/luizgununes/reshelf.git
   cd reshelf
   npm install
   npm run build
   ```
3. Open `chrome://extensions`, turn on **Developer mode** and click **Load unpacked**.
4. Choose the `dist` folder.
5. Click the Reshelf icon in the toolbar.

After pulling new changes, run `npm run build` again and click the reload button on the Reshelf card in `chrome://extensions`.

## Permissions and privacy

| Permission | Why |
| --- | --- |
| `bookmarks` | Read and change your bookmarks. |
| `favicon` | Show each site's icon. |
| `storage`, `unlimitedStorage` | Keep backups, undo history and per-folder settings on your computer. |
| `youtube.com` | Read video pages to get durations and check whether videos still exist. |

Reshelf has no server. Your bookmarks, backups and settings stay in your browser. The only network requests are to YouTube video pages, and only when you ask for durations or a check, or when a folder's automatic mode is on.

## Development

- `npm run dev` starts Vite with hot reload. Load the `dist` folder it creates as an unpacked extension.
- `npm run build` checks the types and builds the extension into `dist`.

Built with React, TypeScript, Vite, Tailwind CSS and [shadcn/ui](https://ui.shadcn.com), on Manifest V3 through [CRXJS](https://crxjs.dev).

## License

[MIT](LICENSE) © Luiz Gustavo Nunes
