import type { processes, questions } from "../extinction-risk";

export type Lang = "en" | "et" | "lv" | "lt";
export type ProcessName = (typeof processes)[number];
export type QuestionKey = (typeof questions)[number]["key"];
export type QuestionCopy = {
  name: string;
  text: string;
  labels: [string, string, string, string];
  diagnosis: string;
  why: string;
  action: string;
};

/**
 * Display copy for one language. Stored and shared values (process names, industries,
 * tiers) stay in canonical English; these maps only translate them at render time.
 */
export type Dict = {
  homeAria: string;
  headerNote: string;
  headerNoteShort: string;
  language: string;
  switchToDay: string;
  switchToNight: string;
  heroAlt: string;
  heroEyebrow: string;
  heroTagline: string;
  heroSubtitle: string;
  heroDescription: string;
  startCta: string;
  ctaFootnote: string;
  imageCaption: string;
  methodLabel: string;
  methodSteps: [title: string, copy: string][];
  footerLeft: string;
  footerRight: string;
  invalidLink: string;
  stepBasics: string;
  stepSuspects: string;
  stepInterrogation: (n: number, total: number) => string;
  aboutFiveMin: string;
  minLeft: (n: number) => string;
  progressAria: string;
  basicsEyebrow: string;
  basicsTitle: string;
  basicsIntro: string;
  industryLabel: string;
  industryPlaceholder: string;
  sizeLabel: string;
  regulatedLabel: string;
  yes: string;
  no: string;
  back: string;
  pickSuspects: string;
  suspectsEyebrow: string;
  suspectsTitle: string;
  suspectsIntro: string;
  addOwnAria: string;
  addOwnPlaceholder: string;
  addCustomAria: string;
  selectedCount: (n: number) => string;
  interrogate: string;
  suspect: (n: string) => string;
  interrogationIntro: string;
  reveal: string;
  nextSuspect: string;
  verdictEyebrow: string;
  yourMeteor: string;
  impact: (time: string) => string;
  whyKill: string;
  noWeakness: string;
  firstMove: string;
  fallbackAction: string;
  restRecord: string;
  rankAria: (name: string, score: number) => string;
  pdfError: string;
  downloadPdf: string;
  linkCopied: string;
  copyFallback: string;
  copyLink: string;
  retake: string;
  disclaimer: string;
  showScoring: string;
  scoring: string;
  leadTitle: string;
  leadNotConnected: string;
  emailAria: string;
  emailPlaceholder: string;
  letsTalk: string;
  leadNote: string;
  pdfSubtitle: string;
  pdfPeople: (size: string) => string;
  pdfRegulated: string;
  pdfNotRegulated: string;
  pdfDisclaimer: string;
  /** Keyed by the English tier returned by riskTier(). */
  tiers: Record<string, string>;
  /** Keyed by the English value returned by timeToImpact(). */
  times: Record<string, string>;
  industries: Record<string, string>;
  processes: Record<ProcessName, string>;
  questions: Record<QuestionKey, QuestionCopy>;
  closers: { hostage: string; notYet: string; clean: string };
};
