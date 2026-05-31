// Centralized mock data for spaces awaiting real integrations.
// Each constant is labeled with its eventual source so it's easy to
// find and swap when the corresponding integration lands.

import type { FocusItemData } from '@/components/spaces/shared/FocusList'

// === WORK ===========================================================
// Source: Planning Center (Phase 5+)
export const WORK_OVERVIEW_KPIS = {
  weekendAttendance: { value: '4,820', sub: '↑ 3.2% vs last week' },
  volunteersActive:  { value: '362', sub: 'of 410 rostered' },
  groups:            { value: '47', sub: '3 launching this month' },
  givingMtd:         { value: '$184k', sub: '78% of plan' },
}

// Source: Notion (Phase 5+)
export const SOUTHEAST_KPIS = {
  targetLaunch:  { value: 'Sep 14', sub: '15 weeks out' },
  coreTeam:      { value: '11', sub: 'goal 18' },
  fundingRaised: { value: '$142k', sub: 'of $250k goal' },
  citiesScoped:  { value: '4', sub: '1 committed' },
}

export const SOUTHEAST_MILESTONES: FocusItemData[] = [
  { id: 's1', title: 'Site visit · Knoxville',           subtitle: 'Tour candidate venues with elder team',  status: 'active',    rightText: 'Jun 12' },
  { id: 's2', title: 'Core team retreat',                 subtitle: 'Vision alignment + commitment ask',     status: 'attention', rightText: 'Jul 8'  },
  { id: 's3', title: 'Public soft-launch announce',       subtitle: 'Press kit + parish-wide email',         status: 'idle',      rightText: 'Aug 15' },
]

// Source: Planning Center Students (Phase 5+)
export const STUDENTS_KPIS = {
  weeklyAttendance: { value: '184', sub: '↑ 12 vs last wk' },
  smallGroupLeaders: { value: '22 / 26', sub: '4 groups short' },
  nextEvent: { value: 'Wed · CAM Summer Kickoff', sub: 'Doors 6:30p' },
}

// === PERSONAL =======================================================
// Source: Apple iCloud + Day One (mocked)
export const PERSONAL_OVERVIEW_KPIS = {
  nextFamily: { value: 'Sun · Pool day with the boys', sub: 'apple_family · 2:00p' },
  habitConsistency: { value: '78%', sub: 'last 30 days' },
  journalStreak: { value: '12 days', sub: 'Day One' },
  remindersDue: { value: '3', sub: 'today' },
}

// Source: Apple Family Shared (mocked, will switch to real apple_family events)
export const FAMILY_KPIS = {
  nextTrip:     { value: 'Jun 21 · Gatlinburg', sub: '21 days out' },
  birthdays:    { value: '2', sub: 'this month' },
  sharedList:   { value: '14 items', sub: 'Groceries' },
}

// Source: Day One (Phase 5+)
export const JOURNAL_KPIS = {
  entriesMonth: { value: '23', sub: '↑ 4 vs last month' },
  currentStreak: { value: '12 days', sub: 'best: 41' },
  wordsWritten: { value: '8.2k', sub: 'this month' },
}

export const JOURNAL_ENTRIES: FocusItemData[] = [
  { id: 'j1', title: 'Morning thoughts on the week ahead', subtitle: 'Morning · 412 words', leftText: 'Today' },
  { id: 'j2', title: 'Reflection on CMT planning meeting', subtitle: 'Evening · 318 words', leftText: 'Yest' },
  { id: 'j3', title: 'Notes from Tim Keller lecture',      subtitle: 'Evening · 540 words', leftText: '2d' },
  { id: 'j4', title: 'Quick gratitude list',               subtitle: 'Morning · 92 words',  leftText: '3d' },
]

// Source: Apple Health (HR will be mocked; macros + habits are real)
export const RESTING_HR = { value: '54 bpm', sub: '7-day avg' }

