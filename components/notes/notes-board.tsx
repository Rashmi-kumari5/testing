"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Note,
  NoteDraft,
  createNote,
  deleteNoteById,
  deserializeNotes,
  sortNotesByUpdatedAt,
  updateNote,
} from "@/lib/notes";

const STORAGE_KEY = "aurora.notes.v1";

const createBlankDraft = (): NoteDraft => ({
  title: "",
  content: "",
});

export function NotesBoard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteDraft, setNewNoteDraft] = useState<NoteDraft>(() => createBlankDraft());
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<NoteDraft>(() => createBlankDraft());
  const [formError, setFormError] = useState<string | null>(null);

  // Hydrate notes from localStorage once on mount.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);
      if (!storedValue) {
        return;
      }

      const parsed = JSON.parse(storedValue);
      setNotes(deserializeNotes(parsed));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Persist notes to localStorage whenever they change.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const orderedNotes = useMemo(() => sortNotesByUpdatedAt(notes), [notes]);
  const latestUpdatedAt = orderedNotes[0]?.updatedAt ?? null;

  const isCreatingDisabled =
    !newNoteDraft.title.trim() && !newNoteDraft.content.trim();

  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg shadow-slate-100">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
          Notes
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950">
          Capture ideas with clarity
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600">
          Create lightweight notes, keep them organized locally, and edit or remove them whenever
          inspiration strikes. Everything stays on your device for quick context switching while
          working with the calculator.
        </p>
        <dl className="mt-6 flex flex-wrap gap-6 text-sm text-slate-500">
          <div>
            <dt className="font-semibold uppercase tracking-wide text-slate-400">
              Notes saved
            </dt>
            <dd className="text-2xl font-semibold text-slate-900">{notes.length}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-slate-400">
              Last updated
            </dt>
            <dd className="text-2xl font-semibold text-slate-900">
              {latestUpdatedAt ? formatTimestamp(latestUpdatedAt) : "—"}
            </dd>
          </div>
        </dl>
      </header>

      <form
        onSubmit={handleCreateNote}
        className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-md shadow-slate-100"
      >
        <div>
          <label htmlFor="note-title" className="block text-sm font-semibold text-slate-700">
            Title
          </label>
          <input
            id="note-title"
            name="title"
            value={newNoteDraft.title}
            onChange={(event) => setNewNoteDraft((draft) => ({ ...draft, title: event.target.value }))}
            placeholder="Project outline, meeting notes..."
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label htmlFor="note-content" className="block text-sm font-semibold text-slate-700">
            Details
          </label>
          <textarea
            id="note-content"
            name="content"
            rows={4}
            value={newNoteDraft.content}
            onChange={(event) =>
              setNewNoteDraft((draft) => ({ ...draft, content: event.target.value }))
            }
            placeholder="Capture the context, todos, and follow-ups..."
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {formError && <p className="text-sm text-rose-600">{formError}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isCreatingDisabled}
            className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 sm:flex-none sm:px-6"
          >
            Save note
          </button>
          <button
            type="button"
            onClick={() => {
              setNewNoteDraft(createBlankDraft());
              setFormError(null);
            }}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 sm:flex-none sm:px-6"
          >
            Reset
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Notes sync to your browser&apos;s storage only—clearing site data will remove them.
        </p>
      </form>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">My notes</h2>
        {orderedNotes.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-slate-200 bg-white/80 px-6 py-10 text-center text-slate-500">
            You have not created any notes yet. Start by jotting down a reminder or quick idea above.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {orderedNotes.map((note) => {
              const isEditing = activeEditId === note.id;

              return (
                <li
                  key={note.id}
                  className="flex flex-col rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    {isEditing ? (
                      <input
                        value={editDraft.title}
                        onChange={(event) =>
                          setEditDraft((draft) => ({ ...draft, title: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-lg font-semibold text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-slate-900">{note.title}</h3>
                    )}

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {formatRelativeTime(note.updatedAt)}
                    </span>
                  </div>

                  <div className="mt-3 flex-1">
                    {isEditing ? (
                      <textarea
                        value={editDraft.content}
                        onChange={(event) =>
                          setEditDraft((draft) => ({ ...draft, content: event.target.value }))
                        }
                        rows={4}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      />
                    ) : (
                      <p className="text-sm text-slate-600 whitespace-pre-line">{note.content || "No details provided."}</p>
                    )}
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div>
                      <dt className="font-semibold uppercase tracking-wide">Created</dt>
                      <dd>{formatTimestamp(note.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold uppercase tracking-wide">Updated</dt>
                      <dd>{formatTimestamp(note.updatedAt)}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(note.id)}
                          className="flex-1 rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 sm:flex-none"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 sm:flex-none"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(note)}
                          className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 sm:flex-none"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="flex-1 rounded-2xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 sm:flex-none"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </section>
  );

  function handleCreateNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const note = createNote(newNoteDraft);
      setNotes((current) => [note, ...current]);
      setNewNoteDraft(createBlankDraft());
      setFormError(null);
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Unable to create note.");
      }
    }
  }

  function handleStartEdit(note: Note) {
    setActiveEditId(note.id);
    setEditDraft({
      title: note.title,
      content: note.content,
    });
  }

  function handleCancelEdit() {
    setActiveEditId(null);
    setEditDraft(createBlankDraft());
  }

  function handleSaveEdit(noteId: string) {
    try {
      setNotes((current) =>
        current.map((note) => {
          if (note.id !== noteId) {
            return note;
          }

          return updateNote(note, editDraft);
        }),
      );
      handleCancelEdit();
      setFormError(null);
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Unable to update note.");
      }
    }
  }

  function handleDeleteNote(noteId: string) {
    setNotes((current) => deleteNoteById(current, noteId));
    if (activeEditId === noteId) {
      handleCancelEdit();
    }
  }
}

function formatTimestamp(value: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatRelativeTime(value: string) {
  const deltaMs = Date.now() - new Date(value).getTime();
  const minutes = Math.round(deltaMs / (1000 * 60));

  if (Number.isNaN(minutes)) {
    return "just now";
  }

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
