import LE from 'virtual:le-core'
export { LE }
let _id = 1
export const uid = () => 'n' + (_id++)
export const noteName = (n) => LE.noteName(n)
export function parseNote(v) {
  if (typeof v === 'number') return v
  v = String(v ?? '').trim()
  const m = /^([A-Ha-h])([#b]?)(-?\d+)$/.exec(v)
  if (m) {
    const N = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11, H: 11 }
    return Math.max(0, Math.min(127, N[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 2) * 12))
  }
  const f = parseFloat(v.replace(',', '.')); return isNaN(f) ? 0 : f
}
export function num(v) { if (typeof v === 'number') return v; const f = parseFloat(String(v ?? '').replace(',', '.')); return isNaN(f) ? 0 : f }
export const fmt = (v) => (Math.round(v * 1000) / 1000).toString().replace('.', ',')
export const usesP2 = (cond) => cond === 207 || cond === 209 || cond === 206 || cond === 208
export function cmp(cd, v, p1, p2) {
  switch (cd) {
    case 200: return v === p1; case 201: return v !== p1; case 202: return v > p1; case 203: return v >= p1; case 204: return v < p1; case 205: return v <= p1
    case 207: return v >= Math.min(p1, p2) && v <= Math.max(p1, p2); case 209: return v < Math.min(p1, p2) || v > Math.max(p1, p2)
  }
  return null
}
// Tiefe Kopie ohne Vue-Proxys (Uint8Array bleibt Uint8Array)
export function rawClone(x) {
  if (x == null || typeof x !== 'object') return x
  if (x instanceof Uint8Array) return new Uint8Array(x)
  if (Array.isArray(x)) return x.map(rawClone)
  const o = {}; for (const k of Object.keys(x)) o[k] = rawClone(x[k]); return o
}
