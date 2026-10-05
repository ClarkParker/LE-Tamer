<script setup>
import { computed } from 'vue'
import { S, ctx, setTool, addChip, addAction, newPreset, undo, redo, RECIPES } from '../model/store.js'
import { CHIPDEF, ACTDEF, TOOLS } from '../model/defs.js'
const open = defineModel('open', { type: Boolean })
const props = defineProps({ cmd: Object })
const run = (fn) => () => { open.value = false; fn() }
const groups = computed(() => [
  { id: 'cmd', label: 'Befehle', items: [
    { label: 'Exportieren', icon: 'i-lucide-download', kbds: ['meta', 's'], onSelect: run(props.cmd.export) },
    { label: 'Datei öffnen …', icon: 'i-lucide-folder-open', kbds: ['meta', 'o'], onSelect: run(props.cmd.open) },
    { label: 'Assistent …', icon: 'i-lucide-wand', onSelect: run(props.cmd.assistant) },
    { label: 'Neues leeres Preset', icon: 'i-lucide-file-plus', onSelect: run(() => newPreset()) },
    { label: 'Rückgängig', icon: 'i-lucide-undo-2', kbds: ['meta', 'z'], onSelect: run(undo) },
    { label: 'Wiederholen', icon: 'i-lucide-redo-2', kbds: ['meta', 'shift', 'z'], onSelect: run(redo) },
    { label: S.expert ? 'Experten-Ansicht ausschalten' : 'Experten-Ansicht einschalten', icon: 'i-lucide-binary', onSelect: run(() => { S.expert = !S.expert }) }] },
  { id: 'chip', label: 'Bedingung hinzufügen', items: Object.entries(CHIPDEF).filter(([k, d]) => d.tools.includes(S.tool) && (!d.expert || S.expert)).map(([k, d]) => ({ label: d.label, suffix: d.cubase, icon: d.icon, onSelect: run(() => addChip(k)) })) },
  { id: 'act', label: 'Aktion hinzufügen', items: Object.entries(ACTDEF).filter(([k, d]) => d.tools.includes(S.tool)).map(([k, d]) => ({ label: d.label, suffix: d.cubase, icon: d.icon, onSelect: run(() => addAction(k)) })) },
  { id: 'tool', label: 'Werkzeug', items: TOOLS.filter(t => t.id !== S.tool).map(t => ({ label: 'Wechseln zu ' + t.label, icon: 'i-lucide-arrow-right-left', onSelect: run(() => setTool(t.id)) })) },
  { id: 'rec', label: 'Vorlagen', items: RECIPES.map(r => ({ label: r.name, suffix: r.cat, icon: 'i-lucide-library', onSelect: run(() => props.cmd.recipe(r)) })) }
])
</script>
<template>
  <UModal v-model:open="open" :ui="{ content: 'max-w-xl' }" title="Befehle" description="Befehl, Baustein oder Vorlage suchen">
    <template #content>
      <UCommandPalette :groups="groups" placeholder="Befehl, Baustein oder Vorlage …" class="h-[26rem]" :close="true" @update:open="v => open = v" />
    </template>
  </UModal>
</template>
