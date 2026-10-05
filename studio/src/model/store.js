// Zentraler Zustand + Befehle (Rückgängig, Import, Export, Validierung).
import { reactive, computed, watch, toRaw, markRaw } from 'vue'
import { LE, rawClone, uid } from './util.js'
import { TOOL, CHIPDEF, ACTDEF, USES_ACTIONS, FUNCS } from './defs.js'
import { mkChip, mkGroup, mkAction, buildDoc, docToState, ctxOfRoot } from './doc.js'
import { chipUnverified, actionUnverified, chipValue, funcLabel } from './text.js'
import { RECIPES } from './recipes.js'
import TIME_TPL from '../../../data/time-templates.json'

const DOCKEYS = ['tool', 'style', 'outer', 'orig', 'cmdRaw', 'name', 'category', 'comment', 'commentRaw', 'commentOrig', 'func', 'root', 'actions']
export const S = reactive({
  tool: 'LE', style: 'modern', outer: true, orig: null, cmdRaw: null, name: 'Hi-Hats auf 2 und 4 leiser', category: '', comment: '', commentRaw: null, commentOrig: null,
  func: 1, root: mkGroup(103, []), actions: [],
  sel: null, clip: 'drums', previewMode: 'after', bottomTab: 'preview', expert: false,
  dragging: false, source: null
})

/* ---------- Baum-Helfer ---------- */
export function findParent(g, id) {
  for (let i = 0; i < g.items.length; i++) { const it = g.items[i]; if (it.id === id) return { parent: g, index: i, item: it }; if (it.type === 'group') { const r = findParent(it, id); if (r) return r } }
  return null
}
export function findGroup(g, id) { if (g.id === id) return g; for (const it of g.items) if (it.type === 'group') { const r = findGroup(it, id); if (r) return r } return null }
export const contains = (g, t) => g === t || (g.type === 'group' && g.items.some(it => contains(it, t)))
export function allChips(g, acc = []) { for (const it of g.items) { if (it.type === 'chip') acc.push(it); else allChips(it, acc) } return acc }
export function depthOf(g) { let d = 0; for (const it of g.items) if (it.type === 'group' && it.items.length) d = Math.max(d, 1 + depthOf(it)); return d }
function prune(g) { g.items = g.items.filter(it => it.type === 'chip' || (prune(it), it.items.length > 0)); for (const it of g.items) if (it.type === 'group' && it.items.length === 1 && g !== null) { /* Einzelgruppe bleibt sichtbar, wird beim Export nicht geklammert */ } }

/* ---------- Rückgängig ---------- */
const hist = { past: [], future: [], lock: false, last: '' }
const snap = () => { const o = {}; for (const k of DOCKEYS) o[k] = k === 'orig' ? S[k] : rawClone(toRaw(S[k])); return o }
const sig = () => JSON.stringify(DOCKEYS.map(k => k === 'commentRaw' || k === 'cmdRaw' || k === 'orig' ? !!S[k] : S[k]))
let timer = null
export function startHistory() {
  hist.last = sig(); hist.base = snap()
  watch(() => DOCKEYS.map(k => S[k]), () => {
    if (hist.lock) return
    clearTimeout(timer)
    timer = setTimeout(() => { const s = sig(); if (s === hist.last) return; hist.past.push(hist.base); if (hist.past.length > 200) hist.past.shift(); hist.future = []; hist.base = snap(); hist.last = s }, 250)
  }, { deep: true })
}
function restore(o) { hist.lock = true; for (const k of DOCKEYS) S[k] = k === 'orig' ? o[k] : rawClone(o[k]); S.sel = null; hist.base = snap(); hist.last = sig(); setTimeout(() => { hist.lock = false }, 0) }
export function undo() { clearTimeout(timer); if (!hist.past.length) return false; hist.future.push(snap()); restore(hist.past.pop()); return true }
export function redo() { if (!hist.future.length) return false; hist.past.push(snap()); restore(hist.future.pop()); return true }
export const canUndo = () => hist.past.length > 0

