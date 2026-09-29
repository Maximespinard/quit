import { useState } from 'react'
import { Button } from '@/shared/ui/base/button'
import { Slider } from '@/shared/ui/base/slider'
import { Switch } from '@/shared/ui/base/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/base/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/base/toggle-group'
import { strings } from '@/shared/utils/strings'
import { SPECIMEN_SWITCHES } from '../utils/specimen-data'
import { OverlaysSpecimen } from './OverlaysSpecimen'
import { SpecimenSection } from './SpecimenSection'

const t = strings.design

/** Every shadcn primitive the app ships, reskinned, in each of its states, with real copy. */
export function ControlsSpecimen() {
  const [intensity, setIntensity] = useState<string[]>(['2'])
  const [chip, setChip] = useState<string[]>([t.chips[1]])

  return (
    <SpecimenSection title={t.sections.controls}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          <Button>{t.buttons.primary}</Button>
          <Button variant="secondary">{t.buttons.secondary}</Button>
          <Button variant="ghost">{t.buttons.ghost}</Button>
          <Button variant="destructive">{t.buttons.destructive}</Button>
          <Button disabled>{t.buttons.disabled}</Button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-label text-muted">{t.chipsLabel}</span>
          <ToggleGroup
            aria-label={t.chipsLabel}
            value={chip}
            onValueChange={setChip}
            className="flex-wrap"
          >
            {t.chips.map((site) => (
              <ToggleGroupItem key={site} value={site}>
                {site}
              </ToggleGroupItem>
            ))}
            <ToggleGroupItem value={t.chipPrevious} disabled>
              {t.chipPrevious}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-col divide-y divide-line">
          {SPECIMEN_SWITCHES.map((row) => (
            <div
              key={row.label}
              className="flex min-h-12 items-center justify-between gap-4 py-1 text-body"
            >
              <span aria-hidden="true">{row.label}</span>
              <Switch aria-label={row.label} defaultChecked={row.checked} disabled={row.disabled} />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-label text-muted">{t.segmentedLabel}</span>
          <ToggleGroup
            aria-label={t.segmentedLabel}
            variant="outline"
            spacing={0}
            value={intensity}
            onValueChange={(value) => {
              if (value.length > 0) setIntensity(value)
            }}
            className="w-full"
          >
            {t.segments.map((segment) => (
              <ToggleGroupItem key={segment} value={segment} aria-label={`${segment} / 3`}>
                {segment}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-label text-muted">{t.sliderLabel}</span>
          <Slider aria-label={t.sliderLabel} defaultValue={[3]} min={1} max={5} step={1} />
        </div>

        <Tabs defaultValue={t.tabs[0]}>
          <TabsList aria-label={t.tabsLabel}>
            {t.tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          {t.tabs.map((tab) => (
            <TabsContent key={tab} value={tab} className="text-body text-muted">
              {t.tabsEmpty}
            </TabsContent>
          ))}
        </Tabs>

        <Tabs defaultValue={t.tabsLine[0]}>
          <TabsList variant="line" aria-label={t.tabsLineLabel}>
            {t.tabsLine.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <OverlaysSpecimen />
      </div>
    </SpecimenSection>
  )
}
