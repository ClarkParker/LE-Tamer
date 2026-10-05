<script setup>
// Assistent: zwei Schritte (Aufgabe → Einstellungen), erzeugt Bedingungen und Aktionen im Editor.
import { ref, reactive, computed, watch } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { S, loadRecipe, undo } from '../model/store.js'
import { MEDIA, COLORS, CC_NAMES } from '../model/defs.js'
import { noteName, parseNote } from '../model/util.js'
import { summary } from '../model/text.js'
import { mkChip, mkGroup, mkAction } from '../model/doc.js'
import KeyboardEditor from './editors/KeyboardEditor.vue'
import OptionList from './editors/OptionList.vue'
const open = defineModel('open', { type: Boolean })
const toast = useToast()
const TASKS = [
  { id: 'vel', label: 'Velocity ändern', hint: 'Anheben, absenken, fest setzen, skalieren, humanisieren oder als Rampe', icon: 'i-lucide-chart-no-axes-column-increasing' },
  { id: 'notes', label: 'Noten herauslösen', hint: 'Bestimmte Noten oder eine Akkordstimme auf eine neue Spur, auswählen oder löschen', icon: 'i-lucide-scissors' },
  { id: 'cc', label: 'Controller bearbeiten', hint: 'Löschen, auf eine andere Nummer kopieren oder umleiten, Werte skalieren', icon: 'i-lucide-sliders-horizontal' },
  { id: 'tracks', label: 'Spuren schalten', hint: 'Project Logical Editor: Mute, Solo, Ausblenden, Farbe oder Name für passende Spuren', icon: 'i-lucide-toggle-right' }
]
const task = ref(null)
const f = reactive({})
function reset() {
  Object.assign(f, { velWho: 'all', keys: { id: 'k', cond: 207, p1: 36, p2: 48 }, velHow: 'up', velN: 10, velFix: 100, velPct: 80, velHum: 6, rampA: 127, rampB: 40,
    noteWho: 'pitch', nkeys: { id: 'n', cond: 200, p1: 36, p2: 36 }, voice: 0, quiet: 20, noteTo: 5,
    cc: 1, ccHow: 'delete', ccTo: 11, ccPct: 80,
    trWho: 'name', trText: 'Vocal', trMedia: 0, trHow: 'mute', trColor: 'Color 9', trName: 'Neu' })
}
reset()
watch(open, v => { if (v) { task.value = null; reset() } })

