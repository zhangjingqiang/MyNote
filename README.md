# MyNote

A simple Evernote-like note taking app built with Electron, React, and SQLite.

## Features

- Create and manage notebooks
- Create, edit, and delete notes
- Markdown editing with live preview
- Search notes by title or content
- Auto-save (500ms debounce)
- Data persistence with SQLite

## Tech Stack

- **Electron** - Desktop app framework
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **SQLite (better-sqlite3)** - Local database
- **react-markdown** - Markdown rendering

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
cd ~/test
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build      # Build only
npm run dist       # Build and package for distribution
```

## Project Structure

```bash
├── src/
│   ├── main/          # Electron main process
│   │   ├── index.ts   # Main entry, window + IPC
│   │   └── db.ts      # SQLite database operations
│   ├── preload/       # Preload script
│   │   └── index.ts   # Expose IPC API to renderer
│   └── renderer/      # React frontend
│       ├── components/
│       │   ├── Sidebar.tsx      # Notebook sidebar
│       │   ├── NoteList.tsx     # Note list + search
│       │   └── NoteEditor.tsx   # Markdown editor/preview
│       ├── types/
│       │   └── index.ts         # TypeScript types
│       ├── App.tsx              # Main app component
│       ├── main.tsx             # React entry
│       ├── index.html           # HTML template
│       └── styles.css           # Global styles
├── package.json
├── tsconfig.json
├── tsconfig.main.json
└── vite.config.ts
```

## License

MIT
