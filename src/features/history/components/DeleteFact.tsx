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
import { strings } from '@/shared/utils/strings'
import type { HistoryFact } from '../utils/history-days'

type DeleteFactProps = {
  fact: HistoryFact
  onDelete: () => void
}

const copy = strings.history

/**
 * Deletes the fact being edited; every derived figure follows on the next render. A lapse
 * asks first: the guard is against a mis-tap, not against the user.
 */
export function DeleteFact({ fact, onDelete }: DeleteFactProps) {
  if (fact.type !== 'lapse') {
    return (
      <Button variant="destructive" size="lg" onClick={onDelete}>
        {copy.delete}
      </Button>
    )
  }
  const dialog = copy.confirmLapseDelete
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" size="lg" />}>
        {copy.delete}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialog.title}</DialogTitle>
          <DialogDescription>{dialog.body}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" size="lg" />}>{dialog.cancel}</DialogClose>
          <Button variant="destructive" size="lg" onClick={onDelete}>
            {dialog.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
