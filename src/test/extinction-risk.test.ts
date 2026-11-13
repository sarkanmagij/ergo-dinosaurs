import { describe, it, expect } from 'vitest';
import { extinctionRiskScore, processes, riskTier, timeToImpact, rankAssessment, isValidSelection } from '../lib/extinction-risk';
import { encodeAssessment, decodeAssessment } from '../lib/share-assessment';
import { diagnose, questions } from '../lib/extinction-risk';
import { dictionaries } from '../lib/i18n';
import { industryNames } from '../lib/i18n/en';
import { buildAutopsy } from '../lib/autopsy-pdf';
import { readFileSync } from 'node:fs';
describe('Autopsy rules', () => {
  it('uses likelihood × impact × detection / 729', () => { expect(extinctionRiskScore([1,2,2,3,3], false, 'Custom')).toBe(44); });
  it('covers scores from zero to 100', () => { expect(extinctionRiskScore([0,0,0,0,0], false, 'Custom')).toBe(0); expect(extinctionRiskScore([3,3,3,3,3], false, 'Custom')).toBe(100); });
  it.each([processes[7], processes[8], processes[10]])('applies regulated 1.2 modifier to %s', name => { expect(extinctionRiskScore([2,2,2,2,2], true, name)).toBe(36); expect(extinctionRiskScore([3,3,3,3,3], true, name)).toBe(100); });
  it('does not boost other processes or unregulated companies', () => { expect(extinctionRiskScore([2,2,2,2,2], true, processes[0])).toBe(30); expect(extinctionRiskScore([2,2,2,2,2], false, processes[7])).toBe(30); });
  it.each([[80,'Extinction-level','0–6 months'],[79,'Asteroid belt','6–12 months'],[60,'Asteroid belt','6–12 months'],[59,'Climate change','1–2 years'],[40,'Climate change','1–2 years'],[39,'Fossil-stable','Not today']] as const)('maps score %s to the specified tier and timeline', (score,tier,time) => { expect(riskTier(score)).toBe(tier); expect(timeToImpact(score)).toBe(time); });
  it('allows 3 to 6 processes only', () => { expect([2,3,6,7].map(isValidSelection)).toEqual([false,true,true,false]); });
  it('ranks highest first and round-trips a shared assessment', () => {
    const data = { industry:'Other', size:'1–50', regulated:false, entries: [{ name:'A', answers:[0,0,0,0,0] as [number,number,number,number,number] }, { name:'B', answers:[3,3,3,3,3] as [number,number,number,number,number] }, { name:'C', answers:[2,2,2,2,2] as [number,number,number,number,number] }] };
    expect(rankAssessment(data).map(p => p.name)).toEqual(['B','C','A']); expect(decodeAssessment(encodeAssessment(data))).toEqual(data);
  });
  it('rejects malformed shared answers', () => { expect(decodeAssessment('invalid')).toBeNull(); });
  it.each(Object.entries(dictionaries))('has complete %s copy', (_lang, t) => {
    expect(Object.keys(t).sort()).toEqual(Object.keys(dictionaries.en).sort());
    expect(Object.keys(t.processes)).toEqual([...processes]);
    expect(Object.keys(t.industries)).toEqual([...industryNames]);
    expect(Object.keys(t.tiers)).toEqual(Object.keys(dictionaries.en.tiers));
    expect(Object.keys(t.times)).toEqual(Object.keys(dictionaries.en.times));
    expect(t.methodSteps).toHaveLength(3);
    for (const q of questions) expect(Object.values(t.questions[q.key]).flat().every(v => typeof v === 'string' && v.length > 0)).toBe(true);
  });
  it('keeps the English diagnosis unchanged and translates it without changing the ranking', () => {
    const answers: [number,number,number,number,number] = [3,1,2,0,0];
    expect(diagnose(answers, 70).paragraph).toBe("It lives in one person's head. You'd hear about failure from the outside first. Spreadsheets and copy-paste are holding it together. That's not a process. That's a hostage situation.");
    expect(diagnose(answers, 70, dictionaries.en)).toEqual(diagnose(answers, 70));
    const lv = diagnose(answers, 70, dictionaries.lv);
    expect(lv.dominant.map(q => q.key)).toEqual(['bus','blind','tape']);
    expect(lv.paragraph).toBe('Tas dzīvo viena cilvēka galvā. Par kļūmi tu vispirms uzzinātu no malas. To kopā satur tabulas un copy-paste. Tas nav process. Tā ir ķīlnieku krīze.');
    expect(diagnose([0,0,0,0,0], 0, dictionaries.lt).paragraph).toBe(dictionaries.lt.closers.clean);
  });
  it.each(Object.keys(dictionaries) as (keyof typeof dictionaries)[])('builds a %s PDF with the embedded font', lang => {
    const font = (name: string) => readFileSync(`src/assets/fonts/${name}`).toString('base64');
    const data = { industry:'Other', size:'1–50', regulated:true, entries: processes.slice(7, 11).map(name => ({ name, answers:[3,2,3,2,1] as [number,number,number,number,number] })) };
    const doc = buildAutopsy(data, dictionaries[lang], lang, { regular: font('DMSans-Regular.ttf'), bold: font('DMSans-Bold.ttf') });
    expect(doc?.getNumberOfPages()).toBe(1);
    expect(doc?.getFontList()['DMSans']).toEqual(['normal', 'bold']);
  });
});
