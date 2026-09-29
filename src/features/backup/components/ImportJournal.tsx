import { type ChangeEvent, useId, useRef, useState } from 'react'
import { backedUpAt } from '@/shared/domain/backup-reminder'
import type { Journal } from '@/shared/domain/journal'
import { type ImportRefusal, importJournal } from '@/shared/domain/journal-file'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { Button } from '@/shared/ui/base/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/base/dialog'
import { newFactId } from '@/shared/utils/fact-id'
import { formatDate } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'

type ImportJournalProps = {
  /** The journal in place: replacing one that holds facts asks first. */
  journal: Journal
  /** The button's words: import from settings, restore from first launch. */
  label: string
  variant?: 'secondary' | 'ghost'
  className?: string
  /** Commits the imported journal; the backup record is already updated. */
  onImported: (journal: Journal) => void
}

type ImportState =
  | { readonly step: 'idle' }
  | { readonly step: 'refused'; readonly reason: ImportRefusal }
  | { readonly step: 'confirming'; readonly journal: Journal; readonly exportedAt: number }
  /** Once confirmed: a second tap must not replace the journal twice. */
  | { readonly step: 'replacing' }

const copy = strings.backup

/**
 * Reads a picked export file, all or nothing: a refused file leaves the journal untouched
 * and says why. A journal that holds facts is only replaced after a confirmation.
 */
export function ImportJournal({
  journal,
  label,
  variant = 'secondary',
  className,
  onImported,
}: ImportJournalProps) {
  const { now, backup, sandbox } = useJournalSource()
  const input = useRef<HTMLInputElement>(null)
  const errorId = useId()
  const [state, setState] = useState<ImportState>({ step: 'idle' })

  const replace = async (imported: Journal) => {
    setState({ step: 'replacing' })
    // The journal now matches a file the user holds: that file is a backup.
    await backup.save(backedUpAt(now))
    onImported(imported)
  }

  const read = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Cleared at once, so picking the same file again still reads it.
    event.target.value = ''
    if (file === undefined) return
    const text = await file.text().catch(() => '')
    const result = importJournal(text, sandbox === null ? 'device' : 'sandbox', newFactId)
    if (!result.ok) setState({ step: 'refused', reason: result.reason })
    else if (journal.facts.length === 0) await replace(result.journal)
    else setState({ step: 'confirming', journal: result.journal, exportedAt: result.exportedAt })
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={input}
        type="file"
        accept=".json,application/json"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
        onChange={(event) => void read(event)}
      />
      <Button
        variant={variant}
        size="lg"
        className={className}
        aria-describedby={state.step === 'refused' ? errorId : undefined}
        onClick={() => {
          setState({ step: 'idle' })
          input.current?.click()
        }}
      >
        {label}
      </Button>
      {state.step === 'refused' ? (
        <p id={errorId} role="alert" className="text-alert text-label">
          {copy.refusal[state.reason]} {copy.untouched}
        </p>
      ) : null}

      <Dialog
        open={state.step === 'confirming'}
        onOpenChange={(open) => {
          if (!open) setState({ step: 'idle' })
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {sandbox === null ? copy.confirm.title : copy.confirm.sandboxTitle}
            </DialogTitle>
            <DialogDescription>
              {state.step === 'confirming' ? copy.confirm.body(formatDate(state.exportedAt)) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" size="lg" />}>
              {copy.confirm.cancel}
            </DialogClose>
            <Button
              variant="destructive"
              size="lg"
              disabled={state.step !== 'confirming'}
              onClick={() => {
                if (state.step === 'confirming') void replace(state.journal)
              }}
            >
              {copy.confirm.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
