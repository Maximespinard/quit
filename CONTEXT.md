# Quit

A personal tracker for one person's smoke-free journey under a self-managed nicotine patch taper.

## Language

**Quit moment**:
The exact timestamp at which the user stopped smoking. Every elapsed-time figure derives from it.
_Avoid_: Quit date, start date, day zero

**Lapse**:
Any smoke inhaled after the quit moment, recorded with its timestamp. There is no threshold: one puff is a lapse.
_Avoid_: Relapse, slip, failure, reset

**Streak**:
The time elapsed since the latest lapse, or since the quit moment if there is none.
_Avoid_: Counter, run, clean time

**Smoke-free day**:
A calendar day after the quit moment containing no lapse. Their total never resets.
_Avoid_: Clean day, totalClean

**Craving**:
An urge to smoke that the user chose to log, with an intensity from 1 to 3. A craving is not a lapse.
_Avoid_: Urge, trigger

**Tag**:
An optional label describing the situation in which a craving arose, picked from a default set or typed by the user.
_Avoid_: Trigger, category, context

**Check-in**:
The user's once-a-day recorded mood, from 1 to 5.
_Avoid_: Journal entry, daily log

**XP**:
Points earned from real recorded facts: smoke-free time, cravings overcome, patch applications, check-ins and badges. XP is never spent.
_Avoid_: Points, score, coins

**Streak multiplier**:
A factor applied to every XP gain that grows with the streak up to a cap. A lapse resets it to its starting value.
_Avoid_: Bonus, combo

**Level**:
The rank reached from accumulated XP. A lapse drops the user to the entry threshold of the previous level.
_Avoid_: Rank, tier, grade

**Badge**:
A permanent award unlocked by a real fact: elapsed smoke-free time with its health milestone, cravings overcome, protocol progress, money saved or cigarettes not smoked. A lapse never removes a badge.
_Avoid_: Achievement, trophy, milestone

**Encouragement**:
A hand-written message citing one of the user's real figures, shown or pushed at most once a day.
_Avoid_: Notification, quote, tip

**Demo mode**:
A read-only state in which the app shows a fictional journey instead of the user's data, without ever reading or writing the real data. Nothing can be recorded in it.
_Avoid_: Fake mode, sandbox

**Sandbox**:
A throwaway journal, empty at the start, paired with a clock that can be moved at will. Facts can be recorded in it and time moved to see any state; the real journal is never read or written, and the sandbox is gone on reload.
_Avoid_: Sandbox journal, test mode, playground, debug mode

**Protocol**:
The user-defined ordered list of steps describing the patch taper. A lapse never alters it.
_Avoid_: Plan, schedule, program

**Step**:
One stage of the protocol: a patch dose in mg and a duration in days, both user-editable.
_Avoid_: Phase, stage, level

**Patch application**:
The recorded fact that a patch was put on, at a given time and dose, optionally with its application site.
_Avoid_: Patch log, dose taken

**Application site**:
The body area where a patch is put on. Two consecutive patch applications never share the same site.
_Avoid_: Location, spot, zone

**Fact**:
Something the user recorded as having happened: the quit moment, a patch application, a craving, a lapse, a check-in. Everything else the app shows is derived from facts.
_Avoid_: Event, entry, record

**Journal**:
The whole set of facts recorded by one person, plus the settings that shape what is derived from them: the protocol, the weekly spend, the baseline smokes per day, the goal and the reminder preferences. It is the only thing stored, and the only thing exported and imported.
_Avoid_: History, database, log, diary

**Scenario**:
A named journal paired with a value of the current time, describing one precise situation of the app. The same scenarios are reused by the tests, by the debug panel and by demo mode.
_Avoid_: Preset, seed, fixture, mock

**Personal best**:
The longest streak ever held. It is shown only once a lapse exists.
_Avoid_: Record, best streak, high score

**Goal**:
The one thing the user is saving towards: a label and a price, against which money saved is shown as progress.
_Avoid_: Objective, target, reward, wish