/* ---------- Befehle ---------- */
export function newPreset(tool = S.tool) {
  Object.assign(S, { tool, style: 'modern', outer: true, orig: null, cmdRaw: null, name: 'Neues Preset', category: '', comment: '', commentRaw: null, commentOrig: null, func: 1, root: mkGroup(103, tool === 'PLE' ? [mkChip('container', { p1: 1 })] : [mkChip('type', { p1: 0 })]), actions: [], sel: null, source: null })
}
export function loadRecipe(r) {
  const build = (items) => items.map(x => x.group ? mkGroup(x.group, build(x.items)) : mkChip(x.t, Object.fromEntries(Object.entries(x).filter(([k]) => k !== 't'))))
  Object.assign(S, { tool: r.tool, func: r.func, style: 'modern', outer: true, orig: null, cmdRaw: null, comment: '', commentRaw: null, commentOrig: null, category: '', name: r.name, sel: null, source: { kind: 'recipe', name: r.name } })
  S.root = mkGroup(103, build(r.items))
  S.actions = r.actions.map(a => mkAction(a.t, Object.fromEntries(Object.entries(a).filter(([k]) => k !== 't'))))
  if (r.tool !== 'PLE') S.clip = r.cat === 'Controller' ? 'cc' : /Akkord|Stimme|Oktave|Noten |Notenlänge|früher|Leise/.test(r.name) ? 'keys' : 'drums'
}
export function setTool(id) {
  if (S.tool === id) return
  S.tool = id; const t = TOOL[id]
  if (!t.funcs.includes(S.func)) S.func = t.funcs[0]
  for (const c of allChips(S.root)) if (c.t !== 'raw' && !CHIPDEF[c.t].tools.includes(id)) { const r = findParent(S.root, c.id); r?.parent.items.splice(r.index, 1) }
  S.actions = S.actions.filter(a => a.t === 'raw' || ACTDEF[a.t].tools.includes(id))
  S.sel = null
}
export function addChip(t, groupId, index) {
  const c = mkChip(t); if (t === 'property' && S.tool === 'PLE') c.p1 = 1
  const g = (groupId && findGroup(S.root, groupId)) || S.root
  g.items.splice(index ?? g.items.length, 0, c); S.sel = { kind: 'chip', id: c.id }; return c
}
export function addAction(t, index) { const a = mkAction(t); S.actions.splice(index ?? S.actions.length, 0, a); if (!USES_ACTIONS[S.func]) S.func = 1; S.sel = { kind: 'action', id: a.id }; return a }
export function removeItem(id) {
  const r = findParent(S.root, id); if (r) { r.parent.items.splice(r.index, 1); cleanupGroups(S.root) }
  const i = S.actions.findIndex(a => a.id === id); if (i >= 0) S.actions.splice(i, 1)
  if (S.sel?.id === id) S.sel = null
}
export function duplicateItem(id) {
  const r = findParent(S.root, id)
  if (r) { const c = rawClone(toRaw(r.item)); const re = (x) => { x.id = uid(); if (x.items) x.items.forEach(re) }; re(c); delete c.src; r.parent.items.splice(r.index + 1, 0, c); S.sel = { kind: 'chip', id: c.id }; return }
  const i = S.actions.findIndex(a => a.id === id); if (i >= 0) { const a = rawClone(toRaw(S.actions[i])); a.id = uid(); delete a.src; S.actions.splice(i + 1, 0, a); S.sel = { kind: 'action', id: a.id } }
}
export function cleanupGroups(g) { for (const it of g.items) if (it.type === 'group') cleanupGroups(it); g.items = g.items.filter(it => it.type === 'chip' || it.items.length > 0) }
export function wrapInGroup(id) {
  const r = findParent(S.root, id); if (!r) return
  const g = mkGroup(r.parent.bool === 103 ? 104 : 103, [r.item]); r.parent.items.splice(r.index, 1, g)
}
export function ungroup(id) {
  const r = findParent(S.root, id); if (!r || r.item.type !== 'group') return
  r.parent.items.splice(r.index, 1, ...r.item.items)
}
export function moveNode(fromGid, oldIndex, toGid, newIndex) {
  const src = findGroup(S.root, fromGid), dst = findGroup(S.root, toGid); if (!src || !dst) return
  const it = src.items[oldIndex]; if (!it || (it.type === 'group' && contains(it, dst))) return
  src.items.splice(oldIndex, 1); dst.items.splice(newIndex, 0, it); cleanupGroups(S.root)
}
export function moveIntoNewGroup(fromGid, oldIndex, targetGid) {
  const src = findGroup(S.root, fromGid), dst = findGroup(S.root, targetGid); if (!src || !dst) return
  const it = src.items[oldIndex]; if (!it || (it.type === 'group' && contains(it, dst))) return
  src.items.splice(oldIndex, 1); dst.items.push(mkGroup(dst.bool === 103 ? 104 : 103, [it])); cleanupGroups(S.root)
}
export function moveAction(oldIndex, newIndex) { const it = S.actions[oldIndex]; if (!it) return; S.actions.splice(oldIndex, 1); S.actions.splice(newIndex, 0, it) }

