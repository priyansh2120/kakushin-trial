import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  ChevronRight,
  Clock3,
  FileSpreadsheet,
  Landmark,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { UserContext } from '../contexts/UserContext';
import API_BASE_URL from '../config';

const modules = [
  {
    id: 'itr-filing',
    icon: FileSpreadsheet,
    color: 'from-sky-500 to-blue-600',
    title: 'ITR Filing Mock',
    subtitle: 'Practice the salaried return flow before the real portal',
    difficulty: 'Yearly essential',
    basedOn: 'Income Tax Department ITR-1 online filing and e-verify flow',
    sourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/how-to-file-itr1-form-sahaj',
    checklist: [
      'Read Form 16 before opening the return form',
      'Cross-check AIS / 26AS instead of trusting payroll blindly',
      'Confirm bank account for refund and e-verification',
    ],
  },
  {
    id: 'tds-check',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-600',
    title: 'TDS & Form 16 Reconciliation',
    subtitle: 'Catch salary tax mismatches before they become notices',
    difficulty: 'Common working-professional pain point',
    basedOn: 'Income Tax Department tax-credit mismatch and Form 26AS / AIS reconciliation flow',
    sourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/tax-credit-mismatch',
    steps: [
      { title: 'Read Form 16 first', detail: 'Use it as the employer-declared salary and TDS summary, but do not treat it as the only source of truth.' },
      { title: 'Compare tax credit with portal data', detail: 'Match employer TDS with Form 26AS and AIS-style credit checks so you can spot missing or delayed deduction reporting.' },
      { title: 'Review salary components', detail: 'Check basic pay, HRA, special allowance, bonus, perquisites, and deductions to make sure payroll classification looks consistent.' },
      { title: 'Flag mismatches early', detail: 'If employer tax is missing or lower than expected, the mock teaches you to pause filing and resolve it before submission.' },
      { title: 'Document the final tax position', detail: 'Finish with a clean summary: matched, mismatch found, or extra tax still payable.' },
    ],
    checklist: [
      'Never file on Form 16 alone when AIS / 26AS data differs',
      'Check bonus and FD interest before assuming refund',
      'Treat mismatch resolution as a pre-filing step, not an afterthought',
    ],
  },
  {
    id: 'epf-lab',
    icon: Landmark,
    color: 'from-violet-500 to-fuchsia-600',
    title: 'EPF / UAN Service Lab',
    subtitle: 'Understand passbook, transfer, and claim journeys',
    difficulty: 'Useful during job switches',
    basedOn: 'EPFO member service journeys like passbook, claim status, and transfer support',
    sourceUrl: 'https://www.epfindia.gov.in/site_en/For_Employees.php',
    steps: [
      { title: 'Check UAN and KYC readiness', detail: 'The mock starts by confirming UAN access and whether bank, PAN, and Aadhaar details are in a usable state.' },
      { title: 'Read the passbook correctly', detail: 'You practice separating employee contribution, employer contribution, and pension-related understanding instead of just scanning totals.' },
      { title: 'Handle job-switch transfer logic', detail: 'The guided flow teaches when you should transfer EPF rather than leave scattered balances across employers.' },
      { title: 'Track claim and service status', detail: 'Learn the order of checks before raising panic: passbook update, transfer status, and claim status.' },
      { title: 'Close with an action plan', detail: 'You finish with a clear result: keep invested, transfer, or investigate service mismatch.' },
    ],
    checklist: [
      'Understand EPF transfer before withdrawal temptations',
      'Check if KYC blocks the next action',
      'Track service history across employers',
    ],
  },
  {
    id: 'regime-decoder',
    icon: Briefcase,
    color: 'from-amber-500 to-orange-600',
    title: 'Old vs New Regime Decoder',
    subtitle: 'Practice the regime decision salaried workers struggle with',
    difficulty: 'Needed before return filing and payroll declarations',
    basedOn: 'Income Tax Department FAQ on new tax vs old tax regime',
    sourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/new-tax-vs-old-tax-regime-faqs',
    steps: [
      { title: 'List deductions you actually use', detail: 'The mock begins with real deduction habits like 80C, HRA, home-loan interest, NPS, and insurance instead of idealized assumptions.' },
      { title: 'Estimate both regime outcomes', detail: 'You compare lower tax against lower flexibility and learn why the default option is not always the best option for every salaried person.' },
      { title: 'Check whether you can switch freely', detail: 'The module highlights the difference between non-business salary cases and business-income restrictions.' },
      { title: 'Align payroll declaration and final return', detail: 'The practice flow shows why last-minute regime changes can create confusion between employer payroll and final filing.' },
      { title: 'Leave with a regime memo', detail: 'The result summarizes which regime wins and what evidence supports that choice.' },
    ],
    checklist: [
      'Compare both regimes with your actual deductions',
      'Do not optimize payroll and final return as if they are unrelated',
      'Revisit the choice when salary, rent, or home-loan status changes',
    ],
  },
];

const itrSteps = [
  { id: 'login', title: 'Login', caption: 'Mock portal sign-in' },
  { id: 'file-return', title: 'File Return', caption: 'Assessment year and filing mode' },
  { id: 'select-itr', title: 'Return Selection', caption: 'Taxpayer profile and ITR form' },
  { id: 'income', title: 'Income Details', caption: 'Salary and bank interest' },
  { id: 'deductions', title: 'Deductions & Regime', caption: 'Old vs new regime choice' },
  { id: 'tax-paid', title: 'Taxes Paid', caption: 'TDS and self-assessment' },
  { id: 'preview', title: 'Preview', caption: 'Review and e-verify' },
];

const tdsSteps = [
  { id: 'documents', title: 'Documents', caption: 'Form 16, AIS, and 26AS inputs' },
  { id: 'salary-check', title: 'Salary Check', caption: 'Employer figures vs expected payroll' },
  { id: 'credit-check', title: 'Tax Credit Check', caption: 'TDS reported vs portal credit' },
  { id: 'resolution', title: 'Resolution', caption: 'Mismatch decision before filing' },
];

const epfSteps = [
  { id: 'uan', title: 'UAN Access', caption: 'KYC and portal readiness' },
  { id: 'passbook', title: 'Passbook Review', caption: 'Contribution understanding' },
  { id: 'transfer', title: 'Transfer Decision', caption: 'Job-switch action choice' },
  { id: 'claim-status', title: 'Claim & Status', caption: 'Resolution and next step' },
];

const regimeSteps = [
  { id: 'income', title: 'Income Setup', caption: 'Salary and basic profile' },
  { id: 'deductions', title: 'Deductions', caption: 'Old-regime benefits used' },
  { id: 'comparison', title: 'Compare Regimes', caption: 'Tax-saving logic' },
  { id: 'decision', title: 'Final Choice', caption: 'Payroll and filing decision' },
];

const emptyDraft = {
  scenarioSummary: '',
  chosenActions: '',
  checksPerformed: '',
  finalDecision: '',
};

const initialItrDraft = {
  pan: 'ABCDE1234F',
  password: '',
  assessmentYear: '2026-27',
  filingSection: '139(1)',
  filingMode: 'Online',
  taxpayerStatus: 'Individual',
  residentStatus: 'Resident',
  itrForm: 'ITR-1',
  regime: 'New',
  salaryIncome: '650000',
  interestIncome: '12000',
  otherIncome: '0',
  deduction80c: '50000',
  deduction80d: '12000',
  hraExemption: '0',
  homeLoanInterest: '0',
  tdsSalary: '42000',
  tdsOther: '600',
  advanceTax: '0',
  selfAssessmentTax: '0',
  bankAccountVerified: false,
  aisChecked: false,
  form26asChecked: false,
  prefillReviewed: false,
  eVerifyMethod: 'Aadhaar OTP',
  declarationAccepted: false,
};

const initialTdsDraft = {
  form16Salary: '650000',
  expectedSalary: '650000',
  form16Tds: '42000',
  form26asTds: '42000',
  aisTds: '42000',
  bonusIncluded: true,
  bankInterestIncluded: false,
  salaryMismatchNote: '',
  taxCreditMismatchNote: '',
  resolutionAction: 'Proceed to file return',
  employerContacted: false,
  proofCollected: false,
  filingPaused: false,
};

const initialEpfDraft = {
  uanActive: true,
  kycStatus: 'Complete',
  panLinked: true,
  aadhaarLinked: true,
  currentEmployerPassbook: '36000',
  previousEmployerPassbook: '54000',
  employeeContribution: '45000',
  employerContribution: '45000',
  pensionContribution: '12500',
  changingJob: true,
  chosenAction: 'Transfer EPF to new employer',
  claimStatus: 'No claim initiated',
  issueObserved: '',
  proofChecked: false,
  nextActionNote: '',
};

