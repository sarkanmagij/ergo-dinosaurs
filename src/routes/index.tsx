import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, ArrowUpRight, Clock3, Check, Plus, Download, Link2, RotateCcw, Flame, BriefcaseBusiness, UserRoundPlus, Headphones, Receipt, ShoppingCart, Users, ChartNoAxesCombined, ShieldCheck, Server, Package, MessageSquareWarning, Database, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import meteorImage from '@/assets/meteor-landscape.jpg';
import { processes, questions, rankAssessment, riskTier, timeToImpact, diagnose, isValidSelection, type Answers, type Assessment } from '@/lib/extinction-risk';
import { decodeAssessment, encodeAssessment } from '@/lib/share-assessment';
import { trackEvent } from '@/lib/autopsy-events';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'The T-Rex Test – A 5-Minute Digital Autopsy' },
    { name: 'description', content: "Dinosaurs didn't see it coming either. Find the process that could kill your company first in 5 minutes. No signup. No deck." },
    { property: 'og:title', content: 'The T-Rex Test – Find your meteor' },
    { property: 'og:description', content: 'A blunt, five-minute diagnostic. One ranked verdict. One first move on Monday.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

const icons = [BriefcaseBusiness, UserRoundPlus, Headphones, Receipt, ShoppingCart, Users, ChartNoAxesCombined, ShieldCheck, Server, Package, MessageSquareWarning, Database];
const industries = ['Technology', 'Financial services', 'Healthcare', 'Manufacturing', 'Retail & e-commerce', 'Professional services', 'Logistics & transport', 'Construction', 'Public sector', 'Other'];
function Header({ reset }: { reset: () => void }) {
  return <header className="site-header"><Button variant="ghost" onClick={reset} className="brand h-auto px-0 hover:bg-transparent" aria-label="The T-Rex Test home"><Flame className="brand-mark" strokeWidth={1.5} /><span>THE T-REX TEST<span className="text-primary">.</span></span></Button><div className="header-note"><span className="status-dot" /><span className="desktop-note">An extinction risk diagnostic</span><span className="md:hidden">5-minute autopsy</span></div></header>;
}
function Landing({ start }: { start: () => void }) {
  return <>
    <main>
      <section className="landing-hero">
        <img className="hero-image" src={meteorImage} width={1536} height={1024} alt="A molten meteor descending toward ancient fossil-bearing rocks" />
        <div className="hero-copy"><div className="eyebrow">A 5-minute digital autopsy</div><h1 className="hero-title">The T-Rex Test<span>Find your meteor.</span></h1><p className="hero-subtitle">Dinosaurs didn’t see it coming either.</p><p className="hero-description">Somewhere in your company, a broken process is waiting to become a very bad day. Find out which one.</p><Button variant="meteor" className="landing-cta" onClick={start}>Start the autopsy <ArrowUpRight /></Button><div className="cta-footnote"><Clock3 size={12} /> No signup. No deck. 5 minutes.</div></div>
        <span className="image-caption">Extinction rarely sends a calendar invite.</span>
      </section>
      <section className="method-section"><p className="section-label">The examination · three steps, no theater</p><div className="method-grid">{[
        ['01', 'Pick your processes.', 'The ones that keep the lights on. And the ones held together by a spreadsheet.'],
        ['02', 'Tell the ugly truth.', 'Five blunt questions per process. Nobody’s grading your homework.'],
        ['03', 'Meet your meteor.', 'One ranked verdict. The biggest threat. And your first move on Monday.'],
      ].map(([n,title,copy]) => <div className="method-item" key={n}><span className="method-number">{n}</span><div><h2>{title}</h2><p>{copy}</p></div></div>)}</div></section>
    </main><footer className="site-footer"><span>Built for operators. Not slide decks.</span><span className="flex items-center gap-2"><LockKeyhole size={11} /> Your answers stay in your browser.</span></footer>
  </>;
}

function Index() {
  const [step, setStep] = useState(-1);
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [regulated, setRegulated] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [customName, setCustomName] = useState('');
  const [answers, setAnswers] = useState<Record<string, Answers>>({});
  const [result, setResult] = useState<Assessment | null>(null);
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');
  const [invalidLink, setInvalidLink] = useState(false);
  useEffect(() => {
    function loadShared() {
      const hash = window.location.hash;
      if (!hash.startsWith('#r=')) return;
      const shared = decodeAssessment(hash.slice(3));
      if (shared) { setResult(shared); setStep(99); setInvalidLink(false); } else { setInvalidLink(true); }
    }
    loadShared(); window.addEventListener('hashchange', loadShared); return () => window.removeEventListener('hashchange', loadShared);
  }, []);
  function go(next: number) { setStep(next); setNotice(''); window.scrollTo({ top: 0, behavior: 'instant' }); }
  function reset() { setStep(-1); setResult(null); setSelected([]); setAnswers({}); setIndustry(''); setSize(''); setRegulated(null); setCustom(''); setCustomName(''); setNotice(''); setEmail(''); setInvalidLink(false); window.history.replaceState(null, '', window.location.pathname); window.scrollTo(0,0); }
  function toggleProcess(name: string) {
    if (selected.includes(name)) setSelected(selected.filter(p => p !== name));
    else if (selected.length < 6) { setSelected([...selected, name]); trackEvent('process_selected', { process: name }); }
  }
  const currentProcess = selected[step - 2];
  const currentAnswers = currentProcess ? answers[currentProcess] || [-1,-1,-1,-1,-1] as Answers : null;
  function finish() {
    const entries: Assessment['entries'] = [];
    for (const name of selected) {
      const entryAnswers = answers[name];
      if (!entryAnswers || entryAnswers.some(a => a < 0)) return;
      entries.push({ name, answers: entryAnswers });
    }
    const data: Assessment = { industry, size, regulated: regulated === true, entries };
    setResult(data); window.history.replaceState(null, '', `#r=${encodeAssessment(data)}`); trackEvent('completed', { processes: selected.length, score: rankAssessment(data)[0]?.score }); go(99);
  }
  const progress = step === 0 ? 8 : step === 1 ? 17 : Math.round((2 + step - 2) / (selected.length + 2) * 100);
  return <div className="site-shell"><Header reset={reset} />
    {step === -1 ? <>{invalidLink && <p role="alert" className="notice px-6">That result link is incomplete. Start a fresh autopsy.</p>}<Landing start={() => { trackEvent('start'); go(0); }} /></> : result && step === 99 ? <Verdict data={result} reset={reset} notice={notice} setNotice={setNotice} email={email} setEmail={setEmail} /> : <main className="wizard">
      <div className="progress-meta"><span>{step === 0 ? '01 / Company basics' : step === 1 ? '02 / The suspects' : `03 / Interrogation · ${step - 1} of ${selected.length}`}</span><span><Clock3 size={12} className="inline mr-1" />{step < 2 ? 'About 5 minutes' : `${Math.max(1, selected.length - step + 2)} min left`}</span></div><div className="progress-track"><progress value={progress} max={100} aria-label="Autopsy progress" /></div>
      {step === 0 && <><div className="eyebrow">Know the specimen</div><h1 className="step-title">First, the basics.</h1><p className="step-intro">Three facts. No company name. No awkward introductions.</p>
        <div className="field-group"><label className="field-label" htmlFor="industry">Your industry</label><select id="industry" className="form-input" value={industry} onChange={e => setIndustry(e.target.value)}><option value="" disabled>Select an industry</option>{industries.map(i => <option key={i}>{i}</option>)}</select></div>
        <div className="field-group"><span className="field-label" id="size-label">How many people?</span><div className="choices" role="group" aria-labelledby="size-label">{['1–50','51–250','251–1000','1000+'].map(s => <Button key={s} variant="outline" className="choice" aria-pressed={size === s} onClick={() => setSize(s)}>{s}</Button>)}</div></div>
        <div className="field-group"><span className="field-label" id="regulated-label">A regulated industry?</span><div className="choices binary" role="group" aria-labelledby="regulated-label">{[true,false].map(v => <Button key={String(v)} variant="outline" className="choice" aria-pressed={regulated === v} onClick={() => setRegulated(v)}>{v ? 'Yes' : 'No'}</Button>)}</div></div>
        <div className="wizard-actions"><Button variant="ghost" onClick={() => go(-1)}><ArrowLeft /> Back</Button><Button variant="meteor" size="lg" disabled={!industry || !size || regulated === null} onClick={() => go(1)}>Pick the suspects <ArrowRight /></Button></div>
      </>}
      {step === 1 && <><div className="eyebrow">The usual suspects</div><h1 className="step-title">What keeps the lights on?</h1><p className="step-intro">Pick 3 to 6 processes. Include the one nobody wants to talk about.</p><div className="process-grid">{processes.map((p,i) => { const Icon = icons[i]; return <Button key={p} variant="outline" className="process-choice" aria-pressed={selected.includes(p)} disabled={selected.length >= 6 && !selected.includes(p)} onClick={() => toggleProcess(p)}>{Icon && <Icon className="process-icon" />}<span>{p}</span>{selected.includes(p) && <Check className="check" />}</Button>; })}{customName && <Button variant="outline" className="process-choice" aria-pressed={selected.includes(customName)} disabled={selected.length >= 6 && !selected.includes(customName)} onClick={() => toggleProcess(customName)}><Plus /><span>{customName}</span>{selected.includes(customName) && <Check className="check" />}</Button>}</div>
        {!customName && <form className="custom-process" onSubmit={e => { e.preventDefault(); const name = custom.trim(); if (name && selected.length < 6 && !processes.some(p => p.toLowerCase() === name.toLowerCase())) { setCustomName(name); toggleProcess(name); } }}><input className="form-input" aria-label="Add your own process" placeholder="Something else? Add your own." maxLength={100} value={custom} onChange={e => setCustom(e.target.value)} /><Button variant="outline" size="icon" className="h-12 w-12 shrink-0" aria-label="Add custom process" type="submit" disabled={!custom.trim() || selected.length >= 6 || processes.some(p => p.toLowerCase() === custom.trim().toLowerCase())}><Plus /></Button></form>}
        <div className="wizard-actions"><Button variant="ghost" onClick={() => go(0)}><ArrowLeft /> Back</Button><span className="text-xs text-muted-foreground">{selected.length}/6 selected</span><Button variant="meteor" size="lg" disabled={!isValidSelection(selected.length)} onClick={() => go(2)}>Interrogate <ArrowRight /></Button></div>
      </>}
      {step >= 2 && currentProcess && currentAnswers && <><div className="eyebrow">Suspect {String(step - 1).padStart(2,'0')}</div><h1 className="step-title">{currentProcess}</h1><p className="step-intro">Answer for how it actually works. Not how the handbook says it does.</p>{questions.map((q,i) => <div className="question-row" key={q.key}><div className="question-meta">0{i+1} / {q.name}</div><fieldset><legend>{q.text}</legend><div className="choices">{q.labels.map((label, value) => <Button variant="outline" className="choice" aria-pressed={currentAnswers[i] === value} key={label} onClick={() => { const next = [...currentAnswers] as Answers; next[i] = value; setAnswers({ ...answers, [currentProcess]: next }); }}>{label}</Button>)}</div></fieldset></div>)}<div className="wizard-actions"><Button variant="ghost" onClick={() => go(step - 1)}><ArrowLeft /> Back</Button><Button variant="meteor" size="lg" disabled={currentAnswers.some(a => a < 0)} onClick={() => step - 1 === selected.length ? finish() : go(step + 1)}>{step - 1 === selected.length ? 'Reveal my meteor' : 'Next suspect'} <ArrowRight /></Button></div></>}
    </main>}
  </div>;
}

function Verdict({ data, reset, notice, setNotice, email, setEmail }: { data: Assessment; reset: () => void; notice: string; setNotice: (s: string) => void; email: string; setEmail: (s: string) => void }) {
  const ranked = rankAssessment(data); const meteor = ranked[0];
  if (!meteor) return null;
  const diagnosis = diagnose(meteor.answers, meteor.score);
  return <main className="verdict"><div className="meteor-streak" aria-hidden="true" /><div className="verdict-lead"><div><div className="eyebrow">Autopsy complete · the verdict</div><h1 className="verdict-title">Your meteor:<span>{meteor.name}</span></h1><p className="text-sm text-muted-foreground">{meteor.score < 40 ? 'Impact estimated: Not today.' : `Impact estimated in ${timeToImpact(meteor.score)}.`}</p></div><div><div className="score">{meteor.score}<small>/100</small></div><span className="tier">{riskTier(meteor.score)}</span></div></div><p className="diagnosis">{diagnosis.paragraph}</p><div className="verdict-details"><section><h2 className="report-label">Why it’ll kill you</h2><ul className="risk-bullets">{diagnosis.dominant.length ? diagnosis.dominant.map(q => <li key={q.key}>{q.why}</li>) : <li>No material weaknesses surfaced in these answers. Keep testing that assumption.</li>}</ul></section><section><h2 className="report-label">First move on Monday</h2><p className="monday">{diagnosis.dominant[0]?.action || 'Keep one weekly check. Review again in six months.'}</p></section></div>
    <section className="ranking"><h2 className="report-label">The rest of the fossil record</h2>{ranked.slice(1).map((p,i) => <div className="ranking-row" key={p.name}><div className="ranking-title"><span><span className="text-muted-foreground mr-3">0{i+2}</span>{p.name}</span><strong className="shrink-0">{p.score}<span className="text-muted-foreground font-normal">/100</span></strong></div><progress value={p.score} max={100} aria-label={`${p.name}: ${p.score} out of 100`} /><span className="ranking-tier">{riskTier(p.score)}</span></div>)}</section>
    <div className="report-actions"><Button variant="meteor" onClick={async () => { try { const { downloadAutopsy } = await import('@/lib/autopsy-pdf'); downloadAutopsy(data); trackEvent('pdf_downloaded'); } catch { setNotice('The report could not download. Please try again.'); } }}><Download /> Download one-pager (PDF)</Button><Button variant="outline" onClick={async () => { const link = `${window.location.origin}${window.location.pathname}#r=${encodeAssessment(data)}`; try { await navigator.clipboard.writeText(link); setNotice('Link copied. Anyone with it can read these answers.'); } catch { setNotice('Copy the result link from your browser’s address bar.'); } }}><Link2 /> Copy shareable link</Button><Button variant="ghost" onClick={reset}><RotateCcw /> Retake</Button></div>
    {notice && <p className="notice" role="status">{notice}</p>}
    <p className="report-disclaimer">Self-reported answers. Time-to-impact is a heuristic, not a forecast. Sharing a link shares your answers, not your identity.</p>
    <details className="mb-8 text-xs text-muted-foreground"><summary className="cursor-pointer py-2">Show the scoring</summary><p className="leading-7 mt-2">Each answer: 0–3. Likelihood = bus factor + duct tape + age. Impact = blast radius × 3. Detection = blindness × 3. Score = round(likelihood × impact × detection / 729 × 100). Regulated compliance, claims, and IT processes receive a 1.2× modifier, rounded and capped at 100. Ties follow selection order.</p></details>
    <section className="lead-capture"><h2>Want someone to actually fix it?</h2><form onSubmit={e => { e.preventDefault(); setNotice('Contact requests aren’t connected yet. Your email has not been saved or sent.'); }}><input className="form-input" type="email" aria-label="Email for optional follow-up" placeholder="Your email (optional)" maxLength={320} required value={email} onChange={e => setEmail(e.target.value)} /><Button variant="outline" type="submit" size="lg">Let’s talk <ArrowUpRight /></Button></form><p className="notice">Follow-up is not connected yet. No email is stored or sent.</p></section>
  </main>;
}
