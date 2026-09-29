import { CalendarDays, ChartNoAxesColumn, House, List } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/shared/ui/Card'
import { RowLink } from '@/shared/ui/RowLink'
import { TabBar, type TabItem } from '@/shared/ui/TabBar'
import { strings } from '@/shared/utils/strings'
import { SpecimenSection } from './SpecimenSection'

type TabId = 'home' | 'calendar' | 'progress' | 'history'

const TABS: readonly TabItem<TabId>[] = [
  { id: 'home', label: strings.nav.home, icon: <House strokeWidth={1.75} /> },
  { id: 'calendar', label: strings.nav.calendar, icon: <CalendarDays strokeWidth={1.75} /> },
  { id: 'progress', label: strings.nav.progress, icon: <ChartNoAxesColumn strokeWidth={1.75} /> },
  { id: 'history', label: strings.nav.history, icon: <List strokeWidth={1.75} /> },
]

/** How the app is walked today (the home's list card), then the tab bar M2 will ship. */
export function NavigationSpecimen() {
  const [activeTab, setActiveTab] = useState<TabId>('home')

  return (
    <SpecimenSection title={strings.design.sections.navigation}>
      <Card padding="rows" className="py-1">
        <RowLink to="/stats">{strings.stats.open}</RowLink>
        <RowLink to="/calendar">{strings.calendar.open}</RowLink>
        <RowLink to="/history">{strings.history.open}</RowLink>
      </Card>
      <p className="text-muted text-label">{strings.design.tabBarLater}</p>
      <TabBar label={strings.nav.label} items={TABS} activeId={activeTab} onSelect={setActiveTab} />
    </SpecimenSection>
  )
}