const initialRegimeDraft = {
  salaryIncome: '900000',
  rentalStatus: 'No rent claim',
  homeLoan: false,
  deduction80c: '150000',
  deduction80d: '25000',
  npsContribution: '50000',
  hraExemption: '0',
  homeLoanInterest: '0',
  oldRegimeTaxEstimate: '82000',
  newRegimeTaxEstimate: '76000',
  hasBusinessIncome: false,
  payrollChoice: 'New',
  filingChoice: 'New',
  justification: '',
  reviewedSwitchingRule: false,
};

const STORAGE_KEY_PREFIX = 'career_lab_progress_v1';

const loadSavedState = (userId) => {
  if (typeof window === 'undefined' || !userId) return null;

  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveState = (userId, payload) => {
  if (typeof window === 'undefined' || !userId) return;
  window.localStorage.setItem(`${STORAGE_KEY_PREFIX}_${userId}`, JSON.stringify(payload));
};

const getStepReadiness = (steps, validator, draft) => {
  const completed = steps.filter((_, index) => validator(index, draft)).length;
  const score = Math.round((completed / steps.length) * 100);

  if (score >= 90) return { score, label: 'Strong submission readiness', tone: 'emerald' };
  if (score >= 65) return { score, label: 'Good, but review before submit', tone: 'sky' };
  if (score >= 40) return { score, label: 'Partially prepared', tone: 'amber' };
  return { score, label: 'Needs more work before AI review', tone: 'rose' };
};

const readinessToneMap = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  sky: 'border-sky-200 bg-sky-50 text-sky-900',
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  rose: 'border-rose-200 bg-rose-50 text-rose-900',
};

