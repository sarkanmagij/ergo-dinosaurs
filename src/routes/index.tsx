import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, ArrowUpRight, Clock3, Check, Plus, Download, Link2, RotateCcw, Flame, BriefcaseBusiness, UserRoundPlus, Headphones, Receipt, ShoppingCart, Users, ChartNoAxesCombined, ShieldCheck, Server, Package, MessageSquareWarning, Database, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useI18n } from '@/lib/i18n';
import { industryNames } from '@/lib/i18n/en';
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
function Header({ reset }: { reset: () => void }) {
  const { t } = useI18n();
  return <header className="site-header"><Button variant="ghost" onClick={reset} className="brand h-auto px-0 hover:bg-transparent" aria-label={t.homeAria}><Flame className="brand-mark" strokeWidth={1.5} /><span>THE T-REX TEST<span className="text-primary">.</span></span></Button><div className="header-tools"><div className="header-note"><span className="status-dot" /><span className="desktop-note">{t.headerNote}</span><span className="md:hidden">{t.headerNoteShort}</span></div><LanguageSwitcher /><ThemeToggle /></div></header>;
}
function Landing({ start }: { start: () => void }) {
  const { t } = useI18n();
  return <>
    <main>
      <section className="landing-hero">
        <img className="hero-image" src={meteorImage} width={1536} height={1024} alt={t.heroAlt} />
        <div className="hero-copy"><div className="eyebrow">{t.heroEyebrow}</div><h1 className="hero-title">The T-Rex Test<span>{t.heroTagline}</span></h1><p className="hero-subtitle">{t.heroSubtitle}</p><p className="hero-description">{t.heroDescription}</p><Button variant="meteor" className="landing-cta" onClick={start}>{t.startCta} <ArrowUpRight /></Button><div className="cta-footnote"><Clock3 size={12} /> {t.ctaFootnote}</div></div>
        <span className="image-caption">{t.imageCaption}</span>
      </section>
      <section className="method-section"><p className="section-label">{t.methodLabel}</p><div className="method-grid">{t.methodSteps.map(([title,copy],i) => <div className="method-item" key={title}><span className="method-number">0{i+1}</span><div><h2>{title}</h2><p>{copy}</p></div></div>)}</div></section>
    </main><footer className="site-footer"><span>{t.footerLeft}</span><span className="flex items-center gap-2"><LockKeyhole size={11} /> {t.footerRight}</span></footer>
  </>;
}

