<script setup>
// Piano-Roll der Vorschau (Canvas): Notenbereich, Velocity- bzw. Controller-Spur, Cycle und Cursor.
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { BAR, BARS, ENV } from '../model/simulate.js'
import { noteName } from '../model/util.js'
const props = defineProps({ events: Array, mode: String })
const box = ref(null), cv = ref(null), tip = ref(null)
let W = 600, ro = null
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
const notes = computed(() => props.events.filter(e => e.type === 0))
const ccs = computed(() => props.events.filter(e => e.type === 2))
const others = computed(() => props.events.filter(e => e.type !== 0 && e.type !== 2))
const H = computed(() => 206)
const GUT = 34, RULER = 18, LANE = computed(() => ccs.value.length ? 70 : 40)
function range() { const ps = notes.value.map(e => e.pitch); if (!ps.length) return [57, 69]; let lo = Math.min(...ps) - 1, hi = Math.max(...ps) + 1; if (hi - lo < 12) { const m = (lo + hi) >> 1; lo = m - 6; hi = m + 6 } return [lo, hi] }
const X = (t) => GUT + (t / (BAR * BARS)) * (W - GUT - 6)
function stateStyle(e, c) {
  const after = props.mode === 'after'
  if (!after) return e.hit ? { fill: c.acc, stroke: null, a: 1 } : { fill: c.note, stroke: null, a: 0.55 }
  switch (e.state) {
    case 'deleted': return { fill: null, stroke: c.del, a: 0.9, dash: true }
    case 'changed': return { fill: c.acc, stroke: null, a: 1 }
    case 'added': return { fill: c.acc, stroke: c.accHi, a: 0.75 }
    case 'moved': return { fill: null, stroke: c.acc, a: 1, dash: true }
    case 'hit': return { fill: c.acc, stroke: null, a: 1 }
    default: return { fill: c.note, stroke: null, a: e.sel ? 0.95 : 0.42 }
  }
}
function draw() {
  const el = cv.value; if (!el) return
  const dpr = window.devicePixelRatio || 1, h = H.value
  el.width = Math.round(W * dpr); el.height = Math.round(h * dpr); el.style.height = h + 'px'
  const g = el.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, h)
  const c = { bg: css('--le-canvas'), grid: css('--ui-border-muted'), bar: css('--ui-border-accented'), txt: css('--ui-text-dimmed'), note: css('--le-note'), acc: css('--color-brass-400'), accHi: css('--color-brass-200'), del: css('--le-del'), cyc: 'oklch(78.5% 0.12 75 / 0.07)', cur: css('--ui-text-toned'), sel: css('--ui-text-highlighted') }
  const lane = LANE.value, rollTop = RULER, rollH = h - RULER - lane - 6, laneTop = h - lane
  const [lo, hi] = range(), rows = hi - lo + 1, rh = Math.max(3, rollH / rows)
  g.font = '500 10px ' + css('--font-sans'); g.textBaseline = 'middle'
  // Cycle + Ruler
  g.fillStyle = c.cyc; g.fillRect(X(ENV.cycStart), 0, X(ENV.cycEnd) - X(ENV.cycStart), h)
  g.fillStyle = 'oklch(78.5% 0.12 75 / 0.35)'; g.fillRect(X(ENV.cycStart), 2, X(ENV.cycEnd) - X(ENV.cycStart), 3)
  for (let b = 0; b <= BARS * 4; b++) {
    const x = Math.round(X(b * 480)) + 0.5, isBar = b % 4 === 0
    g.strokeStyle = isBar ? c.bar : c.grid; g.lineWidth = 1; g.beginPath(); g.moveTo(x, isBar ? 8 : RULER - 4); g.lineTo(x, h); g.stroke()
    if (isBar && b < BARS * 4) { g.fillStyle = c.txt; g.fillText(String(b / 4 + 1), x + 4, 11) }
  }
  // Tastenraster
  for (let p = lo; p <= hi; p++) {
    const y = rollTop + (hi - p) * rh
    if ([1, 3, 6, 8, 10].includes(p % 12)) { g.fillStyle = 'oklch(0% 0 0 / 0.16)'; g.fillRect(GUT, y, W - GUT, rh) }
    if (p % 12 === 0 && rh >= 4) { g.fillStyle = c.txt; g.fillText(noteName(p), 3, y + rh / 2) }
  }
  g.strokeStyle = c.grid; g.beginPath(); g.moveTo(GUT, laneTop - 3.5); g.lineTo(W, laneTop - 3.5); g.stroke()
  g.fillStyle = c.txt; g.fillText(ccs.value.length ? 'CC' : 'Vel', 3, laneTop + 8)
  // Noten
  const hits = []
  for (const e of notes.value) {
    const s = stateStyle(e, c), x = X(e.pos), w = Math.max(3, X(e.pos + e.len) - x - 1), y = rollTop + (hi - e.pitch) * rh + 0.5, hgt = Math.max(2, rh - 1)
    g.globalAlpha = s.a
    if (s.fill) { g.fillStyle = s.fill; g.beginPath(); g.roundRect(x, y, w, hgt, 1.5); g.fill() }
    if (s.stroke) { g.setLineDash(s.dash ? [3, 2] : []); g.strokeStyle = s.stroke; g.lineWidth = 1; g.beginPath(); g.roundRect(x + .5, y + .5, w - 1, hgt - 1, 1.5); g.stroke(); g.setLineDash([]) }
    // Velocity
    if (!ccs.value.length && e.state !== 'deleted') { const vh = (e.vel / 127) * (lane - 8); g.fillStyle = s.fill || s.stroke; g.fillRect(x, laneTop + lane - vh - 2, 2, vh); g.beginPath(); g.arc(x + 1, laneTop + lane - vh - 2, 1.8, 0, 7); g.fill() }
    g.globalAlpha = 1
    hits.push({ x, y, w, h: hgt, e })
  }
  // Controller
  for (const e of ccs.value) {
    const s = stateStyle(e, c), x = X(e.pos), vh = (e.val / 127) * (lane - 10), y = laneTop + lane - vh - 2
    g.globalAlpha = s.a; g.strokeStyle = s.fill || s.stroke; g.fillStyle = s.fill || s.stroke
    if (e.state === 'deleted') { g.setLineDash([2, 2]); g.beginPath(); g.moveTo(x + 1, laneTop + lane - 2); g.lineTo(x + 1, y); g.stroke(); g.setLineDash([]) }
    else { g.fillRect(x, y, 2, vh); if (e.cc === 11) { g.beginPath(); g.arc(x + 1, y, 2, 0, 7); g.fill() } }
    g.globalAlpha = 1
    hits.push({ x: x - 2, y, w: 6, h: vh + 4, e })
  }
  for (const e of others.value) { const s = stateStyle(e, c), x = X(e.pos); g.globalAlpha = s.a; g.fillStyle = s.fill || s.stroke; g.beginPath(); g.moveTo(x, laneTop + 4); g.lineTo(x + 4, laneTop + 9); g.lineTo(x, laneTop + 14); g.fill(); g.globalAlpha = 1; hits.push({ x: x - 2, y: laneTop + 2, w: 8, h: 14, e }) }
  // Cursor
  const cx = Math.round(X(ENV.cursor)) + 0.5; g.strokeStyle = c.cur; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, h); g.stroke()
  g.fillStyle = c.cur; g.beginPath(); g.moveTo(cx - 4, 0); g.lineTo(cx + 4, 0); g.lineTo(cx, 5); g.fill()
  el._hits = hits
}
const TYPE = { 0: 'Note', 2: 'Controller', 3: 'Program Change', 4: 'Aftertouch', 5: 'Pitchbend' }
const STATE = { deleted: 'gelöscht', changed: 'geändert', added: 'eingefügt', moved: 'auf neue Spur/Lane', hit: 'Treffer', kept: '' }
function pos(t) { return (Math.floor(t / BAR) + 1) + '.' + (Math.floor((t % BAR) / 480) + 1) + '.' + (Math.floor((t % 480) / 120) + 1) }
function onMove(ev) {
  const r = cv.value.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top
  const h = (cv.value._hits || []).slice().reverse().find(o => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h)
  if (!h) { tip.value = null; return }
  const e = h.e, st = props.mode === 'after' ? STATE[e.state] : (e.hit ? 'Treffer' : '')
  const txt = e.type === 0 ? `${noteName(e.pitch)} · Vel ${e.vel} · ${pos(e.pos)} · Kanal ${e.ch}` : e.type === 2 ? `CC ${e.cc} · Wert ${e.val} · ${pos(e.pos)}` : `${TYPE[e.type]} · ${pos(e.pos)}`
  tip.value = { x: Math.min(x + 12, W - 200), y: Math.max(0, y - 30), txt, st }
}
onMounted(() => { ro = new ResizeObserver(([en]) => { W = Math.max(280, en.contentRect.width); draw() }); ro.observe(box.value); document.fonts?.ready.then(draw) })
onBeforeUnmount(() => ro?.disconnect())
watch(() => [props.events, props.mode], draw, { deep: true })
</script>

<template>
  <div ref="box" class="proll" @mouseleave="tip = null">
    <canvas ref="cv" @mousemove="onMove" role="img" aria-label="Vorschau des Beispiel-Clips" />
    <div v-if="tip" class="ptip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }">{{ tip.txt }}<b v-if="tip.st"> · {{ tip.st }}</b></div>
  </div>
</template>

<style>
.proll { position: relative; width: 100%; }
.proll canvas { display: block; width: 100%; border-radius: 6px; background: var(--le-canvas); border: 1px solid var(--ui-border-muted); }
.ptip { position: absolute; pointer-events: none; padding: 4px 8px; border-radius: 5px; background: var(--ui-bg-elevated); border: 1px solid var(--ui-border-accented); font-size: 11.5px; font-family: var(--font-sans); font-variant-numeric: tabular-nums; color: var(--ui-text); white-space: nowrap; box-shadow: 0 6px 18px oklch(0% 0 0 / .4); }
.ptip b { color: var(--color-brass-300); font-weight: 500; }
</style>
