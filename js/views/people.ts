import { allEvidence, allLocations, allPeople } from "../state.js";
import { navigateTo } from "../navigation.js";
import type { Person } from "../types.js";
import { evidenceMentionsPerson, getElement } from "../utils.js";
import { renderEvidenceList } from "./evidence.js";

export function switchPeopleTab(tab: string): void {
  const peoplePanel = getElement("peoplePanel", HTMLDivElement);
  const locationsPanel = getElement("locationsPanel", HTMLDivElement);
  const peopleTabBtn = getElement("tabPeopleBtn", HTMLButtonElement);
  const locationsTabBtn = getElement("tabLocationsBtn", HTMLButtonElement);

  if (tab === "people") {
    peoplePanel.classList.remove("hidden");
    locationsPanel.classList.add("hidden");
    peopleTabBtn.classList.add("active");
    locationsTabBtn.classList.remove("active");
  } else {
    peoplePanel.classList.add("hidden");
    locationsPanel.classList.remove("hidden");
    peopleTabBtn.classList.remove("active");
    locationsTabBtn.classList.add("active");
  }
}

function countEvidenceForPerson(person: Person): number {
  let count = 0;
  for (let i = 0; i < allEvidence.length; i++) {
    if (evidenceMentionsPerson(allEvidence[i], person)) count++;
  }
  return count;
}

export function renderPeople(): void {
  const container = getElement("peoplePanel", HTMLDivElement);
  let html = "";
  for (let i = 0; i < allPeople.length; i++) {
    const person = allPeople[i];
    const count = countEvidenceForPerson(person);

    html += '<div class="person-card">';
    html += '<div class="person-card-header">';
    html +=
      '<img class="person-avatar" src="' +
      person.avatar +
      '" alt="Portrait of ' +
      person.name +
      '">';
    html +=
      "<div><h3>" +
      person.name +
      '</h3><div class="person-role">' +
      person.role +
      "</div></div>";
    html += "</div>";
    html += "<p><strong>Speciality:</strong> " + person.speciality + "</p>";
    html += "<ul>";
    for (let r = 0; r < person.responsibilities.length; r++) {
      html += "<li>" + person.responsibilities[r] + "</li>";
    }
    html += "</ul>";
    html +=
      '<div class="person-statement">&ldquo;' +
      person.statement +
      "&rdquo;</div>";
    html +=
      "<p>" +
      count +
      " related evidence item" +
      (count === 1 ? "" : "s") +
      " &mdash; ";
    html +=
      '<button type="button" class="evidence-count-link" data-person-id="' +
      person.id +
      '">view</button></p>';
    html += "</div>";
  }
  container.innerHTML = html;

  const links = container.querySelectorAll(".evidence-count-link");
  for (let l = 0; l < links.length; l++) {
    const link = links[l];
    link.addEventListener("click", function () {
      const personId = link.getAttribute("data-person-id") ?? "";
      getElement("filterPerson", HTMLSelectElement).value = personId;
      navigateTo("evidence");
      setTimeout(function () {
        renderEvidenceList();
      }, 0);
    });
  }
}

export function renderLocations(): void {
  const container = getElement("locationsPanel", HTMLDivElement);
  let html = "";
  for (let i = 0; i < allLocations.length; i++) {
    const loc = allLocations[i];
    html += '<div class="location-card">';
    html += "<h3>" + loc.id + " &mdash; " + loc.name + "</h3>";
    html += "<p>" + loc.description + "</p>";
    html += "<p><strong>Contains:</strong></p><ul>";
    for (let c = 0; c < loc.contains.length; c++) {
      html += "<li>" + loc.contains[c] + "</li>";
    }
    html += "</ul></div>";
  }
  container.innerHTML = html;
}
