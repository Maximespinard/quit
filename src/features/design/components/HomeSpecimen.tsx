import { Settings } from 'lucide-react'
import { BadgeCard } from '@/shared/ui/BadgeCard'
import { HeroHaze } from '@/shared/ui/HeroHaze'
import { MultiplierSteps } from '@/shared/ui/MultiplierSteps'
import { ProgressBar } from '@/shared/ui/ProgressBar'
import { StreakHero } from '@/shared/ui/StreakHero'
import { formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import {
  MULTIPLIER_STEPS,
  SPECIMEN_BADGE_TOTAL,
  SPECIMEN_BADGES,
  SPECIMEN_LEVEL,
  SPECIMEN_MULTIPLIER,
  SPECIMEN_PROTOCOL,
  SPECIMEN_STREAK,
} from '../utils/specimen-data'
import { SpecimenSection } from './SpecimenSection'

const MAX_MULTIPLIER = MULTIPLIER_STEPS[MULTIPLIER_STEPS.length - 1] ?? 1

/** The home screen as the specimen's first viewport: haze and hero, multiplier, level, badges. */
export function HomeSpecimen() {
  const { duration, multiplier } = SPECIMEN_STREAK
  const { stepNumber, doseMg } = SPECIMEN_PROTOCOL
  const { level, xpIntoLevel, xpForLevel } = SPECIMEN_LEVEL
  const unlockedCount = SPECIMEN_BADGES.filter((badge) => badge.unlocked).length

  return (
    <>
      {/* The home hero as it ships, the haze behind it. */}
      <div className="relative isolate">
        <HeroHaze />
        <StreakHero
          duration={duration}
          daysLabel={strings.streak.days(duration.days)}
          regionLabel={strings.streak.region}
          brand={strings.app.name}
          context={strings.protocol.context(stepNumber, formatDose(doseMg))}
          action={
            <button
              type="button"
              aria-label={strings.nav.settings}
              className="grid size-11 place-items-center rounded-full text-ink active:bg-ghost"
            >
              <Settings className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          }
        />
      </div>

      <div className="flex flex-col gap-5 px-safe pt-16">
        <SpecimenSection
          title={strings.multiplier.title(multiplier)}
          aside={
            multiplier >= MAX_MULTIPLIER
              ? strings.multiplier.capped
              : strings.multiplier.next(SPECIMEN_MULTIPLIER.daysToNext, multiplier + 1)
          }
        >
          <MultiplierSteps
            steps={MULTIPLIER_STEPS}
            current={multiplier}
            label={strings.multiplier.label}
          />
        </SpecimenSection>

        <SpecimenSection
          title={strings.level.title(level)}
          aside={strings.level.xp(xpIntoLevel, xpForLevel)}
        >
          <ProgressBar label={strings.level.label(level)} value={xpIntoLevel} max={xpForLevel} />
        </SpecimenSection>

        <SpecimenSection
          title={strings.badges.title}
          aside={strings.badges.count(unlockedCount, SPECIMEN_BADGE_TOTAL)}
        >
          <ul className="grid grid-cols-3 gap-2">
            {SPECIMEN_BADGES.map((badge) => (
              <li key={badge.id}>
                <BadgeCard
                  name={badge.name}
                  detail={badge.detail}
                  unlocked={badge.unlocked}
                  lockedLabel={strings.badges.locked}
                />
              </li>
            ))}
          </ul>
        </SpecimenSection>
      </div>
    </>
  )
}
