<script setup>
import { ref, computed } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { S, RECIPES, built, tool, importText, undo } from '../model/store.js'
import { RECIPE_CATS } from '../model/recipes.js'
import { mkChip, mkGroup, mkAction } from '../model/doc.js'
import { summary } from '../model/text.js'
import { TOOL } from '../model/defs.js'
import { LE } from '../model/util.js'
import { store } from '../files.js'
const props = defineProps({ cmd: Object, compact: Boolean })
const toast = useToast()
const q = ref('')
function recipeSummary(r) {
  const build = (items) => items.map(x => x.group ? mkGroup(x.group, build(x.items)) : mkChip(x.t, Object.fromEntries(Object.entries(x).filter(([k]) => k !== 't'))))
  const st = { tool: r.tool, func: r.func, root: mkGroup(103, build(r.items)), actions: r.actions.map(a => mkAction(a.t, Object.fromEntries(Object.entries(a).filter(([k]) => k !== 't')))) }
  return summary(st).replace(/^[^:]+: /, '')
}
const items = RECIPES.map(r => ({ r, sum: recipeSummary(r), tool: TOOL[r.tool].label }))
const groups = computed(() => {
  const s = q.value.trim().toLowerCase()
  return RECIPE_CATS.map(cat => ({ cat, list: items.filter(i => i.r.cat === cat && (!s || (i.r.name + ' ' + i.sum).toLowerCase().includes(s))) })).filter(g => g.list.length)
})
const mine = ref(store.get('mine', []))
const mineShown = computed(() => { const s = q.value.trim().toLowerCase(); return mine.value.filter(m => !s || m.name.toLowerCase().includes(s)) })
function saveMine() {
  const entry = { name: S.name || 'Preset', root: tool.value.root, hex: LE.bytesToHex(built.value.bytes), at: Date.now() }
  mine.value = [entry, ...mine.value.filter(m => m.name !== entry.name)].slice(0, 50)
  const ok = store.set('mine', mine.value)
  toast.add({ title: ok ? 'Gespeichert unter „Eigene“' : 'Nicht gespeichert', description: ok ? 'Nur in diesem Browser.' : 'Der Browser erlaubt hier keinen lokalen Speicher.', icon: ok ? 'i-lucide-bookmark' : 'i-lucide-circle-alert', duration: 3000 })
}
function loadMine(m) {
  importText(LE.toXml(m.root, LE.hexToBytes(m.hex), 1), m.name + '.xml'); S.source = { kind: 'mine', name: m.name }
  toast.add({ title: 'Geladen: ' + m.name, duration: 3000, actions: [{ label: 'Rückgängig', color: 'neutral', variant: 'outline', onClick: () => undo() }] })
}
function dropMine(m) { mine.value = mine.value.filter(x => x !== m); store.set('mine', mine.value) }
const active = (name) => S.source?.name === name
</script>

<template>
  <div class="libp">
    <div class="libhead">
      <span class="label-caps" v-if="!compact">Vorlagen</span>
      <UInput v-model="q" icon="i-lucide-search" placeholder="Suchen" size="sm" variant="soft" class="w-full" aria-label="Vorlagen durchsuchen" />
    </div>
    <div class="libscroll">
      <section v-if="mineShown.length" class="libgrp">
        <h3 class="label-caps">Eigene</h3>
        <div v-for="m in mineShown" :key="m.name + m.at" class="libitem" :class="{ on: active(m.name) }">
          <button class="li-main" @click="loadMine(m)"><span class="li-name">{{ m.name }}</span><span class="li-sum mono">{{ m.root.replace('Preset', '').replace(/_/g, ' ') }}</span></button>
          <UButton icon="i-lucide-x" size="xs" color="neutral" variant="ghost" class="li-x" aria-label="Eigene Vorlage entfernen" @click="dropMine(m)" />
        </div>
      </section>
      <section v-for="g in groups" :key="g.cat" class="libgrp">
        <h3 class="label-caps">{{ g.cat }}</h3>
        <UTooltip v-for="it in g.list" :key="it.r.name" :text="it.sum" :content="{ side: 'right', sideOffset: 8 }" :ui="{ content: 'max-w-80 h-auto py-1.5 whitespace-normal leading-snug' }">
          <button class="libitem li-main" :class="{ on: active(it.r.name) }" @click="cmd.recipe(it.r)">
            <span class="li-name">{{ it.r.name }}</span>
            <span class="li-sum">{{ it.sum }}</span>
          </button>
        </UTooltip>
      </section>
      <p v-if="!groups.length && !mineShown.length" class="hint px-3">Keine Vorlage enthält „{{ q }}“.</p>
    </div>
    <div class="libfoot">
      <UButton icon="i-lucide-bookmark-plus" label="Aktuelles Preset merken" color="neutral" variant="ghost" size="sm" block class="justify-start" @click="saveMine" />
      <UButton icon="i-lucide-folder-open" label="Datei öffnen …" color="neutral" variant="ghost" size="sm" block class="justify-start" @click="cmd.open()" />
      <p class="hint px-2.5">Preset-Dateien lassen sich auch ins Fenster ziehen.</p>
    </div>
  </div>
</template>

<style>
.libp { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.libhead { display: flex; flex-direction: column; gap: 10px; padding: 14px 12px 10px; }
.libscroll { flex: 1; overflow: auto; padding: 0 6px 10px; min-height: 0; }
.libgrp { display: flex; flex-direction: column; gap: 1px; padding-top: 10px; }
.libgrp h3 { padding: 0 8px 4px; }
.libitem { position: relative; display: flex; align-items: stretch; border-radius: 6px; }
.li-main { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; width: 100%; text-align: left; padding: 6px 8px; border-radius: 6px; min-width: 0; }
.li-main:hover, .libitem:hover { background: var(--ui-bg-muted); }
.libitem.on, .li-main.on { background: var(--le-accent-soft); }
.libitem.on .li-name, .li-main.on .li-name { color: var(--color-brass-100); }
.li-name { font-size: 12.5px; color: var(--ui-text); font-weight: 500; line-height: 1.3; }
.li-sum { font-size: 11px; color: var(--ui-text-dimmed); line-height: 1.35; width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.li-x { position: absolute; right: 4px; top: 50%; transform: translateY(-50%); opacity: 0; }
.libitem:hover .li-x { opacity: 1; }
.libfoot { border-top: 1px solid var(--ui-border); padding: 8px 6px 10px; display: flex; flex-direction: column; gap: 2px; }
</style>
