import { useState } from 'react'
import { Button } from '@/shared/ui/base/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/base/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/base/drawer'
import { Slider } from '@/shared/ui/base/slider'
import { Switch } from '@/shared/ui/base/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/base/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/base/toggle-group'
import { strings } from '@/shared/utils/strings'
import { SpecimenSection } from './SpecimenSection'

const t = strings.design

/** Every shadcn primitive the app ships, reskinned, with its real copy. */
export function ControlsSpecimen() {
  const [intensity, setIntensity] = useState<string[]>(['2'])

  return (
    <SpecimenSection title={t.sections.controls}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          <Button>{t.buttons.primary}</Button>
          <Button variant="secondary">{t.buttons.secondary}</Button>
          <Button variant="outline">{t.buttons.outline}</Button>
          <Button variant="ghost">{t.buttons.ghost}</Button>
          <Button variant="destructive">{t.buttons.destructive}</Button>
          <Button disabled>{t.buttons.disabled}</Button>
        </div>

        <div className="flex min-h-11 items-center justify-between gap-4 text-body">
          <span id="specimen-switch-label">{t.switchLabel}</span>
          <Switch defaultChecked aria-labelledby="specimen-switch-label" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-ink-soft text-label">{t.segmentedLabel}</span>
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
          <span className="text-ink-soft text-label">{t.sliderLabel}</span>
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
            <TabsContent key={tab} value={tab} className="text-body text-ink-soft">
              {t.tabsEmpty}
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex flex-col gap-2">
          <Drawer showSwipeHandle>
            <DrawerTrigger render={<Button variant="secondary" />}>{t.drawer.open}</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{t.drawer.title}</DrawerTitle>
                <DrawerDescription>{t.drawer.body}</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose render={<Button size="lg" />}>{t.drawer.confirm}</DrawerClose>
                <DrawerClose render={<Button variant="ghost" size="lg" />}>
                  {t.drawer.cancel}
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <Dialog>
            <DialogTrigger render={<Button variant="secondary" />}>{t.dialog.open}</DialogTrigger>
            <DialogContent closeLabel={t.dialog.close}>
              <DialogHeader>
                <DialogTitle>{t.dialog.title}</DialogTitle>
                <DialogDescription>{t.dialog.body}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="ghost" />}>{t.dialog.cancel}</DialogClose>
                <DialogClose render={<Button variant="destructive" />}>
                  {t.dialog.confirm}
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SpecimenSection>
  )
}
