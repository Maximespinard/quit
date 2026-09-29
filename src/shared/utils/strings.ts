import type { ApplicationSite } from '@quit/contract/facts'
import type { ImportRefusal } from '@/shared/domain/journal-file'
import type { ScenarioId } from '@/shared/domain/scenarios'

export const strings = {
  app: { name: 'quit' },
  nav: {
    label: 'Navigation principale',
    home: 'Accueil',
    calendar: 'Calendrier',
    progress: 'Progression',
    history: 'Historique',
    settings: 'Réglages',
  },
  craving: {
    launch: 'Envie',
    logPast: 'Noter une envie passée',
    recorded: 'Envie notée.',
    timer: {
      region: 'Minuteur d’envie',
      lead: 'Respire. Une envie passe en quelques minutes.',
      remaining: 'Temps restant',
      stop: 'Arrêter',
    },
    held: {
      minutes: 'minutes tenues',
      title: 'Tu as tenu jusqu’au bout.',
      lead: 'L’envie est passée sans cigarette.',
    },
    stopped: {
      title: 'Minuteur arrêté.',
      lead: 'L’envie compte quand même : note-la.',
    },
    intensity: {
      label: 'Intensité de l’envie',
      hint: '1 légère · 2 forte · 3 très forte',
      submit: 'Enregistrer l’envie',
    },
    tags: {
      label: 'La situation',
      hint: 'Facultatif · plusieurs possibles',
      defaults: {
        coffee: 'Café',
        meal: 'Repas',
        stress: 'Stress',
        boredom: 'Ennui',
        break: 'Pause',
        'evening-out': 'Soirée',
        youtube: 'YouTube',
        'after-exercise': 'Après le sport',
      },
      customLabel: 'Une autre situation',
      customPlaceholder: 'Ex. voiture',
      add: 'Ajouter',
    },
    past: {
      title: 'Une envie passée',
      lead: 'Sans minuteur : quand elle est arrivée, et sa force.',
      dateLabel: 'Date et heure',
      future: 'Ce moment n’est pas encore arrivé.',
      invalid: 'Indique une date et une heure complètes.',
      cancel: 'Annuler',
      edit: {
        title: 'Modifier l’envie',
        lead: 'Son heure, sa force, sa situation.',
      },
    },
  },
  journal: {
    loading: 'Chargement…',
    error: 'Impossible de lire le journal sur cet appareil.',
  },
  quitMoment: {
    title: 'Depuis quand tu ne fumes plus ?',
    lead: 'Tout part de ce moment. Tu pourras le corriger plus tard.',
    now: 'Maintenant',
    or: 'ou',
    dateLabel: 'Une autre date et heure',
    submit: 'C’est depuis là',
    future: 'Ce moment n’est pas encore arrivé.',
    invalid: 'Indique une date et une heure complètes.',
    /** The earliest fact the new moment would leave before it, as a date and a time. */
    'after-facts': (date: string, time: string) =>
      `Tu as déjà noté quelque chose le ${date} à ${time}. Ton arrêt ne peut pas venir après.`,
  },
  firstLaunch: {
    progress: (step: number, count: number) => `Étape ${step} sur ${count}`,
    back: 'Retour',
    next: 'Continuer',
    spend: {
      title: 'Combien tu dépensais en tabac par semaine ?',
      lead: 'Pour compter l’argent que tu gardes.',
    },
    baseline: {
      title: 'Combien de cigarettes par jour ?',
      lead: 'Avant d’arrêter, en moyenne. Pour compter celles que tu ne fumes plus.',
    },
    protocol: {
      title: 'Ton protocole de patchs',
      lead: 'Un point de départ courant. Tu pourras le changer quand tu veux dans les réglages.',
      step: (doseMg: string, days: number) => `${doseMg} mg · ${days} jours`,
      start: 'C’est parti',
    },
  },
  settings: {
    title: 'Réglages',
    back: 'Retour',
    save: 'Enregistrer',
    unset: 'À renseigner',
    quitMoment: {
      label: 'Moment de l’arrêt',
    },
    spend: {
      label: 'Dépense en tabac par semaine',
      suffix: '€',
    },
    baseline: {
      label: 'Cigarettes par jour, avant',
    },
    protocol: {
      open: 'Modifier le protocole',
      /** The taper at a glance: `21 mg → 14 mg → 7 mg`. */
      doses: (doses: readonly string[]) => doses.map((dose) => `${dose}\u00a0mg`).join(' → '),
    },
  },
  backup: {
    title: 'Sauvegarde',
    lead: 'Ton journal ne vit que sur ce téléphone. Exporte-le dans un fichier pour le garder à l’abri ou le retrouver sur un autre.',
    sandboxLead:
      'Ici, l’export et l’import portent sur le journal du bac à sable. Ton vrai journal n’est ni lu ni modifié.',
    never: 'Pas encore de sauvegarde.',
    last: (date: string) => `Dernière sauvegarde le ${date}.`,
    export: 'Exporter le journal',
    exportSandbox: 'Exporter le bac à sable',
    exported: 'Journal exporté.',
    exportFailed: 'L’export n’a pas abouti. Réessaie.',
    import: 'Importer une sauvegarde',
    importSandbox: 'Importer dans le bac à sable',
    /** The exported file's name, ASCII only: it travels through the share sheet and Files. */
    fileName: (day: string, sandbox: boolean) =>
      `quit-${sandbox ? 'bac-a-sable' : 'journal'}-${day}.json`,
    /** First launch: a new phone, or a wiped one, starts from a file instead. */
    restore: 'Restaurer une sauvegarde',
    imported: 'Journal restauré.',
    confirm: {
      title: 'Remplacer ton journal ?',
      sandboxTitle: 'Remplacer le bac à sable ?',
      body: (date: string) =>
        `Tout ce qui est noté ici sera remplacé par la sauvegarde du ${date}. Pas de retour en arrière.`,
      confirm: 'Oui, remplacer',
      cancel: 'Garder le mien',
    },
    /** Why a file is refused; the journal in place is never touched. */
    refusal: {
      unreadable: 'Ce fichier est illisible ou incomplet.',
      'not-an-export': 'Ce fichier n’est pas une sauvegarde de quit.',
      'unsupported-version':
        'Cette sauvegarde vient d’une version de l’app que celle-ci ne sait pas lire.',
      'sandbox-file':
        'Cette sauvegarde vient du bac à sable : elle ne remplacera pas ton vrai journal.',
      'unknown-fact-type': 'Cette sauvegarde contient des faits que cette version ne connaît pas.',
      'invalid-fact': 'Un des faits de cette sauvegarde est abîmé.',
      'invalid-settings': 'Les réglages de cette sauvegarde sont abîmés.',
      'no-quit-moment': 'Cette sauvegarde n’a pas de moment d’arrêt.',
      'before-quit-moment': 'Cette sauvegarde contient des faits datés d’avant l’arrêt.',
    } satisfies Record<ImportRefusal, string>,
    untouched: 'Rien n’a changé.',
    reminder: {
      label: 'Rappel de sauvegarde',
      first: 'Ton journal n’existe que sur ce téléphone. Exporte-le pour ne rien perdre.',
      stale: (days: number) =>
        `Ta dernière sauvegarde date de ${days}\u00a0jours. Exporte-la à nouveau pour ne rien perdre.`,
      export: 'Exporter',
      later: 'Plus tard',
    },
  },
  mirror: {
    title: 'Miroir',
    lead: 'Colle la clé de l’appareil : chaque changement de ton journal part ensuite vers le miroir, sur ton serveur, sans jamais te faire attendre.',
    keyLabel: 'Clé de l’appareil',
    link: 'Lier ce téléphone',
    linking: 'Liaison…',
    linked: 'Téléphone lié. Chaque changement part vers le miroir dès que le réseau le permet.',
    revoked: 'Cette clé a été révoquée.',
    revokedLead:
      'Colle la nouvelle : les changements en attente sont gardés et partiront avec elle.',
    empty: 'Colle d’abord la clé de l’appareil.',
  },
  money: {
    'invalid-spend': 'Indique un montant en euros, plus grand que zéro.',
  },
  baseline: {
    'invalid-baseline': 'Indique un nombre entier de cigarettes, au moins une.',
  },
  streak: {
    region: 'Streak',
    days: (count: number) => (count <= 1 ? 'jour de streak' : 'jours de streak'),
    totals: 'Ce qui reste acquis',
    smokeFreeDays: 'Jours sans fumer',
    personalBest: 'Plus long streak',
    /** The hours and minutes past the streak's whole days, padded: `07 h 42`. */
    clock: (hours: string, minutes: string) => `${hours}\u00a0h\u00a0${minutes}`,
    /** A streak as whole days and the hours past them. */
    duration: (days: number, hours: string) => `${days}\u00a0j ${hours}\u00a0h`,
  },

  savings: {
    totals: 'Ce que tu gardes',
    moneySaved: 'Argent économisé',
    cigarettesNotSmoked: 'Cigarettes non fumées',
    unset: 'Indique ta dépense en tabac et tes cigarettes par jour pour compter ce que tu gardes.',
    openSettings: 'Ouvrir les réglages',
  },
  goal: {
    title: 'Objectif',
    none: 'Donne un nom et un prix à ce que tu veux t’offrir avec cet argent.',
    choose: 'Choisir un objectif',
    edit: 'Modifier',
    /** Money saved towards the goal, against its price: `220,08 € sur 400 €`. */
    progress: (saved: string, price: string) => `${saved} sur ${price}`,
    percent: (percent: number) => `${percent}\u00a0%`,
    barLabel: (label: string) => `Économies pour ${label}`,
    reached: 'Atteint',
    reachedLead: 'L’argent est là : tu peux te l’offrir.',
    replace: 'Nouvel objectif',
    form: {
      title: 'Ton objectif',
      lead: 'Une chose à t’offrir avec l’argent que tu ne mets plus dans le tabac.',
      restart: 'Ton objectif est atteint : le suivant repart de zéro.',
      label: 'Ce que tu veux t’offrir',
      labelPlaceholder: 'Ex. un vélo',
      price: 'Son prix',
      suffix: '€',
      submit: 'Enregistrer l’objectif',
      cancel: 'Annuler',
      'invalid-label': (max: number) => `Donne-lui un nom, en ${max} caractères au plus.`,
      'invalid-price': 'Indique un prix en euros, plus grand que zéro.',
    },
  },
  lapse: {
    declare: 'J’ai fumé',
    recorded: 'C’est noté.',
    title: 'Tu as fumé ?',
    lead: 'Une taffe compte. Un écart coûte son jour sans fumer, pas ton streak. Trois jours de suite avec un écart font une rechute.',
    dateLabel: 'Quand',
    countLabel: 'Cigarettes',
    fewer: 'Une de moins',
    more: 'Une de plus',
    relapseTitle: 'Ce sera une rechute',
    relapseCost:
      'Trois jours de suite avec un écart : le streak repartira du dernier écart de la série. Tes jours sans fumer et le protocole restent.',
    confirm: 'Oui, noter',
    cancel: 'Annuler',
    edit: {
      title: 'Modifier la cigarette',
      confirm: 'Enregistrer',
    },
    future: 'Ce moment n’est pas encore arrivé.',
    'before-quit-moment': 'C’est avant ton arrêt : rien à noter.',
    'invalid-count': 'Indique au moins une cigarette.',
    invalid: 'Indique une date et une heure complètes.',
    /** How long since the last cigarette, shown after a slip. */
    lastCigarette: (ago: string) => `Dernière cigarette il y a ${ago}.`,
    /** A duration to the hour past a day, to the minute below one. */
    ago: (days: number, hours: number, minutes: number) => {
      if (days > 0) return `${days}\u00a0j ${hours}\u00a0h`
      if (hours > 0) return `${hours}\u00a0h ${minutes}\u00a0min`
      return minutes > 0 ? `${minutes}\u00a0min` : 'moins d’une minute'
    },
    /** The open run of lapse days, while it is still short of a relapse. */
    lapseDays: (days: number) =>
      days <= 1
        ? 'Un jour avec un écart. Trois jours de suite font une rechute.'
        : 'Deux jours de suite avec un écart. Un troisième ferait une rechute.',
  },

  calendar: {
    title: 'Calendrier',
    open: 'Calendrier',
    back: 'Retour',
    empty: 'Le calendrier commence à ton arrêt.',
    nextChange: 'Prochaine étape',
    /** Under the date of the next step change: the box to buy before it. */
    nextDose: (doseMg: string) => `passage à ${doseMg} mg`,
    plannedEnd: 'Fin prévue',
    endedOn: (date: string) => `Terminé le ${date}.`,
    steps: 'Les étapes',
    step: (number: number, doseMg: string) => `Étape ${number} · ${doseMg} mg`,
    span: (from: string, to: string) => `${from} → ${to}`,
    /** After the running step's name. */
    current: ' · en cours',
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    /** Monday first: the letter shown, then the name read out. */
    weekdays: [
      ['L', 'lundi'],
      ['M', 'mardi'],
      ['M', 'mercredi'],
      ['J', 'jeudi'],
      ['V', 'vendredi'],
      ['S', 'samedi'],
      ['D', 'dimanche'],
    ],
    legend: {
      logged: 'Patch posé',
      missing: 'Pas noté',
      due: 'À poser',
      planned: 'Prévu',
      cigarette: 'Cigarette',
      craving: 'Envie',
    },
    /** What a screen reader hears for one day, after its date. */
    day: {
      today: 'aujourd’hui',
      logged: 'patch posé',
      missing: 'patch pas noté',
      due: 'patch à poser',
      planned: 'patch prévu',
      stepStart: (number: number, doseMg: string) => `début de l’étape ${number} à ${doseMg} mg`,
      end: 'fin du protocole',
      cigarettes: (count: number) => (count <= 1 ? `${count} cigarette` : `${count} cigarettes`),
      cravings: (count: number) => (count <= 1 ? `${count} envie` : `${count} envies`),
    },
    /** The dose shown on a step's first day. */
    dose: (doseMg: string) => `${doseMg} mg`,
    end: 'Fin',
  },

  history: {
    title: 'Historique',
    open: 'Historique',
    lead: 'Du plus récent au plus ancien. Touche une ligne pour la modifier ou la supprimer.',
    empty:
      'Rien de noté pour l’instant. Tes patchs, tes envies et tes cigarettes apparaîtront ici.',
    today: 'Aujourd’hui',
    yesterday: 'Hier',
    back: 'Retour',
    edited: 'Modifié.',
    deleted: 'Supprimé.',
    missing: 'Ce fait n’est plus dans le journal.',
    delete: 'Supprimer',
    confirmLapseDelete: {
      title: 'Supprimer cette cigarette ?',
      body: 'Le streak, les jours sans fumer et les rechutes sont recalculés sans elle.',
      confirm: 'Oui, supprimer',
      cancel: 'Garder',
    },
    facts: {
      patch: 'Patch posé',
      craving: 'Envie',
      cravingHeld: 'Envie tenue jusqu’au bout',
      lapse: 'J’ai fumé',
      dose: (doseMg: string) => `${doseMg}\u00a0mg`,
      intensity: (level: number) => `Intensité ${level}`,
      cigarettes: (count: number) => (count <= 1 ? `${count} cigarette` : `${count} cigarettes`),
    },
  },

  stats: {
    open: 'Statistiques des envies',
    title: 'Tes envies',
    lead: 'Quand elles arrivent, dans quelles situations, et comment elles s’espacent.',
    back: 'Retour',
    /** Before enough cravings: what the screen will show, never an empty chart. */
    empty: (needed: number) =>
      `Rien à compter pour l’instant. Dès ${needed}\u00a0envies notées, tu verras ici à quelle heure elles arrivent, dans quelles situations, et comment elles s’espacent.`,
    sparse: (count: number, needed: number) =>
      `${count}\u00a0${count <= 1 ? 'envie notée' : 'envies notées'} sur les ${needed} qu’il faut pour tracer tes statistiques. Chaque envie notée, même passée, compte.`,
    summary: 'En bref',
    count: 'Envies notées',
    held: 'Tenues jusqu’au bout',
    riskiestHour: 'Heure la plus risquée',
    topTag: 'Situation la plus fréquente',
    /** An hour or a situation there is none of yet. */
    none: 'Aucune',
    /** Between a chart readout's name and its value. */
    separator: '·',
    percent: (percent: number) => `${percent}\u00a0%`,
    cravings: (count: number) => (count <= 1 ? `${count} envie` : `${count} envies`),
    /** A local wall-clock hour: `18 h`. */
    hour: (hour: number) => `${hour}\u00a0h`,
    /** One hour of the day, as the chart's readout names it: `18 h – 19 h`. */
    hourSpan: (hour: number) => `${hour}\u00a0h – ${(hour + 1) % 24}\u00a0h`,
    byHour: 'Heure de la journée',
    byTag: 'Situations',
    untagged: 'Sans situation',
    byIntensity: {
      title: 'Intensité',
      /** 1 to 3, as the craving form names them. */
      levels: { 1: '1 · légère', 2: '2 · forte', 3: '3 · très forte' },
    },
    trend: {
      title: 'Au fil du temps',
      countByDay: 'Envies par jour',
      /** Weeks are compared per day: the oldest one, cut at the quit day, is shorter. */
      countByWeek: 'Envies par jour, en moyenne sur chaque semaine',
      /** A week's cravings, then its daily average: `18 envies · 2,6 par jour`. */
      weekCount: (count: number, perDay: number) =>
        `${count <= 1 ? `${count} envie` : `${count} envies`} · ${perDay.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} par jour`,
      intensity: 'Intensité moyenne',
      noIntensity: 'aucune envie',
      /** An average intensity out of 3: `2,5 sur 3`. */
      average: (average: number) =>
        `${average.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} sur 3`,
      /** A week of the trend, its first and last days: the oldest may be shorter. */
      week: (first: string, last: string) => `${first} – ${last}`,
      today: 'aujourd’hui',
      /** A step change on the trend: the dose the new step starts, or the doses of steps starting together: `14 → 7 mg`. */
      stepChange: (doses: readonly string[]) => `${doses.join(' → ')}\u00a0mg`,
      /** A step change for screen readers, with the day or the week it falls in. */
      stepChangeAt: (stepNumber: number, doseMg: string, when: string) =>
        `Étape ${stepNumber} à ${doseMg}\u00a0mg · ${when}`,
      single: 'La tendance apparaîtra dès demain, jour après jour.',
    },
  },

  protocol: {
    title: 'Protocole',
    stepOf: (number: number, count: number) => `Étape ${number} / ${count}`,
    context: (number: number, doseMg: string) => `Étape\u00a0${number} · ${doseMg}\u00a0mg`,
    /** The current step's dose, then how long until what comes next. */
    detail: (doseMg: string, remaining: string) => `${doseMg}\u00a0mg · ${remaining}`,
    day: (day: number, duration: number) => `Jour ${day} sur ${duration}`,
    untilNext: (days: number, doseMg: string) => `encore ${days}\u00a0j avant ${doseMg}\u00a0mg`,
    untilEnd: (days: number) => `encore ${days}\u00a0j avant la fin`,
    over: 'Protocole terminé',
    overLead: 'Plus de patch à poser. Le streak, lui, continue.',
    edit: 'Modifier',
    back: 'Retour',
    lead: 'Chaque étape est un patch de 24\u00a0h. Tu peux tout changer, même en cours d’étape.',
    step: (number: number) => `Étape ${number}`,
    /** Where a step of the protocol in force stands today; an upcoming step carries no mark. */
    status: { current: 'En cours', past: 'Passée' },
    doseLabel: 'Dose (mg)',
    durationLabel: 'Durée (jours)',
    brandLabel: 'Marque (facultatif)',
    moveUp: (number: number) => `Monter l’étape ${number}`,
    moveDown: (number: number) => `Descendre l’étape ${number}`,
    remove: (number: number) => `Supprimer l’étape ${number}`,
    add: 'Ajouter une étape',
    save: 'Enregistrer',
    invalid: 'Chaque étape a besoin d’une dose et d’une durée en jours entiers.',
    empty: 'Garde au moins une étape.',
  },
  patch: {
    title: 'Patch du jour',
    /** Today's patch, today being the calendar day: one put on yesterday never counts. */
    due: 'Pas encore posé',
    logged: (time: string) => `Posé à ${time}`,
    loggedDetail: (doseMg: string, site: string | null) =>
      ['aujourd’hui', `${doseMg}\u00a0mg`, site].filter(Boolean).join(' · '),
    /** The one-tap log: the dose is the running step's. */
    apply: (doseMg: string) => `Poser le patch · ${doseMg}\u00a0mg`,
    other: 'Autre dose ou autre date',
    site: {
      label: 'Où le poser',
      /** Pressing the chosen site again leaves it out. */
      hint: 'Facultatif · jamais deux fois de suite au même site',
      /** Under the previous patch application's site, which the next one may not take. */
      previous: 'la dernière fois',
      /** Under the suggested site, pressed or not. */
      suggested: 'suggéré',
    },
    sites: {
      'arm-left': 'Bras gauche',
      'arm-right': 'Bras droit',
      'chest-left': 'Torse gauche',
      'chest-right': 'Torse droit',
      'hip-left': 'Hanche gauche',
      'hip-right': 'Hanche droite',
    } satisfies Record<ApplicationSite, string>,
    recorded: 'Patch noté.',
    form: {
      title: 'Noter un patch',
      lead: 'Un jour à rattraper, ou une dose différente pour ce patch seulement. Le protocole ne change pas.',
      doseLabel: 'Dose (mg)',
      dateLabel: 'Date et heure',
      submit: 'Enregistrer le patch',
      cancel: 'Annuler',
      future: 'Ce moment n’est pas encore arrivé.',
      'before-quit-moment': 'C’est avant ton arrêt : le protocole n’avait pas commencé.',
      'invalid-dose': 'Indique une dose en mg, plus grande que zéro.',
      invalid: 'Indique une date et une heure complètes.',
      edit: {
        title: 'Modifier le patch',
        lead: 'Son heure ou sa dose. Le protocole ne change pas.',
        submit: 'Enregistrer',
      },
    },
  },
  debug: {
    marker: 'Bac à sable',
    title: 'Bac à sable',
    lead: 'Ton vrai journal n’y est ni lu ni modifié.',
    shifts: 'Déplacer l’horloge',
    dayBack: '−1 j',
    hourBack: '−1 h',
    hourForward: '+1 h',
    dayForward: '+1 j',
    realTime: 'Revenir à l’heure réelle',
    /** How many facts the sandbox journal holds: the one trace an injected craving leaves. */
    facts: (count: number) => (count <= 1 ? `${count} fait` : `${count} faits`),
    scenarios: 'Scénarios',
    scenario: {
      'day-3-craving': 'Jour 3, envie juste notée',
      'step-down-eve': 'Veille de l’étape 2',
      'day-29': 'Jour 29, étape 2',
      'day-45-lapse': 'Jour 45, un écart hier',
      'protocol-over': 'Protocole fini, une semaine sans patch',
      'day-60-cravings': 'Jour 60, deux mois d’envies',
    } satisfies Record<ScenarioId, string>,
    inject: 'Injecter à l’heure du bac à sable',
    injectCraving: 'Injecter une envie',
    injectLapse: 'Injecter un écart',
    jumpToNextStep: 'Sauter à l’étape suivante',
    jumpToEnd: 'Sauter à la fin du protocole',
    wipe: 'Vider',
    leave: 'Sortir',
    close: 'Fermer',
  },
  multiplier: {
    label: 'Multiplicateur de streak',
    title: (current: number) => `Multiplicateur ×${current}`,
    next: (days: number, next: number) => `encore ${days} j pour ×${next}`,
    capped: 'au maximum',
  },
  level: {
    title: (level: number) => `Niveau ${level}`,
    label: (level: number) => `XP du niveau ${level}`,
    xp: (into: number, total: number) =>
      `${into.toLocaleString('fr-FR')} / ${total.toLocaleString('fr-FR')} XP`,
  },
  badges: {
    title: 'Badges',
    count: (unlocked: number, total: number) => `${unlocked} / ${total}`,
    locked: 'à débloquer',
  },
  design: {
    synthetic: 'Toutes les données sont fictives.',
    sections: {
      controls: 'Composants',
      fields: 'Champs',
      colors: 'Couleurs',
      type: 'Typographie',
      radii: 'Rayons',
      navigation: 'Navigation',
    },
    /** The tab bar's look is set; it ships once its fourth screen, Progression, exists (M2). */
    tabBarLater:
      'Barre d’onglets : elle arrive avec Progression (M2). D’ici là, la liste de l’accueil.',
    buttons: {
      primary: 'Poser le patch',
      secondary: 'Plus tard',
      ghost: 'Annuler',
      destructive: 'Supprimer ce fait',
      link: 'Autre dose ou autre date',
      disabled: 'Indisponible',
    },
    switchLabel: 'Rappel du patch',
    switchOffLabel: 'Rappel de sauvegarde',
    switchDisabledLabel: 'Notifications, bloquées par le téléphone',
    chipsLabel: 'Site du patch',
    chips: ['Bras gauche', 'Bras droit', 'Torse gauche'],
    chipPrevious: 'Hanche droite',
    segmentedLabel: 'Intensité de l’envie',
    segments: ['1', '2', '3'],
    sliderLabel: 'Humeur du check-in',
    tabsLabel: 'Période',
    tabs: ['Semaine', 'Mois', 'Tout'],
    tabsEmpty: 'Rien à afficher pour cette période.',
    tabsLineLabel: 'Vue',
    tabsLine: ['Heures', 'Tags', 'Intensité'],
    fields: {
      label: 'Ce que tu veux t’offrir',
      placeholder: 'Ex. un vélo',
      price: 'Son prix',
      priceValue: '900',
      invalid: 'Date et heure',
      invalidValue: '31/12/2027 23:59',
      error: 'Cette date est dans le futur.',
      disabled: 'Marque du patch',
      disabledValue: 'Patch 24 h',
    },
    drawer: {
      open: 'Ouvrir le tiroir',
      title: 'Poser le patch',
      body: 'Site suggéré : bras gauche. Le précédent était sur l’épaule droite.',
      confirm: 'C’est posé',
      cancel: 'Plus tard',
    },
    dialog: {
      open: 'Ouvrir la boîte de dialogue',
      title: 'Enregistrer un écart ?',
      body: 'Le streak et le multiplicateur repartent de zéro. Tes badges et tes jours sans fumer restent.',
      confirm: 'Enregistrer',
      cancel: 'Non, pas cette fois',
      close: 'Fermer',
    },
  },
} as const