function Index() {
  const { t } = useI18n();
  const processLabel = (name: string) => (t.processes as Record<string, string>)[name] ?? name;
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
    {step === -1 ? <>{invalidLink && <p role="alert" className="notice px-6">{t.invalidLink}</p>}<Landing start={() => { trackEvent('start'); go(0); }} /></> : result && step === 99 ? <Verdict data={result} reset={reset} notice={notice} setNotice={setNotice} email={email} setEmail={setEmail} /> : <main className="wizard">
      <div className="progress-meta"><span>{step === 0 ? `01 / ${t.stepBasics}` : step === 1 ? `02 / ${t.stepSuspects}` : `03 / ${t.stepInterrogation(step - 1, selected.length)}`}</span><span><Clock3 size={12} className="inline mr-1" />{step < 2 ? t.aboutFiveMin : t.minLeft(Math.max(1, selected.length - step + 2))}</span></div><div className="progress-track"><progress value={progress} max={100} aria-label={t.progressAria} /></div>
      {step === 0 && <><div className="eyebrow">{t.basicsEyebrow}</div><h1 className="step-title">{t.basicsTitle}</h1><p className="step-intro">{t.basicsIntro}</p>
        <div className="field-group"><label className="field-label" htmlFor="industry">{t.industryLabel}</label><select id="industry" className="form-input" value={industry} onChange={e => setIndustry(e.target.value)}><option value="" disabled>{t.industryPlaceholder}</option>{industryNames.map(i => <option key={i} value={i}>{t.industries[i] ?? i}</option>)}</select></div>
        <div className="field-group"><span className="field-label" id="size-label">{t.sizeLabel}</span><div className="choices" role="group" aria-labelledby="size-label">{['1–50','51–250','251–1000','1000+'].map(s => <Button key={s} variant="outline" className="choice" aria-pressed={size === s} onClick={() => setSize(s)}>{s}</Button>)}</div></div>
        <div className="field-group"><span className="field-label" id="regulated-label">{t.regulatedLabel}</span><div className="choices binary" role="group" aria-labelledby="regulated-label">{[true,false].map(v => <Button key={String(v)} variant="outline" className="choice" aria-pressed={regulated === v} onClick={() => setRegulated(v)}>{v ? t.yes : t.no}</Button>)}</div></div>
        <div className="wizard-actions"><Button variant="ghost" onClick={() => go(-1)}><ArrowLeft /> {t.back}</Button><Button variant="meteor" size="lg" disabled={!industry || !size || regulated === null} onClick={() => go(1)}>{t.pickSuspects} <ArrowRight /></Button></div>
      </>}
      {step === 1 && <><div className="eyebrow">{t.suspectsEyebrow}</div><h1 className="step-title">{t.suspectsTitle}</h1><p className="step-intro">{t.suspectsIntro}</p><div className="process-grid">{processes.map((p,i) => { const Icon = icons[i]; return <Button key={p} variant="outline" className="process-choice" aria-pressed={selected.includes(p)} disabled={selected.length >= 6 && !selected.includes(p)} onClick={() => toggleProcess(p)}>{Icon && <Icon className="process-icon" />}<span>{processLabel(p)}</span>{selected.includes(p) && <Check className="check" />}</Button>; })}{customName && <Button variant="outline" className="process-choice" aria-pressed={selected.includes(customName)} disabled={selected.length >= 6 && !selected.includes(customName)} onClick={() => toggleProcess(customName)}><Plus /><span>{customName}</span>{selected.includes(customName) && <Check className="check" />}</Button>}</div>
        {!customName && <form className="custom-process" onSubmit={e => { e.preventDefault(); const name = custom.trim(); if (name && selected.length < 6 && !processes.some(p => p.toLowerCase() === name.toLowerCase())) { setCustomName(name); toggleProcess(name); } }}><input className="form-input" aria-label={t.addOwnAria} placeholder={t.addOwnPlaceholder} maxLength={100} value={custom} onChange={e => setCustom(e.target.value)} /><Button variant="outline" size="icon" className="h-12 w-12 shrink-0" aria-label={t.addCustomAria} type="submit" disabled={!custom.trim() || selected.length >= 6 || processes.some(p => p.toLowerCase() === custom.trim().toLowerCase())}><Plus /></Button></form>}
        <div className="wizard-actions"><Button variant="ghost" onClick={() => go(0)}><ArrowLeft /> {t.back}</Button><span className="text-xs text-muted-foreground">{t.selectedCount(selected.length)}</span><Button variant="meteor" size="lg" disabled={!isValidSelection(selected.length)} onClick={() => go(2)}>{t.interrogate} <ArrowRight /></Button></div>
      </>}
      {step >= 2 && currentProcess && currentAnswers && <><div className="eyebrow">{t.suspect(String(step - 1).padStart(2,'0'))}</div><h1 className="step-title">{processLabel(currentProcess)}</h1><p className="step-intro">{t.interrogationIntro}</p>{questions.map((q,i) => <div className="question-row" key={q.key}><div className="question-meta">0{i+1} / {t.questions[q.key].name}</div><fieldset><legend>{t.questions[q.key].text}</legend><div className="choices">{t.questions[q.key].labels.map((label, value) => <Button variant="outline" className="choice" aria-pressed={currentAnswers[i] === value} key={value} onClick={() => { const next = [...currentAnswers] as Answers; next[i] = value; setAnswers({ ...answers, [currentProcess]: next }); }}>{label}</Button>)}</div></fieldset></div>)}<div className="wizard-actions"><Button variant="ghost" onClick={() => go(step - 1)}><ArrowLeft /> {t.back}</Button><Button variant="meteor" size="lg" disabled={currentAnswers.some(a => a < 0)} onClick={() => step - 1 === selected.length ? finish() : go(step + 1)}>{step - 1 === selected.length ? t.reveal : t.nextSuspect} <ArrowRight /></Button></div></>}
    </main>}
  </div>;
}

