<script setup>
import { ref, computed } from 'vue'
import { S, built, tool } from '../model/store.js'
import { CLIPS, clipEvents, evalGroup, previewResult, TRACKS, evalTrackGroup } from '../model/simulate.js'
import { cubaseRows, actionValue } from '../model/text.js'
import { CHIPDEF, CONTAINER, MEDIA, ACTDEF, USES_ACTIONS } from '../model/defs.js'
import { LE } from '../model/util.js'
import { copyText } from '../files.js'
import PianoRoll from './PianoRoll.vue'
const open = ref(true)
const tabs = [{ id: 'preview', label: 'Vorschau' }, { id: 'cubase', label: 'Cubase-Ansicht' }, { id: 'hex', label: 'Datei (Hex)' }]
const isPLE = computed(() => S.tool === 'PLE')
const ev = computed(() => clipEvents(S.clip))
const sim = computed(() => {
  const unknown = new Set(), all = ev.value, hits = {}
  for (const e of all) hits[e.i] = evalGroup(S.root, e, all, unknown)
  return { hits, unknown: [...unknown].filter(Boolean) }
})
const before = computed(() => ev.value.map(e => ({ ...e, hit: !!sim.value.hits[e.i] })))
const after = computed(() => previewResult(S, ev.value, sim.value.hits))
const nHit = computed(() => Object.values(sim.value.hits).filter(Boolean).length)
const unknownText = computed(() => sim.value.unknown.length ? 'Nicht simuliert: ' + sim.value.unknown.map(k => CHIPDEF[k]?.label || k).join(', ') + ' (als erfüllt angenommen).' : '')
const tracks = computed(() => { const u = new Set(); return TRACKS.map(t => ({ ...t, hit: evalTrackGroup(S.root, t, u) })) })
const nTrackHit = computed(() => tracks.value.filter(t => t.hit).length)
const rows = computed(() => built.value.dec ? cubaseRows(built.value.dec) : { rows: [], acts: [], func: '' })
const hexRows = computed(() => { const b = built.value.bytes, out = []; for (let i = 0; i < b.length; i += 16) { const sl = b.slice(i, i + 16); out.push({ off: i.toString(16).toUpperCase().padStart(4, '0'), hex: Array.from(sl, x => x.toString(16).toUpperCase().padStart(2, '0')).join(' '), asc: Array.from(sl, x => x >= 32 && x < 127 ? String.fromCharCode(x) : '·').join('') }) } return out })
const copied = ref(false)
async function copyHex() { copied.value = await copyText(LE.bytesToHex(built.value.bytes)); setTimeout(() => copied.value = false, 1500) }
const kindLabel = (t) => CONTAINER.find(x => x.v === t.kind)?.label
const mediaLabel = (t) => MEDIA.find(x => x.v === t.media)?.label
</script>

<template>
  <section class="pv" :class="{ closed: !open }">
    <div class="pv-head">
      <div class="seg sm"><button v-for="t in tabs" :key="t.id" :class="{ on: S.bottomTab === t.id }" @click="S.bottomTab = t.id; open = true">{{ t.label }}</button></div>
      <template v-if="S.bottomTab === 'preview' && open">
        <template v-if="!isPLE">
          <div class="seg sm"><button v-for="c in CLIPS" :key="c.id" :class="{ on: S.clip === c.id }" @click="S.clip = c.id">{{ c.label }}</button></div>
          <div class="seg sm"><button :class="{ on: S.previewMode === 'before' }" @click="S.previewMode = 'before'">Treffer</button><button :class="{ on: S.previewMode === 'after' }" @click="S.previewMode = 'after'">Ergebnis</button></div>
          <span class="pv-count num">{{ nHit }} von {{ ev.length }} Events getroffen</span>
        </template>
        <span v-else class="pv-count num">{{ nTrackHit }} von {{ tracks.length }} Objekten getroffen</span>
      </template>
      <template v-if="S.bottomTab === 'hex' && open"><span class="pv-count num">{{ built.bytes.length }} Bytes</span><UButton :icon="copied ? 'i-lucide-check' : 'i-lucide-clipboard-copy'" :label="copied ? 'Kopiert' : 'Kopieren'" size="xs" color="neutral" variant="ghost" @click="copyHex" /></template>
      <span class="grow" />
      <UButton :icon="open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'" size="xs" color="neutral" variant="ghost" :aria-label="open ? 'Vorschau einklappen' : 'Vorschau ausklappen'" @click="open = !open" />
    </div>
    <div v-if="open" class="pv-body">
      <template v-if="S.bottomTab === 'preview'">
        <template v-if="!isPLE">
          <PianoRoll :events="S.previewMode === 'after' ? after : before" :mode="S.previewMode" />
          <div class="pv-legend">
            <span><i class="lg-note" />Event</span>
            <template v-if="S.previewMode === 'before'"><span><i class="lg-hit" />Treffer</span></template>
            <template v-else><span><i class="lg-hit" />geändert / eingefügt</span><span><i class="lg-moved" />auf neue Spur oder Lane</span><span><i class="lg-del" />gelöscht</span></template>
            <span><i class="lg-cyc" />Cycle Takt 2–3</span><span><i class="lg-cur" />Cursor Takt 3</span>
            <span v-if="unknownText" class="pv-unk">{{ unknownText }}</span>
          </div>
        </template>
        <div v-else class="tracks">
          <div v-for="(t, i) in tracks" :key="i" class="trk" :class="{ hit: t.hit, sub: t.depth }">
            <span class="sw" :style="{ background: `oklch(66% 0.11 ${(t.color * 47) % 360})` }" />
            <UIcon :name="t.kind === 0 ? 'i-lucide-folder' : t.kind === 2 ? 'i-lucide-box' : t.kind === 3 ? 'i-lucide-flag' : 'i-lucide-audio-lines'" class="size-3.5 text-dimmed" />
            <span class="tn">{{ t.name }}</span>
            <span class="tf" v-if="t.sel">ausgewählt</span><span class="tf" v-if="t.mute">M</span><span class="tf" v-if="t.hidden">ausgeblendet</span><span class="tf" v-if="t.disabled">deaktiviert</span>
            <span class="grow" /><span class="tt mono">{{ kindLabel(t) }} · {{ mediaLabel(t) }}</span>
          </div>
        </div>
      </template>
      <div v-else-if="S.bottomTab === 'cubase'" class="cbv">
        <table class="cbt mono">
          <thead><tr><th></th><th>Filter Target</th><th>Condition</th><th>Parameter 1</th><th>Parameter 2</th><th></th><th>Bool</th></tr></thead>
          <tbody>
            <tr v-for="(r, i) in rows.rows" :key="i"><td class="br">{{ r.lb }}</td><td>{{ r.target }}</td><td>{{ r.cond }}</td><td>{{ r.p1 }}</td><td>{{ r.p2 }}</td><td class="br">{{ r.rb }}</td><td>{{ r.bool }}</td></tr>
            <tr v-if="!rows.rows.length"><td colspan="7" class="dim">keine Filterzeile</td></tr>
          </tbody>
        </table>
        <div class="cbf"><span class="label-caps">Function</span><span class="mono">{{ rows.func }}</span></div>
        <table v-if="rows.acts.length" class="cbt mono">
          <thead><tr><th>Action Target</th><th>Operation</th><th>Parameter 1</th><th>Parameter 2</th></tr></thead>
          <tbody><tr v-for="(a, i) in rows.acts" :key="i"><td>{{ a.target }}</td><td>{{ a.op }}</td><td>{{ a.p1 }}</td><td>{{ a.p2 }}</td></tr></tbody>
        </table>
        <p class="hint">So erscheint das Preset im Logical Editor von Cubase (englische Bezeichnungen wie in der Datei).</p>
      </div>
      <div v-else class="hexv mono">
        <div v-for="r in hexRows" :key="r.off" class="hr"><span class="ho">{{ r.off }}</span><span class="hh">{{ r.hex }}</span><span class="ha">{{ r.asc }}</span></div>
      </div>
    </div>
  </section>
