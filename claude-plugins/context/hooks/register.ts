import type { Register, SessionContextUsage } from 'claude-code'

const k = (n: number) => `${Math.round(n / 1000)}k`

const line = (c: SessionContextUsage) =>
  c.percent === undefined
    ? '--'
    : c.tokens
      ? `${c.percent}% (${k(c.tokens)} / ${k(c.window)})`
      : `${c.percent}%`

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    $.ui.status(line((await $.session.usage()).context))
    return r
  })

  on('session.measure', ($, e, next) => {
    if (e.changed.includes('context')) $.ui.status(line(e.context))
    return next(e)
  })
}
