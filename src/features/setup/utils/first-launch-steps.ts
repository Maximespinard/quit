/** First launch's screens in order: the quit moment, the weekly spend, the baseline, the protocol. */
export const FIRST_LAUNCH_STEPS = [1, 2, 3, 4] as const

/** What first launch has gathered so far: each answer `null` until its screen is done. */
export type FirstLaunchAnswers = {
  quitMoment: number | null
  weeklySpendCents: number | null
  baselineSmokesPerDay: number | null
}

export const NO_ANSWERS: FirstLaunchAnswers = {
  quitMoment: null,
  weeklySpendCents: null,
  baselineSmokesPerDay: null,
}
