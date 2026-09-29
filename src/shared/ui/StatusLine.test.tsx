import { render, screen } from '@testing-library/react'
import { StatusLine } from './StatusLine'

it('is in the DOM before its message arrives, so the message is announced as a change', () => {
  const container = document.body.appendChild(document.createElement('div'))
  const observer = new MutationObserver(() => {})
  observer.observe(container, { childList: true, subtree: true, characterData: true })

  render(<StatusLine message="Envie notée." />, { container })
  const records = observer.takeRecords()
  observer.disconnect()

  const status = screen.getByRole('status')
  expect(status).toHaveTextContent('Envie notée.')
  // Mounted holding its text, the region would only show up as an insertion into its parent.
  expect(records.some((record) => record.target === status && record.addedNodes.length > 0)).toBe(
    true,
  )
})

it('stays mounted and empty when there is nothing to say', () => {
  render(<StatusLine message={null} />)

  expect(screen.getByRole('status')).toBeEmptyDOMElement()
})

it('clears when its message goes, and says the next one in the same region', () => {
  const { rerender } = render(<StatusLine message="Envie notée." />)
  const status = screen.getByRole('status')

  rerender(<StatusLine message={null} />)
  expect(status).toBeEmptyDOMElement()

  rerender(<StatusLine message="C’est noté." />)
  expect(screen.getByRole('status')).toBe(status)
  expect(status).toHaveTextContent('C’est noté.')
})
