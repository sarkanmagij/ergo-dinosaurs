export const processes = [
  'Sales & lead handling', 'Customer onboarding', 'Customer support',
  'Invoicing & collections', 'Procurement', 'Hiring & onboarding',
  'Reporting & management info', 'Compliance & regulatory reporting',
  'IT & security operations', 'Product / service delivery',
  'Claims or complaints handling', 'Data management',
] as const;

export const questions = [
  { key: 'bus', name: 'Bus factor', text: 'If one specific person quit tomorrow, would this process break?', labels: ['No', 'Wobble', 'Limp', 'Collapse'], diagnosis: "It lives in one person's head.", why: 'One departure could take the process with it.', action: 'Document the process and cross-train a second person.' },
  { key: 'tape', name: 'Duct tape', text: 'How much of it runs on spreadsheets, email and copy-paste?', labels: ['Almost none', 'Some', 'Most', 'All of it'], diagnosis: 'Spreadsheets and copy-paste are holding it together.', why: 'Manual handoffs multiply mistakes and delays.', action: 'Automate the single most repeated manual step.' },
  { key: 'blind', name: 'Blindness', text: "Would you find out it's broken before a customer or regulator does?", labels: ['Instantly', 'Within days', 'Within weeks', "Never, they'd tell us"], diagnosis: "You'd hear about failure from the outside first.", why: 'A failure could spread before anyone notices.', action: 'Add one alert or a weekly check that catches failure early.' },
  { key: 'blast', name: 'Blast radius', text: 'If it stopped for a week, what happens?', labels: ['Annoying', 'Costly', 'Customers leave', 'Regulator or headlines'], diagnosis: 'One bad week could become a very public problem.', why: 'An outage puts customers, revenue, or regulatory standing at risk.', action: 'Write a one-page fallback plan for a week-long outage.' },
  { key: 'age', name: 'Age', text: 'When was it last seriously redesigned?', labels: ['This year', '1–3 years', '3–5 years', 'Nobody remembers'], diagnosis: 'The process has outlived the world it was built for.', why: 'Old assumptions are still running current operations.', action: 'Book a two-hour redesign session with the people doing the work.' },
] as const;

export type Answers = [number, number, number, number, number];
export type Assessment = { industry: string; size: string; regulated: boolean; entries: { name: string; answers: Answers }[] };
export const isValidSelection = (count: number) => count >= 3 && count <= 6;
export const riskTier = (score: number) => score >= 80 ? 'Extinction-level' : score >= 60 ? 'Asteroid belt' : score >= 40 ? 'Climate change' : 'Fossil-stable';
export const timeToImpact = (score: number) => score >= 80 ? '0–6 months' : score >= 60 ? '6–12 months' : score >= 40 ? '1–2 years' : 'Not today';
export function extinctionRiskScore(answers: Answers, regulated: boolean, name: string) {
  const [bus, tape, blind, blast, age] = answers;
  const base = Math.round(((bus + tape + age) * (blast * 3) * (blind * 3)) / 729 * 100);
  const modifier = regulated && [processes[7], processes[8], processes[10]].some(p => p === name) ? 1.2 : 1;
  return Math.min(100, Math.round(base * modifier));
}
export function rankAssessment(assessment: Assessment) {
  return assessment.entries.map(entry => ({ ...entry, score: extinctionRiskScore(entry.answers, assessment.regulated, entry.name) })).sort((a, b) => b.score - a.score);
}
export function diagnose(answers: Answers, score: number) {
  const dominant = questions.map((q, i) => ({ ...q, value: answers[i] ?? 0 })).sort((a, b) => b.value - a.value).filter(q => q.value > 0).slice(0, 3);
  return { dominant, paragraph: dominant.length ? dominant.map(q => q.diagnosis).join(' ') + (score >= 60 ? " That's not a process. That's a hostage situation." : 'Not an extinction event yet. Still worth fixing before it grows teeth.') : 'No obvious fault lines in these answers. Keep the checks, backups, and documentation alive. Fossil-stable does not mean immortal.' };
}