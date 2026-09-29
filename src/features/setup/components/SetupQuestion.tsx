import { type ReactNode, useId } from 'react'

type SetupQuestionProps = {
  title: string
  lead: string
  /** What the question takes in: a field, a list to accept. */
  children?: ReactNode
  /** The way forward, held down in the thumb zone whatever the answer's height. */
  action: ReactNode
}

/** One first-launch question: asked up top on its own, answered at the bottom of the screen. */
export function SetupQuestion({ title, lead, children, action }: SetupQuestionProps) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="flex flex-1 flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 id={titleId} className="text-balance text-headline">
          {title}
        </h2>
        {/* Ink, not muted: over the full haze only ink holds 4.5:1 at the glow's brightest pixel. */}
        <p className="text-body text-ink">{lead}</p>
      </div>
      {children}
      <div className="mt-auto flex flex-col gap-3">{action}</div>
    </section>
  )
}
