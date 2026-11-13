import { jsPDF } from 'jspdf';
import { diagnose, rankAssessment, riskTier, timeToImpact, type Assessment } from './extinction-risk';
export function downloadAutopsy(data: Assessment) {
  const doc = new jsPDF();
  const ranked = rankAssessment(data);
  const meteor = ranked[0];
  if (!meteor) return;
  const diagnosis = diagnose(meteor.answers, meteor.score);
  const clean = (text: string) => text.replaceAll('–', '-').replaceAll('’', "'");
  let y = 23;
  const text = (value: string, size = 11, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size);
    const lines = doc.splitTextToSize(clean(value), 170); doc.text(lines, 20, y); y += lines.length * (size * .42) + 5;
  };
  text('THE T-REX TEST', 11, true); text('A 5-Minute Digital Autopsy', 10);
  y += 3; text(`Your meteor: ${meteor.name}`, 24, true);
  text(`${meteor.score}/100 | ${riskTier(meteor.score)} | ${timeToImpact(meteor.score)}`, 12, true);
  text(`${data.industry} | ${data.size} people | ${data.regulated ? 'Regulated' : 'Not regulated'}`, 10);
  text(diagnosis.paragraph);
  text("WHY IT'LL KILL YOU", 10, true);
  diagnosis.dominant.forEach(q => text(`- ${q.why}`, 10));
  text('FIRST MOVE ON MONDAY', 10, true);
  text(diagnosis.dominant[0]?.action || 'Keep one weekly check and review the process again in six months.', 11);
  text('THE REST OF THE FOSSIL RECORD', 10, true);
  ranked.slice(1).forEach(p => text(`${p.name}: ${p.score}/100 - ${riskTier(p.score)}`, 10));
  doc.setFontSize(8); doc.text('Self-reported diagnostic. Time estimates are heuristic, not forecasts.', 20, 281);
  doc.save('t-rex-autopsy.pdf');
}