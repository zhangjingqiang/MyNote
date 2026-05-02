export interface Notebook {
  id: number;
  name: string;
  created_at: string;
  note_count?: number;
  order_index?: number;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  notebook_id: number | null;
  created_at: string;
  updated_at: string;
  order_index?: number;
}

export interface ElectronAPI {
  notebooks: {
    getAll: () => Promise<Notebook[]>;
    create: (data: { name: string }) => Promise<Notebook>;
    update: (id: number, data: { name: string }) => Promise<Notebook>;
    delete: (id: number) => Promise<void>;
    reorder: (sourceIndex: number, targetIndex: number) => Promise<void>;
  };
  notes: {
    getAll: (notebookId?: number) => Promise<Note[]>;
    getTotal: () => Promise<number>;
    getById: (id: number) => Promise<Note>;
    create: (data: { title: string; content: string; notebookId?: number }) => Promise<Note>;
    update: (id: number, data: { title: string; content: string; notebookId?: number }) => Promise<Note>;
    delete: (id: number) => Promise<void>;
    reorder: (sourceIndex: number, targetIndex: number, notebookId: number | null) => Promise<void>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