const build = computed(() => {
  const ch = (t, cond, p1, p2, x) => ({ t, cond, p1, p2: p2 ?? p1, ...x }), ac = (t, op, p1, p2, x) => ({ t, op, p1, p2: p2 ?? 0, ...x })
  switch (task.value) {
    case 'vel': {
      const items = [ch('type', 200, 0)]
      if (f.velWho === 'sel') items.push(ch('property', 211, 1))
      if (f.velWho === 'pitch') items.push(ch('pitch', +f.keys.cond, +f.keys.p1, +f.keys.p2))
      const a = { up: [ac('velocity', 304, f.velN)], down: [ac('velocity', 306, f.velN)], fix: [ac('velocity', 312, f.velFix)], pct: [ac('velocity', 307, Math.round(f.velPct) / 100)], hum: [ac('velocity', 311, -f.velHum, f.velHum)], ramp: [ac('velocity', 317, f.rampA, f.rampB)] }[f.velHow]
      const name = { up: 'Velocity +' + f.velN, down: 'Velocity −' + f.velN, fix: 'Velocity auf ' + f.velFix, pct: 'Velocity × ' + f.velPct + ' %', hum: 'Velocity humanisieren ±' + f.velHum, ramp: 'Velocity-Rampe ' + f.rampA + '→' + f.rampB }[f.velHow]
      return { tool: 'LE', func: 1, items, actions: a, name, cat: 'Velocity' }
    }
    case 'notes': {
      const items = [ch('type', 200, 0)]
      if (f.noteWho === 'pitch') items.push(ch('pitch', +f.nkeys.cond, +f.nkeys.p1, +f.nkeys.p2))
      if (f.noteWho === 'voice') items.push(ch('context', 200, 14, f.voice))
      if (f.noteWho === 'top') items.push(ch('context', 203, 15, 3))
      if (f.noteWho === 'quiet') items.push(ch('velocity', 204, f.quiet))
      const what = { pitch: f.nkeys.cond === 207 ? noteName(+f.nkeys.p1) + '–' + noteName(+f.nkeys.p2) : noteName(+f.nkeys.p1), voice: 'Stimme ' + f.voice, top: 'Höchste Akkordnote', quiet: 'Velocity < ' + f.quiet }[f.noteWho]
      const verb = { 5: ' in Spur extrahieren', 4: ' auf neue Spur kopieren', 6: ' auswählen', 0: ' löschen' }[f.noteTo]
      return { tool: 'LE', func: +f.noteTo, items, actions: [], name: what + verb, cat: 'Noten' }
    }
    case 'cc': {
      const items = [ch('type', 200, 2), ch('ccnum', 200, f.cc)]
      if (f.ccHow === 'cursor') items.push(ch('timepos', 216, 0))
      const cc = 'CC ' + f.cc + (CC_NAMES[f.cc] ? ' ' + CC_NAMES[f.cc] : '')
      const m = { delete: [0, [], cc + ' löschen'], cursor: [0, [], cc + ' vor dem Cursor löschen'], copy: [2, [ac('ccnum', 312, f.ccTo)], cc + ' zusätzlich als CC ' + f.ccTo], move: [1, [ac('ccnum', 312, f.ccTo)], cc + ' → CC ' + f.ccTo], scale: [1, [ac('ccval', 307, Math.round(f.ccPct) / 100)], cc + ' × ' + f.ccPct + ' %'] }[f.ccHow]
      return { tool: 'LE', func: m[0], items, actions: m[1], name: m[2], cat: 'Controller' }
    }
    case 'tracks': {
      const items = [ch('container', 200, 1)]
      if (f.trWho === 'sel') items.push(ch('property', 211, 1))
      if (f.trWho === 'name') items.push(ch('name', 210, f.trText))
      if (f.trWho === 'media') items.push(ch('media', 200, f.trMedia))
      const a = { mute: [ac('trackop', 335, 2, 1)], solo: [ac('trackop', 334, 2, 1)], hide: [ac('trackop', 343, 0, 1)], color: [ac('plecolor', 312, f.trColor)], name: [ac('plename', 327, f.trName), ac('plename', 365, f.trName)] }[f.trHow]
      const who = { sel: 'Ausgewählte Spuren', name: 'Spuren mit „' + f.trText + '“', media: (MEDIA.find(m => m.v === f.trMedia)?.label || '') + '-Spuren' }[f.trWho]
      const how = { mute: ' muten/entmuten', solo: ' solo umschalten', hide: ' ausblenden', color: ' einfärben', name: ' umbenennen' }[f.trHow]
      return { tool: 'PLE', func: 1, items, actions: a, name: who + how, cat: 'Spuren' }
    }
  }
  return null
})
const preview = computed(() => {
  const r = build.value; if (!r) return ''
  const b = (items) => items.map(x => mkChip(x.t, Object.fromEntries(Object.entries(x).filter(([k]) => k !== 't'))))
  return summary({ tool: r.tool, func: r.func, root: mkGroup(103, b(r.items)), actions: r.actions.map(a => mkAction(a.t, Object.fromEntries(Object.entries(a).filter(([k]) => k !== 't')))) })
})
function apply() {
  loadRecipe(build.value); open.value = false
  toast.add({ title: 'Übernommen: ' + build.value.name, description: 'Im Editor weiter anpassen oder exportieren.', icon: 'i-lucide-wand', actions: [{ label: 'Rückgängig', color: 'neutral', variant: 'outline', onClick: () => undo() }] })
}
const seg = (opts, key) => ({ opts, key })
</script>