/* ---------- Abgeleitete Werte ---------- */
export const ctx = computed(() => ctxOfRoot(S.root))
export const tool = computed(() => TOOL[S.tool])
export const built = computed(() => {
  try {
    const doc = buildDoc(S, TIME_TPL), bytes = LE.encode(doc), dec = LE.decode(bytes), ok = LE.bytesEqual(LE.encode(dec), bytes) && !dec.errors.length
    return { doc, bytes, dec, ok, err: null }
  } catch (e) { return { doc: null, bytes: new Uint8Array(0), dec: null, ok: false, err: e.message } }
})
export const selected = computed(() => {
  if (!S.sel) return null
  if (S.sel.kind === 'chip') return findParent(S.root, S.sel.id)?.item ?? null
  return S.actions.find(a => a.id === S.sel.id) ?? null
})
// Nur echte Probleme. level: error (Export gesperrt) | warn | info
export const issues = computed(() => {
  const out = [], chips = allChips(S.root), b = built.value, t = S.tool
  if (b.err) out.push({ level: 'error', text: 'Datei kann nicht erzeugt werden: ' + b.err })
  else if (!b.ok) out.push({ level: 'error', text: 'Interner Prüffehler: erzeugte Datei liest sich nicht identisch zurück.' })
  if (depthOf(S.root) > 3) out.push({ level: 'error', text: 'Mehr als drei Klammerebenen. Cubase verarbeitet höchstens drei.' })
  if (t !== 'PLE' && !ctx.value) for (const c of chips) if (['pitch', 'velocity', 'ccnum', 'ccval'].includes(c.t)) { out.push({ level: 'warn', id: c.id, text: `„${CHIPDEF[c.t].label}“ ohne Event-Typ gilt für alle Event-Arten (z. B. auch Controller-Werte).` }); break }
  if (ctx.value === 'other') for (const c of chips) if (['pitch', 'velocity', 'ccnum', 'ccval'].includes(c.t)) { out.push({ level: 'warn', id: c.id, text: 'Mehrere Event-Typen gesetzt: Tonhöhe/Velocity bedeuten je Typ etwas anderes.' }); break }
  if ((t === 'TR' || t === 'IT') && chips.some(c => c.t === 'type' && +c.p1 > 6)) out.push({ level: 'error', text: 'Transformer und Input Transformer kennen nur die Event-Typen bis SysEx.' })
  if (S.func === 1 && !S.actions.length) out.push({ level: 'warn', text: 'Transformieren ohne Aktion ändert nichts.' })
  if (!USES_ACTIONS[S.func] && S.actions.length) out.push({ level: 'info', text: `„${funcLabel(S.func, t)}“ führt keine Aktionen aus. Die Aktionen werden gespeichert, aber nicht angewendet.` })
  for (const c of chips) if (chipUnverified(c, t)) out.push({ level: 'info', id: c.id, text: `„${CHIPDEF[c.t].label}: ${chipValue(c, t)}“ nutzt einen Code, der noch nicht mit einer Cubase-15-Datei abgeglichen ist.` })
  for (const a of S.actions) if (actionUnverified(a)) out.push({ level: 'info', id: a.id, text: `Aktion „${ACTDEF[a.t].label}“ nutzt eine Schreibweise, die noch nicht in Cubase 15 geladen wurde.` })
  if (FUNCS[S.func]?.unverified) out.push({ level: 'info', text: `Funktion „${FUNCS[S.func].label}“: Code noch nicht mit einer Cubase-15-Datei abgeglichen.` })
  return out
})
export const issuesById = computed(() => { const m = {}; for (const i of issues.value) if (i.id) (m[i.id] ||= []).push(i); return m })

/* ---------- Import / Export ---------- */
export function importText(text, fname) {
  const px = LE.parseXml(text), d = LE.decode(px.bytes), st = docToState(d, px.root)
  Object.assign(S, { tool: st.tool, root: st.root, outer: st.outer, orig: markRaw(st.orig), cmdRaw: st.cmdRaw, actions: st.actions, func: st.func, comment: st.comment, commentRaw: st.commentRaw, commentOrig: st.comment, style: st.style,
    name: (fname || 'Import').replace(/\.xml$/i, ''), category: '', sel: null, source: { kind: 'file', name: fname } })
  const raws = allChips(S.root).filter(c => c.t === 'raw').length + S.actions.filter(a => a.t === 'raw').length
  const same = LE.bytesEqual(LE.encode(buildDoc(S, TIME_TPL)), px.bytes)
  return { bytes: px.bytes.length, raws, same, legacy: d.magic !== 0x4000, errors: d.errors }
}
export const fileName = computed(() => (S.name.trim() || 'Preset').replace(/[\\/:*?"<>|]/g, '_') + '.xml')
export const xmlText = () => LE.toXml(tool.value.root, built.value.bytes, 1)
export const presetFolder = (os) => {
  const cat = S.category.trim() ? (os === 'win' ? '\\' : '/') + S.category.trim().replace(/[\\/:*?"<>|]/g, '_') : ''
  return os === 'win' ? '%USERPROFILE%\\Documents\\Steinberg\\Cubase 15\\User Presets\\' + tool.value.folder + cat + '\\' : '~/Documents/Steinberg/Cubase 15/User Presets/' + tool.value.folder + cat + '/'
}
export { RECIPES, TIME_TPL }
