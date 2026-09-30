import type { FirstLaunchAnswers } from '../types/first-launch-answers'

/** First launch's screens in order: the quit moment, the weekly spend, the baseline, the protocol. */
export const FIRST_LAUNCH_STEPS = [1, 2, 3, 4] as const

/** First launch before any screen is answered. */
export const EMPTY_ANSWERS: FirstLaunchAnswers = {
  quitMoment: null,
  weeklySpendCents: null,
  baselineSmokesPerDay: null,
}
