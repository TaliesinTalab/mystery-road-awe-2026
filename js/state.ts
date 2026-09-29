import type {
  CaseData,
  CaseLocation,
  Evidence,
  Person,
  TimelineEvent,
} from "./types.js";

export let allEvidence: Evidence[] = [];
export let filteredEvidence: Evidence[] = [];
export let bookmarks: string[] = [];
export let currentPage = "dashboard";

export let allPeople: Person[] = [];
export let allLocations: CaseLocation[] = [];
export let allTimeline: TimelineEvent[] = [];
export let caseData: Partial<CaseData> = {};

export const viewRendered = {
  evidence: false,
  people: false,
  timeline: false,
};

export function setAllEvidence(value: Evidence[]): void {
  allEvidence = value;
}
export function setFilteredEvidence(value: Evidence[]): void {
  filteredEvidence = value;
}
export function setBookmarks(value: string[]): void {
  bookmarks = value;
}
export function setCurrentPage(value: string): void {
  currentPage = value;
}
export function setAllPeople(value: Person[]): void {
  allPeople = value;
}
export function setAllLocations(value: CaseLocation[]): void {
  allLocations = value;
}
export function setAllTimeline(value: TimelineEvent[]): void {
  allTimeline = value;
}
export function setCaseData(value: CaseData): void {
  caseData = value;
}

export function findEvidenceById(id: string): Evidence | null {
  for (let i = 0; i < allEvidence.length; i++) {
    if (allEvidence[i].id === id) return allEvidence[i];
  }
  return null;
}

export function findPersonById(id: string): Person | null {
  for (let i = 0; i < allPeople.length; i++) {
    if (allPeople[i].id === id) return allPeople[i];
  }
  return null;
}

export function findLocationById(id: string): CaseLocation | null {
  for (let i = 0; i < allLocations.length; i++) {
    if (allLocations[i].id === id) return allLocations[i];
  }
  return null;
}
