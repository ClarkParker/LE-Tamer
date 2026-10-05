<script setup>
import { computed } from 'vue'
import { NOTEVALS } from '../../model/defs.js'
import { num, usesP2 } from '../../model/util.js'
const props = defineProps({ c: Object })
const two = computed(() => usesP2(+props.c.cond))
const secs = computed(() => props.c.unit === 's')
function unit(u) { if ((props.c.unit || 'ticks') === u) return; if (u === 's') { props.c.p1 = Math.round(num(props.c.p1) / 960 * 1000) / 1000; props.c.p2 = Math.round(num(props.c.p2) / 960 * 1000) / 1000 } else { props.c.p1 = Math.round(num(props.c.p1) * 960); props.c.p2 = Math.round(num(props.c.p2) * 960) } props.c.unit = u }
function pick(v) { if (two.value && num(props.c.p1) !== num(props.c.p2) && v > num(props.c.p1)) props.c.p2 = v; else { props.c.p1 = v; if (!two.value || num(props.c.p2) < v) props.c.p2 = v } }
const p1 = computed({ get: () => num(props.c.p1), set: v => { props.c.p1 = v ?? 0; if (!two.value) props.c.p2 = props.c.p1 } })
const p2 = computed({ get: () => num(props.c.p2), set: v => { props.c.p2 = v ?? 0 } })
</script>
<template>
  <div>
    <div class="seg sm mb-3"><button :class="{ on: !secs }" @click="unit('ticks')">Notenwert</button><button :class="{ on: secs }" @click="unit('s')">Sekunden</button></div>
    <div v-if="!secs" class="quick mb-3"><button v-for="n in NOTEVALS" :key="n.v" :class="{ on: num(c.p1) === n.v || (two && num(c.p2) === n.v) }" @click="pick(n.v)">{{ n.label }}</button></div>
    <div class="row">
      <label class="field"><span class="fl">{{ two ? 'Von' : (secs ? 'Sekunden' : 'Ticks') }}</span><UInputNumber v-model="p1" :min="0" :step="secs ? 0.01 : 10" size="sm" class="w-32" :format-options="{ maximumFractionDigits: 3, useGrouping: false }" /></label>
      <label v-if="two" class="field"><span class="fl">Bis</span><UInputNumber v-model="p2" :min="0" :step="secs ? 0.01 : 10" size="sm" class="w-32" :format-options="{ maximumFractionDigits: 3, useGrouping: false }" /></label>
    </div>
    <p class="hint mt-2">{{ secs ? 'Sekunden-Werte sind aus Cubase-12-Dateien abgeleitet und noch nicht in Cubase 15 geladen.' : '480 Ticks = Viertelnote. Cubase ergänzt bei Länge automatisch „Event-Typ = Note“.' }}</p>
  </div>
</template>
