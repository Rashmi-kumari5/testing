'use client';

import { useState } from 'react';

/**
 * Interface defining the structure of a note
 */
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Main Home component - Simple Note-Taking Application
 * Allows users to create, edit, and delete notes with a clean minimal UI
 */
export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');

  /**
   * Creates a new note or updates an existing one
   */
  const handleSaveNote = () => {
    if (!currentTitle.trim() && !currentContent.trim()) {
      return;
    }

    if (editingId) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === editingId 
          ? { ...note, title: currentTitle, content: currentContent, updatedAt: new Date() }
          : note
      ));
      setEditingId(null);
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: currentTitle,
        content: currentContent,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes([newNote, ...notes]);
    }

    // Reset form
    setCurrentTitle('');
    setCurrentContent('');
    setIsCreating(false);
  };

  /**
   * Initiates editing mode for a specific note
   */
  const handleEditNote = (note: Note) => {
    setEditingId(note.id);
    setCurrentTitle(note.title);
    setCurrentContent(note.content);
    setIsCreating(true);
  };

  /**
   * Deletes a note by its ID
   */
  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  /**
   * Cancels the current create/edit operation
   */
  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setCurrentTitle('');
    setCurrentContent('');
  };

  /**
   * Formats a date to a readable string
   */
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Notes
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Create and manage your notes
          </p>
        </div>

        {/* Create Note Button */}
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full mb-6 py-4 px-6 bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors font-medium"
          >
            + New Note
          </button>
        )}

        {/* Note Creation/Edit Form */}
        {isCreating && (
          <div className="mb-6 p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
            <input
              type="text"
              placeholder="Note title..."
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              className="w-full mb-4 px-4 py-2 text-xl font-semibold bg-transparent border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
              autoFocus
            />
            <textarea
              placeholder="Start writing your note..."
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              className="w-full min-h-[150px] px-4 py-2 bg-transparent text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSaveNote}
                className="px-6 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
              >
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 && !isCreating && (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-500">
              <p className="text-lg">No notes yet</p>
              <p className="text-sm mt-2">Click "New Note" to get started</p>
            </div>
          )}

          {notes.map((note) => (
            <div
              key={note.id}
              className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {note.title || 'Untitled Note'}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="px-3 py-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap mb-3">
                {note.content}
              </p>
              <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-500">
                <span>Created: {formatDate(note.createdAt)}</span>
                {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                  <span>Updated: {formatDate(note.updatedAt)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