// === FINANCE (full mock — no live source) ===========================
export const FINANCE_NET_WORTH = {
  value: '$614,040',
  delta: '+$12,400',
  pct: '+2.1%',
  timeframe: '30 days',
  assets: '$782,160',
  liabilities: '$168,120',
}

export const FINANCE_ASSETS = {
  Cash:        [{ name: 'Chase Checking', amount: '$12,400' }, { name: 'Ally HYSA', amount: '$28,200' }],
  Investments: [{ name: 'Fidelity 401k', amount: '$284,300' }, { name: 'Roth IRA', amount: '$96,800' }, { name: 'Brokerage', amount: '$48,400' }],
  Property:    [{ name: 'Home (est.)', amount: '$285,000' }, { name: '2018 Camry', amount: '$14,260' }],
  Education:   [{ name: '529 Plan · Boys', amount: '$12,800' }],
}

export const FINANCE_LIABILITIES = [
  { name: 'Mortgage',       amount: '$148,200' },
  { name: 'Card · Chase',   amount: '$2,420' },
  { name: 'Student loans',  amount: '$17,500' },
]

export const FINANCE_ALLOCATION = [
  { label: 'Investments', pct: 55, color: '#3B82F6' },
  { label: 'Property',    pct: 28, color: '#10B981' },
  { label: 'Cash',        pct: 12, color: '#FBBF24' },
  { label: 'Education',   pct: 5,  color: '#A78BFA' },
]

// === BUILD ==========================================================
// Source: Linear + Craft (mocked)
export const BUILD_OVERVIEW_KPIS = {
  activeBuilds: { value: '4', sub: '2 shipping soon' },
  shippedQ2:    { value: '7', sub: 'tools + docs' },
  openIssues:   { value: '23', sub: '5 high priority' },
}

export const BUILD_ACTIVITY: FocusItemData[] = [
  { id: 'b1', title: 'Resell sync — published-to-web CSV pipeline live', leftText: '12m' },
  { id: 'b2', title: 'Phase 3 spaces configurator merged',               leftText: '2h'  },
  { id: 'b3', title: 'Calendar dedup fix shipped to main',                leftText: '1d'  },
  { id: 'b4', title: 'Ask my OS — pgvector RPC + Claude synth shipped',  leftText: '3d'  },
  { id: 'b5', title: 'Morning briefing cron scheduled',                   leftText: '4d'  },
]

export const EXPERIMENTS_KPIS = {
  prototypes: { value: '6', sub: '2 promising' },
  inReview:   { value: '2', sub: 'with Sarah' },
  archived:   { value: '11', sub: 'lessons logged' },
}

export const EXPERIMENTS_BENCH: FocusItemData[] = [
  { id: 'e1', title: 'Voice → reflective journal entry', subtitle: 'Pipeline sketch', status: 'research', contextTag: 'build' },
  { id: 'e2', title: 'Multi-campus rollup heatmap',      subtitle: 'For CMT weekly',  status: 'idea',     contextTag: 'work'  },
  { id: 'e3', title: 'Auto-categorize resell photos',    subtitle: 'GPT-4o vision',   status: 'research', contextTag: 'resell' },
  { id: 'e4', title: 'Mileage from Apple Health steps',  subtitle: 'API exploration', status: 'idea',     contextTag: 'resell' },
]

export const BRANDKIT_KPIS = {
  version:    { value: 'v2.4', sub: 'shipped' },
  tokens:     { value: '128', sub: 'color + type' },
  components: { value: '34', sub: 'in kit' },
}

export const BRANDKIT_CHANGELOG: FocusItemData[] = [
  { id: 'c1', title: 'v2.4 · monospace font swap (JetBrains Mono → Berkeley Mono)', leftText: '2w' },
  { id: 'c2', title: 'v2.3 · status badge variants + dot states',                    leftText: '1mo' },
  { id: 'c3', title: 'v2.2 · ✱ asterisk lockup, finalized brand mark',                leftText: '2mo' },
  { id: 'c4', title: 'v2.1 · spaces card spec frozen',                                leftText: '3mo' },
]
