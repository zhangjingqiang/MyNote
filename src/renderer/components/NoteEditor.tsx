import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Note } from '../types'

interface NoteEditorProps {
  note: Note | null
  onUpdate: (id: number, data: { title: string; content: string }) => void
}

function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
    }
  }, [note])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (note) {
      debouncedSave(newTitle, content)
    }
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    if (note) {
      debouncedSave(title, newContent)
    }
  }

  const debouncedSave = (t: string, c: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (note) {
        onUpdate(note.id, { title: t, content: c })
      }
    }, 500)
  }

  if (!note) {
    return (
      <div className="note-editor">
        <div className="empty-editor">
          <p>Select a note or create a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="note-editor">
      <div className="editor-header">
        <input
          type="text"
          className="title-input"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title"
        />
        <button
          className={`btn-toggle ${isPreview ? 'active' : ''}`}
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      <div className="editor-content">
        {isPreview ? (
          <div className="markdown-preview">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            className="markdown-input"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start writing in Markdown..."
          />
        )}
      </div>

      <div className="editor-footer">
        <span className="last-saved">
          Last updated: {new Date(note.updated_at).toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default NoteEditor
