import { twoDigits } from '@/shared/utils/format'

export type SaveOutcome = 'saved' | 'cancelled' | 'failed'

/** The local day as a file name carries it, sortable: `2026-09-28`. */
export function fileDay(now: number): string {
  const d = new Date(now)
  return `${d.getFullYear()}-${twoDigits(d.getMonth() + 1)}-${twoDigits(d.getDate())}`
}

function download(file: File) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  // Revoked once the click has handed the file over, not before.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Hands a JSON file to the user: through the share sheet where files can be shared (iOS:
 * « Enregistrer dans Fichiers »), else as a download. Must start inside the tap's handler:
 * nothing is awaited before the share sheet opens.
 */
export async function saveJsonFile(text: string, fileName: string): Promise<SaveOutcome> {
  const file = new File([text], fileName, { type: 'application/json' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return 'saved'
    } catch (error) {
      return error instanceof DOMException && error.name === 'AbortError' ? 'cancelled' : 'failed'
    }
  }
  try {
    download(file)
    return 'saved'
  } catch {
    return 'failed'
  }
}
