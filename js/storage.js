import { bookmarks, setBookmarks } from "./state.js";

var STORAGE_KEY_BOOKMARKS = "remotion_bookmarks";
var STORAGE_KEY_NOTES = "remotion_notes";
export var STORAGE_KEY_HYPOTHESIS = "remotion_hypothesis";

export var notesStore = {};

export function saveBookmarksToStorage() {
  localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks));
}

export function loadBookmarksFromStorage() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    var parsed = raw ? JSON.parse(raw) : [];
    setBookmarks(Array.isArray(parsed) ? parsed : []);
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);
    setBookmarks([]);
  }
}

export function saveNoteForEvidence(evidenceId, text) {
  notesStore[evidenceId] = text;
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notesStore));
}

export function loadNoteForEvidence(evidenceId) {
  return notesStore[evidenceId] || "";
}

export function loadNotesFromStorage() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY_NOTES);
    var parsed = raw ? JSON.parse(raw) : {};
    notesStore = parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.warn("Could not read stored notes, starting empty", err);
    notesStore = {};
  }
}

export function loadNoteAsync(evidenceId) {
  return new Promise(function (resolve) {
    resolve(notesStore[evidenceId] || "");
  });
}
