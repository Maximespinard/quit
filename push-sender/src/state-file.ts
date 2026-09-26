import { mkdir, open, readFile, rename } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { State } from './types.ts'
import { parseState } from './validation.ts'

const EMPTY_STATE: State = { subscription: null, schedule: [] }

export interface StateFile {
  load(): Promise<State>
  save(state: State): Promise<void>
}

/**
 * The whole state as one small JSON file. Writes go to a temporary file renamed over the real
 * one, so a crash mid-write leaves the previous state intact; they are chained so two saves
 * never interleave.
 */
export function createStateFile(path: string): StateFile {
  let pending: Promise<void> = Promise.resolve()

  async function write(state: State) {
    await mkdir(dirname(path), { recursive: true })
    const temporary = `${path}.tmp`
    const file = await open(temporary, 'w')
    try {
      await file.writeFile(JSON.stringify(state))
      // On disk before the rename, or a power cut could leave the renamed file empty.
      await file.sync()
    } finally {
      await file.close()
    }
    await rename(temporary, path)
  }

  return {
    async load() {
      let text: string
      try {
        text = await readFile(path, 'utf8')
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return EMPTY_STATE
        throw error
      }
      // A corrupted file stops the service rather than silently dropping the subscription.
      let state: State | null = null
      try {
        state = parseState(JSON.parse(text))
      } catch {
        // Not JSON: reported below with the same message as a JSON that is not a state.
      }
      if (!state) throw new Error(`State file ${path} is not a valid push sender state`)
      return state
    },
    save(state) {
      const next = pending.then(() => write(state))
      pending = next.catch(() => {})
      return next
    },
  }
}
