# Quit

A personal tracker for one person's smoke-free journey under a self-managed nicotine patch taper.

## Language

**Quit moment**:
The exact timestamp at which the user stopped smoking. Every elapsed-time figure derives from it.
_Avoid_: Quit date, start date, day zero

**Lapse**:
Any smoke inhaled after the quit moment, recorded as one episode with its timestamp and its number of cigarettes (one by default). There is no threshold: one puff is a lapse. Every lapse is a slip or part of a relapse.
_Avoid_: Failure, reset, incident

**Slip**:
A lapse that is not part of a relapse. It costs its smoke-free day and its cigarettes, nothing else: the streak, the streak multiplier and the level stay. French copy: « écart ».
_Avoid_: Cheat, exception, mistake

**Relapse**:
The state reached when three consecutive calendar days each contain a lapse. It is derived, never declared, and a backdated lapse can create one after the fact. It restarts the streak from the latest lapse of the run (again while the run goes on; a day without a lapse breaks it), resets the streak multiplier and drops the level one threshold. Badges, smoke-free days and the protocol stay. French copy: « rechute ».
_Avoid_: Failure, reset, back to zero

**Streak**:
The time elapsed since the latest relapse, or since the quit moment if there is none. A slip does not restart it. Every time-based mechanic (streak multiplier, time badges, personal best) keys on it.
_Avoid_: Counter, run, clean time

**Last cigarette**:
The time elapsed since the latest lapse. Shown after a slip; it drives nothing.
_Avoid_: Clean time, since lapse

**Smoke-free day**:
A calendar day after the quit moment containing no lapse. Their total never resets.
_Avoid_: Clean day, totalClean

**Craving**:
An urge to smoke that the user chose to log, with an intensity from 1 to 3. A craving is not a lapse.
_Avoid_: Urge, trigger

**Tag**:
An optional label describing the situation in which a craving arose, picked from a default set or typed by the user.
A default tag is stored by its id (`coffee`), a typed one by its words; two tags differing only by case or spacing are the same tag.
_Avoid_: Trigger, category, context

**Check-in**:
The user's once-a-day recorded mood, from 1 to 5.
_Avoid_: Journal entry, daily log

**XP**:
Points earned from real recorded facts: smoke-free time, cravings overcome, patch applications, check-ins and badges. XP is never spent.
_Avoid_: Points, score, coins

**Streak multiplier**:
A factor applied to every XP gain that grows with the streak up to a cap. A relapse resets it to its starting value; a slip does not.
_Avoid_: Bonus, combo

**Level**:
The rank reached from accumulated XP. A relapse drops the user to the entry threshold of the previous level; a slip does not.
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
One step of the protocol: a patch dose in mg and a duration in protocol days, both user-editable.
_Avoid_: Phase, stage, level

**Protocol day**:
One of the successive 24 h blocks that start at the quit moment; the protocol and its steps are counted in them. Unlike a smoke-free day, it is not a calendar day, and it does not set when a patch application is expected.
_Avoid_: Patch day, cycle, today

**Patch application**:
The recorded fact that a patch was put on, at a given time and dose, optionally with its application site.
One patch application is expected per local calendar day of the protocol. The quit day and the end day, when the last patch comes off, ask for none, but one put on during either still counts.
_Avoid_: Patch log, dose taken

**Application site**:
The body area where a patch is put on. Two consecutive patch applications never share the same site.
_Avoid_: Location, spot, zone

**Fact**:
Something the user recorded as having happened: the quit moment, a patch application, a craving, a lapse, a check-in. Everything else the app shows is derived from facts. A corrected fact stays the same fact.
_Avoid_: Event, entry, record

**Journal**:
The whole set of facts recorded by one person, plus the settings that shape what is derived from them: the protocol, the weekly spend, the baseline smokes per day, the goal and the reminder preferences. It is the only thing exported, imported and mirrored; on the device, beside the backup record and the pending changes, it is the only thing stored.
_Avoid_: History, database, log, diary

**Backup record**:
What the device keeps about its own exports: when the journal was last exported (or imported). It is neither a fact nor a setting, belongs to the device rather than the journey, and is never exported or mirrored. The sandbox keeps its own, in memory.
_Avoid_: Backup history, export log, sync state

**Mirror**:
The server's copy of the journal, brought up to date with every change the device records. The device's journal stays the reference: the mirror follows it and is read back only by a restore. Only the real journal is mirrored, never the sandbox nor demo mode.
_Avoid_: Backup, cloud, replica, remote copy, sync

**Pending change**:
A change recorded in the device's journal that the mirror has not received yet. It waits on the device and leaves as soon as the server can be reached.
_Avoid_: Outbox item, queue, unsynced change

**Restore**:
Replacing the device's journal with the mirror's content, after confirmation when the device's journal already holds facts.
_Avoid_: Sync, download, import (an import reads a file)

**Device key**:
The secret that lets a device keep the mirror and receive push reminders. Only one exists at a time: issuing a new one revokes the previous.
_Avoid_: Password, token, account, API key, login

**Scenario**:
A named journal paired with a value of the current time, describing one precise situation of the app. The same scenarios are reused by the tests, by the debug panel and by demo mode.
_Avoid_: Preset, seed, fixture, mock

**Personal best**:
The longest streak ever held. It is shown only once a relapse exists.
_Avoid_: Record, best streak, high score

**Goal**:
The one thing the user is saving towards: a label and a price, against which money saved is shown as progress. Once reached and celebrated it stays reached, and the goal that replaces it counts money saved from zero; replacing a goal not yet reached keeps what was already saved towards it.
_Avoid_: Objective, target, reward, wish
