export let allEvidence = [];
export let filteredEvidence = [];
export let bookmarks = [];
export let currentPage = "dashboard";

export let allPeople = [];
export let allLocations = [];
export let allTimeline = [];
export let caseData = {};

export const viewRendered = {
  evidence: false,
  people: false,
  timeline: false
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
  for (let i = 0; i < allEvidence.length; i++) {
    if (allEvidence[i].id === id) return allEvidence[i];
  }
  return null;
}

export function findPersonById(id) {
  for (let i = 0; i < allPeople.length; i++) {
    if (allPeople[i].id === id) return allPeople[i];
  }
  return null;
}

export function findLocationById(id) {
  for (let i = 0; i < allLocations.length; i++) {
    if (allLocations[i].id === id) return allLocations[i];
  }
  return null;
}
