import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

let db: Database.Database;

export function initDB() {
  try {
    const dbPath = path.join(app.getPath('userData'), 'notes.sqlite');
    db = new Database(dbPath);

    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    db.exec(`
      CREATE TABLE IF NOT EXISTS notebooks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL DEFAULT 'Untitled',
        content TEXT DEFAULT '',
        notebook_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE
      );
    `);

    const notebookCols = db.pragma('table_info(notebooks)') as any[];
    if (!notebookCols.some(col => col.name === 'order_index')) {
      db.prepare('ALTER TABLE notebooks ADD COLUMN order_index INTEGER DEFAULT 0').run();
    }

    const noteCols = db.pragma('table_info(notes)') as any[];
    if (!noteCols.some(col => col.name === 'order_index')) {
      db.prepare('ALTER TABLE notes ADD COLUMN order_index INTEGER DEFAULT 0').run();
    }

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_notes_notebook ON notes(notebook_id);
      CREATE INDEX IF NOT EXISTS idx_notebooks_order ON notebooks(order_index);
      CREATE INDEX IF NOT EXISTS idx_notes_order ON notes(order_index);
    `);
    
    console.log('DB initialized at:', dbPath);
  } catch (error) {
    console.error('DB Initialization Error:', error);
  }
}

export function getNotebooks() {
  return db.prepare(`
    SELECT n.*, COUNT(note.id) as note_count
    FROM notebooks n
    LEFT JOIN notes note ON n.id = note.notebook_id
    GROUP BY n.id
    ORDER BY n.order_index, n.created_at
  `).all();
}

export function createNotebook(data: { name: string }) {
  const maxOrder = db.prepare('SELECT MAX(order_index) as max_idx FROM notebooks').get() as { max_idx: number | null };
  const nextOrder = (maxOrder.max_idx ?? -1) + 1;
  const result = db.prepare(
    'INSERT INTO notebooks (name, order_index) VALUES (?, ?)'
  ).run(data.name, nextOrder);
  return db.prepare('SELECT * FROM notebooks WHERE id = ?').get(result.lastInsertRowid);
}

export function updateNotebook(id: number, data: { name: string }) {
  db.prepare('UPDATE notebooks SET name = ? WHERE id = ?').run(data.name, id);
  return db.prepare('SELECT * FROM notebooks WHERE id = ?').get(id);
}

export function deleteNotebook(id: number) {
  return db.prepare('DELETE FROM notebooks WHERE id = ?').run(id);
}

export function reorderNotebooks(sourceIndex: number, targetIndex: number) {
  const items = getNotebooks() as any[];
  const [moved] = items.splice(sourceIndex, 1);
  items.splice(targetIndex, 0, moved);
  
  const update = db.prepare('UPDATE notebooks SET order_index = ? WHERE id = ?');
  const runUpdate = db.transaction((updatedItems: any[]) => {
    for (let i = 0; i < updatedItems.length; i++) {
      update.run(i, updatedItems[i].id);
    }
  });
  runUpdate(items);
}

export function getTotalNotes() {
  const result = db.prepare('SELECT COUNT(*) as count FROM notes').get() as { count: number };
  return result.count;
}

export function getNotes(notebookId?: number) {
  if (notebookId !== undefined) {
    return db.prepare(
      'SELECT * FROM notes WHERE notebook_id = ? ORDER BY order_index, updated_at DESC'
    ).all(notebookId);
  }
  return db.prepare(
    'SELECT * FROM notes ORDER BY order_index, updated_at DESC'
  ).all();
}

export function getNoteById(id: number) {
  return db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
}

export function createNote(data: { title: string; content: string; notebookId?: number }) {
  const notebookId = data.notebookId;
  let nextOrder = 0;
  
  if (notebookId) {
    const maxOrder = db.prepare('SELECT MAX(order_index) as max_idx FROM notes WHERE notebook_id = ?').get(notebookId) as { max_idx: number | null };
    nextOrder = (maxOrder.max_idx ?? -1) + 1;
  } else {
    const maxOrder = db.prepare('SELECT MAX(order_index) as max_idx FROM notes WHERE notebook_id IS NULL').get() as { max_idx: number | null };
    nextOrder = (maxOrder.max_idx ?? -1) + 1;
  }

  const result = db.prepare(
    'INSERT INTO notes (title, content, notebook_id, order_index) VALUES (?, ?, ?, ?)'
  ).run(data.title || 'Untitled', data.content || '', notebookId || null, nextOrder);
  return db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
}

export function updateNote(id: number, data: { title: string; content: string; notebookId?: number }) {
  db.prepare(
    'UPDATE notes SET title = ?, content = ?, notebook_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(data.title, data.content, data.notebookId || null, id);
  return db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
}

export function deleteNote(id: number) {
  return db.prepare('DELETE FROM notes WHERE id = ?').run(id);
}

export function reorderNotes(sourceIndex: number, targetIndex: number, notebookId: number | null) {
  const items = getNotes(notebookId ?? undefined) as any[];
  const [moved] = items.splice(sourceIndex, 1);
  items.splice(targetIndex, 0, moved);
  
  const update = db.prepare('UPDATE notes SET order_index = ? WHERE id = ?');
  const runUpdate = db.transaction((updatedItems: any[]) => {
    for (let i = 0; i < updatedItems.length; i++) {
      update.run(i, updatedItems[i].id);
    }
  });
  runUpdate(items);
}
