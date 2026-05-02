import { useState } from 'react'
import { Note } from '../types'

interface NoteListProps {
  notes: Note[]
  selectedNote: Note | null
  searchQuery: string
  onSearchChange: (query: string) => void
  onSelectNote: (note: Note) => void
  onCreateNote: () => void
  onDeleteNote: (id: number) => void
  onReorderNote: (sourceIndex: number, targetIndex: number) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function NoteList({ notes, selectedNote, searchQuery, onSearchChange, onSelectNote, onCreateNote, onDeleteNote, onReorderNote }: NoteListProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [notebookId, setNotebookId] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setNotebookId(selectedNote?.notebook_id || null)
    e.dataTransfer.setData('type', 'note')
    e.dataTransfer.setData('index', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    if (e.dataTransfer.getData('type') !== 'note') return
    
    const sourceIndex = Number(e.dataTransfer.getData('index'))
    if (sourceIndex !== targetIndex) {
      onReorderNote(sourceIndex, targetIndex)
    }
  }

  return (
    <div className="note-list">
      <div className="note-list-header">
        <input
          type="text"
          className="search-input"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button className="btn-add" onClick={onCreateNote}>+ New Note</button>
      </div>

      <div className="notes">
        {notes.length === 0 ? (
          <div className="empty-state">
            <p>No notes yet</p>
            <button onClick={onCreateNote}>Create your first note</button>
          </div>
        ) : (
          notes.map((note, index) => (
            <div
              key={note.id}
              className={`note-item ${selectedNote?.id === note.id ? 'active' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
              onClick={() => onSelectNote(note)}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="note-item-header">
                <h3 className="note-item-title">{note.title || 'Untitled'}</h3>
                <button
                  className="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Delete this note?')) {
                      onDeleteNote(note.id)
                    }
                  }}
                >
                  ×
                </button>
              </div>
              <p className="note-item-preview">
                {note.content.replace(/[#*`_~]/g, '').substring(0, 100) || 'No content'}
              </p>
              <span className="note-item-date">{formatDate(note.updated_at)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NoteList
