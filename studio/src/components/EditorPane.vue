<script setup>
import { computed } from 'vue'
import { S, ctx, tool, allChips, addChip, addAction, moveAction, wrapInGroup } from '../model/store.js'
import { CHIPDEF, ACTDEF, FUNCS, USES_ACTIONS } from '../model/defs.js'
import { funcLabel } from '../model/text.js'
import { vSortable } from '../sortable.js'
import RuleGroup from './RuleGroup.vue'
import ActionRow from './ActionRow.vue'

// Bausteine je Werkzeug; Tonhöhe/Velocity bzw. Controller-Nr./-Wert erscheinen passend zum gesetzten Event-Typ.
const chipPalette = computed(() => {
  const t = S.tool, c = ctx.value, out = []
  for (const [k, d] of Object.entries(CHIPDEF)) {
    if (!d.tools.includes(t) || (d.expert && !S.expert)) continue
    if (d.ctx === 'other' && !(S.expert || c === 'other')) continue
    if ((d.ctx === 'note' || d.ctx === 'cc') && c && c !== d.ctx && !S.expert) continue
    if ((t === 'TR' || t === 'IT') && ['barpos', 'timepos', 'length', 'property', 'context'].includes(k)) continue
    out.push({ k, ...d })
  }
  return out
})
const actPalette = computed(() => {
  const t = S.tool, c = ctx.value, out = []
  for (const [k, d] of Object.entries(ACTDEF)) {
    if (!d.tools.includes(t)) continue
    if (d.ctx === 'other' && !(S.expert || c === 'other' || c === '')) continue
    if ((d.ctx === 'note' || d.ctx === 'cc') && c !== d.ctx && !S.expert) continue
    if ((t === 'TR' || t === 'IT') && ['position', 'length', 'nxp'].includes(k)) continue
    out.push({ k, ...d })
  }
  return out
})
const funcs = computed(() => tool.value.funcs.map(code => ({ code, ...FUNCS[code], label: funcLabel(code, S.tool), cubase: (S.tool === 'TR' || S.tool === 'IT') && FUNCS[code].rt ? FUNCS[code].rt.cubase : FUNCS[code].cubase, hint: (S.tool === 'TR' || S.tool === 'IT') && FUNCS[code].rt ? FUNCS[code].rt.hint : FUNCS[code].hint })))
const curFunc = computed(() => funcs.value.find(f => f.code === S.func) || funcs.value[0])
const usesActions = computed(() => !!USES_ACTIONS[S.func])
const nChips = computed(() => allChips(S.root).length)

function onPaletteDrop(info) {
  const type = info.item.type
  if (info.to.zone) { const c = addChip(type, info.to.gid); wrapInGroup(c.id); S.sel = { kind: 'chip', id: c.id }; return }
  addChip(type, info.to.gid, info.newIndex)
}
function onActPaletteDrop(info) { addAction(info.item.type, info.newIndex) }
function onActMove(info) { moveAction(info.oldIndex, info.newIndex) }
</script>

