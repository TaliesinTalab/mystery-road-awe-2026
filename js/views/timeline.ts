import {
  allLocations,
  allPeople,
  allTimeline,
  findEvidenceById,
  findLocationById,
} from "../state.js";
import { navigateTo } from "../navigation.js";
import { certaintyBadgeClass, formatDate, getElement } from "../utils.js";
import { openEvidenceDetail } from "./evidence.js";

export function populateTimelineDropdowns(): void {
  const personSelect = document.getElementById("timelinePersonFilter");
  const locationSelect = document.getElementById("timelineLocationFilter");
  const typeSelect = document.getElementById("timelineTypeFilter");
  if (!personSelect || !locationSelect || !typeSelect) return;

  personSelect.innerHTML = '<option value="">All people</option>';
  for (let p = 0; p < allPeople.length; p++) {
    personSelect.innerHTML +=
      '<option value="' +
      allPeople[p].id +
      '">' +
      allPeople[p].name +
      "</option>";
  }

  locationSelect.innerHTML = '<option value="">All locations</option>';
  for (let l = 0; l < allLocations.length; l++) {
    locationSelect.innerHTML +=
      '<option value="' +
      allLocations[l].id +
      '">' +
      allLocations[l].id +
      "</option>";
  }

  const types = [];
  for (let i = 0; i < allTimeline.length; i++) {
    if (types.indexOf(allTimeline[i].type) === -1)
      types.push(allTimeline[i].type);
  }
  typeSelect.innerHTML = '<option value="">All event types</option>';
  for (let t = 0; t < types.length; t++) {
    typeSelect.innerHTML +=
      '<option value="' + types[t] + '">' + types[t] + "</option>";
  }
}

export function renderTimeline(): void {
  const container = document.getElementById("timelineContainer");
  if (!container) return;

  const order = getElement("timelineOrder", HTMLSelectElement).value;
  const personFilter = getElement(
    "timelinePersonFilter",
    HTMLSelectElement,
  ).value;
  const locationFilter = getElement(
    "timelineLocationFilter",
    HTMLSelectElement,
  ).value;
  const typeFilter = getElement("timelineTypeFilter", HTMLSelectElement).value;

  let events = [];
  for (let i = 0; i < allTimeline.length; i++) {
    const evt = allTimeline[i];
    if (personFilter && !evt.personIds.some((id) => id === personFilter))
      continue;
    if (locationFilter && evt.locationIds.indexOf(locationFilter) === -1)
      continue;
    if (typeFilter && evt.type !== typeFilter) continue;
    events.push(evt);
  }

  events = events.slice().sort(function (a, b) {
    const diff = new Date(a.time).getTime() - new Date(b.time).getTime();
    return order === "desc" ? -diff : diff;
  });

  let html = "";
  for (let e = 0; e < events.length; e++) {
    const item = events[e];
    html += '<div class="timeline-event certainty-' + item.certainty + '">';
    html +=
      '<div class="timeline-time">' +
      formatDate(item.time) +
      '&nbsp;&middot;&nbsp;<span class="badge badge-' +
      certaintyBadgeClass(item.certainty) +
      '">' +
      item.certainty +
      "</span></div>";
    html += "<h3>" + item.title + "</h3>";
    html += "<p>" + item.description + "</p>";

    const eventLocationNames = [];
    for (let el = 0; el < item.locationIds.length; el++) {
      const evtLoc = findLocationById(item.locationIds[el]);
      eventLocationNames.push(
        evtLoc ? evtLoc.id + " - " + evtLoc.name : item.locationIds[el],
      );
    }
    if (eventLocationNames.length > 0) {
      html +=
        '<p class="evidence-meta">Location: ' +
        eventLocationNames.join(", ") +
        "</p>";
    }

    for (let ev2 = 0; ev2 < item.evidenceIds.length; ev2++) {
      html +=
        '<button type="button" class="evidence-link-btn" data-evidence-id="' +
        item.evidenceIds[ev2] +
        '">View ' +
        item.evidenceIds[ev2] +
        "</button>";
    }
    html += "</div>";
  }
  if (events.length === 0) {
    html = "<p>No timeline events match the current filters.</p>";
  }
  container.innerHTML = html;

  const linkButtons = container.querySelectorAll(".evidence-link-btn");
  for (let b = 0; b < linkButtons.length; b++) {
    const linkButton = linkButtons[b];
    linkButton.addEventListener("click", function () {
      openEvidenceModal(linkButton.getAttribute("data-evidence-id") ?? "");
    });
  }
}

// --- Quick-view modal (used from the timeline) -------------------------
function openEvidenceModal(evidenceId: string): void {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  let modal = document.getElementById("quickViewModal");
  if (!modal) {
    const newModal = document.createElement("div");
    newModal.id = "quickViewModal";
    document.body.appendChild(newModal);

    newModal.addEventListener("click", function (e) {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (
        target.classList.contains("modal-close-btn") ||
        target.classList.contains("modal-backdrop")
      ) {
        newModal.innerHTML = "";
      }
      const fullEvidenceId = target.getAttribute("data-open-full");
      if (fullEvidenceId) {
        newModal.innerHTML = "";
        navigateTo("evidence");
        setTimeout(function () {
          openEvidenceDetail(fullEvidenceId);
        }, 0);
      }
    });
    modal = newModal;
  }

  modal.innerHTML =
    '<div class="modal-backdrop"><div class="modal-box">' +
    '<button type="button" class="modal-close-btn" aria-label="Close">&times;</button>' +
    "<h3>" +
    ev.title +
    "</h3>" +
    '<p class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</p>" +
    "<p>" +
    ev.summary +
    "</p>" +
    '<button type="button" class="btn btn-primary btn-small" data-open-full="' +
    ev.id +
    '">Open full evidence</button>' +
    "</div></div>";
}
