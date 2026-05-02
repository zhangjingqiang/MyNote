import { useState, useEffect, useCallback } from 'react'
import { Notebook, Note } from './types'
import Sidebar from './components/Sidebar'
import NoteList from './components/NoteList'
import NoteEditor from './components/NoteEditor'

function App() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [totalNotes, setTotalNotes] = useState(0)
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNotebook, setSelectedNotebook] = useState<number | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadNotebooks = useCallback(async () => {
    const data = await window.electronAPI.notebooks.getAll()
    setNotebooks(data)
  }, [])

  const loadNotes = useCallback(async (notebookId?: number) => {
    const data = await window.electronAPI.notes.getAll(notebookId)
    setNotes(data)
    const total = await window.electronAPI.notes.getTotal()
    setTotalNotes(total)
  }, [])

  useEffect(() => {
    loadNotebooks()
  }, [loadNotebooks])

  useEffect(() => {
    loadNotes(selectedNotebook || undefined)
  }, [loadNotes, selectedNotebook])

  const handleCreateNotebook = async (name: string) => {
    await window.electronAPI.notebooks.create({ name })
    loadNotebooks()
  }

  const handleDeleteNotebook = async (id: number) => {
    await window.electronAPI.notebooks.delete(id)
    if (selectedNotebook === id) {
      setSelectedNotebook(null)
      setSelectedNote(null)
    }
    loadNotebooks()
    loadNotes(null)
  }

  const handleCreateNote = async (notebookId?: number) => {
    try {
      console.log('Creating note...');
      setSearchQuery('')
      const note = await window.electronAPI.notes.create({
        title: 'Untitled',
        content: '',
        notebookId: notebookId || selectedNotebook || undefined,
      })
      if (note) {
        console.log('Note created:', note);
        setSelectedNote(note)
        loadNotes(selectedNotebook || undefined)
        loadNotebooks()
      } else {
        console.error('Create note returned null/undefined')
      }
    } catch (error) {
      console.error('Failed to create note:', error)
      alert('Failed to create note. See console for details.')
    }
  }

  const handleUpdateNote = async (id: number, data: { title: string; content: string }) => {
    const noteData = selectedNotebook !== null 
      ? { ...data, notebookId: selectedNotebook } 
      : { ...data, notebookId: selectedNote?.notebook_id || undefined }
    
    const note = await window.electronAPI.notes.update(id, noteData)
    setSelectedNote(note)
    loadNotes(selectedNotebook || undefined)
    loadNotebooks()
  }

  const handleDeleteNote = async (id: number) => {
    await window.electronAPI.notes.delete(id)
    setSelectedNote(null)
    loadNotes(selectedNotebook || undefined)
    loadNotebooks()
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="app">
      <Sidebar
        notebooks={notebooks}
        totalNotes={totalNotes}
        selectedNotebook={selectedNotebook}
        onSelectNotebook={setSelectedNotebook}
        onCreateNotebook={handleCreateNotebook}
        onDeleteNotebook={handleDeleteNotebook}
        onReorderNotebook={(sourceIndex, targetIndex) => {
          window.electronAPI.notebooks.reorder(sourceIndex, targetIndex)
          loadNotebooks()
        }}
      />
      <NoteList
        notes={filteredNotes}
        selectedNote={selectedNote}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectNote={setSelectedNote}
        onCreateNote={() => handleCreateNote()}
        onDeleteNote={handleDeleteNote}
        onReorderNote={(sourceIndex, targetIndex) => {
          window.electronAPI.notes.reorder(sourceIndex, targetIndex, selectedNotebook)
          loadNotes(selectedNotebook || undefined)
        }}
      />
      <NoteEditor
        note={selectedNote}
        onUpdate={handleUpdateNote}
      />
    </div>
  )
}

export default App