</template>

<style>
.pv { border-top: 1px solid var(--ui-border); background: var(--ui-bg); display: flex; flex-direction: column; min-height: 0; }
.pv-head { display: flex; align-items: center; gap: 8px; padding: 7px 12px; flex-wrap: wrap; }
.pv-head .grow { flex: 1; }
.pv-count { font-size: 11.5px; color: var(--ui-text-dimmed); }
.pv-body { padding: 0 12px 10px; height: 252px; overflow: auto; }
.pv-legend { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 8px; font-size: 11px; color: var(--ui-text-dimmed); align-items: center; }
.pv-legend i { display: inline-block; width: 12px; height: 7px; border-radius: 1.5px; margin-right: 6px; vertical-align: 1px; }
.lg-note { background: var(--le-note); opacity: .6; } .lg-hit { background: var(--color-brass-400); } .lg-moved { border: 1px dashed var(--color-brass-400); } .lg-del { border: 1px dashed var(--le-del); }
.lg-cyc { background: oklch(78.5% 0.12 75 / 0.25); } .lg-cur { width: 2px !important; height: 11px !important; background: var(--ui-text-toned); }
.pv-unk { color: var(--le-warn); }
.tracks { display: flex; flex-direction: column; gap: 2px; }
.trk { display: flex; align-items: center; gap: 8px; height: 28px; padding: 0 10px; border-radius: 5px; font-size: 12px; color: var(--ui-text-muted); }
.trk.sub { padding-left: 30px; }
.trk.hit { background: var(--le-accent-soft); color: var(--color-brass-100); }
.trk .sw { width: 8px; height: 14px; border-radius: 2px; }
.trk .tn { color: inherit; }
.trk .tf { font-size: 10.5px; color: var(--ui-text-dimmed); border: 1px solid var(--ui-border); border-radius: 3px; padding: 0 4px; }
.trk .tt { font-size: 10px; color: var(--ui-text-dimmed); }
.trk .grow { flex: 1; }
.cbv { display: flex; flex-direction: column; gap: 12px; overflow-x: auto; }
.cbt { border-collapse: collapse; font-size: 11px; min-width: 560px; }
.cbt th { text-align: left; font-family: var(--font-sans); font-size: 10.5px; font-weight: 600; letter-spacing: .04em; color: var(--ui-text-dimmed); padding: 4px 10px; border-bottom: 1px solid var(--ui-border); }
.cbt td { padding: 5px 10px; border-bottom: 1px solid var(--ui-border-muted); color: var(--ui-text-toned); white-space: nowrap; }
.cbt td.br { color: var(--color-brass-300); width: 1%; }
.cbt td.dim { color: var(--ui-text-dimmed); }
.cbf { display: flex; align-items: baseline; gap: 12px; font-size: 11.5px; color: var(--ui-text-toned); }
.hexv { font-size: 10.5px; line-height: 1.7; color: var(--ui-text-muted); }
.hr { display: flex; gap: 16px; white-space: pre; }
.ho { color: var(--ui-text-dimmed); } .ha { color: var(--ui-text-dimmed); }
@media (max-width: 820px) { .pv-body { height: auto; max-height: none; } }
</style>
