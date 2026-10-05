<script setup>
import { computed } from 'vue'
import { S, setTool, undo, redo, newPreset, allChips } from '../model/store.js'
import { TOOLS } from '../model/defs.js'
import { useToast } from '@nuxt/ui/composables'
const props = defineProps({ cmd: Object })
const toast = useToast()
const toolItems = TOOLS.map(t => ({ label: t.label, value: t.id }))
const tool = computed({
  get: () => S.tool,
  set: (v) => {
    const before = allChips(S.root).length + S.actions.length
    setTool(v)
    const lost = before - (allChips(S.root).length + S.actions.length)
    if (lost > 0) toast.add({ title: 'Werkzeug: ' + TOOLS.find(t => t.id === v).label, description: lost + ' Baustein(e) entfernt, die es dort nicht gibt.', icon: 'i-lucide-info', actions: [{ label: 'Rückgängig', color: 'neutral', variant: 'outline', onClick: () => undo() }] })
  }
})
const menu = computed(() => [
  [{ label: 'Neues leeres Preset', icon: 'i-lucide-file-plus', onSelect: () => { newPreset(); toast.add({ title: 'Leeres Preset angelegt', duration: 3000, actions: [{ label: 'Rückgängig', color: 'neutral', variant: 'outline', onClick: () => undo() }] }) } },
   { label: 'Öffnen …', icon: 'i-lucide-folder-open', kbds: ['meta', 'o'], onSelect: props.cmd.open },
   { label: 'Exportieren', icon: 'i-lucide-download', kbds: ['meta', 's'], onSelect: props.cmd.export }],
  [{ label: 'Assistent …', icon: 'i-lucide-wand', onSelect: props.cmd.assistant },
   { label: 'Befehle …', icon: 'i-lucide-command', kbds: ['meta', 'k'], onSelect: props.cmd.palette }],
  [{ label: 'Experten-Ansicht', icon: 'i-lucide-binary', type: 'checkbox', checked: S.expert, onUpdateChecked: (v) => { S.expert = v } }]
])
</script>

<template>
  <header class="topbar">
    <div class="brand"><span class="mark" aria-hidden="true"><i /><i /><i /></span><span class="wm">LE-Tamer</span></div>
    <UButton class="libbtn" icon="i-lucide-library" label="Vorlagen" color="neutral" variant="ghost" size="sm" @click="cmd.library()" />
    <USelect v-model="tool" :items="toolItems" size="sm" variant="soft" class="toolsel" aria-label="Werkzeug" />
    <span class="divider" />
    <UInput v-model="S.name" size="sm" variant="ghost" placeholder="Preset-Name" class="pname" aria-label="Preset-Name" :ui="{ base: 'font-medium text-[13px] text-highlighted' }" />
    <span class="grow" />
    <div class="tools">
      <UTooltip text="Rückgängig" :kbds="['meta', 'z']"><UButton icon="i-lucide-undo-2" color="neutral" variant="ghost" size="sm" aria-label="Rückgängig" @click="undo()" /></UTooltip>
      <UTooltip text="Wiederholen" :kbds="['meta', 'shift', 'z']"><UButton icon="i-lucide-redo-2" color="neutral" variant="ghost" size="sm" aria-label="Wiederholen" @click="redo()" /></UTooltip>
      <span class="divider" />
      <UButton icon="i-lucide-wand" label="Assistent" color="neutral" variant="ghost" size="sm" class="hide-sm" @click="cmd.assistant()" />
      <UButton color="neutral" variant="ghost" size="sm" class="hide-sm" aria-label="Befehle" @click="cmd.palette()">
        <span class="text-muted">Befehle</span><UKbd value="meta" size="sm" /><UKbd value="K" size="sm" />
      </UButton>
      <UButton icon="i-lucide-folder-open" label="Öffnen" color="neutral" variant="outline" size="sm" class="hide-sm" @click="cmd.open()" />
      <UButton icon="i-lucide-download" label="Exportieren" color="primary" size="sm" @click="cmd.export()" />
      <UDropdownMenu :items="menu" :content="{ align: 'end' }"><UButton icon="i-lucide-ellipsis" color="neutral" variant="ghost" size="sm" aria-label="Weitere" /></UDropdownMenu>
    </div>
  </header>
</template>

<style>
.topbar { display: flex; align-items: center; gap: 10px; padding: 0 10px 0 14px; border-bottom: 1px solid var(--ui-border); background: var(--ui-bg); min-width: 0; padding-top: env(safe-area-inset-top, 0px); }
.brand { display: flex; align-items: center; gap: 9px; flex: none; padding-right: 4px; }
.brand .wm { font-weight: 650; font-size: 13.5px; letter-spacing: 0.01em; color: var(--ui-text-highlighted); font-stretch: 88%; }
.mark { display: inline-grid; grid-template-columns: repeat(3, 4px); gap: 2px; align-items: end; height: 14px; }
.mark i { display: block; width: 4px; border-radius: 1px; background: var(--ui-text-toned); }
.mark i:nth-child(1) { height: 8px; } .mark i:nth-child(2) { height: 14px; background: var(--le-accent); } .mark i:nth-child(3) { height: 11px; }
.toolsel { width: 196px; }
.pname { width: min(340px, 30vw); }
.divider { width: 1px; height: 18px; background: var(--ui-border); flex: none; }
.grow { flex: 1; }
.tools { display: flex; align-items: center; gap: 4px; }
.libbtn { display: none; }
@media (max-width: 1180px) { .libbtn { display: inline-flex; } }
@media (max-width: 960px) { .hide-sm { display: none; } }
@media (max-width: 820px) {
  .topbar { flex-wrap: wrap; padding: 8px 12px; row-gap: 8px; }
  .pname { width: 100%; order: 10; }
  .toolsel { width: auto; flex: 1; }
  .grow { display: none; }
  .brand .wm { display: none; }
}
</style>
