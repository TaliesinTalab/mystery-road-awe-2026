import { allEvidence, allPeople, bookmarks } from "../state.js";
import { navigateTo } from "../navigation.js";
import { STORAGE_KEY_HYPOTHESIS, notesStore } from "../storage.js";
import type { HypothesisDraft } from "../types.js";
import { getElement, getSelectedOptions } from "../utils.js";
import { openEvidenceDetail } from "./evidence.js";

export function renderWorkspace(): void {
  renderBookmarksList();
  renderNotesList();
  populateHypothesisDropdowns();
  loadHypothesisFromStorage();
}

function renderBookmarksList(): void {
  const container = document.getElementById("bookmarksList");
  if (!container) return;

  const bookmarkedItems = allEvidence.filter(function (ev) {
    return bookmarks.indexOf(ev.id) !== -1;
  });

  if (bookmarkedItems.length === 0) {
    container.innerHTML =
      "<p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>";
    return;
  }

  let html = "";
  for (let i = 0; i < bookmarkedItems.length; i++) {
    const ev = bookmarkedItems[i];
    html +=
      '<div class="mini-list-item"><strong>' +
      ev.id +
      "</strong> &mdash; " +
      ev.title +
      ' <button type="button" class="btn btn-small btn-secondary" data-open-evidence="' +
      ev.id +
      '">Open</button></div>';
  }
  container.innerHTML = html;

  const openButtons = container.querySelectorAll("[data-open-evidence]");
  for (let b = 0; b < openButtons.length; b++) {
    const openButton = openButtons[b];
    openButton.addEventListener("click", function () {
      navigateTo("evidence");
      const id = openButton.getAttribute("data-open-evidence") ?? "";
      setTimeout(function () {
        openEvidenceDetail(id);
      }, 0);
    });
  }
}

function renderNotesList(): void {
  const container = document.getElementById("notesList");
  if (!container) return;

  const noteEntries = [];
  for (let i = 0; i < allEvidence.length; i++) {
    const note = notesStore[allEvidence[i].id];
    if (note) {
      noteEntries.push({
        index: i,
        evidenceId: allEvidence[i].id,
        title: allEvidence[i].title,
        text: note,
      });
    }
  }

  if (noteEntries.length === 0) {
    container.innerHTML =
      "<p>No notes yet. Add one from an evidence item's detail view.</p>";
    return;
  }

  let html = "";
  for (let n = 0; n < noteEntries.length; n++) {
    const entry = noteEntries[n];
    html +=
      '<div class="mini-list-item"><strong>' +
      entry.evidenceId +
      "</strong> &mdash; " +
      entry.title;
    html +=
      '<div id="noteText-' + entry.index + '">' + entry.text + "</div></div>"; // unsafe innerHTML rendering, same as the note preview
  }
  container.innerHTML = html;
}

export function populateHypothesisDropdowns(): void {
  const suspectSelect = document.getElementById("hypSuspect");
  const evidenceSelect = document.getElementById("hypEvidence");
  if (
    !(suspectSelect instanceof HTMLSelectElement) ||
    !(evidenceSelect instanceof HTMLSelectElement)
  )
    return;

  const currentSuspect = suspectSelect.value;
  suspectSelect.innerHTML = '<option value="">Select a person…</option>';
  for (let p = 0; p < allPeople.length; p++) {
    suspectSelect.innerHTML +=
      '<option value="' +
      allPeople[p].id +
      '">' +
      allPeople[p].name +
      "</option>";
  }
  suspectSelect.value = currentSuspect;

  evidenceSelect.innerHTML = "";
  for (let i = 0; i < allEvidence.length; i++) {
    evidenceSelect.innerHTML +=
      '<option value="' +
      allEvidence[i].id +
      '">' +
      allEvidence[i].id +
      " - " +
      allEvidence[i].title +
      "</option>";
  }
}

export function saveHypothesis(): void {
  const draft: HypothesisDraft = {
    suspectId: getElement("hypSuspect", HTMLSelectElement).value,
    nature: getElement("hypNature", HTMLSelectElement).value,
    evidenceIds: getSelectedOptions(
      getElement("hypEvidence", HTMLSelectElement),
    ),
    confidence: getElement("hypConfidence", HTMLInputElement).value,
    explanation: getElement("hypExplanation", HTMLTextAreaElement).value,
    alternative: getElement("hypAlternative", HTMLTextAreaElement).value,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
  } catch (err) {
    console.error("Could not save hypothesis draft", err);
    alert("Your hypothesis could not be saved to local storage.");
    return;
  }

  const msg = getElement("hypothesisSavedMsg", HTMLSpanElement);
  msg.classList.remove("hidden");
  setTimeout(function () {
    msg.classList.add("hidden");
  }, 2000);
}

function loadHypothesisFromStorage(): void {
  const raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
  if (!raw) return;

  let draft: Partial<HypothesisDraft>;
  try {
    draft = JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read stored hypothesis draft, ignoring it", err);
    return;
  }
  if (!draft || typeof draft !== "object") return;

  getElement("hypSuspect", HTMLSelectElement).value = draft.suspectId || "";
  getElement("hypNature", HTMLSelectElement).value = draft.nature || "";
  getElement("hypConfidence", HTMLInputElement).value =
    draft.confidence || "50";
  getElement("hypConfidenceValue", HTMLOutputElement).textContent =
    draft.confidence || "50";
  getElement("hypExplanation", HTMLTextAreaElement).value =
    draft.explanation || "";
  getElement("hypAlternative", HTMLTextAreaElement).value =
    draft.alternative || "";

  const evidenceSelect = getElement("hypEvidence", HTMLSelectElement);
  const savedIds = draft.evidenceIds || [];
  for (let i = 0; i < evidenceSelect.options.length; i++) {
    evidenceSelect.options[i].selected =
      savedIds.indexOf(evidenceSelect.options[i].value) !== -1;
  }
}
