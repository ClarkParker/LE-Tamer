<script setup>
import { ref, computed, watch } from 'vue'
import { S, selected, removeItem, duplicateItem, presetFolder, tool, built } from '../model/store.js'
import { CHIPDEF, ACTDEF, CONDLABEL, OPNAME, OPLABEL, TYPES, PROPS_LE, PROPS_PLE, TIMEPOS, CONTEXT, NOTEVALS, TRACKOPS, GENOP, NAMEOPS, COLORS, CC_NAMES } from '../model/defs.js'
import { chipValue, actionValue } from '../model/text.js'
import { clipEvents } from '../model/simulate.js'
import { LE, num, noteName } from '../model/util.js'
import { copyText } from '../files.js'
import KeyboardEditor from './editors/KeyboardEditor.vue'
import RangeEditor from './editors/RangeEditor.vue'
import CcEditor from './editors/CcEditor.vue'
import ChannelEditor from './editors/ChannelEditor.vue'
import BarEditor from './editors/BarEditor.vue'
import OptionList from './editors/OptionList.vue'
import LengthEditor from './editors/LengthEditor.vue'
import TextEditor from './editors/TextEditor.vue'

const props = defineProps({ os: String })
const tab = ref('item')
watch(() => S.sel?.id, (v) => { if (v) tab.value = 'item' })
const it = computed(() => selected.value)
const isChip = computed(() => S.sel?.kind === 'chip')
const d = computed(() => it.value ? (isChip.value ? CHIPDEF[it.value.t] : ACTDEF[it.value.t]) : null)

/* Bedingung */
const condItems = computed(() => (d.value?.conds || []).map(k => ({ k, label: CONDLABEL[k] })))
const ownCond = computed(() => ['bar', 'timepos', 'property', 'raw'].includes(d.value?.editor))
function setCond(k) { const c = it.value, was = [206, 207, 208, 209].includes(+c.cond); c.cond = k; if ([207, 209].includes(k) && !was && num(c.p2) <= num(c.p1)) c.p2 = Math.min(127, num(c.p1) + 12) }
const props_ = computed(() => S.tool === 'PLE' ? PROPS_PLE : PROPS_LE)
const ctxItem = computed(() => CONTEXT.find(x => x.v === +it.value?.p1))
const sampleValues = computed(() => {
  if (!it.value || !['velocity', 'ccval'].includes(it.value.t)) return []
  return clipEvents(S.clip).filter(e => it.value.t === 'velocity' ? e.type === 0 : e.type === 2).map(e => e.v2)
})
const cubaseLine = computed(() => {
  if (!it.value || !d.value) return ''
  if (isChip.value) return it.value.t === 'raw' ? it.value.obj.cls : d.value.cubase + ' · ' + (LE.CODES.conditions[+it.value.cond] ?? it.value.cond)
  return it.value.t === 'raw' ? it.value.obj.cls : d.value.cubase + ' · ' + (LE.CODES.operations[+it.value.op] ?? it.value.op)
})

/* Aktion */
const op = computed(() => +it.value?.op)
const p1 = computed({ get: () => num(it.value.p1), set: v => { it.value.p1 = v ?? 0 } })
const p2 = computed({ get: () => num(it.value.p2), set: v => { it.value.p2 = v ?? 0 } })
function setOp(o) {
  const a = it.value, was = +a.op, k = d.value.kind; a.op = o
  if ((o === 307 || o === 308) && was !== 307 && was !== 308) a.p1 = o === 307 ? 1.1 : 1.15
  else if ((was === 307 || was === 308) && o !== 307 && o !== 308) a.p1 = k === 'pitch' ? 12 : 10
  if (o === 310 || o === 317) { a.p1 = k === 'pitch' ? 48 : 60; a.p2 = k === 'pitch' ? 72 : 100 }
  if (o === 311) { a.p1 = -6; a.p2 = 6 }
  if (o === 312 && k === 'num') a.p1 = 100
  if (o === 312 && k === 'pitch') a.p1 = 60
  if (k === 'time' && o !== 304 && o !== 306) a.unit = 'ticks'
}
function setUnit(u) { const a = it.value; if ((a.unit || 'ticks') === u) return; a.unit = u; a.p1 = u === 'ms' ? Math.round(num(a.p1) / 0.96) : Math.round(num(a.p1) * 0.96) }
const pct = computed(() => { const f = num(it.value?.p1); if (!f) return ''; const r = op.value === 307 ? f : 1 / f; return (r >= 1 ? '+' : '−') + Math.abs(Math.round((r - 1) * 100)) + ' %' })
const trackop = computed(() => TRACKOPS.find(t => t.v === op.value))
const nameop = computed(() => NAMEOPS.find(n => n.v === op.value) || NAMEOPS[0])
const fixedSingle = computed(() => ({ id: it.value.id, get p1() { return it.value.p1 }, set p1(v) { it.value.p1 = v }, get p2() { return it.value.p1 }, set p2(v) {}, cond: 200 }))

