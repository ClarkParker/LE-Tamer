<script setup>
import { computed } from 'vue'
import { S, built, tool, issues } from '../model/store.js'
defineProps({ cmd: Object })
const counts = computed(() => ({ error: issues.value.filter(i => i.level === 'error').length, warn: issues.value.filter(i => i.level === 'warn').length, info: issues.value.filter(i => i.level === 'info').length }))
const label = computed(() => { const c = counts.value; if (c.error) return c.error + ' Fehler'; if (c.warn) return c.warn + ' Hinweis' + (c.warn > 1 ? 'e' : ''); if (c.info) return c.info + ' ungeprüfte' + (c.info > 1 ? ' Codes' : 'r Code'); return '' })
const icon = computed(() => counts.value.error ? 'i-lucide-circle-alert' : counts.value.warn ? 'i-lucide-triangle-alert' : 'i-lucide-info')
function focus(i) { if (i.id) S.sel = { kind: S.actions.some(a => a.id === i.id) ? 'action' : 'chip', id: i.id } }
</script>
<template>
  <footer class="status">
    <span class="mono">{{ tool.root }}</span><span class="dot">·</span>
    <span class="mono">{{ built.bytes.length }} B</span><span class="dot">·</span>
    <span>{{ S.style === 'modern' ? 'Schreibweise Cubase 13–15' : 'Schreibweise bis Cubase 12' }}</span>
    <UPopover v-if="label" :content="{ side: 'top', align: 'start' }">
      <button class="st-issues" :class="{ err: counts.error, warn: !counts.error && counts.warn }"><UIcon :name="icon" class="size-3.5" />{{ label }}</button>
      <template #content>
        <ul class="st-list">
          <li v-for="(i, n) in issues" :key="n" :class="i.level"><UIcon :name="i.level === 'error' ? 'i-lucide-circle-alert' : i.level === 'warn' ? 'i-lucide-triangle-alert' : 'i-lucide-info'" class="size-3.5 mt-0.5 flex-none" />
            <button :disabled="!i.id" @click="focus(i)">{{ i.text }}</button></li>
        </ul>
      </template>
    </UPopover>
    <span class="grow" />
    <span class="st-kbd">Befehle <UKbd value="meta" size="sm" /><UKbd value="K" size="sm" /></span>
  </footer>
</template>
<style>
.status { display: flex; align-items: center; gap: 8px; padding: 0 12px; border-top: 1px solid var(--ui-border); background: var(--ui-bg); font-size: 11px; color: var(--ui-text-dimmed); white-space: nowrap; overflow: hidden; padding-bottom: env(safe-area-inset-bottom, 0px); }
.status .dot { opacity: .6; }
.status .grow { flex: 1; }
.st-issues { display: inline-flex; align-items: center; gap: 5px; margin-left: 8px; padding: 1px 7px; border-radius: 4px; color: var(--ui-text-muted); }
.st-issues:hover { background: var(--ui-bg-elevated); color: var(--ui-text-highlighted); }
.st-issues.warn { color: var(--le-warn); } .st-issues.err { color: var(--le-del); }
.st-kbd { display: inline-flex; align-items: center; gap: 4px; }
.st-list { list-style: none; margin: 0; padding: 6px; max-width: 420px; display: flex; flex-direction: column; gap: 2px; }
.st-list li { display: flex; gap: 8px; padding: 6px 8px; border-radius: 5px; font-size: 12px; color: var(--ui-text-toned); line-height: 1.45; }
.st-list li.warn { color: var(--le-warn); } .st-list li.error { color: var(--le-del); }
.st-list li button { text-align: left; } .st-list li button:not(:disabled):hover { text-decoration: underline; text-underline-offset: 2px; }
@media (max-width: 820px) { .st-kbd { display: none; } .status { height: 28px; } }
</style>
