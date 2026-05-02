import { useState } from 'react'
import { Notebook } from '../types'

interface SidebarProps {
  notebooks: Notebook[]
  totalNotes: number
  selectedNotebook: number | null
  onSelectNotebook: (id: number | null) => void
  onCreateNotebook: (name: string) => void
  onDeleteNotebook: (id: number) => void
  onReorderNotebook: (sourceIndex: number, targetIndex: number) => void
}

function Sidebar({ notebooks, totalNotes, selectedNotebook, onSelectNotebook, onCreateNotebook, onDeleteNotebook, onReorderNotebook }: SidebarProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('type', 'notebook')
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
    
    if (e.dataTransfer.getData('type') !== 'notebook') return
    
    const sourceIndex = Number(e.dataTransfer.getData('index'))
    if (sourceIndex !== targetIndex) {
      onReorderNotebook(sourceIndex, targetIndex)
    }
  }

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateNotebook(newName.trim())
      setNewName('')
      setShowCreate(false)
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Notebooks</h2>
        <button className="btn-add" onClick={() => setShowCreate(true)}>+</button>
      </div>
      
      <div
        className={`notebook-item ${selectedNotebook === null ? 'active' : ''}`}
        onClick={() => onSelectNotebook(null)}
      >
        <span className="notebook-name">All Notes</span>
        <span className="note-count">{totalNotes}</span>
      </div>

      {showCreate && (
        <div className="create-notebook">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Notebook name"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="create-actions">
            <button onClick={handleCreate}>Create</button>
            <button onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="notebook-list">
        {notebooks.map((notebook, index) => (
          <div
            key={notebook.id}
            className={`notebook-item ${selectedNotebook === notebook.id ? 'active' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
            onClick={() => onSelectNotebook(notebook.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            <span className="notebook-name">{notebook.name}</span>
            <button
              className="btn-delete"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Delete "${notebook.name}"?`)) {
                  onDeleteNotebook(notebook.id)
                }
              }}
            >
              ×
            </button>
            <span className="note-count">{notebook.note_count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar
