'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { format, parseISO, startOfWeek, addDays } from 'date-fns'
import { Check, Flame } from 'lucide-react'
import SpaceShell from './shared/SpaceShell'
import KpiCard from './shared/KpiCard'
import KpiRow from './shared/KpiRow'
import { FocusList, FocusItemData } from './shared/FocusList'
import {
  PERSONAL_OVERVIEW_KPIS, FAMILY_KPIS, JOURNAL_KPIS, JOURNAL_ENTRIES, RESTING_HR,
  FINANCE_NET_WORTH, FINANCE_ASSETS, FINANCE_LIABILITIES, FINANCE_ALLOCATION,
} from '@/lib/mockSpaceData'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'family',   label: 'Family' },
  { id: 'finance',  label: 'Finance' },
  { id: 'journal',  label: 'Journal' },
  { id: 'health',   label: 'Health' },
]

interface Props {
  onYourPlate: FocusItemData[]
  familyComingUp: FocusItemData[]
}

export default function PersonalSpace({ onYourPlate, familyComingUp }: Props) {
  const sp = useSearchParams()
  const tab = sp.get('tab') ?? 'overview'

  return (
    <>
      {tab === 'overview' && (
        <SpaceShell
          name="Personal"
          tabs={TABS} activeTab="overview"
          tagline="Personal Overview"
          syncLabel="Apple · iCloud"
        >
          <KpiRow cols={4}>
            <KpiCard label="Next Family Event"  value={PERSONAL_OVERVIEW_KPIS.nextFamily.value}      subtitle={PERSONAL_OVERVIEW_KPIS.nextFamily.sub}        accent="#E0568A" />
            <KpiCard label="Habit Consistency"  value={PERSONAL_OVERVIEW_KPIS.habitConsistency.value} subtitle={PERSONAL_OVERVIEW_KPIS.habitConsistency.sub} accent="#10B981" />
            <KpiCard label="Journal Streak"     value={PERSONAL_OVERVIEW_KPIS.journalStreak.value}    subtitle={PERSONAL_OVERVIEW_KPIS.journalStreak.sub}    accent="#FBBF24" />
            <KpiCard label="Reminders Due"      value={PERSONAL_OVERVIEW_KPIS.remindersDue.value}     subtitle={PERSONAL_OVERVIEW_KPIS.remindersDue.sub}     accent="#3B82F6" />
          </KpiRow>
          <FocusList title="On your plate" count={onYourPlate.length} items={onYourPlate} empty="Quiet — no personal items pending." />
        </SpaceShell>
      )}

      {tab === 'family' && (
        <SpaceShell
          name="Personal"
          tabs={TABS} activeTab="family"
          tagline="Shared with Elizabeth"
          syncLabel="Apple · Shared"
        >
          <KpiRow cols={3}>
            <KpiCard label="Next Trip"            value={FAMILY_KPIS.nextTrip.value}   subtitle={FAMILY_KPIS.nextTrip.sub}   accent="#E0568A" />
            <KpiCard label="Upcoming Birthdays"   value={FAMILY_KPIS.birthdays.value}  subtitle={FAMILY_KPIS.birthdays.sub}  accent="#FBBF24" />
            <KpiCard label="Shared List"          value={FAMILY_KPIS.sharedList.value} subtitle={FAMILY_KPIS.sharedList.sub} accent="#3B82F6" />
          </KpiRow>
          <FocusList title="Coming up" count={familyComingUp.length} items={familyComingUp} empty="Nothing on the family calendar yet." />
        </SpaceShell>
      )}

      {tab === 'finance' && (
        <SpaceShell
          name="Personal"
          tabs={TABS} activeTab="finance"
          tagline="Net worth, accounts, runway."
          mockBanner="Future-state mock · live accounts not yet connected"
        >
          <FinanceHero />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <AssetsCard />
            <LiabilitiesAndAllocCard />
          </div>
        </SpaceShell>
      )}

      {tab === 'journal' && (
        <SpaceShell
          name="Personal"
          tabs={TABS} activeTab="journal"
          tagline="Reflection + notes."
          syncLabel="Day One"
          mockBanner="Future-state mock · Day One integration not wired yet"
        >
          <KpiRow cols={3}>
            <KpiCard label={`Entries · ${format(new Date(), 'MMM')}`} value={JOURNAL_KPIS.entriesMonth.value}  subtitle={JOURNAL_KPIS.entriesMonth.sub}  accent="#A78BFA" />
            <KpiCard label="Current Streak"                            value={JOURNAL_KPIS.currentStreak.value} subtitle={JOURNAL_KPIS.currentStreak.sub} accent="#FBBF24" />
            <KpiCard label="Words Written"                             value={JOURNAL_KPIS.wordsWritten.value}  subtitle={JOURNAL_KPIS.wordsWritten.sub}  accent="#10B981" />
          </KpiRow>
          <FocusList title="Recent entries" count={JOURNAL_ENTRIES.length} items={JOURNAL_ENTRIES} />
        </SpaceShell>
      )}

      {tab === 'health' && (
        <SpaceShell
          name="Personal"
          tabs={TABS} activeTab="health"
          tagline="Macros, habits, and how the body's holding up."
          syncLabel="Apple Health"
        >
          <HealthTab />
        </SpaceShell>
      )}
    </>
  )
}

