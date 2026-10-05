// Kurztexte für Bausteine, Aktionen und die Zusammenfassung. Sachlich, ohne Füllwörter.
import { LE, noteName, parseNote, num, fmt } from './util.js'
import { CHIPDEF, ACTDEF, TYPES, PROPS_LE, PROPS_PLE, CONTEXT, MEDIA, CONTAINER, CONDLABEL, CONDSYM, CC_NAMES, NOTEVALS, TRACKOPS, GENOP, NAMEOPS, OPLABEL, FUNCS, TOOL, USES_ACTIONS } from './defs.js'

const find = (list, v) => list.find(x => x.v === +v)
export const ticksText = (t) => { const nv = NOTEVALS.find(n => n.v === t); return nv ? nv.label : t + ' Ticks' }
export function barText(a, b) {
  const beats = [0, 480, 960, 1440]
  for (let i = 0; i < 4; i++) if (a <= beats[i] && b >= beats[i] && (b - a) <= 240 && a >= beats[i] - 120) return 'Zählzeit ' + (i + 1) + (a === beats[i] && b === beats[i] ? '' : ' ±' + Math.max(beats[i] - a, b - beats[i]))
  if (a % 120 === 0 && (b + 1) % 120 === 0) { const c1 = a / 120 + 1, c2 = (b + 1) / 120; return c1 === c2 ? '16tel ' + c1 : '16tel ' + c1 + '–' + c2 }
  return a + '–' + b + ' Ticks'
}
function rng(cd, p1, p2, f) {
  if (cd === 207) return f(p1) + ' – ' + f(p2)
  if (cd === 209) return 'außer ' + f(p1) + ' – ' + f(p2)
  return (cd === 200 ? '' : CONDSYM[cd] + ' ') + f(p1)
}
export function chipValue(c, tool) {
  const cd = +c.cond, p1 = c.p1, p2 = c.p2
  switch (c.t) {
    case 'type': return cd === 214 ? 'alle' : (cd === 201 ? '≠ ' : '') + (find(TYPES, p1)?.label ?? p1)
    case 'pitch': return rng(cd, p1, p2, v => noteName(parseNote(v)))
    case 'ccnum': return rng(cd, p1, p2, v => { const n = Math.round(num(v)); return 'CC ' + n + (CC_NAMES[n] ? ' ' + CC_NAMES[n] : '') })
    case 'velocity': case 'ccval': case 'subtype': case 'mainvalue': return rng(cd, p1, p2, v => fmt(num(v)))
    case 'channel': return rng(cd, p1, p2, v => String(Math.round(num(v))))
    case 'barpos': return (cd === 208 ? 'nicht ' : '') + barText(+p1, +p2)
    case 'timepos': return CONDLABEL[cd] ?? String(cd)
    case 'length': return rng(cd, p1, p2, v => c.unit === 's' ? fmt(num(v)) + ' s' : ticksText(Math.round(num(v))))
    case 'property': return (cd === 212 ? 'nicht ' : '') + ((tool === 'PLE' ? PROPS_PLE : PROPS_LE).find(p => p.v === +p1)?.label ?? p1).toLowerCase()
    case 'context': { const x = find(CONTEXT, p1); return (x?.label ?? 'Variable ' + p1) + (x?.p2 ? ' ' + (CONDSYM[cd] || '=') + ' ' + p2 : '') }
    case 'lastevent': return 'Eintrag ' + p1 + ' ' + (CONDSYM[cd] || '=') + ' ' + p2
    case 'container': return cd === 214 ? 'alle' : (cd === 201 ? '≠ ' : '') + (find(CONTAINER, p1)?.label ?? p1)
    case 'media': return cd === 214 ? 'alle' : (cd === 201 ? '≠ ' : '') + (find(MEDIA, p1)?.label ?? p1)
    case 'name': case 'color': return (cd === 200 ? '= ' : cd === 210 ? 'enthält ' : 'enthält nicht ') + '„' + p1 + '“'
    case 'raw': return c.obj.cls.replace(/^le|Target$/g, '') + ' · ' + (LE.CODES.conditions[c.obj.cond] ?? c.obj.cond)
  }
  return ''
}
export function chipUnverified(c, tool) {
  const d = CHIPDEF[c.t]
  if (d.unverified) return true
  if (c.t === 'type') return !!find(TYPES, c.p1)?.unverified
  if (c.t === 'timepos') return +c.cond === 219 || +c.cond === 222
  if (c.t === 'context') return !!find(CONTEXT, c.p1)?.unverified
  if (c.t === 'property') return !!(tool === 'PLE' ? PROPS_PLE : PROPS_LE).find(p => p.v === +c.p1)?.unverified
  if (c.t === 'media') return !!find(MEDIA, c.p1)?.unverified
  return c.t === 'length' && c.unit === 's'
}
export function actionUnverified(a) {
  if (ACTDEF[a.t].unverified) return true
  if (a.t === 'trackop') return !!find(TRACKOPS, a.op)?.unverified
  if (a.t === 'type') return !!find(TYPES, a.p1)?.unverified
  return false
}
export function actionValue(a) {
  const op = +a.op
  switch (a.t) {
    case 'raw': return a.obj.cls.replace(/^leActionTarget|^ActionTarget/, '') + ' · ' + (LE.CODES.operations[a.obj.op] ?? a.obj.op)
    case 'nxp': return 'entfernen'
    case 'type': return '→ ' + (find(TYPES, a.p1)?.label ?? a.p1)
    case 'channel': return op === 312 ? '→ ' + a.p1 : OPLABEL[op] + ' ' + a.p1
    case 'trackop': { const T = find(TRACKOPS, op) ?? { label: 'Op ' + op }; return T.label + (T.slot ? ' ' + a.p2 : '') + ' ' + ((T.modes || GENOP)[+a.p1] ?? '') }
    case 'plename': { const N = find(NAMEOPS, op) ?? { label: 'Op ' + op }; return N.label + ' „' + a.p1 + '“' + (N.p2 ? ' → „' + a.p2 + '“' : '') }
    case 'plecolor': return '→ ' + a.p1
    case 'trim': return '× ' + fmt(num(a.p1))
    case 'pitch': if (op === 312) return '→ ' + noteName(parseNote(a.p1)); if (op === 304 || op === 306) return OPLABEL[op] + ' ' + a.p1 + ' HT'; break
    case 'ccnum': if (op === 312) return '→ CC ' + a.p1 + (CC_NAMES[+a.p1] ? ' ' + CC_NAMES[+a.p1] : ''); break
  }
  const unit = (a.t === 'position' || a.t === 'length') ? (a.unit === 'ms' ? ' ms' : (op === 307 || op === 308 ? '' : ' Ticks')) : ''
  if (op === 312) return '→ ' + fmt(num(a.p1)) + unit
  if (op === 310 || op === 311 || op === 317) return OPLABEL[op] + ' ' + fmt(num(a.p1)) + unit + ' … ' + fmt(num(a.p2)) + unit
  if (op === 309) return 'Runden ' + fmt(num(a.p1)) + unit
  return OPLABEL[op] + ' ' + fmt(num(a.p1)) + unit
}
function groupText(g, tool, isRoot) {
  const eff = g.items.filter(it => it.type === 'chip' || it.items.length)
  if (!eff.length) return isRoot ? 'alle ' + TOOL[tool].objects : ''
  return eff.map(it => {
    if (it.type === 'chip') return CHIPDEF[it.t].label + ' ' + chipValue(it, tool)
    const n = it.items.filter(x => x.type === 'chip' || x.items.length).length
    return n >= 2 ? '(' + groupText(it, tool, false) + ')' : groupText(it, tool, false)
  }).join(g.bool === 103 ? ' und ' : ' oder ')
}
export function funcLabel(func, tool) { const F = FUNCS[func] ?? FUNCS[1]; return (tool === 'TR' || tool === 'IT') && F.rt ? F.rt.label : F.label }
export function summary(S) {
  let s = funcLabel(S.func, S.tool) + ': ' + groupText(S.root, S.tool, true)
  if (USES_ACTIONS[S.func] && S.actions.length) s += ' → ' + S.actions.map(a => ACTDEF[a.t].label + ' ' + actionValue(a)).join(', ')
  return s
}

