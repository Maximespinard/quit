/** One column of a `ColumnChart`. */
export type ChartColumn = {
  /** What the readout and the table name: `18 h – 19 h`, `8 mai – 14 mai`. */
  readonly label: string
  readonly value: number
  /** The value as read: `35 envies`, `2,5 sur 3`. */
  readonly valueText: string
}

/** A label pinned to the left edge of the column at `index`. */
export type ChartMark = { readonly index: number; readonly label: string }

/** One row of a `BarList`. */
export type BarRow = {
  /** Unique within the list. */
  readonly key: string
  readonly label: string
  readonly count: number
  /** A row set apart from the ranking, like cravings without a tag: its label steps back. */
  readonly muted?: boolean
}
