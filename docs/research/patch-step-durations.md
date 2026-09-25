# Default step durations from official 24 h nicotine patch notices

Ticket: SYR-31. Retrieved 2026-09-25.

This document reports what the official French notices and RCPs (summaries of product
characteristics) of 24 h nicotine patches say. It is not medical advice. The app's protocol
stays fully editable by the user.

## Sources

All four are official records in the French public medicines database. Each page holds both
the RCP (§4.2 "Posologie et mode d'administration") and the notice (§3 "Comment utiliser").
The pages display "Dernière mise à jour le 31/08/2026". The legacy
`affichageDoc.php?specid=…` links redirect to these URLs.

| Id | Product | URL |
|----|---------|-----|
| A | Nicopatchlib 21 mg/24 h | https://base-donnees-publique.medicaments.gouv.fr/medicament/62155071/extrait |
| B | Niquitin 21 mg/24 h | https://base-donnees-publique.medicaments.gouv.fr/medicament/61056501/extrait |
| C | Nicotinell TTS 21 mg/24 h | https://base-donnees-publique.medicaments.gouv.fr/medicament/62267070/extrait |
| D | Nicotine EG 21 mg/24 h (generic) | https://base-donnees-publique.medicaments.gouv.fr/medicament/67906013/extrait |

Every brand found uses the 21 / 14 / 7 mg/24 h strengths.

## Patch alone: standard schedule

All four notices use the same three-phase table. Its header reads, verbatim: "Phase initiale
3 à 4 semaines | Suivi de traitement 3 à 4 semaines | Sevrage thérapeutique 3 à 4 semaines"
(B names the last phase "Sevrage tabagique").

For 20 cigarettes a day or more ("20 cigarettes ou plus par jour"):

