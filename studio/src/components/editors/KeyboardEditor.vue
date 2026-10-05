<script setup>
// Klaviatur: Klick = einzelne Note, Ziehen = Bereich. Fenster von fünf Oktaven, verschiebbar.
import { ref, computed, watch } from 'vue'
import { noteName, parseNote, cmp, usesP2 } from '../../model/util.js'
const props = defineProps({ c: Object, single: Boolean, octaves: { type: Number, default: 4 } })
const v1 = computed(() => parseNote(props.c.p1)), v2 = computed(() => parseNote(props.c.p2))
const start = ref(24) // C0
const span = computed(() => props.octaves * 12)
watch(() => props.c.id, () => { const n = v1.value; if (n < start.value || n > start.value + span.value - 1) start.value = Math.max(0, Math.min(128 - span.value, Math.floor(n / 12) * 12 - 12)) }, { immediate: true })
const W = 11, H = 64
const keys = computed(() => {
  const out = []; let w = 0
  for (let n = start.value; n < Math.min(128, start.value + span.value); n++) {
    const k = n % 12, black = [1, 3, 6, 8, 10].includes(k)
    if (!black) { out.push({ n, black, x: w * W }); w++ } else out.push({ n, black, x: w * W - 3.6 })
  }
  return { list: out, width: w * W }
})
const hit = (n) => props.single ? n === v1.value : !!cmp(+props.c.cond, n, v1.value, v2.value)
let drag = null
function keyAt(e) { const el = document.elementFromPoint(e.clientX, e.clientY); return el?.dataset?.n != null ? +el.dataset.n : null }
function down(e) {
  const n = keyAt(e); if (n == null) return
  e.currentTarget.setPointerCapture(e.pointerId); drag = { start: n, moved: false }
  if (props.single) { props.c.p1 = n; return }
  if (usesP2(+props.c.cond)) props.c.cond = 200
  props.c.p1 = n; props.c.p2 = n
}
function move(e) {
  if (!drag || props.single) return
  const n = keyAt(e); if (n == null || (n === drag.start && !drag.moved)) return
  drag.moved = true; if (!usesP2(+props.c.cond)) props.c.cond = 207
  props.c.p1 = Math.min(drag.start, n); props.c.p2 = Math.max(drag.start, n)
}
const up = () => { drag = null }
function setText(field, t) { const n = parseNote(t); props.c[field] = Math.max(0, Math.min(127, Math.round(n))); if (!props.single && usesP2(+props.c.cond) && props.c.p1 > props.c.p2) [props.c.p1, props.c.p2] = [props.c.p2, props.c.p1] }
</script>

<template>
  <div class="kbd-ed">
    <div class="kbd-nav">
      <UButton icon="i-lucide-chevron-left" size="xs" color="neutral" variant="ghost" aria-label="Oktave tiefer" :disabled="start <= 0" @click="start = Math.max(0, start - 12)" />
      <span class="num kbd-range">{{ noteName(start) }} – {{ noteName(Math.min(127, start + span - 1)) }}</span>
      <UButton icon="i-lucide-chevron-right" size="xs" color="neutral" variant="ghost" aria-label="Oktave höher" :disabled="start >= 128 - span" @click="start = Math.min(128 - span, start + 12)" />
    </div>
    <svg class="kbd" :viewBox="`0 0 ${keys.width} ${H + 10}`" @pointerdown.prevent="down" @pointermove="move" @pointerup="up" @pointercancel="up" role="group" aria-label="Klaviatur">
      <template v-for="k in keys.list" :key="k.n">
        <rect v-if="!k.black" :x="k.x + 0.5" y="0" :width="W - 1" :height="H" rx="1.5" :class="['wk', { on: hit(k.n) }]" :data-n="k.n"><title>{{ noteName(k.n) }} · {{ k.n }}</title></rect>
      </template>
      <template v-for="k in keys.list" :key="'b' + k.n">
        <rect v-if="k.black" :x="k.x" y="0" width="7.2" :height="H * 0.6" rx="1" :class="['bk', { on: hit(k.n) }]" :data-n="k.n"><title>{{ noteName(k.n) }} · {{ k.n }}</title></rect>
      </template>
      <template v-for="k in keys.list" :key="'t' + k.n"><text v-if="k.n % 12 === 0" :x="k.x + 1.5" :y="H + 8.5">{{ noteName(k.n) }}</text></template>
    </svg>
    <div class="row mt-3">
      <label class="field"><span class="fl">{{ !single && usesP2(+c.cond) ? 'Von' : 'Note' }}</span>
        <UInput :model-value="noteName(v1)" size="sm" class="w-24" @change="setText('p1', $event.target.value)" /></label>
      <label v-if="!single && usesP2(+c.cond)" class="field"><span class="fl">Bis</span>
        <UInput :model-value="noteName(v2)" size="sm" class="w-24" @change="setText('p2', $event.target.value)" /></label>
      <span class="num kbd-num">{{ v1 }}<template v-if="!single && usesP2(+c.cond)"> – {{ v2 }}</template></span>
    </div>
  </div>
</template>

<style>
.kbd-ed { display: flex; flex-direction: column; }
.kbd-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.kbd-range { font-size: 11px; color: var(--ui-text-dimmed); }
.kbd { width: 100%; height: auto; touch-action: none; user-select: none; display: block; }
.kbd .wk { fill: oklch(88% 0.006 232); stroke: oklch(40% 0.01 232); stroke-width: .4; cursor: pointer; }
.kbd .wk:hover { fill: oklch(95% 0.004 232); }
.kbd .bk { fill: oklch(22% 0.008 232); cursor: pointer; }
.kbd .bk:hover { fill: oklch(32% 0.01 232); }
.kbd .wk.on { fill: var(--color-brass-300); }
.kbd .bk.on { fill: var(--color-brass-600); }
.kbd text { font-family: var(--font-sans); font-size: 4.8px; fill: var(--ui-text-dimmed); pointer-events: none; }
.kbd-num { font-size: 11px; color: var(--ui-text-dimmed); align-self: flex-end; padding-bottom: 8px; }
</style>
