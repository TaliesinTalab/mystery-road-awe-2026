export var allEvidence = [];
export var filteredEvidence = [];
export var bookmarks = [];
export var currentPage = "dashboard";

export var allPeople = [];
export var allLocations = [];
export var allTimeline = [];
export var caseData = {};

export var viewRendered = {
  dashboard: false,
  evidence: false,
  people: false,
  timeline: false,
  workspace: false
};

export function setAllEvidence(value) { allEvidence = value; }
export function setFilteredEvidence(value) { filteredEvidence = value; }
export function setBookmarks(value) { bookmarks = value; }
export function setCurrentPage(value) { currentPage = value; }
export function setAllPeople(value) { allPeople = value; }
export function setAllLocations(value) { allLocations = value; }
export function setAllTimeline(value) { allTimeline = value; }
export function setCaseData(value) { caseData = value; }

export function findEvidenceById(id) {
  for (var i = 0; i < allEvidence.length; i++) {
    if (allEvidence[i].id === id) return allEvidence[i];
  }
  return null;
}

export function findPersonById(id) {
  for (var i = 0; i < allPeople.length; i++) {
    if (allPeople[i].id === id) return allPeople[i];
  }
  return null;
}

export function findLocationById(id) {
  for (var i = 0; i < allLocations.length; i++) {
    if (allLocations[i].id === id) return allLocations[i];
  }
  return null;
}
