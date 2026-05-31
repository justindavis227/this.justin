'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import SpaceShell from './shared/SpaceShell'
import KpiCard from './shared/KpiCard'
import KpiRow from './shared/KpiRow'
import { FocusList, FocusItemData } from './shared/FocusList'

const TABS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'sourcing',  label: 'Sourcing' },
  { id: 'listings',  label: 'Listings' },
]

interface Summary {
  revenue: number; netProfit: number; sales: number; margin: number
  fees: number; shipping: number; expenses: number; miles: number
}
interface KpiPayload {
  mtd: Summary; ytd: Summary
  categories: { name: string; revenue: number; sales: number }[]
  last_sync: string | null
}
interface TopMover {
  id: string; description: string; category: string | null
  sold_price: number | null; net_profit: number | null; date_sold: string | null
  platform_sold: string | null
}

function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}
function pct(n: number): string { return `${(n * 100).toFixed(1)}%` }

export default function ResellSpace() {
  const sp = useSearchParams()
  const tab = sp.get('tab') ?? 'overview'

  return (
    <>
      {tab === 'overview' && <ResellOverview />}
      {tab === 'sourcing' && (
        <SpaceShell name="Resell" tabs={TABS} activeTab="sourcing"
          tagline="Where the next items come from."
          syncLabel="Google Sheets">
          <div className="empty" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
            Sourcing pipeline view — Phase 5+. The data is in the Sheet; the visualization isn’t built yet.
          </div>
        </SpaceShell>
      )}
      {tab === 'listings' && (
        <SpaceShell name="Resell" tabs={TABS} activeTab="listings"
          tagline="What’s live across platforms."
          syncLabel="Google Sheets">
          <div className="empty" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
            Listings grid — Phase 5+. The data is in the Sheet; the visualization isn’t built yet.
          </div>
        </SpaceShell>
      )}
    </>
  )
}

function ResellOverview() {
  const [data, setData] = useState<KpiPayload | null>(null)
  const [movers, setMovers] = useState<TopMover[]>([])
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  async function loadAll() {
    try {
      const [kpis, mov] = await Promise.all([
        fetch('/api/resell/kpis', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/resell/top-movers', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ movers: [] })),
      ])
      setData(kpis)
      setMovers(mov.movers ?? [])
    } catch { /* ignore */ }
  }

  useEffect(() => { loadAll() }, [])

  async function syncNow() {
    if (syncing) return
    setSyncing(true); setSyncMsg(null)
    try {
      const res = await fetch('/api/resell/sync', { method: 'POST' })
      const j = await res.json()
      if (res.ok) {
        setSyncMsg(`Synced: ${j.counts.inventory} inv · ${j.counts.expenses} exp · ${j.counts.mileage} mi`)
        await loadAll()
      } else {
        setSyncMsg(`Failed: ${j.error ?? 'unknown error'}`)
      }
    } catch (e) {
      setSyncMsg(`Failed: ${e instanceof Error ? e.message : 'network error'}`)
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(null), 4000)
    }
  }

  const mtd = data?.mtd

  // Top movers: net_profit (sold) sorted desc
  const moverItems: FocusItemData[] = movers.map(m => ({
    id: m.id,
    title: m.description,
    subtitle: [m.category, m.platform_sold].filter(Boolean).join(' · ') || undefined,
    status: 'complete',
    rightText: m.net_profit !== null ? `+${money(Number(m.net_profit))}` : undefined,
  }))

  return (
    <SpaceShell
      name="Resell" tabs={TABS} activeTab="overview"
      tagline="Reselling side business."
      syncLabel="Google Sheets"
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: -6, marginBottom: 10 }}>
        {data?.last_sync && (
          <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            Last sync: {formatDistanceToNow(new Date(data.last_sync), { addSuffix: true })}
          </span>
        )}
        {syncMsg && <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{syncMsg}</span>}
        <button className="btn btn-secondary sm" onClick={syncNow} disabled={syncing}>
          <RefreshCw size={13} className={syncing ? 'spin' : ''} />
          {syncing ? 'Syncing…' : 'Sync now'}
        </button>
      </div>

      <KpiRow cols={4}>
        <KpiCard
          label="Revenue · MTD"
          value={mtd ? money(mtd.revenue) : '—'}
          subtitle={data ? `YTD ${money(data.ytd.revenue)}` : ''}
          accent="#10B981"
        />
        <KpiCard
          label="Active Listings"
          value="—"
          subtitle="watchers · TBD"
          accent="#3B82F6"
        />
        <KpiCard
          label="Sell-Through %"
          value={mtd && mtd.sales > 0 ? `${Math.round(100 * mtd.sales / Math.max(1, mtd.sales))}%` : '—'}
          subtitle="30-day · need active listings count"
          accent="#FBBF24"
        />
        <KpiCard
          label="Avg Margin %"
          value={mtd && mtd.revenue > 0 ? pct(mtd.margin) : '—'}
          subtitle="after fees"
          accent="#A78BFA"
        />
      </KpiRow>

      <FocusList
        title="Top movers"
        count={moverItems.length}
        items={moverItems.slice(0, 6)}
        empty="No sales recorded yet this period."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        <KpiCard
          label="Mileage MTD"
          value={mtd ? `${mtd.miles.toFixed(1)} mi` : '—'}
          subtitle={data ? `YTD ${data.ytd.miles.toFixed(0)} mi` : ''}
          accent="#F59E0B"
        />
        <KpiCard
          label="Expenses MTD"
          value={mtd ? money(mtd.expenses) : '—'}
          subtitle={data ? `YTD ${money(data.ytd.expenses)}` : ''}
          accent="#EF4444"
        />
      </div>

      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </SpaceShell>
  )
}