// =================== HEALTH TAB ====================================
function HealthTab() {
  const router = useRouter()
  const sp = useSearchParams()
  const sub = sp.get('sub') ?? 'overview'

  function setSub(id: string) {
    const p = new URLSearchParams(sp.toString())
    if (id === 'overview') p.delete('sub')
    else p.set('sub', id)
    router.replace(`?${p.toString()}`, { scroll: false })
  }

  const SUB_TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'macros',   label: 'Macros' },
    { id: 'habits',   label: 'Habits' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            style={{
              background: t.id === sub ? 'rgba(255,255,255,0.06)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 6,
              color: t.id === sub ? 'var(--fg)' : 'var(--muted)',
              padding: '4px 12px',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'overview' && <HealthOverview />}
      {sub === 'macros'   && <HealthMacros full />}
      {sub === 'habits'   && <HealthHabits full />}
    </div>
  )
}

function HealthOverview() {
  const [habitsCount, setHabitsCount] = useState<{ active: number; consistency: number } | null>(null)
  const [calToday, setCalToday] = useState<{ kcal: number; goal: number } | null>(null)

  useEffect(() => {
    fetch('/api/habits', { cache: 'no-store' }).then(r => r.json()).then(d => {
      const active = (d.habits ?? []).length
      const heatmap = d.heatmap ?? {}
      const vals = Object.values(heatmap) as number[]
      const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
      setHabitsCount({ active, consistency: Math.round(avg * 100) })
    }).catch(() => {})
    fetch('/api/macros/today', { cache: 'no-store' }).then(r => r.json()).then(d => {
      setCalToday({ kcal: d.totals?.calories ?? 0, goal: 2200 })
    }).catch(() => {})
  }, [])

  return (
    <>
      <KpiRow cols={4}>
        <KpiCard
          label="Calories · Today"
          value={calToday ? String(calToday.kcal) : '—'}
          subtitle={calToday ? `of ${calToday.goal} kcal` : 'loading…'}
          accent="#EF4444"
        />
        <KpiCard
          label="Habit Consistency"
          value={habitsCount ? `${habitsCount.consistency}%` : '—'}
          subtitle="last 30 days"
          accent="#10B981"
        />
        <KpiCard
          label="Active Habits"
          value={habitsCount ? String(habitsCount.active) : '—'}
          subtitle="across all cadences"
          accent="#3B82F6"
        />
        <KpiCard
          label="Resting HR"
          value={RESTING_HR.value}
          subtitle={RESTING_HR.sub}
          accent="#FBBF24"
        />
      </KpiRow>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <HealthMacros />
        <HealthHabits />
      </div>
    </>
  )
}

interface MacroEntry { calories: number | null; protein_g: number | null; carbs_g: number | null; fat_g: number | null }

