// Vorschau: Beispiel-Clips und eine vereinfachte Auswertung der Bedingungen/Aktionen (nur zur Anschauung).
import { parseNote, num, cmp } from './util.js'
export const PPQ = 480, BAR = 1920, BARS = 4
export const ENV = { cursor: 2 * BAR, cycStart: BAR, cycEnd: 3 * BAR }
export const CLIPS = [{ id: 'drums', label: 'Drums' }, { id: 'keys', label: 'Akkorde' }, { id: 'cc', label: 'Controller' }]
const note = (pos, pitch, vel, len, ch, fl) => ({ type: 0, pos, pitch, vel, len, ch: ch || 1, sel: !!fl?.sel, mute: !!fl?.mute })
export function clipEvents(id) {
  const ev = []
  if (id === 'drums') {
    for (let b = 0; b < 4; b++) {
      const o = b * BAR
      ev.push(note(o, 36, 112, 180, 10), note(o + 960, 36, 104, 180, 10, { sel: b === 1 }), note(o + 1200, 36, 88, 180, 10))
      ev.push(note(o + 480, 38, 100, 180, 10), note(o + 1440, 38, 96, 180, 10, { mute: b === 2 }))
      for (let e = 0; e < 8; e++) ev.push(note(o + e * 240, 42, e % 2 ? 52 : 86, 100, 10, { sel: b === 1 }))
      if (b === 3) ev.push(note(o + 1680, 46, 92, 200, 10))
    }
  } else if (id === 'keys') {
    const chords = [[0, [48, 55, 60, 64]], [BAR, [43, 50, 59, 62]], [2 * BAR, [45, 52, 57, 60]], [3 * BAR, [41, 48, 57, 65]]]
    chords.forEach(([p, ps], ci) => ps.forEach((x, i) => ev.push(note(p, x, 64 + i * 8 - ci * 3, 1800, 1, { sel: ci === 1 }))))
    const mel = [[960, 67, 96, 240], [1200, 69, 70, 240], [1440, 72, 104, 480], [BAR + 960, 71, 88, 480], [BAR + 1440, 67, 60, 240], [2 * BAR + 960, 69, 100, 960], [3 * BAR + 960, 72, 92, 240], [3 * BAR + 1200, 74, 78, 240], [3 * BAR + 1440, 76, 110, 480]]
    mel.forEach(m => ev.push(note(m[0], m[1], m[2], m[3], 1)))
  } else {
    for (let i = 0; i < 32; i++) ev.push({ type: 2, pos: i * 240, cc: 1, val: Math.round(64 + 58 * Math.sin(i / 4.5)), ch: 1, len: 0, sel: false, mute: false })
    for (let k = 0; k < 16; k++) ev.push({ type: 2, pos: k * 480 + 120, cc: 11, val: 30 + k * 6, ch: 1, len: 0, sel: k > 7, mute: false })
    ev.push({ type: 4, pos: 960, v1: 80, ch: 1, len: 0 }, { type: 3, pos: 3840, v1: 5, ch: 1, len: 0 })
    for (let n = 0; n < 4; n++) ev.push(note(n * BAR, 60 + [0, 5, 7, 0][n], 90, 1800, 1))
  }
  ev.forEach((e, i) => { e.i = i; e.v1 = e.type === 0 ? e.pitch : e.type === 2 ? e.cc : (e.v1 || 0); e.v2 = e.type === 0 ? e.vel : e.type === 2 ? e.val : 0 })
  return ev
}
const chordOf = (ev, all) => all.filter(x => x.type === 0 && x.pos === ev.pos)
function evalChip(c, ev, all) {
  const cd = +c.cond
  switch (c.t) {
    case 'type': return cd === 214 ? true : cd === 200 ? ev.type === +c.p1 : ev.type !== +c.p1
    case 'pitch': case 'ccnum': case 'subtype': return cmp(cd, ev.v1, parseNote(c.p1), parseNote(c.p2))
    case 'velocity': case 'ccval': case 'mainvalue': return cmp(cd, ev.v2, num(c.p1), num(c.p2))
    case 'channel': return cmp(cd, ev.ch, num(c.p1), num(c.p2))
    case 'barpos': { const t = ev.pos % BAR, inside = t >= +c.p1 && t <= +c.p2; return cd === 206 ? inside : !inside }
    case 'timepos': switch (cd) { case 216: return ev.pos < ENV.cursor; case 217: return ev.pos > ENV.cursor; case 218: case 222: return ev.pos >= ENV.cycStart && ev.pos < ENV.cycEnd; case 219: return ev.pos < ENV.cycStart || ev.pos >= ENV.cycEnd; case 220: return ev.pos === ENV.cycStart && ev.pos + ev.len === ENV.cycEnd } return null
    case 'length': { if (ev.type !== 0) return false; const f = c.unit === 's' ? 960 : 1; return cmp(cd, ev.len, num(c.p1) * f, num(c.p2) * f) }
    case 'property': { const v = +c.p1 === 0 ? ev.mute : +c.p1 === 1 ? ev.sel : null; if (v === null) return null; return cd === 211 ? v : !v }
    case 'context': {
      if (ev.type !== 0) return false
      const ch = chordOf(ev, all), v = +c.p1, p = +c.p2, ps = ch.map(x => x.pitch).sort((a, b) => a - b), vs = ch.map(x => x.vel)
      const isChord = ch.length >= 3
      switch (v) {
        case 0: return cmp(cd, ev.pitch === Math.max(...ps) ? 1 : 0, 1, 0); case 1: return cmp(cd, ev.pitch === Math.min(...ps) ? 1 : 0, 1, 0)
        case 3: return cmp(cd, ev.vel === Math.max(...vs) ? 1 : 0, 1, 0); case 4: return cmp(cd, ev.vel === Math.min(...vs) ? 1 : 0, 1, 0)
        case 9: return isChord && cmp(cd, ch.length, p, 0); case 12: return isChord && cmp(cd, ps.indexOf(ev.pitch), p, 0)
        case 14: return isChord && cmp(cd, ps.length - 1 - ps.indexOf(ev.pitch), p, 0)
        case 15: return ch.length >= p && ev.pitch === Math.max(...ps); case 16: return ch.length >= p && ev.pitch === Math.min(...ps)
      }
      return null
    }
  }
  return null
}
export function evalGroup(g, ev, all, unknown) {
  const eff = g.items.filter(it => it.type === 'chip' || it.items.length)
  if (!eff.length) return true
  const and = g.bool === 103; let res = and
  for (const it of eff) {
    let r = it.type === 'chip' ? evalChip(it, ev, all) : evalGroup(it, ev, all, unknown)
    if (r === null) { unknown.add(it.t || 'group'); r = true }
    res = and ? (res && r) : (res || r)
  }
  return res
}
let seed = 7
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
function applyOp(op, v, p1, p2, lo, hi, x) {
  switch (op) {
    case 304: v += p1; break; case 306: v -= p1; break; case 307: v *= p1; break; case 308: v = p1 ? v / p1 : v; break
    case 309: v = p1 ? Math.round(v / p1) * p1 : v; break; case 310: v = Math.min(p1, p2) + rnd() * Math.abs(p2 - p1); break
    case 311: v += Math.min(p1, p2) + rnd() * Math.abs(p2 - p1); break; case 312: v = p1; break
    case 317: { const t = Math.max(0, Math.min(1, (x - ENV.cycStart) / (ENV.cycEnd - ENV.cycStart))); if (x >= ENV.cycStart && x < ENV.cycEnd) v = p1 + (p2 - p1) * t; break }
  }
  return Math.max(lo, Math.min(hi, Math.round(v)))
}
export function applyActions(ev, actions, hits) {
  seed = 7
  return ev.map(e0 => {
    const e = { ...e0 }
    if (!hits[e.i]) return e
    e.changed = actions.length > 0
    for (const a of actions) {
      const op = +a.op, p1 = (a.t === 'pitch' || a.t === 'ccnum') ? parseNote(a.p1) : num(a.p1), p2 = a.t === 'pitch' ? parseNote(a.p2) : num(a.p2)
      switch (a.t) {
        case 'velocity': case 'ccval': case 'mainvalue': e.v2 = applyOp(op, e.v2, p1, p2, 0, 127, e.pos); if (e.type === 0) e.vel = e.v2; else e.val = e.v2; break
        case 'pitch': case 'ccnum': case 'subtype': e.v1 = applyOp(op, e.v1, p1, p2, 0, 127, e.pos); if (e.type === 0) e.pitch = e.v1; else e.cc = e.v1; break
        case 'channel': e.ch = op === 312 ? p1 : applyOp(op, e.ch, p1, 0, 1, 16, e.pos); break
        case 'type': e.type = p1; if (p1 === 2 && e0.type !== 2) { e.cc = e.v1; e.val = e.v2 } break
        case 'position': { const f = a.unit === 'ms' ? 0.96 : 1; e.pos = applyOp(op, e.pos, p1 * f, p2 * f, 0, 1e9, e.pos); break }
        case 'length': { const f = a.unit === 'ms' ? 0.96 : 1; e.len = applyOp(op, e.len, p1 * f, p2 * f, 1, 1e9, e.pos); break }
      }
    }
    return e
  })
}
// Ergebnis je Funktion: Liste {…event, state: 'hit'|'kept'|'changed'|'deleted'|'added'|'moved'}
export function previewResult(S, ev, hits) {
  const f = S.func, tr = applyActions(ev, S.actions, hits)
  const tag = (e, state) => ({ ...e, state })
  switch (f) {
    case 0: return ev.map(e => tag(e, hits[e.i] ? 'deleted' : 'kept'))
    case 1: return tr.map(e => tag(e, hits[e.i] ? 'changed' : 'kept'))
    case 2: return ev.map(e => tag(e, 'kept')).concat(tr.filter(e => hits[e.i]).map(e => tag(e, 'added')))
    case 3: return tr.map(e => tag(e, hits[e.i] ? 'changed' : 'deleted'))
    case 4: return ev.map(e => tag(e, 'kept')).concat(tr.filter(e => hits[e.i]).map(e => tag(e, 'moved')))
    case 5: case 7: return tr.map(e => tag(e, hits[e.i] ? 'moved' : 'kept'))
    case 6: return ev.map(e => tag({ ...e, sel: !!hits[e.i] }, hits[e.i] ? 'hit' : 'kept'))
    case 8: return ev.map(e => tag({ ...e, sel: e.sel && !hits[e.i] }, hits[e.i] ? 'hit' : 'kept'))
  }
  return ev.map(e => tag(e, 'kept'))
}
/* Project Logical Editor: Beispielprojekt */
export const TRACKS = [
  { name: 'Drums', kind: 0, media: 1, color: 3 }, { name: 'Kick', kind: 1, media: 1, color: 3, sel: true, depth: 1 }, { name: 'Snare', kind: 1, media: 1, color: 3, depth: 1, mute: true },
  { name: 'HiHat Perc', kind: 1, media: 1, color: 4, depth: 1, hidden: true }, { name: 'Bass', kind: 1, media: 1, color: 7 }, { name: 'Bass Part 1', kind: 2, media: 1, color: 7, depth: 1, sel: true },
  { name: 'Strings', kind: 0, media: 1, color: 9 }, { name: 'Violins', kind: 1, media: 1, color: 9, depth: 1 }, { name: 'Cello', kind: 1, media: 1, color: 9, depth: 1, disabled: true },
  { name: 'Vocals Lead', kind: 1, media: 0, color: 12 }, { name: 'Vox_take3', kind: 3, media: 0, color: 12, depth: 1 }, { name: 'Vocals Dbl', kind: 1, media: 0, color: 12, mute: true },
  { name: 'Volume', kind: 1, media: 2, color: 1, depth: 1 }, { name: 'Verse', kind: 3, media: 3, color: 1 }, { name: 'Reverb FX', kind: 1, media: 12, color: 15 }
]
function evalTrackChip(c, t) {
  const cd = +c.cond, p1 = c.p1
  switch (c.t) {
    case 'container': return cd === 214 ? true : cd === 200 ? t.kind === +p1 : t.kind !== +p1
    case 'media': return cd === 214 ? true : cd === 200 ? t.media === +p1 : t.media !== +p1
    case 'name': case 'color': { const s = (c.t === 'name' ? t.name : 'Color ' + t.color).toLowerCase(), q = String(p1 ?? '').toLowerCase(); return cd === 200 ? s === q : cd === 210 ? s.includes(q) : !s.includes(q) }
    case 'property': { const v = +p1 === 0 ? !!t.mute : +p1 === 1 ? !!t.sel : +p1 === 5 ? !!t.hidden : +p1 === 8 ? !!t.disabled : +p1 === 2 ? false : null; if (v === null) return null; return cd === 211 ? v : !v }
  }
  return null
}
export function evalTrackGroup(g, t, unknown) {
  const eff = g.items.filter(it => it.type === 'chip' || it.items.length); if (!eff.length) return true
  const and = g.bool === 103; let res = and
  for (const it of eff) { let r = it.type === 'chip' ? evalTrackChip(it, t) : evalTrackGroup(it, t, unknown); if (r === null) { unknown.add(it.t); r = true } res = and ? (res && r) : (res || r) }
  return res
}
