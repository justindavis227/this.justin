'use client'

import { useSearchParams } from 'next/navigation'
import SpaceShell from './shared/SpaceShell'
import KpiCard from './shared/KpiCard'
import KpiRow from './shared/KpiRow'
import { FocusList, FocusItemData } from './shared/FocusList'
import { WORK_OVERVIEW_KPIS, SOUTHEAST_KPIS, SOUTHEAST_MILESTONES, STUDENTS_KPIS } from '@/lib/mockSpaceData'

const TABS = [
  { id: 'overview',  label: 'Overview'  },
  { id: 'southeast', label: 'Southeast' },
  { id: 'students',  label: 'Students'  },
]

interface Props {
  needsYouThisWeek: FocusItemData[]
  studentsThisWeek: FocusItemData[]
}

export default function WorkSpace({ needsYouThisWeek, studentsThisWeek }: Props) {
  const sp = useSearchParams()
  const tab = sp.get('tab') ?? 'overview'

  return (
    <>
      {tab === 'overview' && (
        <SpaceShell
          name="Work"
          tabs={TABS}
          activeTab="overview"
          tagline="Ministry leadership at a glance."
          syncLabel="Planning Center"
          mockBanner="Future-state mock · Planning Center integration not wired yet"
        >
          <KpiRow cols={4}>
            <KpiCard label="Weekend Attendance"  value={WORK_OVERVIEW_KPIS.weekendAttendance.value} subtitle={WORK_OVERVIEW_KPIS.weekendAttendance.sub} accent="#3B82F6" />
            <KpiCard label="Volunteers Active"   value={WORK_OVERVIEW_KPIS.volunteersActive.value}  subtitle={WORK_OVERVIEW_KPIS.volunteersActive.sub}  accent="#10B981" />
            <KpiCard label="Groups"              value={WORK_OVERVIEW_KPIS.groups.value}             subtitle={WORK_OVERVIEW_KPIS.groups.sub}             accent="#FBBF24" />
            <KpiCard label="Giving · MTD"        value={WORK_OVERVIEW_KPIS.givingMtd.value}          subtitle={WORK_OVERVIEW_KPIS.givingMtd.sub}          accent="#A78BFA" />
          </KpiRow>
          <FocusList
            title="Needs you this week"
            count={needsYouThisWeek.length}
            items={needsYouThisWeek}
            empty="Nothing urgent in your work spaces."
          />
        </SpaceShell>
      )}

      {tab === 'southeast' && (
        <SpaceShell
          name="Work"
          tabs={TABS}
          activeTab="southeast"
          tagline="Church-planting region."
          syncLabel="Notion"
          mockBanner="Future-state mock · Notion integration not wired yet"
        >
          <KpiRow cols={4}>
            <KpiCard label="Target Launch"   value={SOUTHEAST_KPIS.targetLaunch.value}  subtitle={SOUTHEAST_KPIS.targetLaunch.sub}  accent="#3B82F6" />
            <KpiCard label="Core Team"        value={SOUTHEAST_KPIS.coreTeam.value}      subtitle={SOUTHEAST_KPIS.coreTeam.sub}      accent="#10B981" />
            <KpiCard label="Funding Raised"   value={SOUTHEAST_KPIS.fundingRaised.value} subtitle={SOUTHEAST_KPIS.fundingRaised.sub} accent="#FBBF24" />
            <KpiCard label="Cities Scoped"    value={SOUTHEAST_KPIS.citiesScoped.value}  subtitle={SOUTHEAST_KPIS.citiesScoped.sub}  accent="#A78BFA" />
          </KpiRow>
          <FocusList title="Milestones" count={SOUTHEAST_MILESTONES.length} items={SOUTHEAST_MILESTONES} />
        </SpaceShell>
      )}

      {tab === 'students' && (
        <SpaceShell
          name="Work"
          tabs={TABS}
          activeTab="students"
          tagline="Student ministry."
          syncLabel="Planning Center"
          mockBanner="Future-state mock · Planning Center integration not wired yet"
        >
          <KpiRow cols={3}>
            <KpiCard label="Weekly Attendance"       value={STUDENTS_KPIS.weeklyAttendance.value}   subtitle={STUDENTS_KPIS.weeklyAttendance.sub}   accent="#3B82F6" />
            <KpiCard label="Small-Group Leaders"     value={STUDENTS_KPIS.smallGroupLeaders.value}  subtitle={STUDENTS_KPIS.smallGroupLeaders.sub}  accent="#FBBF24" />
            <KpiCard label="Next Event"              value={STUDENTS_KPIS.nextEvent.value}          subtitle={STUDENTS_KPIS.nextEvent.sub}          accent="#10B981" />
          </KpiRow>
          <FocusList
            title="This week"
            count={studentsThisWeek.length}
            items={studentsThisWeek}
            empty="Nothing on the student board this week."
          />
        </SpaceShell>
      )}
    </>
  )
}