<template>
  <UModal v-model:open="open" title="Assistent" :description="task ? TASKS.find(t => t.id === task).label : 'Aufgabe wählen'" :ui="{ content: 'max-w-2xl' }">
    <template #body>
      <div v-if="!task" class="as-tasks">
        <button v-for="t in TASKS" :key="t.id" class="as-task" @click="task = t.id">
          <UIcon :name="t.icon" class="size-4 text-primary" /><span class="as-tl">{{ t.label }}</span><span class="as-th">{{ t.hint }}</span>
        </button>
      </div>
      <div v-else class="as-form">
        <template v-if="task === 'vel'">
          <div class="field"><span class="label-caps">Welche Noten</span><div class="seg sm"><button v-for="o in [['all', 'Alle'], ['sel', 'Ausgewählte'], ['pitch', 'Bestimmte Tonhöhen']]" :key="o[0]" :class="{ on: f.velWho === o[0] }" @click="f.velWho = o[0]">{{ o[1] }}</button></div></div>
          <KeyboardEditor v-if="f.velWho === 'pitch'" :c="f.keys" :octaves="5" />
          <div class="field"><span class="label-caps">Änderung</span><div class="seg sm"><button v-for="o in [['up', 'Anheben'], ['down', 'Absenken'], ['fix', 'Fester Wert'], ['pct', 'Skalieren'], ['hum', 'Humanisieren'], ['ramp', 'Rampe im Cycle']]" :key="o[0]" :class="{ on: f.velHow === o[0] }" @click="f.velHow = o[0]">{{ o[1] }}</button></div></div>
          <div class="row">
            <template v-if="f.velHow === 'up' || f.velHow === 'down'"><UInputNumber v-model="f.velN" :min="1" :max="127" size="sm" class="w-28" /><span class="hint">Velocity-Stufen</span></template>
            <template v-if="f.velHow === 'fix'"><UInputNumber v-model="f.velFix" :min="1" :max="127" size="sm" class="w-28" /></template>
            <template v-if="f.velHow === 'pct'"><UInputNumber v-model="f.velPct" :min="10" :max="300" size="sm" class="w-28" /><span class="hint">% des bisherigen Werts</span></template>
            <template v-if="f.velHow === 'hum'"><span class="hint">±</span><UInputNumber v-model="f.velHum" :min="1" :max="40" size="sm" class="w-28" /><span class="hint">zufällig um den bisherigen Wert</span></template>
            <template v-if="f.velHow === 'ramp'"><UInputNumber v-model="f.rampA" :min="1" :max="127" size="sm" class="w-24" /><span class="hint">→</span><UInputNumber v-model="f.rampB" :min="1" :max="127" size="sm" class="w-24" /><span class="hint">vom linken zum rechten Locator</span></template>
          </div>
        </template>
        <template v-if="task === 'notes'">
          <div class="field"><span class="label-caps">Welche Noten</span><div class="seg sm"><button v-for="o in [['pitch', 'Tonhöhe'], ['voice', 'Akkordstimme'], ['top', 'Höchste Akkordnote'], ['quiet', 'Leise Noten']]" :key="o[0]" :class="{ on: f.noteWho === o[0] }" @click="f.noteWho = o[0]">{{ o[1] }}</button></div></div>
          <KeyboardEditor v-if="f.noteWho === 'pitch'" :c="f.nkeys" :octaves="5" />
          <div v-if="f.noteWho === 'voice'" class="row"><span class="hint">Stimme</span><UInputNumber v-model="f.voice" :min="0" :max="7" size="sm" class="w-24" /><span class="hint">0 = oberste, 1 = zweite von oben …</span></div>
          <div v-if="f.noteWho === 'quiet'" class="row"><span class="hint">Velocity unter</span><UInputNumber v-model="f.quiet" :min="1" :max="127" size="sm" class="w-24" /></div>
          <div class="field"><span class="label-caps">Was passiert</span><div class="seg sm"><button v-for="o in [[5, 'Auf neue Spur verschieben'], [4, 'Auf neue Spur kopieren'], [6, 'Auswählen'], [0, 'Löschen']]" :key="o[0]" :class="{ on: f.noteTo === o[0] }" @click="f.noteTo = o[0]">{{ o[1] }}</button></div></div>
        </template>
        <template v-if="task === 'cc'">
          <div class="field"><span class="label-caps">Controller</span>
            <div class="row"><UInputNumber v-model="f.cc" :min="0" :max="127" size="sm" class="w-24" /><div class="quick"><button v-for="n in [1, 7, 10, 11, 64, 74]" :key="n" :class="{ on: f.cc === n }" @click="f.cc = n">{{ n }} {{ CC_NAMES[n] }}</button></div></div></div>
          <div class="field"><span class="label-caps">Was passiert</span><div class="seg sm"><button v-for="o in [['delete', 'Löschen'], ['cursor', 'Vor dem Cursor löschen'], ['copy', 'Auf andere Nummer kopieren'], ['move', 'Auf andere Nummer umleiten'], ['scale', 'Werte skalieren']]" :key="o[0]" :class="{ on: f.ccHow === o[0] }" @click="f.ccHow = o[0]">{{ o[1] }}</button></div></div>
          <div v-if="f.ccHow === 'copy' || f.ccHow === 'move'" class="row"><span class="hint">Ziel-Controller</span><UInputNumber v-model="f.ccTo" :min="0" :max="127" size="sm" class="w-24" /><span class="hint">{{ CC_NAMES[f.ccTo] }}</span></div>
          <div v-if="f.ccHow === 'scale'" class="row"><UInputNumber v-model="f.ccPct" :min="10" :max="300" size="sm" class="w-24" /><span class="hint">% des bisherigen Werts</span></div>
        </template>
        <template v-if="task === 'tracks'">
          <div class="field"><span class="label-caps">Welche Spuren</span><div class="seg sm"><button v-for="o in [['name', 'Name enthält'], ['media', 'Spurtyp'], ['sel', 'Ausgewählte']]" :key="o[0]" :class="{ on: f.trWho === o[0] }" @click="f.trWho = o[0]">{{ o[1] }}</button></div></div>
          <UInput v-if="f.trWho === 'name'" v-model="f.trText" size="sm" class="w-64" placeholder="Text im Spurnamen" />
          <div v-if="f.trWho === 'media'" class="w-64"><OptionList :items="MEDIA.filter(m => !m.unverified)" :model-value="f.trMedia" @update:model-value="v => f.trMedia = v" /></div>
          <div class="field"><span class="label-caps">Was passiert</span><div class="seg sm"><button v-for="o in [['mute', 'Mute umschalten'], ['solo', 'Solo umschalten'], ['hide', 'Ausblenden'], ['color', 'Einfärben'], ['name', 'Umbenennen']]" :key="o[0]" :class="{ on: f.trHow === o[0] }" @click="f.trHow = o[0]">{{ o[1] }}</button></div></div>
          <div v-if="f.trHow === 'color'" class="quick"><button v-for="c in COLORS" :key="c" :class="{ on: f.trColor === c }" @click="f.trColor = c">{{ c.replace('Color ', '') }}</button></div>
          <UInput v-if="f.trHow === 'name'" v-model="f.trName" size="sm" class="w-64" placeholder="Neuer Name" />
        </template>
        <div class="as-sum"><span class="label-caps">Ergebnis</span><p>{{ preview }}</p></div>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full items-center gap-2">
        <UButton v-if="task" icon="i-lucide-chevron-left" label="Andere Aufgabe" color="neutral" variant="ghost" @click="task = null" />
        <span class="flex-1" />
        <UButton label="Abbrechen" color="neutral" variant="ghost" @click="open = false" />
        <UButton v-if="task" label="In den Editor übernehmen" icon="i-lucide-check" @click="apply" />
      </div>
    </template>
  </UModal>
</template>

<style>
.as-tasks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.as-task { display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 10px; row-gap: 3px; align-items: center; text-align: left; padding: 12px; border-radius: 8px; border: 1px solid var(--ui-border); }
.as-task:hover { border-color: var(--le-accent-line); background: var(--ui-bg-muted); }
.as-tl { font-weight: 600; font-size: 13px; color: var(--ui-text-highlighted); }
.as-th { grid-column: 2; font-size: 12px; color: var(--ui-text-muted); line-height: 1.4; }
.as-form { display: flex; flex-direction: column; gap: 14px; }
.as-sum { border-top: 1px solid var(--ui-border); padding-top: 12px; display: flex; flex-direction: column; gap: 4px; }
.as-sum p { font-size: 13px; color: var(--ui-text-toned); }
@media (max-width: 640px) { .as-tasks { grid-template-columns: 1fr; } }
</style>
