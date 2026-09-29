import { type SubmitEvent, useId, useState } from 'react'
import type { MirrorControls } from '@/shared/hooks/useDeviceMirroring'
import { Button } from '@/shared/ui/base/button'
import { Input } from '@/shared/ui/base/input'
import { Card } from '@/shared/ui/Card'
import { strings } from '@/shared/utils/strings'

type DeviceKeySectionProps = {
  /** The real journal's mirror: the sandbox has none, and shows no section. */
  mirror: MirrorControls
}

const copy = strings.mirror

/**
 * Settings' link to the mirror: the device key is pasted once. Linked, the section says so;
 * once the server refuses the key, it says that and asks for the new one, pending changes kept.
 */
export function DeviceKeySection({ mirror }: DeviceKeySectionProps) {
  const inputId = useId()
  const errorId = useId()
  const [pasted, setPasted] = useState('')
  const [empty, setEmpty] = useState(false)
  const [linking, setLinking] = useState(false)
  const [failed, setFailed] = useState(false)

  // Nothing while the link loads: never a false "not linked".
  if (mirror.state === 'loading') return null

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pasted.trim() === '') {
      setEmpty(true)
      return
    }
    setLinking(true)
    setFailed(false)
    try {
      await mirror.link(pasted)
      setPasted('')
    } catch {
      // The key stays in the field: one more tap tries again.
      setFailed(true)
    }
    setLinking(false)
  }

  return (
    <Card label={copy.title} className="gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-body">{copy.title}</h3>
        {mirror.state === 'linked' ? (
          <p role="status" className="text-body text-muted">
            {copy.linked}
          </p>
        ) : mirror.state === 'revoked' ? (
          <>
            <p role="alert" className="text-alert text-body">
              {copy.revoked}
            </p>
            <p className="text-body text-muted">{copy.revokedLead}</p>
          </>
        ) : (
          <p className="text-body text-muted">{copy.lead}</p>
        )}
      </div>
      {mirror.state === 'linked' ? null : (
        <form className="flex flex-col gap-3" noValidate onSubmit={(event) => void submit(event)}>
          <label htmlFor={inputId} className="text-label">
            {copy.keyLabel}
          </label>
          <Input
            id={inputId}
            value={pasted}
            onChange={(event) => {
              setPasted(event.target.value)
              setEmpty(false)
            }}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={empty}
            aria-describedby={empty ? errorId : undefined}
          />
          {empty || failed ? (
            <p id={errorId} role="alert" className="text-alert text-label">
              {empty ? copy.empty : copy.linkFailed}
            </p>
          ) : null}
          <Button type="submit" variant="secondary" size="lg" disabled={linking}>
            {linking ? copy.linking : copy.link}
          </Button>
        </form>
      )}
    </Card>
  )
}
