import { describe, it, expect } from 'vitest';
import { extinctionRiskScore, processes, riskTier, timeToImpact, rankAssessment, isValidSelection } from '../lib/extinction-risk';
import { encodeAssessment, decodeAssessment } from '../lib/share-assessment';
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
});