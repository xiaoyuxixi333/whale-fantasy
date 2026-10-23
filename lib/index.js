import { createReadStream, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'dsh-skin-whale-fantasy'
export const inject = ['webServer']

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE = '/dsh-skin-whale-fantasy'
const VIDEO = join(ROOT, 'assets', 'whale-fantasy-loop.mp4')

/** Stream the loop with byte-range support so the <video> can seek/loop cleanly. */
function serveVideo(req, res) {
  let size
  try {
    size = statSync(VIDEO).size
  } catch {
    res.statusCode = 404
    res.end('whale-fantasy: video missing')
    return
  }
  res.setHeader('content-type', 'video/mp4')
  res.setHeader('accept-ranges', 'bytes')
  res.setHeader('cache-control', 'public, max-age=86400')
  const range = req.headers?.range
  const match = typeof range === 'string' ? /bytes=(\d*)-(\d*)/.exec(range) : null
  if (match !== null && (match[1] !== '' || match[2] !== '')) {
    const start = match[1] === '' ? Math.max(0, size - Number(match[2])) : Number(match[1])
    const end = match[1] === '' || match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1)
    if (start > end || start >= size) {
      res.statusCode = 416
      res.setHeader('content-range', `bytes */${size}`)
      res.end()
      return
    }
    res.statusCode = 206
    res.setHeader('content-range', `bytes ${start}-${end}/${size}`)
    res.setHeader('content-length', String(end - start + 1))
    createReadStream(VIDEO, { start, end }).pipe(res)
    return
  }
  res.setHeader('content-length', String(size))
  createReadStream(VIDEO).pipe(res)
}

export function apply(ctx) {
  ctx.effect(
    () => ctx.webServer.register({ kind: 'prefix', path: `${BASE}/media`, handler: serveVideo }),
    'dsh-skin-whale-fantasy: background loop',
  )
}