function Verdict({ data, reset, notice, setNotice, email, setEmail }: { data: Assessment; reset: () => void; notice: string; setNotice: (s: string) => void; email: string; setEmail: (s: string) => void }) {
  const { t, lang } = useI18n();
  const ranked = rankAssessment(data); const meteor = ranked[0];
  if (!meteor) return null;
  const diagnosis = diagnose(meteor.answers, meteor.score, t);
  const processLabel = (name: string) => (t.processes as Record<string, string>)[name] ?? name;
  const tier = (score: number) => t.tiers[riskTier(score)] ?? riskTier(score);
  const time = t.times[timeToImpact(meteor.score)] ?? timeToImpact(meteor.score);
  return <main className="verdict"><div className="meteor-streak" aria-hidden="true" /><div className="verdict-lead"><div><div className="eyebrow">{t.verdictEyebrow}</div><h1 className="verdict-title">{t.yourMeteor}<span>{processLabel(meteor.name)}</span></h1><p className="text-sm text-muted-foreground">{t.impact(time)}</p></div><div><div className="score">{meteor.score}<small>/100</small></div><span className="tier">{tier(meteor.score)}</span></div></div><p className="diagnosis">{diagnosis.paragraph}</p><div className="verdict-details"><section><h2 className="report-label">{t.whyKill}</h2><ul className="risk-bullets">{diagnosis.dominant.length ? diagnosis.dominant.map(q => <li key={q.key}>{q.why}</li>) : <li>{t.noWeakness}</li>}</ul></section><section><h2 className="report-label">{t.firstMove}</h2><p className="monday">{diagnosis.dominant[0]?.action || t.fallbackAction}</p></section></div>
    <section className="ranking"><h2 className="report-label">{t.restRecord}</h2>{ranked.slice(1).map((p,i) => <div className="ranking-row" key={p.name}><div className="ranking-title"><span><span className="text-muted-foreground mr-3">0{i+2}</span>{processLabel(p.name)}</span><strong className="shrink-0">{p.score}<span className="text-muted-foreground font-normal">/100</span></strong></div><progress value={p.score} max={100} aria-label={t.rankAria(processLabel(p.name), p.score)} /><span className="ranking-tier">{tier(p.score)}</span></div>)}</section>
    <div className="report-actions"><Button variant="meteor" onClick={async () => { try { const { downloadAutopsy } = await import('@/lib/autopsy-pdf'); await downloadAutopsy(data, t, lang); trackEvent('pdf_downloaded'); } catch { setNotice(t.pdfError); } }}><Download /> {t.downloadPdf}</Button><Button variant="outline" onClick={async () => { const link = `${window.location.origin}${window.location.pathname}#r=${encodeAssessment(data)}`; try { await navigator.clipboard.writeText(link); setNotice(t.linkCopied); } catch { setNotice(t.copyFallback); } }}><Link2 /> {t.copyLink}</Button><Button variant="ghost" onClick={reset}><RotateCcw /> {t.retake}</Button></div>
    {notice && <p className="notice" role="status">{notice}</p>}
    <p className="report-disclaimer">{t.disclaimer}</p>
    <details className="mb-8 text-xs text-muted-foreground"><summary className="cursor-pointer py-2">{t.showScoring}</summary><p className="leading-7 mt-2">{t.scoring}</p></details>
    <section className="lead-capture"><h2>{t.leadTitle}</h2><form onSubmit={e => { e.preventDefault(); setNotice(t.leadNotConnected); }}><input className="form-input" type="email" aria-label={t.emailAria} placeholder={t.emailPlaceholder} maxLength={320} required value={email} onChange={e => setEmail(e.target.value)} /><Button variant="outline" type="submit" size="lg">{t.letsTalk} <ArrowUpRight /></Button></form><p className="notice">{t.leadNote}</p></section>
  </main>;
}
