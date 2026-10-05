<script setup>
import { ref, computed } from 'vue'
import { CC_NAMES } from '../../model/defs.js'
import { num, cmp, usesP2 } from '../../model/util.js'
const props = defineProps({ c: Object, single: Boolean })
const q = ref('')
const list = computed(() => { const s = q.value.trim().toLowerCase(); return Array.from({ length: 128 }, (_, n) => ({ n, name: CC_NAMES[n] || '' })).filter(x => !s || String(x.n).startsWith(s) || x.name.toLowerCase().includes(s)) })
const two = computed(() => !props.single && usesP2(+props.c.cond))
const on = (n) => props.single ? num(props.c.p1) === n : !!cmp(+props.c.cond, n, num(props.c.p1), num(props.c.p2))
let second = false
function pick(n) {
  if (!two.value) { props.c.p1 = n; props.c.p2 = n; return }
  if (!second) { props.c.p1 = n; props.c.p2 = n; second = true } else { const a = num(props.c.p1); props.c.p1 = Math.min(a, n); props.c.p2 = Math.max(a, n); second = false }
}
</script>
<template>
  <div class="cc-ed">
    <UInput v-model="q" icon="i-lucide-search" size="sm" placeholder="Nummer oder Name" class="w-full" />
    <div class="cc-list">
      <button v-for="x in list" :key="x.n" :class="{ on: on(x.n) }" @click="pick(x.n)"><span class="num">{{ x.n }}</span><span>{{ x.name }}</span></button>
    </div>
    <p v-if="two" class="hint">Bereich: erste und letzte Nummer anklicken.</p>
  </div>
</template>
<style>
.cc-ed { display: flex; flex-direction: column; gap: 8px; }
.cc-list { display: flex; flex-direction: column; max-height: 220px; overflow: auto; border: 1px solid var(--ui-border); border-radius: 6px; padding: 2px; }
.cc-list button { display: flex; gap: 12px; align-items: center; text-align: left; padding: 4px 8px; border-radius: 4px; color: var(--ui-text-toned); font-size: 12px; }
.cc-list button .mono { width: 28px; color: var(--ui-text-dimmed); }
.cc-list button:hover { background: var(--ui-bg-elevated); }
.cc-list button.on { background: var(--le-accent-soft); color: var(--color-brass-100); }
.cc-list button.on .mono { color: var(--color-brass-200); }
</style>
