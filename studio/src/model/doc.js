// Abbildung Editor-Modell ⇄ Preset-Dokument (LE-Core). Unveränderte importierte Zeilen bleiben byteidentisch.
import { LE, uid, parseNote, num, usesP2 } from './util.js'
import { TOOL, CHIPDEF, ACTDEF, NUMC } from './defs.js'
const M = LE.make

export function mkChip(t, over) { const d = CHIPDEF[t], c = { id: uid(), type: 'chip', t, cond: 200, p1: 0, p2: 0 }; Object.assign(c, structuredClone(d.def)); if (over) Object.assign(c, over); return c }
export function mkGroup(bool, items) { return { id: uid(), type: 'group', bool: bool || 103, items: items || [] } }
export function mkAction(t, over) { const d = ACTDEF[t], a = { id: uid(), t, op: 312, p1: 0, p2: 0 }; Object.assign(a, structuredClone(d.def)); if (over) Object.assign(a, over); return a }

export function ctxOfRoot(root) {
  const ts = root.items.filter(i => i.type === 'chip' && i.t === 'type' && +i.cond === 200).map(i => +i.p1)
  if (ts.length !== 1) return ts.length ? 'other' : ''
  return ts[0] === 0 ? 'note' : ts[0] === 2 ? 'cc' : 'other'
}
export const chipSig = (c) => [c.t, +c.cond, String(c.p1), String(c.p2), c.unit || ''].join('|')
export const actSig = (a) => [a.t, +a.op, String(a.p1), String(a.p2), a.unit || ''].join('|')

