<script setup>
import { computed } from 'vue'
import { S, moveNode, moveIntoNewGroup, addChip, ungroup } from '../model/store.js'
import { vSortable } from '../sortable.js'
import RuleChip from './RuleChip.vue'
defineOptions({ name: 'RuleGroup' })
const props = defineProps({ g: Object, depth: Number, root: Boolean })
const word = computed(() => props.g.bool === 103 ? 'und' : 'oder')
function toggle() { props.g.bool = props.g.bool === 103 ? 104 : 103 }
function onEnd(info) {
  if (info.to.zone) { moveIntoNewGroup(info.from.gid, info.oldIndex, info.to.gid); return }
  moveNode(info.from.gid, info.oldIndex, info.to.gid, info.newIndex)
}
</script>

<template>
  <div class="rg" :class="{ root, nested: !root, or: g.bool === 104 }">
    <div class="rg-list" :data-gid="g.id" v-sortable="{ group: { name: 'rules' }, kind: 'rule', invertSwap: true, swapThreshold: 0.5, onEnd }">
      <div v-for="(it, i) in g.items" :key="it.id" class="rg-item dnd" :class="{ wide: it.type === 'group' }">
        <UTooltip v-if="i > 0" :text="g.bool === 103 ? 'Alle müssen zutreffen. Klicken für „oder“.' : 'Eine genügt. Klicken für „und“.'">
          <button class="conn nodrag" :class="{ or: g.bool === 104 }" @click.stop="toggle">{{ word }}</button>
        </UTooltip>
        <RuleChip v-if="it.type === 'chip'" :c="it" :in-group="!root" />
        <RuleGroup v-else :g="it" :depth="depth + 1" />
      </div>
      <div v-if="root && !g.items.length" class="rg-empty nodrag">Baustein anklicken oder hierher ziehen</div>
    </div>
    <button v-if="!root" class="rg-ungroup nodrag" title="Gruppe auflösen" aria-label="Gruppe auflösen" @click.stop="ungroup(g.id)"><UIcon name="i-lucide-ungroup" class="size-3.5" /></button>
  </div>
</template>

<style>
.rg { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; position: relative; }
.rg-list { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 4px; min-height: 30px; min-width: 40px; }
.rg.nested { padding: 6px 30px 6px 8px; border-radius: 8px; background: var(--le-group); border: 1px solid var(--ui-border-accented); }
.rg.nested::before, .rg.nested::after { position: absolute; top: 50%; transform: translateY(-50%); font-family: var(--font-mono); font-size: 16px; color: var(--ui-text-dimmed); }
.rg-item { display: inline-flex; align-items: center; gap: 4px; max-width: 100%; }
.conn { font-size: 11.5px; font-style: italic; color: var(--ui-text-dimmed); padding: 2px 5px; border-radius: 4px; font-stretch: 90%; }
.conn:hover { color: var(--color-brass-200); background: var(--le-accent-soft); }
.conn.or { color: var(--color-brass-300); }
.rg-empty { color: var(--ui-text-dimmed); font-size: 12px; padding: 4px 2px; }
.rg-ungroup { position: absolute; right: 4px; top: 5px; display: grid; place-items: center; width: 22px; height: 22px; border-radius: 4px; color: var(--ui-text-dimmed); opacity: 0; transition: opacity .12s; }
.rg.nested:hover > .rg-ungroup, .rg-ungroup:focus-visible { opacity: 1; }
.rg-ungroup:hover { color: var(--ui-text-highlighted); background: var(--ui-bg-accented); }
</style>
