<script setup>
import { computed } from 'vue'
import { S, removeItem, duplicateItem, wrapInGroup, issuesById } from '../model/store.js'
import { CHIPDEF } from '../model/defs.js'
import { chipValue, chipUnverified } from '../model/text.js'
const props = defineProps({ c: Object, inGroup: Boolean })
const d = computed(() => CHIPDEF[props.c.t])
const sel = computed(() => S.sel?.id === props.c.id)
const val = computed(() => chipValue(props.c, S.tool))
const warn = computed(() => (issuesById.value[props.c.id] || []).some(i => i.level !== 'info'))
const unv = computed(() => chipUnverified(props.c, S.tool))
const menu = computed(() => [
  [{ label: 'Bearbeiten', icon: 'i-lucide-pencil-line', onSelect: select }, { label: 'Duplizieren', icon: 'i-lucide-copy', kbds: ['meta', 'd'], onSelect: () => duplicateItem(props.c.id) },
   { label: 'In eigene Gruppe', icon: 'i-lucide-group', onSelect: () => wrapInGroup(props.c.id) }],
  [{ label: 'Entfernen', icon: 'i-lucide-trash-2', color: 'error', kbds: ['delete'], onSelect: () => removeItem(props.c.id) }]
])
function select() { S.sel = { kind: 'chip', id: props.c.id } }
</script>

<template>
  <UContextMenu :items="menu">
    <div class="chip" :class="{ sel, warn, raw: c.t === 'raw' }" tabindex="0" role="button" :aria-pressed="sel" :aria-label="d.label + ' ' + val"
      @click.stop="select" @keydown.enter.prevent="select" @keydown.space.prevent="select">
      <UIcon :name="d.icon" class="ci" />
      <span class="cl">{{ d.label }}</span>
      <span class="cv">{{ val }}</span>
      <UTooltip v-if="unv" text="Code noch nicht mit einer Cubase-15-Datei abgeglichen"><span class="unv-dot" /></UTooltip>
      <button class="cx nodrag" aria-label="Entfernen" @click.stop="removeItem(c.id)"><UIcon name="i-lucide-x" class="size-3" /></button>
    </div>
  </UContextMenu>
</template>

<style>
.chip { display: inline-flex; align-items: center; gap: 7px; height: 30px; max-width: 100%; padding: 0 4px 0 9px; border-radius: 6px; background: var(--le-chip); border: 1px solid var(--ui-border-accented);
  cursor: grab; user-select: none; transition: background .12s, border-color .12s, box-shadow .12s; box-shadow: 0 1px 0 oklch(100% 0 0 / .03) inset, 0 1px 2px oklch(0% 0 0 / .3); }
.chip:hover { background: var(--le-chip-hover); }
.chip.sel { border-color: var(--le-accent); box-shadow: 0 0 0 3px var(--le-accent-soft); background: oklch(27% 0.02 70); }
.chip.warn:not(.sel) { border-color: oklch(76% 0.14 55 / .55); }
.chip.raw { border-style: dashed; }
.chip .ci { width: 14px; height: 14px; color: var(--ui-text-dimmed); flex: none; }
.chip.sel .ci { color: var(--le-accent); }
.chip .cl { font-size: 12px; color: var(--ui-text-muted); white-space: nowrap; }
.chip .cv { font-size: 12.5px; font-weight: 560; font-variant-numeric: tabular-nums; font-stretch: 92%; color: var(--ui-text-highlighted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.chip .cx { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 4px; color: var(--ui-text-dimmed); opacity: 0; transition: opacity .12s; flex: none; }
.chip:hover .cx, .chip.sel .cx, .chip:focus-visible .cx { opacity: 1; }
.chip .cx:hover { color: var(--ui-text-highlighted); background: var(--ui-bg-accented); }
@media (hover: none) { .chip .cx { opacity: 1; } }
</style>