export function chipToCond(c, env) {
  if (c.src && c.sig === chipSig(c)) return c.src
  const modern = env.style === 'modern', cond = +c.cond, p1 = c.p1, p2 = c.p2, tool = env.tool
  switch (c.t) {
    case 'type': return M.type(cond, +p1, tool.typeMax)
    case 'pitch': case 'ccnum': case 'subtype': {
      const a = parseNote(p1), b = usesP2(cond) ? parseNote(p2) : 0, sctx = c.t === 'pitch' ? 'note' : c.t === 'ccnum' ? 'cc' : ''
      return modern ? M.subType13(cond, a, b, sctx) : M.value1(cond, a, b)
    }
    case 'velocity': case 'ccval': case 'mainvalue': { const a = num(p1), b = usesP2(cond) ? num(p2) : 0; return modern ? M.mainValue13(cond, a, b) : M.value2(cond, a, b) }
    case 'channel': return M.channel(cond, Math.max(0, num(p1) - 1), usesP2(cond) ? Math.max(0, num(p2) - 1) : 0)
    case 'barpos': return M.position(cond, Math.round(num(p1)), Math.round(num(p2)))
    case 'timepos': return M.positionTime(cond, env.timeTpl)
    case 'length': return c.unit === 's' ? M.lengthTime(cond, num(p1), usesP2(cond) ? num(p2) : 0) : M.length(cond, Math.round(num(p1)), usesP2(cond) ? Math.round(num(p2)) : 0)
    case 'property': return M.property(cond, +p1, tool.propMax)
    case 'context': return M.context(cond, +p1, +p2 || 0)
    case 'lastevent': return M.history(cond, +p1, +p2)
    case 'container': return M.container(cond, +p1)
    case 'media': return M.media(cond, +p1)
    case 'name': return M.name(cond, String(p1 ?? ''))
    case 'color': return M.color(cond, String(p1 ?? ''))
    case 'raw': return c.obj
  }
  throw new Error('Unbekannter Baustein ' + c.t)
}
export function actionToDoc(a, env) {
  if (a.src && a.sig === actSig(a)) return a.src
  const modern = env.style === 'modern', op = +a.op, tool = env.tool
  switch (a.t) {
    case 'pitch': case 'ccnum': case 'subtype': {
      const p1 = parseNote(a.p1), p2 = parseNote(a.p2), sctx = a.t === 'pitch' ? 'note' : a.t === 'ccnum' ? 'cc' : ''
      if (op === 307 || op === 308) return M.actFloat(4002, op, num(a.p1))
      return modern && op !== 309 && op !== 317 ? M.actSubType13(op, p1, p2, sctx) : M.actInt(4002, op, p1, p2)
    }
    case 'velocity': case 'ccval': case 'mainvalue': {
      if (op === 307 || op === 308) return M.actFloat(4003, op, num(a.p1))
      if (modern && op === 312) return a.t === 'velocity' ? M.actVelocityFixed13(num(a.p1)) : M.actMainValueFixed13(num(a.p1))
      return M.actInt(4003, op, Math.round(num(a.p1)), Math.round(num(a.p2)))
    }
    case 'channel': return M.actChannel(op, op === 312 ? Math.max(0, num(a.p1) - 1) : num(a.p1))
    case 'type': return M.actType(op, +a.p1, tool.typeMax)
    case 'position': return a.unit === 'ms' ? M.actPositionTime(op, num(a.p1) / 1000) : M.actPositionTicks(op, op === 307 || op === 308 ? num(a.p1) : Math.round(num(a.p1)), Math.round(num(a.p2)))
    case 'length': return a.unit === 'ms' && (op === 304 || op === 306) ? M.actLengthTime(op, num(a.p1) / 1000) : M.actLength(op, num(a.p1), num(a.p2))
    case 'nxp': return M.actNXP(op)
    case 'trackop': return M.trackOp(op, +a.p1, +a.p2 || 1)
    case 'plename': return M.actName(op, String(a.p1 ?? ''), op === 330 ? String(a.p2 ?? '') : +a.p2 || 0)
    case 'plecolor': return M.actColor(String(a.p1 || 'Color 1'))
    case 'trim': return M.actTrim(op, num(a.p1))
    case 'raw': return a.obj
  }
  throw new Error('Unbekannte Aktion ' + a.t)
}
// Baum → Token-Liste. Wurzel in ( ) wie Cubase; Gruppen ab zwei Einträgen bekommen Klammern; wrap = redundante Klammern aus Importen.
export function groupTokens(g, env, isRoot) {
  const eff = g.items.filter(it => it.type === 'chip' || it.items.length); let out = []
  if (!eff.length) return out
  eff.forEach((it, i) => {
    let sub = it.type === 'chip' ? [chipToCond(it, env)] : groupTokens(it, env, false)
    for (let w = 0; w < (it.wrap || 0); w++) sub = [LE.tok(101), ...sub, LE.tok(102)]
    out = out.concat(sub)
    if (i < eff.length - 1) out.push(LE.tok(g.bool))
  })
  const pairs = (isRoot ? (env.outer === false ? 0 : 1) : (eff.length >= 2 ? 1 : 0)) + (isRoot ? (g.wrap || 0) : 0)
  for (let k = 0; k < pairs; k++) { out.unshift(LE.tok(101)); out.push(LE.tok(102)) }
  return out
}
// Struktur-Signatur des Bedingungsbaums: unverändert importierte Bäume werden Token für Token wie im Original geschrieben
// (auch gemischte Und/Oder-Ketten ohne Klammern, die der Editor sonst eindeutig klammern würde).
export function treeSig(g) {
  return JSON.stringify([g.bool, g.wrap || 0, g.items.map(it => it.type === 'chip' ? [it.t === 'raw' ? 'raw:' + it.id : chipSig(it), it.wrap || 0] : JSON.parse(treeSig(it)))])
}
export function buildDoc(S, timeTpl) {
  const tool = TOOL[S.tool], env = { ctx: ctxOfRoot(S.root), style: S.style, tool, outer: S.outer, timeTpl }
  const filters = (S.orig && S.orig.sig === treeSig(S.root) && S.orig.outer === S.outer) ? S.orig.filters : groupTokens(S.root, env, true)
  let comment
  if (S.commentRaw && S.comment === S.commentOrig) comment = S.commentRaw
  else { const cb = S.comment ? LE.utf8Encode(S.comment) : null; comment = new Uint8Array(cb ? cb.length + 1 : 0); if (cb) comment.set(cb) }
  const trailer = M.trailer(S.func, S.tool === 'PLE'); let cmd = null
  if (S.cmdRaw && S.cmdRaw.length) { trailer[0] = S.cmdRaw.length; cmd = S.cmdRaw }
  return { magic: 0x4000, one: tool.one, comment, actions: S.actions.map(a => actionToDoc(a, env)), filters, trailer, cmd }
}

