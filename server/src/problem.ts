import { STATUS_CODES } from 'node:http'
import { PROBLEM_CONTENT_TYPE, type Problem } from '@quit/contract/problem'
import type { Response } from 'express'

/** Answers with an RFC 9457 problem: the status's own title, and `detail` when given. */
export function sendProblem(res: Response, status: number, detail?: string) {
  const problem: Problem = {
    type: 'about:blank',
    title: STATUS_CODES[status] ?? 'Error',
    status,
    ...(detail === undefined ? {} : { detail }),
  }
  res.status(status).type(PROBLEM_CONTENT_TYPE).send(JSON.stringify(problem))
}
