import { Figure } from '@/shared/ui/Figure'
import { strings } from '@/shared/utils/strings'
import { COLOR_TOKENS, RADIUS_TOKENS, TYPE_TOKENS } from '../utils/specimen-data'
import { SpecimenSection } from './SpecimenSection'

const t = strings.design

/** Colour, type and radius tokens, shown with the value and the role they own. */
export function TokenReference() {
  return (
    <>
      <SpecimenSection title={t.sections.colors}>
        <ul className="flex flex-col divide-y divide-line">
          {COLOR_TOKENS.map((token) => (
            <li key={token.token} className="flex items-center gap-3 py-2.5">
              <span
                aria-hidden="true"
                className={`size-9 shrink-0 rounded-step border border-line ${token.swatch}`}
              />
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="font-medium text-body">{token.token}</span>
                <span className="text-muted text-label">{token.role}</span>
              </span>
              <span className="text-muted text-label">{token.value}</span>
            </li>
          ))}
        </ul>
      </SpecimenSection>

      <SpecimenSection title={t.sections.type}>
        <dl className="flex flex-col divide-y divide-line">
          {TYPE_TOKENS.map((token) => (
            <div key={token.token} className="flex flex-col gap-1.5 py-3.5">
              <dd className={`${token.className} truncate`}>
                {token.figure ? <Figure>{token.sample}</Figure> : token.sample}
              </dd>
              <dt className="flex items-baseline justify-between gap-3 text-muted text-label">
                <span>
                  <span className="font-medium text-ink">{token.token}</span> — {token.role}
                </span>
                <span className="shrink-0">{token.px}</span>
              </dt>
            </div>
          ))}
        </dl>
      </SpecimenSection>

      <SpecimenSection title={t.sections.radii}>
        <ul className="flex flex-col divide-y divide-line">
          {RADIUS_TOKENS.map((token) => (
            <li key={token.token} className="flex items-center gap-3 py-2.5">
              <span
                aria-hidden="true"
                className={`size-9 shrink-0 border border-ghost-line bg-ghost ${token.className}`}
              />
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="font-medium text-body">{token.token}</span>
                <span className="text-muted text-label">{token.role}</span>
              </span>
              <span className="text-muted text-label">{token.value}</span>
            </li>
          ))}
        </ul>
      </SpecimenSection>
    </>
  )
}
