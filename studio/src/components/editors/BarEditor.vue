<script setup>
// Takt in 16 Sechzehnteln (480 Ticks pro Viertel). Ziehen markiert einen Bereich; Zählzeit-Tasten setzen ± Toleranz.
import { ref, computed } from 'vue'
import { barText } from '../../model/text.js'
const props = defineProps({ c: Object })
const tol = ref(20)
const cells = Array.from({ length: 16 }, (_, i) => i)
const inCell = (i) => { const a = i * 120, b = a + 119; return !(b < +props.c.p1 || a > +props.c.p2) }
let drag = null
const cellAt = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); return el?.dataset?.i != null ? +el.dataset.i : null }
function down(e) { const i = cellAt(e); if (i == null) return; e.currentTarget.setPointerCapture(e.pointerId); drag = i; props.c.p1 = i * 120; props.c.p2 = i * 120 + 119 }
function move(e) { if (drag == null) return; const i = cellAt(e); if (i == null) return; props.c.p1 = Math.min(drag, i) * 120; props.c.p2 = Math.max(drag, i) * 120 + 119 }
const up = () => { drag = null }
function beat(b) { props.c.p1 = Math.max(0, b * 480 - tol.value); props.c.p2 = Math.min(1919, b * 480 + tol.value) }
const curBeat = computed(() => { for (let b = 0; b < 4; b++) if (+props.c.p1 === Math.max(0, b * 480 - tol.value) && +props.c.p2 === Math.min(1919, b * 480 + tol.value)) return b; return -1 })
</script>
<template>
  <div class="bar-ed">
    <div class="seg sm mb-3"><button :class="{ on: +c.cond === 206 }" @click="c.cond = 206">Innerhalb</button><button :class="{ on: +c.cond === 208 }" @click="c.cond = 208">Außerhalb</button></div>
    <div class="beats num"><span v-for="b in 4" :key="b">{{ b }}</span></div>
    <div class="cells" @pointerdown.prevent="down" @pointermove="move" @pointerup="up" @pointercancel="up" role="group" aria-label="Takt in Sechzehnteln">
      <div v-for="i in cells" :key="i" :data-i="i" :class="{ on: inCell(i), out: +c.cond === 208 && inCell(i), beat: i % 4 === 0 }" />
    </div>
    <div class="row mt-3">
      <span class="fl text-muted text-[11.5px]">Zählzeit</span>
      <div class="quick"><button v-for="b in 4" :key="b" :class="{ on: curBeat === b - 1 }" @click="beat(b - 1)">{{ b }}</button></div>
      <span class="fl text-muted text-[11.5px] ml-2">±</span><UInputNumber v-model="tol" :min="0" :max="240" size="xs" class="w-20" /><span class="text-dimmed text-[11.5px]">Ticks</span>
    </div>
    <div class="row mt-3">
      <label class="field"><span class="fl">Von (Ticks)</span><UInputNumber :model-value="+c.p1" :min="0" :max="1919" size="sm" class="w-28" @update:model-value="v => c.p1 = v ?? 0" /></label>
      <label class="field"><span class="fl">Bis (Ticks)</span><UInputNumber :model-value="+c.p2" :min="0" :max="1919" size="sm" class="w-28" @update:model-value="v => c.p2 = v ?? 0" /></label>
    </div>
    <p class="hint mt-2">{{ barText(+c.p1, +c.p2) }} · gilt in jedem Takt, 4/4 mit 1920 Ticks.</p>
  </div>
</template>
<style>
.beats { display: grid; grid-template-columns: repeat(4, 1fr); font-size: 10.5px; color: var(--ui-text-dimmed); margin-bottom: 4px; }
.cells { display: grid; grid-template-columns: repeat(16, 1fr); gap: 2px; touch-action: none; user-select: none; }
.cells div { height: 34px; border-radius: 3px; background: var(--ui-bg-elevated); cursor: pointer; }
.cells div.beat { background: var(--ui-bg-accented); }
.cells div:hover { outline: 1px solid var(--ui-border-accented); }
.cells div.on { background: var(--le-accent); }
.cells div.out { background: var(--le-warn); }
</style>
