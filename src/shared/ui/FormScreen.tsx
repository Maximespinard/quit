import type { ReactNode } from 'react'

type FormScreenProps = {
  title: string
  lead: string
  /** The form, a full-height column (`flex-1 flex-col`): its fields, then its `ThumbZone`. */
  children: ReactNode
}

/** A form screen: what it records named up top, the form filling the rest of the screen. */
export function FormScreen({ title, lead, children }: FormScreenProps) {
  return (
    <section className="flex flex-1 flex-col gap-6 pt-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{title}</h2>
        <p className="text-body text-muted">{lead}</p>
      </div>
      {children}
    </section>
  )
}