<template>
  <div class="ed" @click.self="S.sel = null">
    <section class="blk">
      <div class="blk-head">
        <h2 class="label-caps">Bedingungen</h2>
        <span class="blk-meta">{{ nChips ? nChips + ' Baustein' + (nChips > 1 ? 'e' : '') : 'keine – betrifft alle ' + tool.objects }}</span>
        <span class="grow" />
        <div v-show="S.dragging === 'rule' || S.dragging === 'palette'" class="rg-zone" :data-gid="S.root.id" data-zone="1"
          v-sortable="{ group: { name: 'rules', pull: false, put: true }, kind: 'zone' }">
          <UIcon name="i-lucide-group" class="size-3.5" />Hier ablegen: neue {{ S.root.bool === 103 ? 'Oder' : 'Und' }}-Gruppe
        </div>
      </div>
      <div class="pal" v-sortable="{ group: { name: 'rules', pull: 'clone', put: false }, sort: false, kind: 'palette', onEnd: onPaletteDrop }" aria-label="Bausteine">
        <UTooltip v-for="p in chipPalette" :key="p.k" :text="'Cubase: ' + p.cubase" :content="{ side: 'top' }">
          <button class="palbtn dnd" :data-type="p.k" @click="addChip(p.k)"><UIcon :name="p.icon" class="size-3.5" /><span>{{ p.label }}</span><span v-if="p.unverified" class="unv-dot" /></button>
        </UTooltip>
      </div>
      <div class="canvas" @click.self="S.sel = null">
        <RuleGroup :g="S.root" :depth="0" root />
      </div>
    </section>

    <section class="blk">
      <div class="blk-head"><h2 class="label-caps">Funktion</h2><span class="blk-meta">Cubase: {{ curFunc.cubase }}</span></div>
      <div class="seg funcs" role="radiogroup" aria-label="Funktion">
        <UTooltip v-for="f in funcs" :key="f.code" :text="f.hint" :content="{ side: 'top' }">
          <button role="radio" :aria-checked="S.func === f.code" :class="{ on: S.func === f.code, acc: S.func === f.code }" @click="S.func = f.code">
            <UIcon :name="f.icon" class="size-3.5" />{{ f.label }}<span v-if="f.unverified" class="unv-dot" />
          </button>
        </UTooltip>
      </div>
      <p class="hint mt-2">{{ curFunc.hint }}.</p>
    </section>

    <section class="blk" :class="{ muted: !usesActions }">
      <div class="blk-head">
        <h2 class="label-caps">Aktionen</h2>
        <span class="blk-meta">{{ usesActions ? (S.actions.length ? 'in dieser Reihenfolge' : 'keine') : 'werden bei „' + curFunc.label + '“ nicht ausgeführt' }}</span>
      </div>
      <div class="pal" v-sortable="{ group: { name: 'acts', pull: 'clone', put: false }, sort: false, kind: 'palette', onEnd: onActPaletteDrop }">
        <UTooltip v-for="p in actPalette" :key="p.k" :text="'Cubase: ' + p.cubase" :content="{ side: 'top' }">
          <button class="palbtn dnd" :data-type="p.k" @click="addAction(p.k)"><UIcon :name="p.icon" class="size-3.5" /><span>{{ p.label }}</span><span v-if="p.unverified" class="unv-dot" /></button>
        </UTooltip>
      </div>
      <div class="acts" data-gid="acts" v-sortable="{ group: { name: 'acts' }, handle: '.grip', kind: 'action', direction: 'vertical', onEnd: onActMove }">
        <ActionRow v-for="(a, i) in S.actions" :key="a.id" :a="a" :index="i" class="dnd" />
      </div>
      <div v-if="!S.actions.length" class="empty">Aktion oben anklicken oder hierher ziehen.</div>
    </section>
  </div>
</template>

<style>
.ed { max-width: 1000px; display: flex; flex-direction: column; gap: 24px; min-height: 100%; }
.blk { display: flex; flex-direction: column; gap: 10px; }
.blk.muted .acts { opacity: .55; }
.blk-head { display: flex; align-items: center; gap: 12px; min-height: 28px; }
.blk-head .grow { flex: 1; }
.rg-zone { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px; border-radius: 6px; border: 1px dashed var(--le-accent-line); color: var(--color-brass-200); font-size: 11.5px; background: var(--le-accent-soft); }
.rg-zone .dnd { display: none; }
.blk-head h2 { color: var(--ui-text-muted); }
.blk-meta { font-size: 11.5px; color: var(--ui-text-dimmed); }
.pal { display: flex; flex-wrap: wrap; gap: 4px; }
.palbtn { display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 9px; border-radius: 5px; font-size: 12px; color: var(--ui-text-muted);
  border: 1px solid var(--ui-border); background: transparent; cursor: grab; transition: color .12s, border-color .12s, background .12s; }
.palbtn:hover { color: var(--ui-text-highlighted); border-color: var(--ui-border-accented); background: var(--ui-bg-muted); }
.palbtn:active { cursor: grabbing; }
.canvas { padding: 14px; border-radius: 9px; background: var(--ui-bg); border: 1px solid var(--ui-border-muted); min-height: 64px; }
.funcs > button { height: 28px; }
.acts { display: flex; flex-direction: column; gap: 4px; min-height: 8px; }
.empty { display: flex; align-items: center; justify-content: center; height: 44px; border: 1px dashed var(--ui-border-accented); border-radius: 8px; color: var(--ui-text-dimmed); font-size: 12px; }
.dnd-ghost { opacity: .35; }
.dnd-drag, .dnd-drag * { pointer-events: none !important; }
.dnd-drag { opacity: .95 !important; box-shadow: 0 10px 28px oklch(0% 0 0 / .45); transform: rotate(-1deg); }
body.is-dragging, body.is-dragging * { cursor: grabbing !important; }
</style>