const SubmissionReadinessPanel = ({ readiness, completedSteps, totalSteps, accent = 'sky' }) => {
  const accentMap = {
    sky: 'text-sky-700',
    emerald: 'text-emerald-700',
    violet: 'text-violet-700',
    amber: 'text-amber-700',
  };

  return (
    <div className={`rounded-2xl border p-4 ${readinessToneMap[readiness.tone]}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] opacity-80 mb-2">AI Review Hint</p>
          <p className="text-lg font-semibold">{readiness.score}/100 readiness</p>
          <p className="text-sm mt-1">{readiness.label}</p>
        </div>
        <div className="rounded-full border border-current/15 bg-white/60 px-3 py-1 text-sm font-semibold">
          {completedSteps}/{totalSteps} steps ready
        </div>
      </div>
      <p className={`text-sm mt-3 font-medium ${accentMap[accent]}`}>
        Progress auto-saves locally. AI grading runs only after the final submit.
      </p>
    </div>
  );
};

const formatDateTime = (value) =>
  !value
    ? 'Just now'
    : new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value));

const getGradeTone = (grade) => {
  if (grade === 'A+' || grade === 'A') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (grade === 'B+' || grade === 'B') return 'text-sky-700 bg-sky-50 border-sky-200';
  if (grade === 'C') return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-rose-700 bg-rose-50 border-rose-200';
};

const portalNav = ['Dashboard', 'e-File', 'Income Tax Return', 'File Income Tax Return'];

const buildItrAttemptData = (draft) => {
  const salary = Number(draft.salaryIncome || 0);
  const interest = Number(draft.interestIncome || 0);
  const deductions =
    Number(draft.deduction80c || 0) +
    Number(draft.deduction80d || 0) +
    Number(draft.hraExemption || 0) +
    Number(draft.homeLoanInterest || 0);
  const taxCredits =
    Number(draft.tdsSalary || 0) +
    Number(draft.tdsOther || 0) +
    Number(draft.advanceTax || 0) +
    Number(draft.selfAssessmentTax || 0);

  return {
    scenarioSummary: `Salaried taxpayer filing ${draft.itrForm} for AY ${draft.assessmentYear} as a ${draft.residentStatus.toLowerCase()} ${draft.taxpayerStatus.toLowerCase()} using ${draft.filingMode.toLowerCase()} mode under section ${draft.filingSection}.`,
    chosenActions: `Logged into the mock portal, selected ${draft.itrForm}, reviewed prefill, entered salary income of ₹${salary.toLocaleString()} and interest income of ₹${interest.toLocaleString()}, then chose the ${draft.regime.toLowerCase()} tax regime with deductions totalling ₹${deductions.toLocaleString()}.`,
    checksPerformed: `Prefill reviewed: ${draft.prefillReviewed ? 'yes' : 'no'}. AIS checked: ${draft.aisChecked ? 'yes' : 'no'}. Form 26AS checked: ${draft.form26asChecked ? 'yes' : 'no'}. Refund bank verified: ${draft.bankAccountVerified ? 'yes' : 'no'}. Total tax credits reviewed: ₹${taxCredits.toLocaleString()}.`,
    finalDecision: `Prepared the return for submission with e-verification through ${draft.eVerifyMethod}. Declaration accepted: ${draft.declarationAccepted ? 'yes' : 'no'}.`,
  };
};

const buildTdsAttemptData = (draft) => {
  const salaryGap = Number(draft.expectedSalary || 0) - Number(draft.form16Salary || 0);
  const tdsGap = Number(draft.form26asTds || 0) - Number(draft.form16Tds || 0);

  return {
    scenarioSummary: `Salaried taxpayer reconciling Form 16 salary of ₹${Number(draft.form16Salary || 0).toLocaleString()} and employer TDS of ₹${Number(draft.form16Tds || 0).toLocaleString()} against portal tax-credit records before ITR filing.`,
    chosenActions: `Compared Form 16 salary with expected payroll, reviewed 26AS TDS of ₹${Number(draft.form26asTds || 0).toLocaleString()} and AIS TDS of ₹${Number(draft.aisTds || 0).toLocaleString()}, then selected the resolution action: ${draft.resolutionAction}.`,
    checksPerformed: `Salary gap observed: ₹${salaryGap.toLocaleString()}. TDS gap observed: ₹${tdsGap.toLocaleString()}. Bonus included: ${draft.bonusIncluded ? 'yes' : 'no'}. Bank interest included: ${draft.bankInterestIncluded ? 'yes' : 'no'}. Employer contacted: ${draft.employerContacted ? 'yes' : 'no'}. Filing paused: ${draft.filingPaused ? 'yes' : 'no'}.`,
    finalDecision: `Resolution note: ${draft.taxCreditMismatchNote || 'No major mismatch note entered.'} Final action: ${draft.resolutionAction}. Supporting proof collected: ${draft.proofCollected ? 'yes' : 'no'}.`,
  };
};

const buildEpfAttemptData = (draft) => ({
  scenarioSummary: `Employee reviewing EPF/UAN readiness with KYC status ${draft.kycStatus.toLowerCase()}, current employer passbook balance of ₹${Number(draft.currentEmployerPassbook || 0).toLocaleString()} and previous employer passbook balance of ₹${Number(draft.previousEmployerPassbook || 0).toLocaleString()}.`,
  chosenActions: `Reviewed passbook contributions, identified the worker as ${draft.changingJob ? 'changing jobs' : 'not changing jobs'}, and selected the action: ${draft.chosenAction}.`,
  checksPerformed: `UAN active: ${draft.uanActive ? 'yes' : 'no'}. PAN linked: ${draft.panLinked ? 'yes' : 'no'}. Aadhaar linked: ${draft.aadhaarLinked ? 'yes' : 'no'}. Claim status reviewed: ${draft.claimStatus}. Supporting proof checked: ${draft.proofChecked ? 'yes' : 'no'}.`,
  finalDecision: `Observed issue: ${draft.issueObserved || 'No major issue noted'}. Next action: ${draft.nextActionNote || draft.chosenAction}.`,
});

const buildRegimeAttemptData = (draft) => ({
  scenarioSummary: `Salaried taxpayer with salary income of ₹${Number(draft.salaryIncome || 0).toLocaleString()} comparing tax regimes with payroll choice ${draft.payrollChoice} and final filing choice ${draft.filingChoice}.`,
  chosenActions: `Calculated deductions under the old regime including 80C ₹${Number(draft.deduction80c || 0).toLocaleString()}, 80D ₹${Number(draft.deduction80d || 0).toLocaleString()}, NPS ₹${Number(draft.npsContribution || 0).toLocaleString()}, HRA ₹${Number(draft.hraExemption || 0).toLocaleString()}, and home-loan interest ₹${Number(draft.homeLoanInterest || 0).toLocaleString()}.`,
  checksPerformed: `Estimated old regime tax at ₹${Number(draft.oldRegimeTaxEstimate || 0).toLocaleString()} and new regime tax at ₹${Number(draft.newRegimeTaxEstimate || 0).toLocaleString()}. Business income present: ${draft.hasBusinessIncome ? 'yes' : 'no'}. Switching rule reviewed: ${draft.reviewedSwitchingRule ? 'yes' : 'no'}.`,
  finalDecision: `Final regime decision: ${draft.filingChoice}. Justification: ${draft.justification || 'No justification entered.'}`,
});

const validateItrStep = (stepIndex, draft) => {
  switch (stepIndex) {
    case 0:
      return draft.pan.trim() && draft.password.trim();
    case 1:
      return draft.assessmentYear && draft.filingSection && draft.filingMode;
    case 2:
      return draft.taxpayerStatus && draft.residentStatus && draft.itrForm && draft.regime;
    case 3:
      return draft.salaryIncome.trim() && draft.interestIncome.trim() && draft.otherIncome.trim();
    case 4:
      return draft.deduction80c.trim() && draft.deduction80d.trim() && draft.hraExemption.trim() && draft.homeLoanInterest.trim();
    case 5:
      return draft.tdsSalary.trim() && draft.tdsOther.trim() && draft.advanceTax.trim() && draft.selfAssessmentTax.trim();
    case 6:
      return (
        draft.bankAccountVerified &&
        draft.aisChecked &&
        draft.form26asChecked &&
        draft.prefillReviewed &&
        draft.declarationAccepted &&
        draft.eVerifyMethod
      );
    default:
      return false;
  }
};

const validateTdsStep = (stepIndex, draft) => {
  switch (stepIndex) {
    case 0:
      return draft.form16Salary.trim() && draft.form16Tds.trim() && draft.form26asTds.trim() && draft.aisTds.trim();
    case 1:
      return draft.expectedSalary.trim() && draft.salaryMismatchNote.trim();
    case 2:
      return draft.taxCreditMismatchNote.trim();
    case 3:
      return draft.resolutionAction && (draft.employerContacted || draft.filingPaused || draft.proofCollected);
    default:
      return false;
  }
};

const validateEpfStep = (stepIndex, draft) => {
  switch (stepIndex) {
    case 0:
      return draft.kycStatus && (draft.uanActive || draft.issueObserved.trim());
    case 1:
      return draft.currentEmployerPassbook.trim() && draft.previousEmployerPassbook.trim() && draft.employeeContribution.trim() && draft.employerContribution.trim();
    case 2:
      return draft.chosenAction && draft.issueObserved.trim();
    case 3:
      return draft.claimStatus && draft.nextActionNote.trim() && (draft.proofChecked || draft.panLinked || draft.aadhaarLinked);
    default:
      return false;
  }
};

const validateRegimeStep = (stepIndex, draft) => {
  switch (stepIndex) {
    case 0:
      return draft.salaryIncome.trim() && draft.rentalStatus;
    case 1:
      return draft.deduction80c.trim() && draft.deduction80d.trim() && draft.npsContribution.trim() && draft.hraExemption.trim() && draft.homeLoanInterest.trim();
    case 2:
      return draft.oldRegimeTaxEstimate.trim() && draft.newRegimeTaxEstimate.trim();
    case 3:
      return draft.payrollChoice && draft.filingChoice && draft.justification.trim() && draft.reviewedSwitchingRule;
    default:
      return false;
  }
};

const numberInputClass =
  'w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

const textAreaClass =
  'w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';

const ItrSimulator = ({
  draft,
  setDraft,
  currentStep,
  setCurrentStep,
  submitting,
  handleSubmitAttempt,
  submitMessage,
}) => {
  const totalIncome =
    Number(draft.salaryIncome || 0) +
    Number(draft.interestIncome || 0) +
    Number(draft.otherIncome || 0);
  const totalDeductions =
    Number(draft.deduction80c || 0) +
    Number(draft.deduction80d || 0) +
    Number(draft.hraExemption || 0) +
    Number(draft.homeLoanInterest || 0);
  const totalTaxCredits =
    Number(draft.tdsSalary || 0) +
    Number(draft.tdsOther || 0) +
    Number(draft.advanceTax || 0) +
    Number(draft.selfAssessmentTax || 0);

  const update = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));
  const currentStepMeta = itrSteps[currentStep];
  const canContinue = validateItrStep(currentStep, draft);
  const readiness = getStepReadiness(itrSteps, validateItrStep, draft);
  const completedSteps = itrSteps.filter((_, index) => validateItrStep(index, draft)).length;

  const nextStep = () => {
    if (!canContinue) return;
    setCurrentStep((prev) => Math.min(prev + 1, itrSteps.length - 1));
  };

  const previousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-4">
          {portalNav.map((item, index) => (
            <React.Fragment key={item}>
              <span className={`px-2.5 py-1 rounded-full ${index === portalNav.length - 1 ? 'bg-sky-50 text-sky-700' : 'bg-stone-100'}`}>{item}</span>
              {index < portalNav.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {itrSteps.map((step, index) => {
            const isActive = index === currentStep;
            const isDone = index < currentStep || validateItrStep(index, draft);
            return (
              <button
                key={step.id}
                onClick={() => {
                  if (index <= currentStep) setCurrentStep(index);
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'border-sky-300 bg-sky-50 text-sky-800'
                    : isDone
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-stone-200 bg-stone-50 text-stone-600'
                }`}
              >
                <span className="font-semibold">{index + 1}</span>
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-stone-500">Resume is enabled for this simulator. You can leave mid-flow and continue from the same step later.</p>
      </div>

      <div className="rounded-[2rem] border border-stone-200 bg-white shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-8 py-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-100 mb-2">ITR Portal Simulator</p>
          <h3 className="text-2xl font-bold mb-1">{currentStepMeta.title}</h3>
          <p className="text-sky-100">{currentStepMeta.caption}</p>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-0">
          <div className="border-r border-stone-200 bg-stone-50 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-4">Return Sections</p>
            <div className="space-y-2">
              {itrSteps.map((step, index) => {
                const isActive = index === currentStep;
                const isReady = index < currentStep || validateItrStep(index, draft);
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (index <= currentStep) setCurrentStep(index);
                    }}
                    className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors ${
                      isActive ? 'border-sky-300 bg-sky-50' : isReady ? 'border-emerald-200 bg-emerald-50' : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div className="text-sm font-semibold text-stone-900 truncate">{step.title}</div>
                    <div className="text-xs text-stone-500 mt-1">{step.caption}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8 space-y-6">
          {currentStep === 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">PAN / User ID</label>
                <input value={draft.pan} onChange={(e) => update('pan', e.target.value.toUpperCase())} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                <input type="password" value={draft.password} onChange={(e) => update('password', e.target.value)} placeholder="Mock portal password" className={numberInputClass} />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Assessment Year</label>
                <select value={draft.assessmentYear} onChange={(e) => update('assessmentYear', e.target.value)} className={numberInputClass}>
                  <option value="2026-27">2026-27</option>
                  <option value="2025-26">2025-26</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Filing Section</label>
                <select value={draft.filingSection} onChange={(e) => update('filingSection', e.target.value)} className={numberInputClass}>
                  <option value="139(1)">139(1) Original Return</option>
                  <option value="139(4)">139(4) Belated Return</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Mode of Filing</label>
                <select value={draft.filingMode} onChange={(e) => update('filingMode', e.target.value)} className={numberInputClass}>
                  <option value="Online">Online</option>
                  <option value="Offline Utility">Offline Utility</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Taxpayer Status</label>
                <select value={draft.taxpayerStatus} onChange={(e) => update('taxpayerStatus', e.target.value)} className={numberInputClass}>
                  <option value="Individual">Individual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Residential Status</label>
                <select value={draft.residentStatus} onChange={(e) => update('residentStatus', e.target.value)} className={numberInputClass}>
                  <option value="Resident">Resident</option>
                  <option value="Non-Resident">Non-Resident</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Return Form</label>
                <select value={draft.itrForm} onChange={(e) => update('itrForm', e.target.value)} className={numberInputClass}>
                  <option value="ITR-1">ITR-1 (Sahaj)</option>
                  <option value="ITR-2">ITR-2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tax Regime</label>
                <select value={draft.regime} onChange={(e) => update('regime', e.target.value)} className={numberInputClass}>
                  <option value="New">New Regime</option>
                  <option value="Old">Old Regime</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Salary Income</label>
                <input value={draft.salaryIncome} onChange={(e) => update('salaryIncome', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Savings / FD Interest</label>
                <input value={draft.interestIncome} onChange={(e) => update('interestIncome', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Other Income</label>
                <input value={draft.otherIncome} onChange={(e) => update('otherIncome', e.target.value)} className={numberInputClass} />
              </div>
              <div className="md:col-span-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-sm text-stone-600">Gross Total Income Preview</p>
                <p className="text-2xl font-bold text-stone-900 mt-1">₹{totalIncome.toLocaleString()}</p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">80C Investments</label>
                <input value={draft.deduction80c} onChange={(e) => update('deduction80c', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">80D Health Insurance</label>
                <input value={draft.deduction80d} onChange={(e) => update('deduction80d', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">HRA Exemption Claimed</label>
                <input value={draft.hraExemption} onChange={(e) => update('hraExemption', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Home Loan Interest</label>
                <input value={draft.homeLoanInterest} onChange={(e) => update('homeLoanInterest', e.target.value)} className={numberInputClass} />
              </div>
              <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">Regime Selection</p>
                <p className="font-semibold text-amber-900 mt-1">{draft.regime} Regime with total deductions of ₹{totalDeductions.toLocaleString()}</p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">TDS on Salary</label>
                <input value={draft.tdsSalary} onChange={(e) => update('tdsSalary', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">TDS on Other Income</label>
                <input value={draft.tdsOther} onChange={(e) => update('tdsOther', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Advance Tax</label>
                <input value={draft.advanceTax} onChange={(e) => update('advanceTax', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Self-Assessment Tax</label>
                <input value={draft.selfAssessmentTax} onChange={(e) => update('selfAssessmentTax', e.target.value)} className={numberInputClass} />
              </div>
              <div className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm text-emerald-800">Tax Credit Summary</p>
                <p className="font-semibold text-emerald-900 mt-1">Total taxes paid / credited: ₹{totalTaxCredits.toLocaleString()}</p>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <p className="font-semibold text-stone-900 mb-3">Preview Return</p>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-stone-700">
                  <div>Gross income: <span className="font-semibold">₹{totalIncome.toLocaleString()}</span></div>
                  <div>Deductions claimed: <span className="font-semibold">₹{totalDeductions.toLocaleString()}</span></div>
                  <div>Tax credits: <span className="font-semibold">₹{totalTaxCredits.toLocaleString()}</span></div>
                  <div>E-verify method: <span className="font-semibold">{draft.eVerifyMethod}</span></div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {[
                  ['prefillReviewed', 'I reviewed prefilled salary, tax, and bank details'],
                  ['aisChecked', 'I checked AIS before submission'],
                  ['form26asChecked', 'I checked Form 26AS / tax credit statement'],
                  ['bankAccountVerified', 'I verified the refund bank account'],
                  ['declarationAccepted', 'I accept the declaration before submission'],
                ].map(([field, label]) => (
                  <label key={field} className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4">
                    <input
                      type="checkbox"
                      checked={draft[field]}
                      onChange={(e) => update(field, e.target.checked)}
                      className="mt-1 h-4 w-4"
                    />
                    <span className="text-sm text-stone-700">{label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">E-Verification Method</label>
                <select value={draft.eVerifyMethod} onChange={(e) => update('eVerifyMethod', e.target.value)} className={numberInputClass}>
                  <option value="Aadhaar OTP">Aadhaar OTP</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Bank Account EVC">Bank Account EVC</option>
                </select>
              </div>
            </div>
          )}

          {submitMessage && (
            <div className={`rounded-2xl px-4 py-3 text-sm ${submitMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              {submitMessage.text}
            </div>
          )}

          <SubmissionReadinessPanel readiness={readiness} completedSteps={completedSteps} totalSteps={itrSteps.length} accent="sky" />

          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <button
              onClick={previousStep}
              disabled={currentStep === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-300 px-4 py-3 text-stone-700 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex gap-3">
              {currentStep < itrSteps.length - 1 ? (
                <button
                  onClick={nextStep}
                  disabled={!canContinue}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white px-5 py-3 font-semibold"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitAttempt}
                  disabled={submitting || !canContinue}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-3 font-semibold"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {submitting ? 'Submitting Attempt...' : 'Submit Completed ITR Mock'}
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TdsSimulator = ({
  draft,
  setDraft,
  currentStep,
  setCurrentStep,
  submitting,
  handleSubmitAttempt,
  submitMessage,
}) => {
  const salaryGap = Number(draft.expectedSalary || 0) - Number(draft.form16Salary || 0);
  const tdsGap26as = Number(draft.form26asTds || 0) - Number(draft.form16Tds || 0);
  const tdsGapAis = Number(draft.aisTds || 0) - Number(draft.form16Tds || 0);
  const currentStepMeta = tdsSteps[currentStep];
  const canContinue = validateTdsStep(currentStep, draft);
  const update = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));
  const readiness = getStepReadiness(tdsSteps, validateTdsStep, draft);
  const completedSteps = tdsSteps.filter((_, index) => validateTdsStep(index, draft)).length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-center gap-2">
          {tdsSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => {
                if (index <= currentStep) setCurrentStep(index);
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
                index === currentStep
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : index < currentStep || validateTdsStep(index, draft)
                    ? 'border-sky-200 bg-sky-50 text-sky-800'
                    : 'border-stone-200 bg-stone-50 text-stone-600'
              }`}
            >
              <span className="font-semibold">{index + 1}</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-stone-500">Your reconciliation notes and step progress are saved locally until you finish the AI-reviewed submission.</p>
      </div>

      <div className="rounded-[2rem] border border-stone-200 bg-white shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-100 mb-2">TDS Reconciliation Simulator</p>
          <h3 className="text-2xl font-bold mb-1">{currentStepMeta.title}</h3>
          <p className="text-emerald-100">{currentStepMeta.caption}</p>
        </div>

        <div className="p-8 space-y-6">
          {currentStep === 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Form 16 Salary</label>
                <input value={draft.form16Salary} onChange={(e) => update('form16Salary', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Form 16 TDS</label>
                <input value={draft.form16Tds} onChange={(e) => update('form16Tds', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Form 26AS TDS</label>
                <input value={draft.form26asTds} onChange={(e) => update('form26asTds', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">AIS TDS</label>
                <input value={draft.aisTds} onChange={(e) => update('aisTds', e.target.value)} className={numberInputClass} />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Expected Salary from Payroll</label>
                  <input value={draft.expectedSalary} onChange={(e) => update('expectedSalary', e.target.value)} className={numberInputClass} />
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">Salary Gap</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">₹{salaryGap.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <input type="checkbox" checked={draft.bonusIncluded} onChange={(e) => update('bonusIncluded', e.target.checked)} className="mt-1 h-4 w-4" />
                  <span className="text-sm text-stone-700">I checked whether bonus / arrears were included in salary</span>
                </label>
                <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <input type="checkbox" checked={draft.bankInterestIncluded} onChange={(e) => update('bankInterestIncluded', e.target.checked)} className="mt-1 h-4 w-4" />
                  <span className="text-sm text-stone-700">I checked whether bank interest may affect refund or tax payable</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Salary Mismatch Note</label>
                <textarea value={draft.salaryMismatchNote} onChange={(e) => update('salaryMismatchNote', e.target.value)} rows={4} className={textAreaClass} placeholder="Explain any mismatch between payroll expectations and Form 16 salary." />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm text-rose-800">26AS vs Form 16 TDS Gap</p>
                  <p className="text-2xl font-bold text-rose-900 mt-1">₹{tdsGap26as.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm text-rose-800">AIS vs Form 16 TDS Gap</p>
                  <p className="text-2xl font-bold text-rose-900 mt-1">₹{tdsGapAis.toLocaleString()}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-700 mt-0.5" />
                <p className="text-sm text-amber-900">If tax credit on the portal is lower than Form 16, the safer training move is to pause filing and resolve the mismatch before submitting the return.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tax Credit Mismatch Note</label>
                <textarea value={draft.taxCreditMismatchNote} onChange={(e) => update('taxCreditMismatchNote', e.target.value)} rows={5} className={textAreaClass} placeholder="Describe what the mismatch means and what you would verify next." />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Resolution Action</label>
                <select value={draft.resolutionAction} onChange={(e) => update('resolutionAction', e.target.value)} className={numberInputClass}>
                  <option>Proceed to file return</option>
                  <option>Pause filing and contact employer payroll</option>
                  <option>Collect proof and compare 26AS / AIS again</option>
                  <option>Escalate before final submission</option>
                </select>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <input type="checkbox" checked={draft.employerContacted} onChange={(e) => update('employerContacted', e.target.checked)} className="mt-1 h-4 w-4" />
                  <span className="text-sm text-stone-700">Employer / payroll contacted</span>
                </label>
                <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <input type="checkbox" checked={draft.proofCollected} onChange={(e) => update('proofCollected', e.target.checked)} className="mt-1 h-4 w-4" />
                  <span className="text-sm text-stone-700">Proof / screenshots collected</span>
                </label>
                <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <input type="checkbox" checked={draft.filingPaused} onChange={(e) => update('filingPaused', e.target.checked)} className="mt-1 h-4 w-4" />
                  <span className="text-sm text-stone-700">Return filing paused until resolved</span>
                </label>
              </div>
            </div>
          )}

          {submitMessage && (
            <div className={`rounded-2xl px-4 py-3 text-sm ${submitMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              {submitMessage.text}
            </div>
          )}

          <SubmissionReadinessPanel readiness={readiness} completedSteps={completedSteps} totalSteps={tdsSteps.length} accent="emerald" />

          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <button onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))} disabled={currentStep === 0} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-300 px-4 py-3 text-stone-700 disabled:opacity-50">
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
            <div className="flex gap-3">
              {currentStep < tdsSteps.length - 1 ? (
                <button onClick={() => canContinue && setCurrentStep((prev) => Math.min(prev + 1, tdsSteps.length - 1))} disabled={!canContinue} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-3 font-semibold">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={handleSubmitAttempt} disabled={submitting || !canContinue} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-3 font-semibold">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {submitting ? 'Submitting Attempt...' : 'Submit TDS Reconciliation'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EpfSimulator = ({
  draft,
  setDraft,
  currentStep,
  setCurrentStep,
  submitting,
  handleSubmitAttempt,
  submitMessage,
}) => {
  const update = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));
  const currentStepMeta = epfSteps[currentStep];
  const canContinue = validateEpfStep(currentStep, draft);
  const totalProvidentFund = Number(draft.employeeContribution || 0) + Number(draft.employerContribution || 0);
  const readiness = getStepReadiness(epfSteps, validateEpfStep, draft);
  const completedSteps = epfSteps.filter((_, index) => validateEpfStep(index, draft)).length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-center gap-2">
          {epfSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => index <= currentStep && setCurrentStep(index)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
                index === currentStep
                  ? 'border-violet-300 bg-violet-50 text-violet-800'
                  : index < currentStep || validateEpfStep(index, draft)
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-stone-200 bg-stone-50 text-stone-600'
              }`}
            >
              <span className="font-semibold">{index + 1}</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-stone-500">This EPF flow auto-saves locally, so users can pause during a job-switch scenario and return without losing progress.</p>
      </div>

      <div className="rounded-[2rem] border border-stone-200 bg-white shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-700 px-8 py-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-100 mb-2">EPF / UAN Simulator</p>
          <h3 className="text-2xl font-bold mb-1">{currentStepMeta.title}</h3>
          <p className="text-violet-100">{currentStepMeta.caption}</p>
        </div>

        <div className="p-8 space-y-6">
          {currentStep === 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <input type="checkbox" checked={draft.uanActive} onChange={(e) => update('uanActive', e.target.checked)} className="mt-1 h-4 w-4" />
                <span className="text-sm text-stone-700">UAN login is active and accessible</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">KYC Status</label>
                <select value={draft.kycStatus} onChange={(e) => update('kycStatus', e.target.value)} className={numberInputClass}>
                  <option>Complete</option>
                  <option>Pending</option>
                  <option>Mismatch Found</option>
                </select>
              </div>
              <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <input type="checkbox" checked={draft.panLinked} onChange={(e) => update('panLinked', e.target.checked)} className="mt-1 h-4 w-4" />
                <span className="text-sm text-stone-700">PAN is linked</span>
              </label>
              <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <input type="checkbox" checked={draft.aadhaarLinked} onChange={(e) => update('aadhaarLinked', e.target.checked)} className="mt-1 h-4 w-4" />
                <span className="text-sm text-stone-700">Aadhaar is linked</span>
              </label>
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Current Employer Passbook Balance</label>
                <input value={draft.currentEmployerPassbook} onChange={(e) => update('currentEmployerPassbook', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Previous Employer Passbook Balance</label>
                <input value={draft.previousEmployerPassbook} onChange={(e) => update('previousEmployerPassbook', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Employee Contribution</label>
                <input value={draft.employeeContribution} onChange={(e) => update('employeeContribution', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Employer Contribution</label>
                <input value={draft.employerContribution} onChange={(e) => update('employerContribution', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Pension Contribution</label>
                <input value={draft.pensionContribution} onChange={(e) => update('pensionContribution', e.target.value)} className={numberInputClass} />
              </div>
              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                <p className="text-sm text-violet-800">Provident Fund Snapshot</p>
                <p className="text-2xl font-bold text-violet-900 mt-1">₹{totalProvidentFund.toLocaleString()}</p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <input type="checkbox" checked={draft.changingJob} onChange={(e) => update('changingJob', e.target.checked)} className="mt-1 h-4 w-4" />
                <span className="text-sm text-stone-700">This employee is changing jobs</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Chosen Action</label>
                <select value={draft.chosenAction} onChange={(e) => update('chosenAction', e.target.value)} className={numberInputClass}>
                  <option>Transfer EPF to new employer</option>
                  <option>Keep account and review status</option>
                  <option>Check claim status before acting</option>
                  <option>Pause action until KYC is fixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Issue Observed</label>
                <textarea value={draft.issueObserved} onChange={(e) => update('issueObserved', e.target.value)} rows={4} className={textAreaClass} placeholder="Explain the main EPF / UAN issue or transfer consideration." />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Claim / Service Status</label>
                <select value={draft.claimStatus} onChange={(e) => update('claimStatus', e.target.value)} className={numberInputClass}>
                  <option>No claim initiated</option>
                  <option>Transfer in progress</option>
                  <option>Claim under process</option>
                  <option>Status unclear / needs investigation</option>
                </select>
              </div>
              <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <input type="checkbox" checked={draft.proofChecked} onChange={(e) => update('proofChecked', e.target.checked)} className="mt-1 h-4 w-4" />
                <span className="text-sm text-stone-700">Passbook / service proof reviewed before next action</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Next Action Note</label>
                <textarea value={draft.nextActionNote} onChange={(e) => update('nextActionNote', e.target.value)} rows={4} className={textAreaClass} placeholder="State the exact next step: transfer, investigate, wait for status update, or fix KYC." />
              </div>
            </div>
          )}

          {submitMessage && <div className={`rounded-2xl px-4 py-3 text-sm ${submitMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>{submitMessage.text}</div>}

          <SubmissionReadinessPanel readiness={readiness} completedSteps={completedSteps} totalSteps={epfSteps.length} accent="violet" />

          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <button onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))} disabled={currentStep === 0} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-300 px-4 py-3 text-stone-700 disabled:opacity-50">
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
            <div className="flex gap-3">
              {currentStep < epfSteps.length - 1 ? (
                <button onClick={() => canContinue && setCurrentStep((prev) => Math.min(prev + 1, epfSteps.length - 1))} disabled={!canContinue} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-5 py-3 font-semibold">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={handleSubmitAttempt} disabled={submitting || !canContinue} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-5 py-3 font-semibold">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {submitting ? 'Submitting Attempt...' : 'Submit EPF Review'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegimeSimulator = ({
  draft,
  setDraft,
  currentStep,
  setCurrentStep,
  submitting,
  handleSubmitAttempt,
  submitMessage,
}) => {
  const update = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));
  const currentStepMeta = regimeSteps[currentStep];
  const canContinue = validateRegimeStep(currentStep, draft);
  const deductionTotal =
    Number(draft.deduction80c || 0) +
    Number(draft.deduction80d || 0) +
    Number(draft.npsContribution || 0) +
    Number(draft.hraExemption || 0) +
    Number(draft.homeLoanInterest || 0);
  const taxDifference = Number(draft.oldRegimeTaxEstimate || 0) - Number(draft.newRegimeTaxEstimate || 0);
  const readiness = getStepReadiness(regimeSteps, validateRegimeStep, draft);
  const completedSteps = regimeSteps.filter((_, index) => validateRegimeStep(index, draft)).length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-center gap-2">
          {regimeSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => index <= currentStep && setCurrentStep(index)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
                index === currentStep
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : index < currentStep || validateRegimeStep(index, draft)
                    ? 'border-sky-200 bg-sky-50 text-sky-800'
                    : 'border-stone-200 bg-stone-50 text-stone-600'
              }`}
            >
              <span className="font-semibold">{index + 1}</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-stone-500">The regime memo is saved as you work, and AI evaluation only runs once the final choice and justification are submitted.</p>
      </div>

      <div className="rounded-[2rem] border border-stone-200 bg-white shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-100 mb-2">Regime Decision Simulator</p>
          <h3 className="text-2xl font-bold mb-1">{currentStepMeta.title}</h3>
          <p className="text-amber-100">{currentStepMeta.caption}</p>
        </div>

        <div className="p-8 space-y-6">
          {currentStep === 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Salary Income</label>
                <input value={draft.salaryIncome} onChange={(e) => update('salaryIncome', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Rental / HRA Situation</label>
                <select value={draft.rentalStatus} onChange={(e) => update('rentalStatus', e.target.value)} className={numberInputClass}>
                  <option>No rent claim</option>
                  <option>Paying rent and eligible for HRA</option>
                  <option>Own house / no HRA</option>
                </select>
              </div>
              <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <input type="checkbox" checked={draft.homeLoan} onChange={(e) => update('homeLoan', e.target.checked)} className="mt-1 h-4 w-4" />
                <span className="text-sm text-stone-700">Home loan is active for this year</span>
              </label>
              <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <input type="checkbox" checked={draft.hasBusinessIncome} onChange={(e) => update('hasBusinessIncome', e.target.checked)} className="mt-1 h-4 w-4" />
                <span className="text-sm text-stone-700">Business / professional income exists</span>
              </label>
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">80C</label>
                <input value={draft.deduction80c} onChange={(e) => update('deduction80c', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">80D</label>
                <input value={draft.deduction80d} onChange={(e) => update('deduction80d', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">NPS Contribution</label>
                <input value={draft.npsContribution} onChange={(e) => update('npsContribution', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">HRA Exemption</label>
                <input value={draft.hraExemption} onChange={(e) => update('hraExemption', e.target.value)} className={numberInputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Home Loan Interest</label>
                <input value={draft.homeLoanInterest} onChange={(e) => update('homeLoanInterest', e.target.value)} className={numberInputClass} />
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">Total Deductions Used</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">₹{deductionTotal.toLocaleString()}</p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Estimated Old Regime Tax</label>
                  <input value={draft.oldRegimeTaxEstimate} onChange={(e) => update('oldRegimeTaxEstimate', e.target.value)} className={numberInputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Estimated New Regime Tax</label>
                  <input value={draft.newRegimeTaxEstimate} onChange={(e) => update('newRegimeTaxEstimate', e.target.value)} className={numberInputClass} />
                </div>
              </div>
              <div className={`rounded-2xl border p-4 ${taxDifference > 0 ? 'border-emerald-200 bg-emerald-50' : 'border-sky-200 bg-sky-50'}`}>
                <p className="text-sm text-stone-700">Comparison Snapshot</p>
                <p className="text-xl font-bold text-stone-900 mt-1">
                  {taxDifference > 0
                    ? `New regime looks lower by ₹${Math.abs(taxDifference).toLocaleString()}`
                    : taxDifference < 0
                      ? `Old regime looks lower by ₹${Math.abs(taxDifference).toLocaleString()}`
                      : 'Both regimes look equal in this mock'}
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Payroll Declaration Choice</label>
                  <select value={draft.payrollChoice} onChange={(e) => update('payrollChoice', e.target.value)} className={numberInputClass}>
                    <option>New</option>
                    <option>Old</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Final Filing Choice</label>
                  <select value={draft.filingChoice} onChange={(e) => update('filingChoice', e.target.value)} className={numberInputClass}>
                    <option>New</option>
                    <option>Old</option>
                  </select>
                </div>
              </div>
              <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <input type="checkbox" checked={draft.reviewedSwitchingRule} onChange={(e) => update('reviewedSwitchingRule', e.target.checked)} className="mt-1 h-4 w-4" />
                <span className="text-sm text-stone-700">I reviewed whether switching flexibility changes if business income is present</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Decision Justification</label>
                <textarea value={draft.justification} onChange={(e) => update('justification', e.target.value)} rows={4} className={textAreaClass} placeholder="Explain why the final filing choice makes sense for this taxpayer." />
              </div>
            </div>
          )}

          {submitMessage && <div className={`rounded-2xl px-4 py-3 text-sm ${submitMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>{submitMessage.text}</div>}

          <SubmissionReadinessPanel readiness={readiness} completedSteps={completedSteps} totalSteps={regimeSteps.length} accent="amber" />

          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <button onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))} disabled={currentStep === 0} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-300 px-4 py-3 text-stone-700 disabled:opacity-50">
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
            <div className="flex gap-3">
              {currentStep < regimeSteps.length - 1 ? (
                <button onClick={() => canContinue && setCurrentStep((prev) => Math.min(prev + 1, regimeSteps.length - 1))} disabled={!canContinue} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white px-5 py-3 font-semibold">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={handleSubmitAttempt} disabled={submitting || !canContinue} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white px-5 py-3 font-semibold">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {submitting ? 'Submitting Attempt...' : 'Submit Regime Decision'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GenericModulePanel = ({
  selectedModule,
  currentDraft,
  setDraftValue,
  latestEvaluation,
  attempts,
  attemptsLoading,
  setLatestEvaluation,
  submitting,
  handleSubmitAttempt,
  submitMessage,
}) => (
  <div className="space-y-6">
    <div className="rounded-[2rem] border border-stone-200 bg-white shadow-lg overflow-hidden">
      <div className={`bg-gradient-to-r ${selectedModule.color} p-8 text-white`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">{selectedModule.title}</h2>
            <p className="text-white/85 max-w-2xl">{selectedModule.subtitle}</p>
          </div>
          <selectedModule.icon className="h-10 w-10 shrink-0" />
        </div>
      </div>

      <div className="p-8">
        <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-6 mb-8">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <div className="flex items-center gap-2 text-stone-900 font-semibold mb-3">
              <Clock3 className="h-4 w-4 text-stone-500" />
              Mock Flow
            </div>
            <div className="space-y-3">
              {selectedModule.steps.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-stone-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-stone-100 text-stone-700">{index + 1}</div>
                    <div>
                      <p className="font-semibold text-stone-900">{step.title}</p>
                      <p className="text-sm text-stone-600 mt-1">{step.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 mb-2">Why This Matters</p>
              <p className="text-sm text-emerald-900 leading-relaxed">
                These are the exact moments where many first-job users freeze: selecting the right flow, understanding tax credit, and knowing when to pause instead of filing blindly.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="font-semibold text-stone-900 mb-3">Checklist</p>
              <ul className="space-y-2">
                {selectedModule.checklist.map((item) => (
                  <li key={item} className="text-sm text-stone-600 flex items-start gap-2">
                    <span className="text-emerald-600 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={selectedModule.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-sky-100 bg-sky-50 p-5 hover:border-sky-200 transition-colors"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-sky-700 mb-2">Official Reference</p>
              <p className="font-semibold text-sky-900 mb-1">Open source material</p>
              <p className="text-sm text-sky-800 break-all">{selectedModule.sourceUrl}</p>
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h3 className="text-xl font-semibold text-stone-900">Submit Mock Attempt For AI Review</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Scenario Summary</label>
                <textarea value={currentDraft.scenarioSummary} onChange={(e) => setDraftValue('scenarioSummary', e.target.value)} rows={3} placeholder="Summarize the user situation and what kind of financial task is being handled." className={textAreaClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Chosen Actions</label>
                <textarea value={currentDraft.chosenActions} onChange={(e) => setDraftValue('chosenActions', e.target.value)} rows={4} placeholder="Describe the exact steps you would take in this workflow." className={textAreaClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Checks Performed</label>
                <textarea value={currentDraft.checksPerformed} onChange={(e) => setDraftValue('checksPerformed', e.target.value)} rows={4} placeholder="List what you would verify before completing the process." className={textAreaClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Final Decision</label>
                <textarea value={currentDraft.finalDecision} onChange={(e) => setDraftValue('finalDecision', e.target.value)} rows={3} placeholder="State the final action or recommendation you would make and why." className={textAreaClass} />
              </div>
            </div>

            {submitMessage && (
              <div className={`mt-4 rounded-2xl px-4 py-3 text-sm ${submitMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {submitMessage.text}
              </div>
            )}

            <button onClick={handleSubmitAttempt} disabled={submitting} className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-3 font-semibold transition-colors">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {submitting ? 'Submitting Attempt...' : 'Submit For AI Review'}
            </button>
          </div>

          <EvaluationColumn
            latestEvaluation={latestEvaluation}
            attempts={attempts}
            attemptsLoading={attemptsLoading}
            setLatestEvaluation={setLatestEvaluation}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-stone-200 bg-[linear-gradient(135deg,#fafaf9,#f0fdf4)] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-2">Reality Check</p>
          <p className="text-stone-700 leading-relaxed">
            This section is a learning simulator, not a substitute for the actual government portal. The AI review grades your process quality and judgment, not legal compliance certainty.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const EvaluationColumn = ({ latestEvaluation, attempts, attemptsLoading, setLatestEvaluation }) => (
  <div className="space-y-4">
    {latestEvaluation && (
      <div className="rounded-3xl border border-stone-200 bg-[linear-gradient(135deg,#fafaf9,#f0fdf4)] p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-1">Latest Evaluation</p>
            <p className="text-sm text-stone-600">{formatDateTime(latestEvaluation.createdAt)}</p>
          </div>
          <div className={`rounded-2xl border px-4 py-2 text-center ${getGradeTone(latestEvaluation.grade)}`}>
            <div className="text-2xl font-bold">{latestEvaluation.grade}</div>
            <div className="text-sm">{latestEvaluation.overallScore}/100</div>
          </div>
        </div>
        <p className="text-sm text-stone-700 mb-4">{latestEvaluation.aiEvaluation.summary}</p>
        <div className="grid gap-3">
          <div>
            <p className="font-semibold text-stone-900 text-sm mb-1">Strengths</p>
            <ul className="space-y-1">
              {latestEvaluation.aiEvaluation.strengths.map((item) => (
                <li key={item} className="text-sm text-stone-600 flex gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-stone-900 text-sm mb-1">Mistakes</p>
            <ul className="space-y-1">
              {latestEvaluation.aiEvaluation.mistakes.map((item) => (
                <li key={item} className="text-sm text-stone-600 flex gap-2">
                  <span className="text-rose-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-stone-900 text-sm mb-1">Next Steps</p>
            <ul className="space-y-1">
              {latestEvaluation.aiEvaluation.recommendedNextSteps.map((item) => (
                <li key={item} className="text-sm text-stone-600 flex gap-2">
                  <span className="text-sky-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )}

    <div className="rounded-3xl border border-stone-200 bg-white p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-3">Attempt History</p>
      {attemptsLoading ? (
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading attempts...
        </div>
      ) : attempts.length > 0 ? (
        <div className="space-y-3">
          {attempts.map((attempt) => (
            <button
              key={attempt._id}
              onClick={() => setLatestEvaluation({
                grade: attempt.grade,
                overallScore: attempt.overallScore,
                aiEvaluation: attempt.aiEvaluation,
                createdAt: attempt.createdAt,
              })}
              className="w-full text-left rounded-2xl border border-stone-200 hover:border-stone-300 bg-stone-50 p-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-stone-900">{formatDateTime(attempt.createdAt)}</p>
                  <p className="text-sm text-stone-500">{attempt.aiEvaluation.summary}</p>
                </div>
                <div className={`rounded-xl border px-3 py-1.5 ${getGradeTone(attempt.grade)}`}>
                  <div className="font-bold text-sm">{attempt.grade}</div>
                  <div className="text-xs">{attempt.overallScore}/100</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {attempt.aiEvaluation.rubricBreakdown.slice(0, 2).map((item) => (
                  <span key={item.criterion} className="text-xs px-2 py-1 rounded-full bg-white border border-stone-200 text-stone-600">
                    {item.criterion}: {item.score}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-stone-500">No saved attempts yet for this module. Submit your first mock for grading.</p>
      )}
    </div>
  </div>
);

const WorkingProfessionalLab = () => {
  const { user, loading, refreshUser } = useContext(UserContext);
  const [selectedModuleId, setSelectedModuleId] = useState(modules[0].id);
  const [drafts, setDrafts] = useState({});
  const [itrDraft, setItrDraft] = useState(initialItrDraft);
  const [itrStepIndex, setItrStepIndex] = useState(0);
  const [tdsDraft, setTdsDraft] = useState(initialTdsDraft);
  const [tdsStepIndex, setTdsStepIndex] = useState(0);
  const [epfDraft, setEpfDraft] = useState(initialEpfDraft);
  const [epfStepIndex, setEpfStepIndex] = useState(0);
  const [regimeDraft, setRegimeDraft] = useState(initialRegimeDraft);
  const [regimeStepIndex, setRegimeStepIndex] = useState(0);
  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [latestEvaluation, setLatestEvaluation] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  const selectedModule = useMemo(
    () => modules.find((module) => module.id === selectedModuleId) || modules[0],
    [selectedModuleId]
  );

  const currentDraft = drafts[selectedModule.id] || emptyDraft;

  const setDraftValue = (field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [selectedModule.id]: {
        ...(prev[selectedModule.id] || emptyDraft),
        [field]: value,
      },
    }));
  };

  const fetchAttempts = async (moduleId) => {
    setAttemptsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/career-lab/attempts?moduleId=${moduleId}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setAttempts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching career lab attempts:', error);
      setAttempts([]);
    } finally {
      setAttemptsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?._id || user.profession !== 'Job') return;

    const saved = loadSavedState(user._id);
    if (saved) {
      setSelectedModuleId(saved.selectedModuleId || modules[0].id);
      setDrafts(saved.drafts || {});
      setItrDraft(saved.itrDraft || initialItrDraft);
      setItrStepIndex(saved.itrStepIndex ?? 0);
      setTdsDraft(saved.tdsDraft || initialTdsDraft);
      setTdsStepIndex(saved.tdsStepIndex ?? 0);
      setEpfDraft(saved.epfDraft || initialEpfDraft);
      setEpfStepIndex(saved.epfStepIndex ?? 0);
      setRegimeDraft(saved.regimeDraft || initialRegimeDraft);
      setRegimeStepIndex(saved.regimeStepIndex ?? 0);
    }
    setHydrated(true);
  }, [user?._id, user?.profession]);

  useEffect(() => {
    if (user?.profession === 'Job') {
      fetchAttempts(selectedModule.id);
      setLatestEvaluation(null);
      setSubmitMessage(null);
    }
  }, [selectedModule.id, user?.profession]);

  useEffect(() => {
    if (!hydrated || !user?._id || user.profession !== 'Job') return;

    saveState(user._id, {
      selectedModuleId,
      drafts,
      itrDraft,
      itrStepIndex,
      tdsDraft,
      tdsStepIndex,
      epfDraft,
      epfStepIndex,
      regimeDraft,
      regimeStepIndex,
    });
  }, [
    hydrated,
    user?._id,
    user?.profession,
    selectedModuleId,
    drafts,
    itrDraft,
    itrStepIndex,
    tdsDraft,
    tdsStepIndex,
    epfDraft,
    epfStepIndex,
    regimeDraft,
    regimeStepIndex,
  ]);

  const handleSubmitAttempt = async () => {
    const attemptData =
      selectedModule.id === 'itr-filing'
        ? buildItrAttemptData(itrDraft)
        : selectedModule.id === 'tds-check'
          ? buildTdsAttemptData(tdsDraft)
          : selectedModule.id === 'epf-lab'
            ? buildEpfAttemptData(epfDraft)
            : selectedModule.id === 'regime-decoder'
              ? buildRegimeAttemptData(regimeDraft)
        : currentDraft;

    if (selectedModule.id === 'itr-filing') {
      if (!validateItrStep(itrSteps.length - 1, itrDraft)) {
        setSubmitMessage({ type: 'error', text: 'Complete the full ITR flow and confirm all preview checks before submitting.' });
        return;
      }
    } else if (selectedModule.id === 'tds-check') {
      if (!validateTdsStep(tdsSteps.length - 1, tdsDraft)) {
        setSubmitMessage({ type: 'error', text: 'Complete the full TDS reconciliation flow and record the resolution decision before submitting.' });
        return;
      }
    } else if (selectedModule.id === 'epf-lab') {
      if (!validateEpfStep(epfSteps.length - 1, epfDraft)) {
        setSubmitMessage({ type: 'error', text: 'Complete the EPF / UAN flow and record the final action before submitting.' });
        return;
      }
    } else if (selectedModule.id === 'regime-decoder') {
      if (!validateRegimeStep(regimeSteps.length - 1, regimeDraft)) {
        setSubmitMessage({ type: 'error', text: 'Complete the regime comparison flow and justify the final filing choice before submitting.' });
        return;
      }
    } else {
      const requiredFields = Object.entries(attemptData).filter(([, value]) => !value.trim());
      if (requiredFields.length > 0) {
        setSubmitMessage({ type: 'error', text: 'Please complete all four reflection fields before submitting for review.' });
        return;
      }
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/career-lab/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          moduleId: selectedModule.id,
          attemptData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit attempt');

      setLatestEvaluation(data);
      setSubmitMessage({ type: 'success', text: `Attempt graded successfully. You earned feedback with grade ${data.grade}.` });
      if (selectedModule.id === 'itr-filing') {
        setItrDraft(initialItrDraft);
        setItrStepIndex(0);
      } else if (selectedModule.id === 'tds-check') {
        setTdsDraft(initialTdsDraft);
        setTdsStepIndex(0);
      } else if (selectedModule.id === 'epf-lab') {
        setEpfDraft(initialEpfDraft);
        setEpfStepIndex(0);
      } else if (selectedModule.id === 'regime-decoder') {
        setRegimeDraft(initialRegimeDraft);
        setRegimeStepIndex(0);
      } else {
        setDrafts((prev) => ({ ...prev, [selectedModule.id]: emptyDraft }));
      }
      await fetchAttempts(selectedModule.id);
      refreshUser();
    } catch (error) {
      setSubmitMessage({ type: 'error', text: error.message || 'Failed to submit attempt' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.profession !== 'Job') {
    return (
      <div className="min-h-screen bg-stone-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-sm">
            <Briefcase className="h-12 w-12 mx-auto text-stone-300 mb-4" />
            <h1 className="text-3xl font-bold text-stone-900 mb-3">Working Professional Lab</h1>
            <p className="text-stone-600">
              This section is unlocked for users whose profile profession is set to `Job`. It is designed around salaried workflows like tax filing, TDS reconciliation, and EPF actions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ec_0%,#f5f7fb_45%,#eef7f1_100%)] py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="rounded-[2rem] overflow-hidden border border-stone-200 bg-white/80 backdrop-blur shadow-xl mb-8">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(21,128,61,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.18),_transparent_40%),linear-gradient(135deg,#111827,#1f2937,#312e81)] px-8 py-10 text-white">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm mb-4">
                  <Briefcase className="h-4 w-4 text-emerald-300" />
                  Working Professional Only
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Career Finance Lab</h1>
                <p className="text-slate-200 text-base md:text-lg leading-relaxed">
                  Practice the paperwork-heavy parts of adult money life before they become stressful in the real world. The ITR module now simulates actual filing steps in the frontend before AI grading.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 min-w-[280px]">
                <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200 mb-1">Unlocked For</p>
                  <p className="text-xl font-semibold">{user.name}</p>
                  <p className="text-sm text-slate-300">{user.profession}</p>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-200 mb-1">Coins</p>
                  <p className="text-xl font-semibold">{user.virtualCurrency}</p>
                  <p className="text-sm text-slate-300">Earned across modules</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1.05fr_1.7fr] gap-6">
          <div className="space-y-4">
            {modules.map((module) => {
              const draftFilledCount =
                module.id === 'itr-filing'
                  ? itrSteps.filter((_, index) => validateItrStep(index, itrDraft)).length
                  : module.id === 'tds-check'
                    ? tdsSteps.filter((_, index) => validateTdsStep(index, tdsDraft)).length
                    : module.id === 'epf-lab'
                      ? epfSteps.filter((_, index) => validateEpfStep(index, epfDraft)).length
                      : module.id === 'regime-decoder'
                        ? regimeSteps.filter((_, index) => validateRegimeStep(index, regimeDraft)).length
                  : Object.values(drafts[module.id] || emptyDraft).filter((value) => value.trim()).length;

              return (
                <button
                  key={module.id}
                  onClick={() => setSelectedModuleId(module.id)}
                  className={`w-full text-left rounded-3xl border p-5 transition-all ${
                    selectedModule.id === module.id ? 'border-emerald-300 bg-white shadow-lg' : 'border-stone-200 bg-white/80 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center text-white shrink-0`}>
                      <module.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h2 className="text-lg font-semibold text-stone-900">{module.title}</h2>
                          <p className="text-sm text-stone-600">{module.subtitle}</p>
                        </div>
                        <ArrowRight className={`h-5 w-5 shrink-0 transition-transform ${selectedModule.id === module.id ? 'text-emerald-600 translate-x-1' : 'text-stone-300'}`} />
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">{module.difficulty}</span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-700">
                          {module.id === 'itr-filing'
                            ? `${draftFilledCount}/${itrSteps.length} portal steps ready`
                            : module.id === 'tds-check'
                              ? `${draftFilledCount}/${tdsSteps.length} reconciliation steps ready`
                              : module.id === 'epf-lab'
                                ? `${draftFilledCount}/${epfSteps.length} EPF steps ready`
                                : module.id === 'regime-decoder'
                                  ? `${draftFilledCount}/${regimeSteps.length} regime steps ready`
                                  : `${draftFilledCount}/4 answer fields`}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">{module.basedOn}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedModule.id === 'itr-filing' ? (
            <div className="grid lg:grid-cols-[1.45fr_0.8fr] gap-6">
              <ItrSimulator
                draft={itrDraft}
                setDraft={setItrDraft}
                currentStep={itrStepIndex}
                setCurrentStep={setItrStepIndex}
                submitting={submitting}
                handleSubmitAttempt={handleSubmitAttempt}
                submitMessage={submitMessage}
              />
              <EvaluationColumn
                latestEvaluation={latestEvaluation}
                attempts={attempts}
                attemptsLoading={attemptsLoading}
                setLatestEvaluation={setLatestEvaluation}
              />
            </div>
          ) : selectedModule.id === 'tds-check' ? (
            <div className="grid lg:grid-cols-[1.45fr_0.8fr] gap-6">
              <TdsSimulator
                draft={tdsDraft}
                setDraft={setTdsDraft}
                currentStep={tdsStepIndex}
                setCurrentStep={setTdsStepIndex}
                submitting={submitting}
                handleSubmitAttempt={handleSubmitAttempt}
                submitMessage={submitMessage}
              />
              <EvaluationColumn
                latestEvaluation={latestEvaluation}
                attempts={attempts}
                attemptsLoading={attemptsLoading}
                setLatestEvaluation={setLatestEvaluation}
              />
            </div>
          ) : selectedModule.id === 'epf-lab' ? (
            <div className="grid lg:grid-cols-[1.45fr_0.8fr] gap-6">
              <EpfSimulator
                draft={epfDraft}
                setDraft={setEpfDraft}
                currentStep={epfStepIndex}
                setCurrentStep={setEpfStepIndex}
                submitting={submitting}
                handleSubmitAttempt={handleSubmitAttempt}
                submitMessage={submitMessage}
              />
              <EvaluationColumn
                latestEvaluation={latestEvaluation}
                attempts={attempts}
                attemptsLoading={attemptsLoading}
                setLatestEvaluation={setLatestEvaluation}
              />
            </div>
          ) : selectedModule.id === 'regime-decoder' ? (
            <div className="grid lg:grid-cols-[1.45fr_0.8fr] gap-6">
              <RegimeSimulator
                draft={regimeDraft}
                setDraft={setRegimeDraft}
                currentStep={regimeStepIndex}
                setCurrentStep={setRegimeStepIndex}
                submitting={submitting}
                handleSubmitAttempt={handleSubmitAttempt}
                submitMessage={submitMessage}
              />
              <EvaluationColumn
                latestEvaluation={latestEvaluation}
                attempts={attempts}
                attemptsLoading={attemptsLoading}
                setLatestEvaluation={setLatestEvaluation}
              />
            </div>
          ) : (
            <GenericModulePanel
              selectedModule={selectedModule}
              currentDraft={currentDraft}
              setDraftValue={setDraftValue}
              latestEvaluation={latestEvaluation}
              attempts={attempts}
              attemptsLoading={attemptsLoading}
              setLatestEvaluation={setLatestEvaluation}
              submitting={submitting}
              handleSubmitAttempt={handleSubmitAttempt}
              submitMessage={submitMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkingProfessionalLab;
