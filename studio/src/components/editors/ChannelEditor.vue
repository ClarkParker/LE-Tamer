<script setup>
import { computed } from 'vue'
import { num, cmp, usesP2 } from '../../model/util.js'
const props = defineProps({ c: Object, single: Boolean })
const two = computed(() => !props.single && usesP2(+props.c.cond))
const on = (n) => props.single ? num(props.c.p1) === n : !!cmp(+props.c.cond, n, num(props.c.p1), num(props.c.p2))
let second = false
function pick(n) {
  if (!two.value) { props.c.p1 = n; props.c.p2 = n; return }
  if (!second) { props.c.p1 = n; props.c.p2 = n; second = true } else { const a = num(props.c.p1); props.c.p1 = Math.min(a, n); props.c.p2 = Math.max(a, n); second = false }
}
</script>
<template>
  <div>
    <div class="chgrid"><button v-for="n in 16" :key="n" class="num" :class="{ on: on(n) }" @click="pick(n)">{{ n }}</button></div>
    <p v-if="two" class="hint mt-2">Bereich: ersten und letzten Kanal anklicken.</p>
  </div>
</template>
<style>
.chgrid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; }
.chgrid button { height: 32px; border-radius: 5px; background: var(--ui-bg-elevated); border: 1px solid var(--ui-border); color: var(--ui-text-toned); font-size: 11.5px; }
.chgrid button:hover { border-color: var(--ui-border-accented); color: var(--ui-text-highlighted); }
.chgrid button.on { background: var(--le-accent-soft); border-color: var(--le-accent-line); color: var(--color-brass-100); }
</style>
