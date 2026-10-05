<script setup>
import { computed } from 'vue'
import { S, removeItem, duplicateItem, issuesById } from '../model/store.js'
import { ACTDEF, OPLABEL, OPNAME } from '../model/defs.js'
import { actionValue, actionUnverified } from '../model/text.js'
import { num } from '../model/util.js'
const props = defineProps({ a: Object, index: Number })
const d = computed(() => ACTDEF[props.a.t])
const sel = computed(() => S.sel?.id === props.a.id)
const op = computed(() => +props.a.op)
const unv = computed(() => actionUnverified(props.a))
const opItems = computed(() => d.value.ops.map(o => ({ label: OPNAME[o] ?? String(o), value: o })))
const inline = computed(() => ['num', 'time', 'factor'].includes(d.value.kind) || (d.value.kind === 'pitch' && op.value !== 312) || (d.value.kind === 'channel' && op.value !== 312))
const two = computed(() => [310, 311, 317].includes(op.value) || (op.value === 311))
const unit = computed(() => d.value.kind === 'time' ? (props.a.unit === 'ms' ? 'ms' : (op.value === 307 || op.value === 308 ? '×' : 'Ticks')) : d.value.kind === 'pitch' ? 'HT' : '')
const step = computed(() => (op.value === 307 || op.value === 308 || d.value.kind === 'factor') ? 0.05 : 1)
const p1 = computed({ get: () => num(props.a.p1), set: v => { props.a.p1 = v ?? 0 } })
const p2 = computed({ get: () => num(props.a.p2), set: v => { props.a.p2 = v ?? 0 } })
function setOp(o) {
  const was = op.value; props.a.op = o
  if ((o === 307 || o === 308) && was !== 307 && was !== 308) props.a.p1 = o === 307 ? 1.1 : 1.15
  else if ((was === 307 || was === 308) && o !== 307 && o !== 308) props.a.p1 = d.value.kind === 'pitch' ? 12 : 10
  if (o === 310 || o === 317) { props.a.p1 = d.value.kind === 'pitch' ? 48 : 60; props.a.p2 = d.value.kind === 'pitch' ? 72 : 100 }
  if (o === 311) { props.a.p1 = -6; props.a.p2 = 6 }
  if (o === 312 && d.value.kind === 'num') props.a.p1 = 100
  if (d.value.kind === 'time' && o !== 304 && o !== 306) props.a.unit = 'ticks'
}
const menu = computed(() => [[{ label: 'Duplizieren', icon: 'i-lucide-copy', kbds: ['meta', 'd'], onSelect: () => duplicateItem(props.a.id) }], [{ label: 'Entfernen', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => removeItem(props.a.id) }]])
const select = () => { S.sel = { kind: 'action', id: props.a.id } }
const warn = computed(() => (issuesById.value[props.a.id] || []).some(i => i.level !== 'info'))
</script>

<template>
  <UContextMenu :items="menu">
    <div class="arow" :class="{ sel, warn, raw: a.t === 'raw' }" @click="select">
      <span class="grip" aria-hidden="true"><UIcon name="i-lucide-grip-vertical" class="size-3.5" /></span>
      <span class="ai num">{{ index + 1 }}</span>
      <UIcon :name="d.icon" class="aicon" />
      <span class="al">{{ d.label }}</span>
      <template v-if="a.t !== 'raw' && d.ops.length > 1 && !['trackop', 'name'].includes(d.kind)">
        <USelect :model-value="op" :items="opItems" size="xs" variant="soft" class="aop nodrag" :aria-label="'Operation für ' + d.label" @update:model-value="setOp" @click.stop />
      </template>
      <template v-if="inline">
        <UInputNumber v-model="p1" :step="step" size="xs" variant="soft" class="anum nodrag" :increment="false" :decrement="false" :format-options="{ maximumFractionDigits: 3, useGrouping: false }" aria-label="Wert" @click.stop />
        <template v-if="two"><span class="ad">…</span><UInputNumber v-model="p2" :step="step" size="xs" variant="soft" class="anum nodrag" :increment="false" :decrement="false" :format-options="{ maximumFractionDigits: 3, useGrouping: false }" aria-label="Zweiter Wert" @click.stop /></template>
        <span class="au">{{ unit }}</span>
      </template>
      <span v-else class="av">{{ actionValue(a) }}</span>
      <UTooltip v-if="unv" text="Schreibweise noch nicht in Cubase 15 geladen"><span class="unv-dot" /></UTooltip>
      <span class="grow" />
      <button class="cx nodrag" aria-label="Aktion entfernen" @click.stop="removeItem(a.id)"><UIcon name="i-lucide-x" class="size-3.5" /></button>
    </div>
  </UContextMenu>
</template>

<style>
.arow { display: flex; align-items: center; gap: 8px; height: 38px; padding: 0 6px 0 4px; border-radius: 7px; background: var(--ui-bg); border: 1px solid var(--ui-border); transition: border-color .12s, background .12s; min-width: 0; }
.arow:hover { border-color: var(--ui-border-accented); }
.arow.sel { border-color: var(--le-accent); background: oklch(21% 0.012 70); box-shadow: 0 0 0 3px var(--le-accent-soft); }
.arow.warn:not(.sel) { border-color: oklch(76% 0.14 55 / .55); }
.arow.raw { border-style: dashed; }
.arow .grip { display: grid; place-items: center; width: 18px; height: 28px; color: var(--ui-text-dimmed); cursor: grab; }
.arow .ai { width: 14px; text-align: right; color: var(--ui-text-dimmed); font-size: 10.5px; }
.arow .aicon { width: 15px; height: 15px; color: var(--ui-text-muted); flex: none; }
.arow.sel .aicon { color: var(--le-accent); }
.arow .al { font-size: 12.5px; color: var(--ui-text); min-width: 92px; white-space: nowrap; }
.arow .aop { width: 168px; }
.arow .anum { width: 78px; }
.arow .anum input { font-variant-numeric: tabular-nums; font-size: 12.5px; font-weight: 560; }
.arow .ad, .arow .au { color: var(--ui-text-dimmed); font-size: 11.5px; }
.arow .av { font-size: 12.5px; font-weight: 560; font-variant-numeric: tabular-nums; color: var(--ui-text-highlighted); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; min-width: 0; }
.arow .grow { flex: 1; }
.arow .cx { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 5px; color: var(--ui-text-dimmed); opacity: 0; }
.arow:hover .cx, .arow.sel .cx { opacity: 1; }
.arow .cx:hover { color: var(--ui-text-highlighted); background: var(--ui-bg-accented); }
@media (max-width: 820px) { .arow { flex-wrap: wrap; height: auto; padding: 6px; } .arow .aop { width: auto; flex: 1; } .arow .cx { opacity: 1; } }
</style>
