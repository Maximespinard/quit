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
import { strings } from '@/shared/utils/strings'

const t = strings.design

/** The drawer and the dialog, each behind the secondary button that opens it. */
export function OverlaysSpecimen() {
  return (
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
            <DialogClose render={<Button variant="destructive" />}>{t.dialog.confirm}</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