/* ---------- Import ---------- */
const isV = (o) => o && typeof o === 'object' && (o.type === 'val12' || o.type === 'val4')
function condToChip0(o, ctx) {
  const objs = o.items.filter(x => typeof x !== 'number'), ints = o.items.filter(x => typeof x === 'number')
  const c = { id: uid(), type: 'chip', t: 'raw', cond: o.cond, p1: 0, p2: 0, obj: o }, cls = o.cls, cd = o.cond
  const v0 = isV(objs[0]) ? objs[0].value : null, v1 = isV(objs[1]) ? objs[1].value : null
  const set = (t, p1, p2, extra) => { c.t = t; c.p1 = p1; c.p2 = p2 == null ? p1 : p2; delete c.obj; if (extra) Object.assign(c, extra); return c }
  if (cls === 'leTypesTarget' && v0 != null && [200, 201, 214].includes(cd)) return set('type', v0, 0)
  if ((cls === 'leValue1Target' || cls === 'SubTypeTarget') && v0 != null && v1 != null && NUMC.includes(cd)) return set(ctx === 'note' ? 'pitch' : ctx === 'cc' ? 'ccnum' : 'subtype', v0, v1)
  if ((cls === 'leValue2Target' || cls === 'MainValueTarget') && v0 != null && v1 != null && NUMC.includes(cd)) return set(ctx === 'note' ? 'velocity' : ctx === 'cc' ? 'ccval' : 'mainvalue', v0, v1)
  if (cls === 'leChannelTarget' && v0 != null && v1 != null && CHIPDEF.channel.conds.includes(cd)) return set('channel', v0 + 1, v1 + 1)
  if (cls === 'lePositionTarget' && (cd === 206 || cd === 208) && v0 != null && v1 != null && objs[0].cls === 'LeUIntValue') return set('barpos', v0, v1)
  if (cls === 'lePositionTarget' && cd >= 216 && cd <= 222) return set('timepos', 0, 0)
  if (cls === 'leLengthTarget' && NUMC.includes(cd)) {
    if (v0 != null && v1 != null && objs[0].cls === 'LeUIntValue') return set('length', v0, v1, { unit: 'ticks' })
    const t0 = LE.timeDiffValue(objs[0]), t1 = LE.timeDiffValue(objs[1])
    if (t0 && t1 && t0.kind === 1 && t1.kind === 1) return set('length', Math.round(t0.value * 1e6) / 1e6, Math.round(t1.value * 1e6) / 1e6, { unit: 's' })
  }
  if (cls === 'leFlagsTarget' && v0 != null && (cd === 211 || cd === 212)) return set('property', v0, 0)
  if (cls === 'leContextTypeTarget' && ints.length >= 1 && CHIPDEF.context.conds.includes(cd)) return set('context', ints[0], ints.length > 1 ? ints[1] : (v0 ?? 0))
  if (cls === 'leHistoryTarget' && v0 != null && v1 != null) return set('lastevent', v0, v1)
  if (cls === 'leContainerTypeTarget' && v0 != null && CHIPDEF.container.conds.includes(cd)) return set('container', v0, 0)
  if (cls === 'leMediaTypeTarget' && v0 != null && CHIPDEF.media.conds.includes(cd)) return set('media', v0, 0)
  if (cls === 'leNameTypeTarget' && objs[0]?.type === 'str' && CHIPDEF.name.conds.includes(cd)) return set('name', objs[0].str, 0)
  if (cls === 'leColorTypeTarget' && objs[0]?.type === 'str' && CHIPDEF.color.conds.includes(cd)) return set('color', objs[0].str, 0)
  return c
}
function actionToCard0(o, ctx) {
  const objs = o.items.filter(x => typeof x !== 'number'), a = { id: uid(), t: 'raw', op: o.op, p1: 0, p2: 0, obj: o }, tg = o.target
  const v0 = isV(objs[0]) ? objs[0].value : null, v1 = isV(objs[1]) ? objs[1].value : null
  const set = (t, p1, p2, extra) => { a.t = t; a.p1 = p1; a.p2 = p2 ?? 0; delete a.obj; if (extra) Object.assign(a, extra); return a }
  const r = (v) => Math.round(v * 1000) / 1000
  if ((tg === 4002 || tg === 4025) && v0 != null && ACTDEF.pitch.ops.concat([307, 308, 317]).includes(o.op)) return set(ctx === 'note' ? 'pitch' : ctx === 'cc' ? 'ccnum' : 'subtype', r(v0), v1 == null ? 0 : r(v1))
  if ((tg === 4003 || tg === 4024 || tg === 4022) && v0 != null && ACTDEF.velocity.ops.includes(o.op)) return set(ctx === 'note' ? 'velocity' : ctx === 'cc' ? 'ccval' : 'mainvalue', r(v0), v1 == null ? 0 : r(v1))
  if (tg === 4005 && v0 != null && ACTDEF.channel.ops.includes(o.op)) return set('channel', o.op === 312 ? v0 + 1 : v0, 0)
  if (tg === 4006 && v0 != null && o.op === 312) return set('type', v0, 0)
  if (tg === 4000 && ACTDEF.position.ops.includes(o.op)) {
    if (v0 != null && (objs[0].cls === 'LeUIntValue' || objs[0].cls === 'LeUFloatValue')) return set('position', r(v0), v1 == null ? 0 : r(v1), { unit: 'ticks' })
    const td = LE.timeDiffValue(objs[0]); if (td && td.kind === 1 && (o.op === 304 || o.op === 306)) return set('position', r(td.value * 1000), 0, { unit: 'ms' })
  }
  if (tg === 4001 && ACTDEF.length.ops.includes(o.op)) {
    if (v0 != null && objs[0].cls === 'LeUFloatValue' && o.op !== 304 && o.op !== 306) return set('length', r(v0), v1 == null ? 0 : r(v1), { unit: 'ticks' })
    const td = LE.timeDiffValue(objs[0]); if (td && td.kind === 1 && (o.op === 304 || o.op === 306)) return set('length', r(td.value * 1000), 0, { unit: 'ms' })
  }
  if (tg === 4016 && o.op === 355) return set('nxp', 0, 0)
  if (tg === 4012 && v0 != null && ACTDEF.trackop.ops.includes(o.op)) return set('trackop', v0, v1 == null ? 1 : v1)
  if (tg === 4007 && objs[0]?.type === 'str' && ACTDEF.plename.ops.includes(o.op)) return set('plename', objs[0].str, objs[1] ? (objs[1].type === 'str' ? objs[1].str : objs[1].value) : 0)
  if (tg === 4014 && o.op === 312 && objs[0]?.type === 'str') return set('plecolor', objs[0].str, 0)
  if (tg === 4013 && o.op === 307 && v0 != null) return set('trim', r(v0), 0)
  return a
}
function condToChip(o, ctx) { const c = condToChip0(o, ctx); if (c.t !== 'raw') { c.src = o; c.sig = chipSig(c) } return c }
function actionToCard(o, ctx) { const a = actionToCard0(o, ctx); if (a.t !== 'raw') { a.src = o; a.sig = actSig(a) } return a }
function tokensToTree(toks, ctx) {
  let pos = 0
  function parseSeq() {
    let items = []; const bools = []
    while (pos < toks.length) {
      const t = toks[pos]
      if (t.type === 'token') {
        if (t.token === 101) { pos++; items.push(parseSeq()) }
        else if (t.token === 102) { pos++; break }
        else { bools.push(t.token); pos++ }
      } else { items.push(t.type === 'cond' ? condToChip(t, ctx) : { id: uid(), type: 'chip', t: 'raw', cond: 0, p1: 0, p2: 0, obj: t }); pos++ }
    }
    items = items.map(it => { if (it.type === 'group' && it.items.length === 1) { const x = it.items[0]; x.wrap = (x.wrap || 0) + 1; return x } return it })
    if (items.length <= 1) return mkGroup(bools[0] || 103, items)
    if (bools.every(b => b === bools[0])) return mkGroup(bools[0] || 103, items)
    let acc = mkGroup(bools[0], [items[0], items[1]])
    for (let i = 2; i < items.length; i++) { const b = bools[i - 1]; if (b === acc.bool) acc.items.push(items[i]); else acc = mkGroup(b, [acc, items[i]]) }
    return acc
  }
  const top = parseSeq(); let outer = true, root = top
  if (top.items.length === 1) { const only = top.items[0]; if (only.type === 'group') root = only; else if (only.wrap) only.wrap--; else outer = false }
  else if (top.items.length > 1) outer = false
  return { root, outer }
}
export function docToState(d, rootEl) {
  const known = { Logical_EditPreset: 'LE', Project_Logical_EditorPreset: 'PLE', TransformerPreset: 'TR', Input_TransformerPreset: 'IT' }
  const tool = known[rootEl] ?? (d.trailer?.[2] === 1 ? 'PLE' : 'LE')   // unbekanntes Wurzelelement (z. B. Makro-Export): Trailer entscheidet
  let ctx = ''
  const types = d.filters.filter(o => o.type === 'cond' && o.cls === 'leTypesTarget' && o.cond === 200)
  if (types.length === 1 && isV(types[0].items[0])) ctx = types[0].items[0].value === 0 ? 'note' : types[0].items[0].value === 2 ? 'cc' : 'other'; else if (types.length) ctx = 'other'
  const tt = tokensToTree(d.filters, ctx)
  const actions = d.actions.map(o => o.type === 'action' ? actionToCard(o, ctx) : { id: uid(), t: 'raw', op: 0, p1: 0, p2: 0, obj: o })
  const classes = JSON.stringify(d.filters.concat(d.actions).map(o => o.cls))
  const modern = /"(SubTypeTarget|MainValueTarget|ActionTargetSubType|ActionTargetMainValue|ActionTargetVelocity)"/.test(classes) || (d.trailer && d.trailer[4] === 0x1100)
  const orig = { filters: d.filters, sig: treeSig(tt.root), outer: tt.outer }
  return { tool, root: tt.root, outer: tt.outer, orig, actions, func: d.trailer?.length > 1 ? d.trailer[1] : 1, comment: LE.commentText(d), commentRaw: d.comment,
    cmdRaw: d.cmd?.length ? d.cmd : null, style: modern ? 'modern' : 'legacy' }
}
