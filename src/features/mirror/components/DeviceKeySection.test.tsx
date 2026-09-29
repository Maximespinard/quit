import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MirrorControls, MirrorState } from '@/shared/hooks/useDeviceMirroring'
import { strings } from '@/shared/utils/strings'
import { DeviceKeySection } from './DeviceKeySection'

const copy = strings.mirror

const mirrorIn = (state: MirrorState): MirrorControls => ({
  state,
  link: vi.fn().mockResolvedValue(undefined),
})

describe('DeviceKeySection', () => {
  it('links the phone with the key pasted', async () => {
    const mirror = mirrorIn('unlinked')
    render(<DeviceKeySection mirror={mirror} />)

    await userEvent.type(screen.getByLabelText(copy.keyLabel), '  k3y-from-the-server ')
    await userEvent.click(screen.getByRole('button', { name: copy.link }))

    expect(mirror.link).toHaveBeenCalledWith('  k3y-from-the-server ')
  })

  it('asks for a key before linking with nothing', async () => {
    const mirror = mirrorIn('unlinked')
    render(<DeviceKeySection mirror={mirror} />)

    await userEvent.click(screen.getByRole('button', { name: copy.link }))

    expect(screen.getByRole('alert')).toHaveTextContent(copy.empty)
    expect(screen.getByLabelText(copy.keyLabel)).toHaveAttribute('aria-invalid', 'true')
    expect(mirror.link).not.toHaveBeenCalled()
  })

  it('says a linked phone is linked, with no field left', () => {
    render(<DeviceKeySection mirror={mirrorIn('linked')} />)

    expect(screen.getByRole('status')).toHaveTextContent(copy.linked)
    expect(screen.queryByLabelText(copy.keyLabel)).not.toBeInTheDocument()
  })

  it('says a revoked key is revoked, and takes the new one', async () => {
    const mirror = mirrorIn('revoked')
    render(<DeviceKeySection mirror={mirror} />)

    expect(screen.getByRole('alert')).toHaveTextContent(copy.revoked)
    await userEvent.type(screen.getByLabelText(copy.keyLabel), 'n3w-key')
    await userEvent.click(screen.getByRole('button', { name: copy.link }))

    expect(mirror.link).toHaveBeenCalledWith('n3w-key')
  })

  it('shows nothing while the link loads', () => {
    const { container } = render(<DeviceKeySection mirror={mirrorIn('loading')} />)

    expect(container).toBeEmptyDOMElement()
  })
})