function HealthMacros({ full = false }: { full?: boolean }) {
  const [data, setData] = useState<{ totals: MacroEntry } | null>(null)
  const goals = { calories: 2200, protein_g: 180, carbs_g: 220, fat_g: 70 }

  useEffect(() => {
    fetch('/api/macros/today', { cache: 'no-store' }).then(r => r.json()).then(setData).catch(() => {})
  }, [])

  const totals = data?.totals ?? { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  const rows: { label: string; val: number; goal: number; unit: string }[] = [
    { label: 'Calories', val: totals.calories ?? 0, goal: goals.calories, unit: 'kcal' },
    { label: 'Protein',  val: totals.protein_g ?? 0, goal: goals.protein_g, unit: 'g' },
    { label: 'Carbs',    val: totals.carbs_g ?? 0,   goal: goals.carbs_g,   unit: 'g' },
    { label: 'Fat',      val: totals.fat_g ?? 0,     goal: goals.fat_g,     unit: 'g' },
  ]

  return (
    <div className="dcard" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: 0.6 }}>Macros · Today</span>
        {!full && <a href="?tab=health&sub=macros" style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>Open →</a>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map(r => {
          const pct = r.goal > 0 ? Math.min(100, Math.round((r.val / r.goal) * 100)) : 0
          return (
            <div key={r.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span>{r.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                  {r.val} / {r.goal}{r.unit} · {pct}%
                </span>
              </div>
              <div className="track sm">
                <span style={{ width: `${pct}%`, background: '#3B82F6' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface HabitRow { slug: string; label: string; week: Record<string, boolean>; streak: number }

function HealthHabits({ full = false }: { full?: boolean }) {
  const [data, setData] = useState<{ habits: HabitRow[] } | null>(null)
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    fetch('/api/habits', { cache: 'no-store' }).then(r => r.json()).then(setData).catch(() => {})
  }, [])

  return (
    <div className="dcard" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: 0.6 }}>Habits · This week</span>
        {!full && <a href="?tab=health&sub=habits" style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>Open →</a>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr repeat(7, 1fr)', gap: 4 }}>
        <div />
        {weekDays.map(d => (
          <div key={d.toISOString()} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>
            {format(d, 'EEEEE').toUpperCase()}
          </div>
        ))}
        {(data?.habits ?? []).map(h => (
          <React.Fragment key={h.slug}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {h.label}
              {h.streak > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#FBBF24' }}>
                  <Flame size={9} />{h.streak}
                </span>
              )}
            </div>
            {weekDays.map(d => {
              const dStr = format(d, 'yyyy-MM-dd')
              const done = h.week[dStr] ?? false
              return (
                <div key={dStr} style={{
                  aspectRatio: '1',
                  borderRadius: 4,
                  background: done ? '#3B82F6' : 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {done && <Check size={11} strokeWidth={2.8} color="#0a0a0a" />}
                </div>
              )
            })}
          </React.Fragment>
        ))}
        {!data && (
          <div style={{ gridColumn: '1 / -1', fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: 8 }}>
            Loading…
          </div>
        )}
      </div>
    </div>
  )
}

// =================== FINANCE (mock) ===============================
function FinanceHero() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 12,
      padding: 24,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24,
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
          Net Worth
        </div>
        <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {FINANCE_NET_WORTH.value}
        </div>
        <div style={{ fontSize: 14, color: '#6EE7B7', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
          {FINANCE_NET_WORTH.delta} · {FINANCE_NET_WORTH.pct} · {FINANCE_NET_WORTH.timeframe}
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 18, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Assets</div>
            <div style={{ color: '#6EE7B7', fontSize: 14, marginTop: 2 }}>{FINANCE_NET_WORTH.assets}</div>
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Liabilities</div>
            <div style={{ color: '#FCA5A5', fontSize: 14, marginTop: 2 }}>{FINANCE_NET_WORTH.liabilities}</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Sparkline mock */}
        <svg viewBox="0 0 200 80" style={{ width: '100%', height: 80 }} preserveAspectRatio="none">
          <polyline
            points="0,60 20,55 40,58 60,48 80,42 100,38 120,32 140,28 160,22 180,18 200,12"
            fill="none" stroke="#6EE7B7" strokeWidth={2}
          />
          <polygon
            points="0,60 20,55 40,58 60,48 80,42 100,38 120,32 140,28 160,22 180,18 200,12 200,80 0,80"
            fill="rgba(110,231,183,0.10)"
          />
        </svg>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', marginTop: 12 }}>
          {['1D', '30D', '1Y', '5Y', 'All'].map(p => (
            <button key={p} style={{
              background: p === '1Y' ? 'rgba(255,255,255,0.12)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 4,
              color: p === '1Y' ? 'var(--fg)' : 'rgba(255,255,255,0.6)',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              padding: '3px 8px',
              cursor: 'pointer',
            }}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

function AssetsCard() {
  return (
    <div className="dcard" style={{ padding: 16 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: 0.6, marginBottom: 10 }}>
        Assets
      </div>
      {Object.entries(FINANCE_ASSETS).map(([group, lines]) => (
        <div key={group} style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
            {group}
          </div>
          {lines.map(l => (
            <div key={l.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span>{l.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#6EE7B7' }}>{l.amount}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function LiabilitiesAndAllocCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="dcard" style={{ padding: 16 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: 0.6, marginBottom: 10 }}>
          Liabilities
        </div>
        {FINANCE_LIABILITIES.map(l => (
          <div key={l.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <span>{l.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#FCA5A5' }}>{l.amount}</span>
          </div>
        ))}
      </div>
      <div className="dcard" style={{ padding: 16 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: 0.6, marginBottom: 10 }}>
          Allocation
        </div>
        <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', marginBottom: 10 }}>
          {FINANCE_ALLOCATION.map(a => (
            <div key={a.label} style={{ width: `${a.pct}%`, background: a.color }} />
          ))}
        </div>
        {FINANCE_ALLOCATION.map(a => (
          <div key={a.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: a.color }} />
              {a.label}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{a.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

