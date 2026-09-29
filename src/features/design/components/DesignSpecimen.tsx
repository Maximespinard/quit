import { CalendarDays, ChartNoAxesColumn, House, List } from 'lucide-react'
import { useState } from 'react'
import { CravingButton } from '@/shared/ui/CravingButton'
import { TabBar, type TabItem } from '@/shared/ui/TabBar'
import { strings } from '@/shared/utils/strings'
import { ControlsSpecimen } from './ControlsSpecimen'
import { FieldsSpecimen } from './FieldsSpecimen'
import { HomeSpecimen } from './HomeSpecimen'
import { TokenReference } from './TokenReference'

type TabId = 'home' | 'calendar' | 'progress' | 'history'

const TABS: readonly TabItem<TabId>[] = [
  { id: 'home', label: strings.nav.home, icon: <House strokeWidth={1.75} /> },
  { id: 'calendar', label: strings.nav.calendar, icon: <CalendarDays strokeWidth={1.75} /> },
  { id: 'progress', label: strings.nav.progress, icon: <ChartNoAxesColumn strokeWidth={1.75} /> },
  { id: 'history', label: strings.nav.history, icon: <List strokeWidth={1.75} /> },
]

/** Hidden route /design: the home screen as first viewport, then every reusable piece. */
export function DesignSpecimen() {
  const [activeTab, setActiveTab] = useState<TabId>('home')

  return (
    <>
      <div className="mx-auto flex max-w-md flex-col pb-44">
        <HomeSpecimen />
        <div className="flex flex-col gap-8 px-safe pt-10">
          {/* The fixed Envie pill may cover scrolling content, never this disclosure. */}
          <p className="max-w-[64%] text-muted text-label">{strings.design.synthetic}</p>
          <ControlsSpecimen />
          <FieldsSpecimen />
          <TokenReference />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0">
        <div className="mx-auto flex max-w-md justify-end px-safe pb-4">
          <CravingButton label={strings.craving.launch} />
        </div>
        <TabBar
          label={strings.nav.label}
          items={TABS}
          activeId={activeTab}
          onSelect={setActiveTab}
        />
      </div>
    </>
  )
}
