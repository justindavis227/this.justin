'use client'

import { useSearchParams } from 'next/navigation'
import SpaceShell from './shared/SpaceShell'
import KpiCard from './shared/KpiCard'
import KpiRow from './shared/KpiRow'
import { FocusList } from './shared/FocusList'
import {
  BUILD_OVERVIEW_KPIS, BUILD_ACTIVITY,
  EXPERIMENTS_KPIS, EXPERIMENTS_BENCH,
  BRANDKIT_KPIS, BRANDKIT_CHANGELOG,
} from '@/lib/mockSpaceData'

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'experiments', label: 'Experiments' },
  { id: 'brandkit',    label: 'Brand kit' },
]

export default function BuildSpace() {
  const sp = useSearchParams()
  const tab = sp.get('tab') ?? 'overview'

  return (
    <>
      {tab === 'overview' && (
        <SpaceShell
          name="Build" tabs={TABS} activeTab="overview"
          tagline="Tools + products I'm building."
          syncLabel="Linear · Craft"
          mockBanner="Future-state mock · Linear + Craft integrations not wired yet"
        >
          <KpiRow cols={3}>
            <KpiCard label="Active Builds" value={BUILD_OVERVIEW_KPIS.activeBuilds.value} subtitle={BUILD_OVERVIEW_KPIS.activeBuilds.sub} accent="#3B82F6" />
            <KpiCard label="Shipped · Q2"   value={BUILD_OVERVIEW_KPIS.shippedQ2.value}    subtitle={BUILD_OVERVIEW_KPIS.shippedQ2.sub}    accent="#10B981" />
            <KpiCard label="Open Issues"    value={BUILD_OVERVIEW_KPIS.openIssues.value}    subtitle={BUILD_OVERVIEW_KPIS.openIssues.sub}    accent="#FBBF24" />
          </KpiRow>
          <FocusList title="Recent activity" count={BUILD_ACTIVITY.length} items={BUILD_ACTIVITY} />
        </SpaceShell>
      )}

      {tab === 'experiments' && (
        <SpaceShell
          name="Build" tabs={TABS} activeTab="experiments"
          tagline="Sketches + prototypes."
          syncLabel="Craft"
          mockBanner="Future-state mock · Craft integration not wired yet"
        >
          <KpiRow cols={3}>
            <KpiCard label="Prototypes" value={EXPERIMENTS_KPIS.prototypes.value} subtitle={EXPERIMENTS_KPIS.prototypes.sub} accent="#A78BFA" />
            <KpiCard label="In Review"   value={EXPERIMENTS_KPIS.inReview.value}   subtitle={EXPERIMENTS_KPIS.inReview.sub}   accent="#FBBF24" />
            <KpiCard label="Archived"    value={EXPERIMENTS_KPIS.archived.value}    subtitle={EXPERIMENTS_KPIS.archived.sub}    accent="#9CA3AF" />
          </KpiRow>
          <FocusList title="Bench" count={EXPERIMENTS_BENCH.length} items={EXPERIMENTS_BENCH} />
        </SpaceShell>
      )}

      {tab === 'brandkit' && (
        <SpaceShell
          name="Build" tabs={TABS} activeTab="brandkit"
          tagline="Design system + assets."
          syncLabel="Figma"
          mockBanner="Future-state mock · Figma integration not wired yet"
        >
          <KpiRow cols={3}>
            <KpiCard label="Version"     value={BRANDKIT_KPIS.version.value}    subtitle={BRANDKIT_KPIS.version.sub}    accent="#3B82F6" />
            <KpiCard label="Tokens"      value={BRANDKIT_KPIS.tokens.value}      subtitle={BRANDKIT_KPIS.tokens.sub}      accent="#A78BFA" />
            <KpiCard label="Components"  value={BRANDKIT_KPIS.components.value}  subtitle={BRANDKIT_KPIS.components.sub}  accent="#10B981" />
          </KpiRow>
          <FocusList title="Changelog" count={BRANDKIT_CHANGELOG.length} items={BRANDKIT_CHANGELOG} />
        </SpaceShell>
      )}
    </>
  )
}
