import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  notebooks: {
    getAll: () => ipcRenderer.invoke('get-notebooks'),
    create: (data: { name: string }) => ipcRenderer.invoke('create-notebook', data),
    update: (id: number, data: { name: string }) => ipcRenderer.invoke('update-notebook', id, data),
    delete: (id: number) => ipcRenderer.invoke('delete-notebook', id),
    reorder: (sourceIndex: number, targetIndex: number) => ipcRenderer.invoke('reorder-notebooks', sourceIndex, targetIndex),
  },
  notes: {
    getAll: (notebookId?: number) => ipcRenderer.invoke('get-notes', notebookId),
    getTotal: () => ipcRenderer.invoke('get-total-notes'),
    getNote: (id: number) => ipcRenderer.invoke('get-note', id),
    create: (data: { title?: string; content?: string; notebookId?: number }) => ipcRenderer.invoke('create-note', data),
    update: (id: number, data: { title?: string; content?: string; notebookId?: number | null }) => ipcRenderer.invoke('update-note', id, data),
    delete: (id: number) => ipcRenderer.invoke('delete-note', id),
    reorder: (sourceIndex: number, targetIndex: number, notebookId: number | null) => ipcRenderer.invoke('reorder-notes', sourceIndex, targetIndex, notebookId),
  },
});
