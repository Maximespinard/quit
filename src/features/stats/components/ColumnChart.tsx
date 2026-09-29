import { type PointerEvent, useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { strings } from '@/shared/utils/strings'
import type { ChartColumn, ChartMark } from '../types/charts'

type ColumnChartProps = {
  /** The table twin's caption: what a screen reader hears instead of the columns. */
  label: string
  columns: readonly ChartColumn[]
  /** Top of the scale; the tallest column by default. */
  max?: number
  /** Axis labels, under the columns they start. */
  ticks: readonly ChartMark[]
  /** Rules before the columns they mark, labelled above the plot: the protocol's step changes. */
  markers?: readonly ChartMark[]
  /** The column the readout names until a finger or a pointer picks another. */
  restingIndex: number
}

/** Past this share of the width, a label hangs left of its edge so it never leaves the chart. */
const HANG_LEFT_FROM = 0.8

/**
 * Where a label spanning `[from, to]` of the width sits: from `from` onwards, or, near the end
 * or on the last column, ending at `to`.
 */
const labelStyle = (from: number, to: number) =>
  from > HANG_LEFT_FROM || to >= 1 ? { right: `${(1 - to) * 100}%` } : { left: `${from * 100}%` }

/**
 * One series in columns of one hue: thin bars, 2px apart, grown from a hairline baseline.
 * A finger dragged across (or a pointer over) the plot names one column in the readout;
 * the other columns step back while it does. Every value is also in a table for screen readers.
 */
export function ColumnChart({
  label,
  columns,
  max = Math.max(...columns.map((column) => column.value)),
  ticks,
  markers = [],
  restingIndex,
}: ColumnChartProps) {
  const [active, setActive] = useState<number | null>(null)
  const shown = columns[active ?? restingIndex]
  const count = columns.length

  const pick = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const index = Math.floor(((event.clientX - box.left) / box.width) * count)
    setActive(Math.min(count - 1, Math.max(0, index)))
  }
  // A finger's pick stays on screen once lifted, so it can be read; a mouse's follows it out.
  const leave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') setActive(null)
  }

  return (
    <div className="flex flex-col gap-2">
      <p aria-hidden className="flex min-h-5 items-baseline gap-1.5 text-label text-ink-soft">
        {shown === undefined ? null : (
          <>
            <span className="font-semibold text-ink">{shown.label}</span>
            <span>{strings.stats.separator}</span>
            <span>{shown.valueText}</span>
          </>
        )}
      </p>
      <div aria-hidden className="flex flex-col gap-1">
        {markers.length > 0 ? (
          <div className="relative h-4">
            {markers.map((marker) => (
              <span
                key={marker.index}
                className="absolute top-0 px-1 font-medium text-detail text-ink"
                style={labelStyle(marker.index / count, marker.index / count)}
              >
                {marker.label}
              </span>
            ))}
          </div>
        ) : null}
        <div
          className="relative h-28 touch-pan-y select-none border-line border-b"
          onPointerDown={pick}
          onPointerMove={pick}
          onPointerLeave={leave}
        >
          {markers.map((marker) => (
            <span
              key={marker.index}
              className="absolute inset-y-0 w-px bg-ink"
              style={{ left: `${(marker.index / count) * 100}%` }}
            />
          ))}
          <div className="absolute inset-0 flex items-end gap-0.5">
            {columns.map((column, index) => (
              <div
                key={column.label}
                className="flex h-full min-w-0 flex-1 items-end justify-center"
              >
                <div
                  className={cn(
                    'w-full max-w-6 rounded-t-mark bg-action transition-opacity duration-150 ease-out-expo motion-reduce:transition-none',
                    active !== null && index !== active && 'opacity-35',
                  )}
                  // A column holding anything stays visible, however small beside the tallest.
                  style={{
                    height:
                      column.value === 0 || max === 0
                        ? 0
                        : `max(2px, ${(column.value / max) * 100}%)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="relative h-4 text-detail text-ink-soft">
          {ticks.map((tick) => (
            <span
              key={tick.index}
              className="absolute top-0 whitespace-nowrap"
              style={labelStyle(tick.index / count, (tick.index + 1) / count)}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {columns.map((column) => (
            <tr key={column.label}>
              <th scope="row">{column.label}</th>
              <td>{column.valueText}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
