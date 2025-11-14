import { describe, expect, it } from "vitest";

import {
  NOTE_VALIDATION_MESSAGE,
  createNote,
  deleteNoteById,
  deserializeNotes,
  sortNotesByUpdatedAt,
  updateNote,
} from "./notes";

const fixedTimestamp = "2024-01-01T00:00:00.000Z";
const nextTimestamp = "2024-01-02T00:00:00.000Z";

const mockTimestampFactory = () => fixedTimestamp;
const mockNextTimestampFactory = () => nextTimestamp;
const mockIdFactory = () => "note-123";

describe("createNote", () => {
  it("creates a normalized note with ids and timestamps", () => {
    const note = createNote(
      { title: "   Hello ", content: " world   " },
      { idFactory: mockIdFactory, timestampFactory: mockTimestampFactory },
    );

    expect(note).toEqual({
      id: "note-123",
      title: "Hello",
      content: "world",
      createdAt: fixedTimestamp,
      updatedAt: fixedTimestamp,
    });
  });

  it("rejects empty drafts", () => {
    expect(() => createNote({ title: " ", content: " " })).toThrow(NOTE_VALIDATION_MESSAGE);
  });
});

describe("updateNote", () => {
  const baseNote = {
    id: "note-001",
    title: "Alpha",
    content: "Beta",
    createdAt: fixedTimestamp,
    updatedAt: fixedTimestamp,
  };

  it("updates note fields and refreshes the timestamp", () => {
    const result = updateNote(
      baseNote,
      { content: "  updated " },
      { timestampFactory: mockNextTimestampFactory },
    );

    expect(result).toEqual({
      ...baseNote,
      content: "updated",
      updatedAt: nextTimestamp,
    });
  });

  it("returns the original note when nothing changes", () => {
    const result = updateNote(baseNote, {});
    expect(result).toBe(baseNote);
  });
});

describe("deleteNoteById", () => {
  it("removes the matching note", () => {
    const notes = [
      { id: "one", title: "1", content: "", createdAt: fixedTimestamp, updatedAt: fixedTimestamp },
      { id: "two", title: "2", content: "", createdAt: fixedTimestamp, updatedAt: fixedTimestamp },
    ];

    expect(deleteNoteById(notes, "one")).toEqual([notes[1]]);
  });
});

describe("sortNotesByUpdatedAt", () => {
  it("sorts notes descending by updatedAt", () => {
    const notes = [
      { id: "older", title: "", content: "", createdAt: fixedTimestamp, updatedAt: fixedTimestamp },
      { id: "newer", title: "", content: "", createdAt: nextTimestamp, updatedAt: nextTimestamp },
    ];

    expect(sortNotesByUpdatedAt(notes).map((note) => note.id)).toEqual(["newer", "older"]);
  });
});

describe("deserializeNotes", () => {
  it("filters malformed payloads and trims content", () => {
    const payload = [
      {
        id: "ok",
        title: " title ",
        content: " content ",
        createdAt: fixedTimestamp,
        updatedAt: nextTimestamp,
      },
      { id: "missing-fields" },
    ];

    expect(deserializeNotes(payload)).toEqual([
      {
        id: "ok",
        title: "title",
        content: "content",
        createdAt: fixedTimestamp,
        updatedAt: nextTimestamp,
      },
    ]);
  });
});
