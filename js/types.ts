export type PersonId =
  | "signal-scholar"
  | "kernel-colt"
  | "nova-byte"
  | "patch-vector"
  | "refactor-rex"
  | "root-harbor";

export type CaseData = {
  caseId: string;
  title: string;
  subtitle: string;
  status: string;
  opened: string;
  summary: string;
  location: string;
  leadInvestigator: string;
  notes: string;
};

export type Person = {
  id: PersonId;
  name: string;
  role: string;
  speciality: string;
  responsibilities: string[];
  statement: string;
  background: string;
  avatar: string;
};

export type CaseLocation = {
  id: string;
  name: string;
  description: string;
  contains: string[];
};

export type Evidence = {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  summary: string;
  content: string;
  personIds: PersonId[];
  locationIds: string[];
  tags: string[];
  status: string;
  relevance: string;
};

export type TimelineEvent = {
  id: string;
  time: string;
  title: string;
  description: string;
  type: string;
  certainty: string;
  personIds: PersonId[];
  locationIds: string[];
  evidenceIds: string[];
};
