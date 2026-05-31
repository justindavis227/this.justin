'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, TrendingUp, Receipt, Car, ShoppingBag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Summary {
  revenue: number
  netProfit: number
  sales: number
  margin: number
  fees: number
  shipping: number
  expenses: number
  miles: number
}

interface KpiPayload {
  mtd: Summary
  ytd: Summary
  categories: { name: string; revenue: number; sales: number }[]
  last_sync: string | null
}

function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}
function money2(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}
function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

export default function ResellDashboard() {
  const [data, setData] = useState<KpiPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/resell/kpis', { cache: 'no-store' })
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function syncNow() {
    if (syncing) return
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res = await fetch('/api/resell/sync', { method: 'POST' })
      const j = await res.json()
      if (res.ok) {
        setSyncMsg(`Synced: ${j.counts.inventory} inv · ${j.counts.expenses} exp · ${j.counts.mileage} mi`)
        await load()
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
  const ytd = data?.ytd

  return (
    <div className="content-inner">
      <div className="section">
        <div className="section-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="section-eyebrow">Resell</span>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              {data?.last_sync
                ? `Last sync: ${formatDistanceToNow(new Date(data.last_sync), { addSuffix: true })}`
                : (loading ? 'Loading…' : 'Never synced')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {syncMsg && (
              <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{syncMsg}</span>
            )}
            <button className="btn btn-secondary sm" onClick={syncNow} disabled={syncing}>
              <RefreshCw size={13} className={syncing ? 'spin' : ''} />
              {syncing ? 'Syncing…' : 'Sync now'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 14 }}>
          <KpiTile
            icon={<TrendingUp size={14} />}
            label="Revenue MTD"
            value={mtd ? money(mtd.revenue) : '—'}
            sub={ytd ? `YTD ${money(ytd.revenue)}` : ''}
            color="#10B981"
          />
          <KpiTile
            icon={<TrendingUp size={14} />}
            label="Net Profit MTD"
            value={mtd ? money(mtd.netProfit) : '—'}
            sub={ytd ? `YTD ${money(ytd.netProfit)}` : ''}
            color="#3B82F6"
          />
          <KpiTile
            icon={<ShoppingBag size={14} />}
            label="Sales MTD"
            value={mtd ? String(mtd.sales) : '—'}
            sub={ytd ? `YTD ${ytd.sales}` : ''}
            color="#FBBF24"
          />
          <KpiTile
            icon={<TrendingUp size={14} />}
            label="Avg Margin"
            value={mtd && mtd.revenue > 0 ? pct(mtd.margin) : '—'}
            sub={ytd && ytd.revenue > 0 ? `YTD ${pct(ytd.margin)}` : ''}
            color="#A78BFA"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginTop: 12 }}>
          {/* Top categories */}
          <div className="dcard">
            <div className="dcard-head">
              <span className="dcard-eyebrow">Top categories · MTD</span>
            </div>
            {data && data.categories.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {data.categories.map(c => {
                  const max = Math.max(...data.categories.map(x => x.revenue), 1)
                  const pctW = Math.round((c.revenue / max) * 100)
                  return (
                    <div key={c.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span>{c.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                          {money(c.revenue)} · {c.sales} sale{c.sales === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="track sm">
                        <span style={{ width: `${pctW}%`, background: '#10B981' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                {loading ? 'Loading…' : 'No sales this month'}
              </div>
            )}
          </div>

          {/* Side tiles: mileage + expenses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <KpiTile
              icon={<Car size={14} />}
              label="Mileage MTD"
              value={mtd ? `${mtd.miles.toFixed(1)} mi` : '—'}
              sub={ytd ? `YTD ${ytd.miles.toFixed(0)} mi` : ''}
              color="#F59E0B"
            />
            <KpiTile
              icon={<Receipt size={14} />}
              label="Expenses MTD"
              value={mtd ? money2(mtd.expenses) : '—'}
              sub={ytd ? `YTD ${money2(ytd.expenses)}` : ''}
              color="#EF4444"
            />
            <div className="dcard" style={{ padding: 14 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                Costs breakdown · MTD
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                <Row label="Fees + promoted" value={mtd ? money2(mtd.fees) : '—'} />
                <Row label="Shipping"          value={mtd ? money2(mtd.shipping) : '—'} />
                <Row label="Expenses (other)"  value={mtd ? money2(mtd.expenses) : '—'} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function KpiTile({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color: string
}) {
  return (
    <div className="dcard" style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  )
}