/* Cubase-Ansicht: Zeilen so, wie sie im Logical Editor stehen (englische Cubase-Begriffe) */
function pval(o) {
  if (o == null) return ''
  if (typeof o === 'number') return String(o)
  if (o.type === 'val12' || o.type === 'val4') return String(Math.round(o.value * 1000) / 1000)
  if (o.type === 'str') return '"' + o.str + '"'
  const td = LE.timeDiffValue(o); if (td) return (td.kind === 1 ? td.value.toFixed(3) + ' s' : String(td.value))
  return o.cls.replace(/^Le/, '')
}
export function cubaseRows(d) {
  const C = LE.CODES, rows = [], toks = d.filters; let open = 0, ctxNote = false, ctxCC = false
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]
    if (t.type === 'token') {
      if (t.token === 101) open++
      else if (t.token === 102) { if (rows.length) rows[rows.length - 1].rb += ')' }
      else if (rows.length) rows[rows.length - 1].bool = t.token === 103 ? 'And' : 'Or'
      continue
    }
    if (t.type !== 'cond') { rows.push({ lb: '('.repeat(open), target: t.cls, cond: '', p1: '', p2: '', rb: '', bool: '' }); open = 0; continue }
    const objs = t.items.filter(x => typeof x !== 'number'), ints = t.items.filter(x => typeof x === 'number')
    let target = C.filterTargets[t.cls] ?? t.cls, p1 = pval(objs[0]), p2 = pval(objs[1])
    if (t.cls === 'leTypesTarget' && objs[0]) { p1 = C.eventTypes[objs[0].value] ?? p1; p2 = ''; if (objs[0].value === 0) ctxNote = true; if (objs[0].value === 2) ctxCC = true }
    if (t.cls === 'leContextTypeTarget') { p1 = C.contextVars[ints[0]] ?? String(ints[0]); p2 = ints.length > 1 ? String(ints[1]) : pval(objs[0]) }
    if (t.cls === 'leFlagsTarget' && objs[0]) { p1 = C.properties[objs[0].value] ?? p1; p2 = '' }
    if (t.cls === 'leContainerTypeTarget' && objs[0]) { p1 = C.containerTypes[objs[0].value] ?? p1; p2 = '' }
    if (t.cls === 'leMediaTypeTarget' && objs[0]) { p1 = C.mediaTypes[objs[0].value] ?? p1; p2 = '' }
    if (t.cls === 'leChannelTarget' && objs[0]) { p1 = String(objs[0].value + 1); p2 = objs[1] ? String(objs[1].value + 1) : '' }
    if ((t.cls === 'SubTypeTarget' || t.cls === 'leValue1Target') && ctxNote) { target = 'Pitch'; if (objs[0]) p1 = LE.noteName(objs[0].value); if (objs[1]) p2 = LE.noteName(objs[1].value) }
    if ((t.cls === 'MainValueTarget' || t.cls === 'leValue2Target') && ctxNote) target = 'Velocity'
    if ((t.cls === 'SubTypeTarget' || t.cls === 'leValue1Target') && ctxCC) target = 'Controller No.'
    const two = [206, 207, 208, 209].includes(t.cond) || (t.cls === 'leContextTypeTarget')
    if (!two && t.cls !== 'leContextTypeTarget') p2 = ''
    if (t.cond >= 216 && t.cond <= 222) { p1 = ''; p2 = '' }
    if (t.cond === 214) { p1 = ''; p2 = '' }
    rows.push({ lb: '('.repeat(open), target, cond: C.conditions[t.cond] ?? String(t.cond), p1, p2, rb: '', bool: '' })
    open = 0
  }
  // äußeres Klammerpaar, das Cubase selbst setzt, nicht doppelt zeigen
  if (rows.length && rows[0].lb.startsWith('(') && rows[rows.length - 1].rb.endsWith(')')) { rows[0].lb = rows[0].lb.slice(1); rows[rows.length - 1].rb = rows[rows.length - 1].rb.slice(1) }
  const acts = d.actions.map(o => {
    const objs = (o.items || []).filter(x => typeof x !== 'number')
    let p1 = pval(objs[0]), p2 = pval(objs[1])
    if (o.target === 4012) { p1 = C.genericOp[objs[0]?.value] ?? p1; if (o.op !== 370 && o.op !== 371) p2 = '' }
    if (o.target === 4006 && objs[0]) { p1 = C.eventTypes[objs[0].value] ?? p1; p2 = '' }
    if (o.target === 4005 && objs[0] && o.op === 312) p1 = String(objs[0].value + 1)
    if (![310, 311, 317, 329, 330, 370, 371].includes(o.op) && o.target !== 4007) p2 = ''
    return { target: C.actionTargets[o.target] ?? String(o.target), op: C.operations[o.op] ?? String(o.op), p1, p2 }
  })
  return { rows, acts, func: C.functions[d.trailer?.[1]] ?? '' }
}
