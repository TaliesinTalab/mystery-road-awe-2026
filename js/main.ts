import { loadAllData } from "./api.js";
import { navigateTo } from "./navigation.js";
import { handleHashChange } from "./router.js";
import {
  loadBookmarksFromStorage,
  loadNoteAsync,
  loadNotesFromStorage,
} from "./storage.js";
import {
  clearFilters,
  closeEvidenceDetail,
  handleSearchInput,
  handleSortChange,
  renderEvidenceList,
  saveCurrentNote,
} from "./views/evidence.js";
import { switchPeopleTab } from "./views/people.js";
import { renderTimeline } from "./views/timeline.js";
import { saveHypothesis } from "./views/workspace.js";
import { getElement } from "./utils.js";

declare global {
  interface Window {
    navigateTo: typeof navigateTo;
    switchPeopleTab: typeof switchPeopleTab;
    saveHypothesis: typeof saveHypothesis;
    handleSortChange: typeof handleSortChange;
    closeEvidenceDetail: typeof closeEvidenceDetail;
    saveCurrentNote: typeof saveCurrentNote;
  }
}

function setupEventListeners(): void {
  window.addEventListener("hashchange", handleHashChange);

  const navButtons = document.querySelectorAll(".nav-btn");
  for (let i = 0; i < navButtons.length; i++) {
    navButtons[i].addEventListener("click", () => {
      const targetView = navButtons[i].getAttribute("data-view");
      console.log("nav clicked:", targetView);
    });
  }

  getElement("evidenceSearch", HTMLInputElement).addEventListener(
    "input",
    handleSearchInput,
  );

  getElement("filterType", HTMLSelectElement).addEventListener(
    "change",
    renderEvidenceList,
  );
  getElement("filterPerson", HTMLSelectElement).addEventListener(
    "change",
    renderEvidenceList,
  );
  getElement("filterLocation", HTMLSelectElement).addEventListener(
    "change",
    renderEvidenceList,
  );

  getElement("filterStatus", HTMLSelectElement).addEventListener(
    "change",
    renderEvidenceList,
  );

  getElement("filterRelevance", HTMLSelectElement).addEventListener(
    "change",
    renderEvidenceList,
  );

  getElement("clearFiltersBtn", HTMLButtonElement).addEventListener(
    "click",
    clearFilters,
  );

  getElement("timelineOrder", HTMLSelectElement).addEventListener(
    "change",
    renderTimeline,
  );
  getElement("timelinePersonFilter", HTMLSelectElement).addEventListener(
    "change",
    renderTimeline,
  );
  getElement("timelineLocationFilter", HTMLSelectElement).addEventListener(
    "change",
    renderTimeline,
  );
  getElement("timelineTypeFilter", HTMLSelectElement).addEventListener(
    "change",
    renderTimeline,
  );

  const hypConfidence = getElement("hypConfidence", HTMLInputElement);
  hypConfidence.addEventListener("input", () => {
    getElement("hypConfidenceValue", HTMLOutputElement).textContent =
      hypConfidence.value;
  });
}

function initApp(): void {
  loadBookmarksFromStorage();
  loadNotesFromStorage();
  setupEventListeners();

  loadAllData().then(function () {
    handleHashChange();
    loadNoteAsync("E01").then(function (note) {
      console.log("First note preview:", note);
    });
  });
}

// ---------------------------------------------------------------------
// GLOBALS REQUIRED BY THE INLINE HANDLERS IN index.html
// ---------------------------------------------------------------------

window.navigateTo = navigateTo;
window.switchPeopleTab = switchPeopleTab;
window.saveHypothesis = saveHypothesis;
window.handleSortChange = handleSortChange;
window.closeEvidenceDetail = closeEvidenceDetail;
window.saveCurrentNote = saveCurrentNote;

window.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("hashchange", handleHashChange);
