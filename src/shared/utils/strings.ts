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
    saved: 'Enregistré.',
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
    /** A streak as whole days and the hours past them. */
    duration: (days: number, hours: string) => `${days}\u00a0j ${hours}\u00a0h`,
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
    /** A protocol day runs 24 h from the quit moment's time, so it may have begun yesterday. */
    due: 'Pas encore posé',
    logged: (time: string) => `Posé à ${time}`,
    loggedDetail: (sameDay: boolean, doseMg: string) =>
      `${sameDay ? 'aujourd’hui' : 'hier'} · ${doseMg}\u00a0mg`,
    /** The one-tap log: the dose is the running step's. */
    apply: (doseMg: string) => `Poser le patch · ${doseMg}\u00a0mg`,
    other: 'Autre dose ou autre date',
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
      colors: 'Couleurs',
      type: 'Typographie',
    },
    buttons: {
      primary: 'Poser le patch',
      secondary: 'Plus tard',
      outline: 'Modifier',
      ghost: 'Annuler',
      destructive: 'Supprimer ce fait',
      disabled: 'Indisponible',
    },
    switchLabel: 'Rappel du patch',
    segmentedLabel: 'Intensité de l’envie',
    segments: ['1', '2', '3'],
    sliderLabel: 'Humeur du check-in',
    tabsLabel: 'Période',
    tabs: ['Semaine', 'Mois', 'Tout'],
    tabsEmpty: 'Rien à afficher pour cette période.',
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
