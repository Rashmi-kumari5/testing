export type NoteDraft = {
  title: string;
  content: string;
};

export type Note = NoteDraft & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

type IdFactory = () => string;
type TimestampFactory = () => string;

type NoteFactoryOptions = {
  idFactory?: IdFactory;
  timestampFactory?: TimestampFactory;
};

type NoteUpdateOptions = {
  timestampFactory?: TimestampFactory;
};

const defaultIdFactory: IdFactory = () => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `note_${Math.random().toString(36).slice(2, 10)}`;
};

const defaultTimestampFactory: TimestampFactory = () => new Date().toISOString();

export const NOTE_VALIDATION_MESSAGE = "Notes require at least a title or some content.";

export function normalizeDraft(draft: NoteDraft): NoteDraft {
  return {
    title: draft.title.trim(),
    content: draft.content.trim(),
  };
}

export function createNote(draft: NoteDraft, options: NoteFactoryOptions = {}): Note {
  const normalized = normalizeDraft(draft);
  ensureHasContent(normalized);
  const timestamp = (options.timestampFactory ?? defaultTimestampFactory)();

  return {
    id: (options.idFactory ?? defaultIdFactory)(),
    ...normalized,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateNote(note: Note, updates: Partial<NoteDraft>, options: NoteUpdateOptions = {}): Note {
  const normalized = normalizeDraft({
    title: updates.title ?? note.title,
    content: updates.content ?? note.content,
  });
  ensureHasContent(normalized);

  const didChange = normalized.title !== note.title || normalized.content !== note.content;
  if (!didChange) {
    return note;
  }

  return {
    ...note,
    ...normalized,
    updatedAt: (options.timestampFactory ?? defaultTimestampFactory)(),
  };
}

export function deleteNoteById(notes: Note[], id: string): Note[] {
  return notes.filter((note) => note.id !== id);
}

export function sortNotesByUpdatedAt(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function deserializeNotes(payload: unknown): Note[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((entry) => coerceNote(entry))
    .filter((note): note is Note => Boolean(note));
}

function ensureHasContent(draft: NoteDraft) {
  if (!draft.title && !draft.content) {
    throw new Error(NOTE_VALIDATION_MESSAGE);
  }
}

function coerceNote(entry: unknown): Note | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const candidate = entry as Partial<Note>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.createdAt !== "string" ||
    typeof candidate.updatedAt !== "string" ||
    typeof candidate.title !== "string" ||
    typeof candidate.content !== "string"
  ) {
    return null;
  }

  const normalized = normalizeDraft({
    title: candidate.title,
    content: candidate.content,
  });

  return {
    id: candidate.id,
    ...normalized,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
  };
}