| Brand | Step | Dose | Duration | Source |
|-------|------|------|----------|--------|
| Nicopatchlib | Phase initiale | 21 mg | 3–4 weeks | [A](https://base-donnees-publique.medicaments.gouv.fr/medicament/62155071/extrait) |
| Nicopatchlib | Suivi de traitement | 14 mg, or stay on 21 mg | 3–4 weeks | [A](https://base-donnees-publique.medicaments.gouv.fr/medicament/62155071/extrait) |
| Nicopatchlib | Sevrage thérapeutique | 7 mg, or 14 mg then 7 mg | 3–4 weeks | [A](https://base-donnees-publique.medicaments.gouv.fr/medicament/62155071/extrait) |
| Niquitin | Phase initiale | 21 mg | 3–4 weeks | [B](https://base-donnees-publique.medicaments.gouv.fr/medicament/61056501/extrait) |
| Niquitin | Suivi de traitement | 14 mg, or stay on 21 mg | 3–4 weeks | [B](https://base-donnees-publique.medicaments.gouv.fr/medicament/61056501/extrait) |
| Niquitin | Sevrage tabagique | 7 mg, or 14 mg then 7 mg | 3–4 weeks | [B](https://base-donnees-publique.medicaments.gouv.fr/medicament/61056501/extrait) |
| Nicotinell TTS | Phase initiale | 21 mg | 3–4 weeks | [C](https://base-donnees-publique.medicaments.gouv.fr/medicament/62267070/extrait) |
| Nicotinell TTS | Suivi de traitement | 14 mg, or stay on 21 mg | 3–4 weeks | [C](https://base-donnees-publique.medicaments.gouv.fr/medicament/62267070/extrait) |
| Nicotinell TTS | Sevrage thérapeutique | 7 mg, or 14 mg then 7 mg | 3–4 weeks | [C](https://base-donnees-publique.medicaments.gouv.fr/medicament/62267070/extrait) |
| Nicotine EG | Phase initiale | 21 mg | 3–4 weeks | [D](https://base-donnees-publique.medicaments.gouv.fr/medicament/67906013/extrait) |
| Nicotine EG | Suivi de traitement | 14 mg, or stay on 21 mg | 3–4 weeks | [D](https://base-donnees-publique.medicaments.gouv.fr/medicament/67906013/extrait) |
| Nicotine EG | Sevrage thérapeutique | 7 mg, or 14 mg then 7 mg | 3–4 weeks | [D](https://base-donnees-publique.medicaments.gouv.fr/medicament/67906013/extrait) |

C's row, verbatim: "NICOTINELL TTS 21 mg/24 h | NICOTINELL TTS 14 mg/24 h * ou NICOTINELL
TTS 21 mg/24 h* | NICOTINELL TTS 7 mg/24 h ou NICOTINELL TTS 14 mg/24 h puis NICOTINELL TTS
7 mg/24 h*".

Dose changes between phases follow withdrawal symptoms. A and D: "augmentation de la dose ou
maintien de la plus forte dose si l'abstinence tabagique n'est pas complète ou si des
symptômes de sevrage sont observés, diminution en cas de suspicion de surdosage ou de
résultats satisfaisants." B and C give the same sentence without "maintien" and without
"ou de résultats satisfaisants".

## Patch alone: lighter-smoker variant

For fewer than 20 cigarettes a day ("moins de 20 cigarettes par jour"), the same three phases
of 3–4 weeks start one strength lower:

| Brand | Phase initiale | Suivi de traitement | Sevrage | Source |
|-------|----------------|---------------------|---------|--------|
| Nicopatchlib | 14 mg (or up to 21 mg) | 7 mg (or 14 mg) | stop (or 7 mg) | [A](https://base-donnees-publique.medicaments.gouv.fr/medicament/62155071/extrait) |
| Niquitin | 14 mg (or up to 21 mg) | 14 mg (or 7 mg) | 7 mg (or stop) | [B](https://base-donnees-publique.medicaments.gouv.fr/medicament/61056501/extrait) |
| Nicotinell TTS | 14 mg (or up to 21 mg) | 14 mg (or 7 mg) | 7 mg (or stop) | [C](https://base-donnees-publique.medicaments.gouv.fr/medicament/62267070/extrait) |
| Nicotine EG | 14 mg (or up to 21 mg) | 7 mg (or 14 mg) | stop (or 7 mg) | [D](https://base-donnees-publique.medicaments.gouv.fr/medicament/67906013/extrait) |

The step to stop early is marked "en cas de résultats satisfaisants" (A).

## Other schedules in the same notices

- **Patch combined with an oral nicotine form**, under medical supervision or advice. A: "Premières
  6-12 semaines — Un patch 21 mg/24 h", then "14 mg/24 h pendant 3 à 6 semaines, puis 7 mg/24 h
  pendant 3 à 6 semaines". B: "Cette dose complète devra être utilisée pendant 6 à 12 semaines",
  then the same 3–6 weeks at 14 mg and 7 mg. C: "Premières 6-12 semaines", then "3 à 6 premières
  semaines" at 14 mg and "3 à 6 semaines suivantes" at 7 mg. D matches A.
- **Niquitin "arrêt progressif"** (B only), where smoking continues at first. Its table has four
  phases, "Préparation à l'arrêt", "Phase initiale", "Suivi de traitement" and "Sevrage
  thérapeutique", lasting 2, 6, 2 and 2 weeks, at 21 / 21 / 14 / 7 mg for 20 cigarettes a day
  or more.

## Maximum total duration

| Brand | Patch alone | With oral forms | Source |
|-------|-------------|-----------------|--------|
| Nicopatchlib | "environ 3 mois"; "ne pas utiliser ce médicament au-delà de 6 mois sans avis médical" (RCP); "La durée du traitement est limitée à 6 mois" (notice) | 12 months | [A](https://base-donnees-publique.medicaments.gouv.fr/medicament/62155071/extrait) |
| Niquitin | "environ 3 mois"; "La durée totale du traitement ne doit pas dépasser 6 mois" | 12 months | [B](https://base-donnees-publique.medicaments.gouv.fr/medicament/61056501/extrait) |
| Nicotinell TTS | "environ 3 mois"; "La durée totale du traitement ne doit pas dépasser 6 mois" | 6 months | [C](https://base-donnees-publique.medicaments.gouv.fr/medicament/62267070/extrait) |
| Nicotine EG | "environ 3 mois"; "ne doit pas dépasser 6 mois" | 9 months (see below) | [D](https://base-donnees-publique.medicaments.gouv.fr/medicament/67906013/extrait) |

## Gaps / disagreements

- **Step length depends on the schedule.** Patch alone: 3–4 weeks per phase, 9–12 weeks in
  total. Patch with oral forms: 6–12 weeks at 21 mg, then 3–6 weeks at 14 mg and 3–6 weeks at 7 mg.
  Niquitin "arrêt progressif": 2 + 6 + 2 + 2 weeks.
- **The phases are not strictly 21 → 14 → 7 mg.** Each phase offers an "ou" alternative:
  stay on 21 mg in phase 2, or run 14 mg then 7 mg inside phase 3. The phase lengths do not change.
- **Lighter smokers start lower.** Below 20 cigarettes a day, every notice starts at 14 mg, not
  21 mg. The notices count factory cigarettes and say nothing about hand-rolled ones.
- **Maximum total differs.** Patch alone is 6 months in all four. Nicopatchlib's RCP adds "sans
  avis médical" while its notice says "limitée à 6 mois". With oral forms: 12 months (A, B),
  6 months (C), 9 months (D).
- **Nicotine EG contradicts itself.** Its text gives 9 months as the maximum with oral forms, its
  own table has a row "Jusqu'à 12 mois", and the same paragraph says the combined use "ne doit
  pas dépasser 12 semaines au total".
- **Niquitin's RCP likely lost a character.** Its "arrêt progressif" text reads "si le patient a
  un score 5 au test de Fagerström"; a "<" seems to be missing.
- **Not covered.** No separate "Nicopatch" (without "lib") record came up in the public database.
  Other generics, ANSM, EMA, manufacturer PDFs, HAS and tabac-info-service.fr were not consulted.

## Recommended default

The notices describe one duration for every step of the patch-alone schedule, whatever the
dose, so the default uses the same duration for all three steps.

| Step | Dose | Default duration | Reasoning |
|------|------|------------------|-----------|
| 1 | 21 mg | 28 days | Upper bound of the notices' "Phase initiale 3 à 4 semaines". |
| 2 | 14 mg | 28 days | Upper bound of "Suivi de traitement 3 à 4 semaines". |
| 3 | 7 mg | 28 days | Upper bound of "Sevrage thérapeutique 3 à 4 semaines". |

- **Why the upper bound.** 3 × 4 weeks = 12 weeks, which matches the "environ 3 mois" all four
  notices give for the whole course. It stays well under their 6-month maximum.
- **Why not per brand.** All four brands give the same 3–4 weeks per phase, so mixing brands
  changes nothing.
- **What the default leaves open.** The doses stay 21 / 14 / 7 mg, as the spec sets them. The
  notices point below 20 cigarettes a day to a 14 mg start, and they do not say how a
  hand-rolled cigarette compares. The user can change any dose or duration in the protocol editor.
