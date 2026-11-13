import { jsPDF } from 'jspdf';
import regularFontUrl from '@/assets/fonts/DMSans-Regular.ttf?url';
import boldFontUrl from '@/assets/fonts/DMSans-Bold.ttf?url';
import { diagnose, rankAssessment, riskTier, timeToImpact, type Assessment } from './extinction-risk';
import type { Dict, Lang } from './i18n/types';

export type PdfFonts = { regular: string; bold: string };

// The built-in PDF fonts lack Baltic letters (ā, č, ė, ų ...), so the report embeds DM Sans.
async function fontBase64(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Font request failed: ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

export function buildAutopsy(data: Assessment, t: Dict, lang: Lang, fonts: PdfFonts) {
  const doc = new jsPDF();
  doc.addFileToVFS('DMSans-Regular.ttf', fonts.regular); doc.addFont('DMSans-Regular.ttf', 'DMSans', 'normal');
  doc.addFileToVFS('DMSans-Bold.ttf', fonts.bold); doc.addFont('DMSans-Bold.ttf', 'DMSans', 'bold');
  const ranked = rankAssessment(data);
  const meteor = ranked[0];
  if (!meteor) return null;
  const diagnosis = diagnose(meteor.answers, meteor.score, t);
  const processName = (name: string) => (t.processes as Record<string, string>)[name] ?? name;
  const tier = (score: number) => t.tiers[riskTier(score)] ?? riskTier(score);
  const time = (score: number) => t.times[timeToImpact(score)] ?? timeToImpact(score);
  const heading = (value: string) => value.toLocaleUpperCase(lang);
  let y = 23;
  const text = (value: string, size = 11, bold = false) => {
    doc.setFont('DMSans', bold ? 'bold' : 'normal'); doc.setFontSize(size);
    const lines = doc.splitTextToSize(value, 170); doc.text(lines, 20, y); y += lines.length * (size * .42) + 5;
  };
  text('THE T-REX TEST', 11, true); text(t.pdfSubtitle, 10);
  y += 3; text(`${t.yourMeteor} ${processName(meteor.name)}`, 24, true);
  text(`${meteor.score}/100 | ${tier(meteor.score)} | ${time(meteor.score)}`, 12, true);
  text(`${t.industries[data.industry] ?? data.industry} | ${t.pdfPeople(data.size)} | ${data.regulated ? t.pdfRegulated : t.pdfNotRegulated}`, 10);
  text(diagnosis.paragraph);
  text(heading(t.whyKill), 10, true);
  diagnosis.dominant.forEach(q => text(`- ${q.why}`, 10));
  text(heading(t.firstMove), 10, true);
  text(diagnosis.dominant[0]?.action || t.fallbackAction, 11);
  text(heading(t.restRecord), 10, true);
  ranked.slice(1).forEach(p => text(`${processName(p.name)}: ${p.score}/100 - ${tier(p.score)}`, 10));
  doc.setFont('DMSans', 'normal'); doc.setFontSize(8); doc.text(t.pdfDisclaimer, 20, 281);
  return doc;
}

export async function downloadAutopsy(data: Assessment, t: Dict, lang: Lang) {
  const [regular, bold] = await Promise.all([fontBase64(regularFontUrl), fontBase64(boldFontUrl)]);
  buildAutopsy(data, t, lang, { regular, bold })?.save('t-rex-autopsy.pdf');
}
