<script setup>
// Bereichsregler 0–127 mit Verteilung der Werte im Vorschau-Clip als Hintergrund.
import { computed } from 'vue'
import { num, cmp, usesP2 } from '../../model/util.js'
const props = defineProps({ c: Object, min: { type: Number, default: 0 }, max: { type: Number, default: 127 }, single: Boolean, values: { type: Array, default: () => [] } })
const two = computed(() => !props.single && usesP2(+props.c.cond))
const model = computed({
  get: () => two.value ? [num(props.c.p1), num(props.c.p2)] : num(props.c.p1),
  set: (v) => { if (Array.isArray(v)) { props.c.p1 = v[0]; props.c.p2 = v[1] } else { props.c.p1 = v; if (!two.value) props.c.p2 = v } }
})
const BINS = 32
const hist = computed(() => {
  const b = new Array(BINS).fill(0); for (const v of props.values) b[Math.min(BINS - 1, Math.floor((v - props.min) / (props.max - props.min + 1) * BINS))]++
  const m = Math.max(1, ...b); return b.map((n, i) => { const lo = props.min + i * (props.max - props.min + 1) / BINS, mid = lo + (props.max - props.min + 1) / BINS / 2; return { h: n / m, on: props.single ? false : !!cmp(+props.c.cond, Math.round(mid), num(props.c.p1), num(props.c.p2)) } })
})
const p1 = computed({ get: () => num(props.c.p1), set: v => { props.c.p1 = Math.max(props.min, Math.min(props.max, v ?? 0)); if (two.value && props.c.p1 > num(props.c.p2)) props.c.p2 = props.c.p1; if (!two.value) props.c.p2 = props.c.p1 } })
const p2 = computed({ get: () => num(props.c.p2), set: v => { props.c.p2 = Math.max(props.min, Math.min(props.max, v ?? 0)); if (props.c.p2 < num(props.c.p1)) props.c.p1 = props.c.p2 } })
</script>

<template>
  <div class="rng-ed">
    <div v-if="values.length" class="hist" aria-hidden="true"><i v-for="(b, i) in hist" :key="i" :style="{ height: Math.max(2, b.h * 100) + '%' }" :class="{ on: b.on }" /></div>
    <USlider v-model="model" :min="min" :max="max" :step="1" size="sm" :class="values.length ? 'mt-1' : 'mt-2'" />
    <div class="row mt-3">
      <label class="field"><span class="fl">{{ two ? 'Von' : 'Wert' }}</span><UInputNumber v-model="p1" :min="min" :max="max" size="sm" class="w-28" /></label>
      <label v-if="two" class="field"><span class="fl">Bis</span><UInputNumber v-model="p2" :min="min" :max="max" size="sm" class="w-28" /></label>
    </div>
    <p v-if="values.length" class="hint mt-2">Balken: Verteilung im Vorschau-Clip, hervorgehoben = getroffen.</p>
  </div>
</template>

<style>
.hist { display: flex; align-items: flex-end; gap: 1px; height: 34px; padding: 0 2px; }
.hist i { flex: 1; background: var(--ui-bg-accented); border-radius: 1px 1px 0 0; }
.hist i.on { background: var(--le-accent-line); }
</style>