/* Preset */
const folder = computed(() => presetFolder(props.os))
const osTab = ref(props.os)
const folderFor = computed(() => presetFolder(osTab.value))
const copied = ref(false)
async function copyFolder() { copied.value = await copyText(folderFor.value); setTimeout(() => copied.value = false, 1500) }
</script>

<template>
  <div class="insp-wrap">
    <div class="insp-tabs">
      <div class="seg sm"><button :class="{ on: tab === 'item' }" @click="tab = 'item'">Auswahl</button><button :class="{ on: tab === 'preset' }" @click="tab = 'preset'">Preset</button></div>
    </div>

    <!-- Auswahl -->
    <template v-if="tab === 'item'">
      <div v-if="!it" class="insp-empty">
        <UIcon name="i-lucide-mouse-pointer-click" class="size-5 text-dimmed" />
        <p>Baustein oder Aktion anklicken, um sie hier einzustellen.</p>
        <p class="hint">Entf löscht die Auswahl, Strg+D dupliziert sie.</p>
      </div>
      <div v-else class="insp-body">
        <div class="insp-head">
          <UIcon :name="d.icon" class="size-4 text-primary" />
          <h2>{{ d.label }}</h2>
          <span class="grow" />
          <UTooltip text="Duplizieren" :kbds="['meta', 'd']"><UButton icon="i-lucide-copy" size="xs" color="neutral" variant="ghost" aria-label="Duplizieren" @click="duplicateItem(it.id)" /></UTooltip>
          <UTooltip text="Entfernen" :kbds="['delete']"><UButton icon="i-lucide-trash-2" size="xs" color="neutral" variant="ghost" aria-label="Entfernen" @click="removeItem(it.id)" /></UTooltip>
        </div>
        <p class="insp-cubase mono">{{ cubaseLine }}</p>

        <!-- Bedingungs-Editoren -->
        <template v-if="isChip">
          <div v-if="!ownCond && condItems.length > 1" class="insp-sec">
            <span class="label-caps">Bedingung</span>
            <div class="seg sm"><button v-for="ci in condItems" :key="ci.k" :class="{ on: +it.cond === ci.k }" @click="setCond(ci.k)">{{ ci.label }}</button></div>
          </div>
          <div class="insp-sec">
            <span class="label-caps">{{ d.editor === 'keyboard' ? 'Noten' : d.editor === 'options' ? 'Auswahl' : 'Wert' }}</span>
            <KeyboardEditor v-if="d.editor === 'keyboard'" :c="it" />
            <RangeEditor v-else-if="d.editor === 'range'" :c="it" :min="d.min" :max="d.max" :values="sampleValues" />
            <CcEditor v-else-if="d.editor === 'cc'" :c="it" />
            <ChannelEditor v-else-if="d.editor === 'channel'" :c="it" />
            <BarEditor v-else-if="d.editor === 'bar'" :c="it" />
            <OptionList v-else-if="d.editor === 'options'" :items="d.opts" :model-value="+it.p1" @update:model-value="v => it.p1 = v" />
            <OptionList v-else-if="d.editor === 'timepos'" :items="TIMEPOS" :model-value="+it.cond" @update:model-value="v => it.cond = v" />
            <template v-else-if="d.editor === 'property'">
              <div class="seg sm mb-3"><button :class="{ on: +it.cond === 211 }" @click="it.cond = 211">Trifft zu</button><button :class="{ on: +it.cond === 212 }" @click="it.cond = 212">Trifft nicht zu</button></div>
              <OptionList :items="props_" :model-value="+it.p1" @update:model-value="v => it.p1 = v" />
            </template>
            <template v-else-if="d.editor === 'context'">
              <OptionList :items="CONTEXT" :model-value="+it.p1" @update:model-value="v => it.p1 = v" />
              <label v-if="ctxItem?.p2" class="field mt-3"><span class="fl">{{ ctxItem.p2 }}</span><UInputNumber :model-value="+it.p2" size="sm" class="w-28" @update:model-value="v => it.p2 = v ?? 0" /></label>
              <p class="hint mt-2">Eine Note zählt zum Akkord, wenn mindestens zwei weitere gleichzeitig klingen.</p>
            </template>
            <LengthEditor v-else-if="d.editor === 'length'" :c="it" />
            <TextEditor v-else-if="d.editor === 'text'" :c="it" :colors="it.t === 'color'" />
            <div v-else-if="d.editor === 'numbers'" class="row">
              <label class="field"><span class="fl">Eintrag (0–5)</span><UInputNumber :model-value="+it.p1" :min="0" :max="5" size="sm" class="w-24" @update:model-value="v => it.p1 = v ?? 0" /></label>
              <label class="field"><span class="fl">Wert</span><UInputNumber :model-value="+it.p2" :min="0" :max="255" size="sm" class="w-24" @update:model-value="v => it.p2 = v ?? 0" /></label>
              <p class="hint w-full">Bedeutung der sechs Einträge ist noch nicht aus Cubase 15 belegt.</p>
            </div>
            <div v-else-if="d.editor === 'raw'" class="hint">Diese Zeile stammt aus der geöffneten Datei. Das Studio kennt sie noch nicht und schreibt sie Byte für Byte unverändert zurück.
              <div class="mono mt-2 text-toned">{{ it.obj.cls }} · Bedingung {{ it.obj.cond }} · {{ it.obj.size }} B</div></div>
          </div>
        </template>

        <!-- Aktions-Editoren -->
        <template v-else>
          <div v-if="d.ops.length > 1 && !['trackop', 'name'].includes(d.kind)" class="insp-sec">
            <span class="label-caps">Operation</span>
            <div class="seg sm"><UTooltip v-for="o in d.ops" :key="o" :text="OPNAME[o]"><button :class="{ on: op === o }" @click="setOp(o)">{{ OPLABEL[o] }}</button></UTooltip></div>
          </div>
          <div class="insp-sec">
            <span class="label-caps">Wert</span>
            <template v-if="d.kind === 'num'">
              <RangeEditor v-if="op === 312" :c="fixedSingle" :min="d.min" :max="d.max" single />
              <template v-else-if="[310, 311, 317].includes(op)">
                <div class="row"><label class="field"><span class="fl">{{ op === 317 ? 'Start' : 'Von' }}</span><UInputNumber v-model="p1" size="sm" class="w-28" /></label>
                  <label class="field"><span class="fl">{{ op === 317 ? 'Ende' : 'Bis' }}</span><UInputNumber v-model="p2" size="sm" class="w-28" /></label></div>
                <p class="hint mt-2">{{ op === 311 ? 'Ein Zufallswert aus diesem Bereich wird zum vorhandenen Wert addiert.' : op === 317 ? 'Lineare Rampe zwischen linkem und rechtem Locator; ersetzt die Werte.' : 'Jedes Event bekommt einen Zufallswert aus diesem Bereich.' }}</p>
              </template>
              <template v-else>
                <UInputNumber v-model="p1" :step="op === 307 || op === 308 ? 0.05 : 1" size="sm" class="w-32" :format-options="{ maximumFractionDigits: 3, useGrouping: false }" />
                <div class="quick mt-2"><button v-for="q in (op === 307 || op === 308 ? [0.5, 0.8, 0.9, 1.1, 1.25, 1.5, 2] : op === 309 ? [5, 8, 10, 16, 32] : [1, 5, 10, 20, 30])" :key="q" :class="{ on: p1 === q }" @click="p1 = q">{{ String(q).replace('.', ',') }}</button></div>
                <p v-if="op === 307 || op === 308" class="hint mt-2">Entspricht {{ pct }}. Cubase begrenzt das Ergebnis auf 0–127.</p>
              </template>
            </template>
            <template v-else-if="d.kind === 'pitch'">
              <KeyboardEditor v-if="op === 312" :c="fixedSingle" single />
              <template v-else-if="op === 304 || op === 306">
                <div class="row"><UInputNumber v-model="p1" size="sm" class="w-28" /><span class="hint">Halbtöne</span></div>
                <div class="quick mt-2"><button v-for="q in [1, 2, 3, 5, 7, 12, 24]" :key="q" :class="{ on: p1 === q }" @click="p1 = q">{{ q === 12 ? 'Oktave' : q === 24 ? '2 Okt.' : q }}</button></div>
              </template>
              <div v-else class="row"><label class="field"><span class="fl">{{ op === 309 ? 'Raster' : 'Von' }}</span><UInputNumber v-model="p1" size="sm" class="w-28" /></label>
                <label v-if="op !== 309" class="field"><span class="fl">Bis</span><UInputNumber v-model="p2" size="sm" class="w-28" /></label></div>
            </template>
            <template v-else-if="d.kind === 'ccnum'">
              <CcEditor v-if="op === 312" :c="fixedSingle" single />
              <UInputNumber v-else v-model="p1" size="sm" class="w-28" />
            </template>
            <template v-else-if="d.kind === 'channel'">
              <ChannelEditor v-if="op === 312" :c="fixedSingle" single />
              <div v-else class="row"><UInputNumber v-model="p1" size="sm" class="w-28" /><span class="hint">Kanäle</span></div>
            </template>
            <OptionList v-else-if="d.kind === 'type'" :items="TYPES" :model-value="+it.p1" @update:model-value="v => it.p1 = v" />
            <template v-else-if="d.kind === 'time'">
              <div v-if="op === 304 || op === 306" class="seg sm mb-3"><button :class="{ on: it.unit !== 'ms' }" @click="setUnit('ticks')">Ticks</button><button :class="{ on: it.unit === 'ms' }" @click="setUnit('ms')">Millisekunden</button></div>
              <div class="row">
                <UInputNumber v-model="p1" :step="op === 307 || op === 308 ? 0.05 : it.unit === 'ms' ? 1 : 10" size="sm" class="w-32" :format-options="{ maximumFractionDigits: 3, useGrouping: false }" />
                <span class="hint">{{ op === 307 || op === 308 ? 'Faktor' : it.unit === 'ms' ? 'ms' : 'Ticks' }}</span>
                <template v-if="op === 311"><UInputNumber v-model="p2" size="sm" class="w-28" /><span class="hint">bis (Ticks)</span></template>
              </div>
              <div class="quick mt-2">
                <template v-if="op === 307 || op === 308"><button v-for="q in [0.5, 0.75, 1.5, 2]" :key="q" :class="{ on: p1 === q }" @click="p1 = q">{{ String(q).replace('.', ',') }}</button></template>
                <template v-else-if="it.unit === 'ms'"><button v-for="q in [5, 10, 20, 50, 100]" :key="q" :class="{ on: p1 === q }" @click="p1 = q">{{ q }} ms</button></template>
                <template v-else><button v-for="n in NOTEVALS" :key="n.v" :class="{ on: p1 === n.v }" @click="p1 = n.v">{{ n.label }}</button></template>
              </div>
              <p class="hint mt-2">Diese Schreibweise stammt aus älteren Cubase-Dateien und ist noch nicht in Cubase 15 geladen worden.</p>
            </template>
            <p v-else-if="d.kind === 'none'" class="hint">Entfernt die Note-Expression-Daten der getroffenen Noten.</p>
            <template v-else-if="d.kind === 'trackop'">
              <OptionList :items="TRACKOPS" :model-value="op" @update:model-value="v => it.op = v" />
              <div class="seg sm mt-3"><button v-for="(m, i) in (trackop?.modes || GENOP)" :key="i" :class="{ on: +it.p1 === i }" @click="it.p1 = i">{{ m }}</button></div>
              <label v-if="trackop?.slot" class="field mt-3"><span class="fl">Slot</span><UInputNumber :model-value="+it.p2" :min="1" :max="16" size="sm" class="w-24" @update:model-value="v => it.p2 = v ?? 1" /></label>
            </template>
            <template v-else-if="d.kind === 'name'">
              <OptionList :items="NAMEOPS" :model-value="op" @update:model-value="v => it.op = v" />
              <label class="field mt-3"><span class="fl">{{ nameop.p1 }}</span><UInput :model-value="it.p1" size="sm" class="w-full" @update:model-value="v => it.p1 = v" /></label>
              <label v-if="nameop.p2" class="field mt-2"><span class="fl">{{ nameop.p2 }}</span><UInput :model-value="String(it.p2)" size="sm" class="w-full" @update:model-value="v => it.p2 = op === 329 ? (parseInt(v, 10) || 0) : v" /></label>
              <p v-if="op === 327 || op === 365" class="hint mt-2">„Anhängen X“ gefolgt von „Text davor löschen X“ ersetzt den Namen vollständig – so machen es die Factory-Presets.</p>
            </template>
            <TextEditor v-else-if="d.kind === 'color'" :c="it" colors />
            <template v-else-if="d.kind === 'factor'">
              <UInputNumber v-model="p1" :step="0.05" size="sm" class="w-28" :format-options="{ maximumFractionDigits: 3, useGrouping: false }" />
              <p class="hint mt-2">Faktor auf die Automationswerte; 1,1 hebt um etwa 0,8 dB an.</p>
            </template>
            <div v-else class="hint">Diese Aktion stammt aus der geöffneten Datei und wird unverändert zurückgeschrieben.
              <div class="mono mt-2 text-toned">{{ it.obj.cls }} · Ziel {{ it.obj.target }} · Operation {{ it.obj.op }}</div></div>
          </div>
        </template>

        <div v-if="S.expert && it.t !== 'raw'" class="insp-sec">
          <span class="label-caps">Rohwerte</span>
          <div class="raw-grid mono">
            <span>{{ isChip ? 'Bedingung' : 'Operation' }}</span><span>{{ isChip ? it.cond : it.op }}</span>
            <span>Parameter 1</span><span>{{ it.p1 }}</span><span>Parameter 2</span><span>{{ it.p2 }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Preset -->
    <div v-else class="insp-body">
      <div class="insp-sec">
        <label class="field"><span class="fl">Name (wird Dateiname)</span><UInput v-model="S.name" size="sm" class="w-full" /></label>
        <label class="field"><span class="fl">Kategorie (Unterordner, optional)</span><UInput v-model="S.category" size="sm" placeholder="z. B. Drums" class="w-full" /></label>
        <label class="field"><span class="fl">Kommentar (wird in der Datei gespeichert)</span><UTextarea v-model="S.comment" :rows="2" autoresize size="sm" class="w-full" /></label>
      </div>
      <div class="insp-sec">
        <span class="label-caps">Schreibweise</span>
        <div class="seg sm"><button :class="{ on: S.style === 'modern' }" @click="S.style = 'modern'">Cubase 13–15</button><button :class="{ on: S.style === 'legacy' }" @click="S.style = 'legacy'">bis Cubase 12</button></div>
        <p class="hint">Cubase 13 hat Subtype/Main Value als neue Klassen eingeführt (Velocity als Fließkommawert). Cubase 13–15 lesen beide Schreibweisen.</p>
      </div>
      <div class="insp-sec">
        <span class="label-caps">In Cubase verwenden</span>
        <div class="seg sm"><button :class="{ on: osTab === 'win' }" @click="osTab = 'win'">Windows</button><button :class="{ on: osTab === 'mac' }" @click="osTab = 'mac'">macOS</button></div>
        <div class="pathbox mono"><span>{{ folderFor }}</span><UButton :icon="copied ? 'i-lucide-check' : 'i-lucide-clipboard-copy'" size="xs" color="neutral" variant="ghost" aria-label="Pfad kopieren" @click="copyFolder" /></div>
        <ol class="steps">
          <li>Exportieren und die Datei in diesen Ordner legen.</li>
          <li>{{ tool.open }}.</li>
          <li>Für ein Tastenkürzel: Bearbeiten › Tastaturbefehle › Process Logical Preset.</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style>
.insp-wrap { display: flex; flex-direction: column; min-height: 100%; }
.insp-tabs { padding: 10px 14px; border-bottom: 1px solid var(--ui-border); position: sticky; top: 0; background: var(--ui-bg); z-index: 2; }
.insp-empty { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 22px 16px; color: var(--ui-text-muted); font-size: 12.5px; }
.insp-body { display: flex; flex-direction: column; gap: 18px; padding: 14px 16px 24px; }
.insp-head { display: flex; align-items: center; gap: 8px; }
.insp-head h2 { font-size: 14px; font-weight: 600; color: var(--ui-text-highlighted); }
.insp-head .grow { flex: 1; }
.insp-cubase { font-size: 10.5px; color: var(--ui-text-dimmed); margin-top: -12px; }
.insp-sec { display: flex; flex-direction: column; gap: 8px; }
.raw-grid { display: grid; grid-template-columns: auto 1fr; gap: 3px 14px; font-size: 11px; color: var(--ui-text-muted); }
.pathbox { display: flex; align-items: center; gap: 6px; padding: 6px 6px 6px 9px; border-radius: 6px; background: var(--le-canvas); border: 1px solid var(--ui-border); font-size: 10.5px; color: var(--ui-text-toned); word-break: break-all; }
.pathbox span { flex: 1; min-width: 0; }
.steps { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--ui-text-muted); list-style: decimal; }
</style>
