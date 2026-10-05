// v-sortable: SortableJS als Direktive. Sortable verschiebt DOM-Knoten; wir setzen den DOM zurück und ändern das Modell –
// Vue rendert danach neu. Callbacks erhalten Gruppen-IDs (data-gid) und Indizes der ziehbaren Elemente.
import Sortable from 'sortablejs'
import { S } from './model/store.js'

function restore(evt) {
  const { from, to, item, clone, oldIndex, newIndex, pullMode } = evt
  if (pullMode === 'clone') { if (to !== from) from.replaceChild(item, clone); else clone?.remove(); return }
  if (to !== from) from.insertBefore(item, from.children[oldIndex] || null)
  else if (oldIndex !== newIndex) { from.removeChild(item); from.insertBefore(item, from.children[oldIndex] || null) }
}
export const vSortable = {
  mounted(el, binding) {
    el._sv = binding.value || {}
    const o = el._sv
    el._sortable = Sortable.create(el, {
      group: o.group, sort: o.sort !== false, draggable: '.dnd', handle: o.handle || '.dnd', filter: '.nodrag', preventOnFilter: false,
      animation: 140, easing: 'cubic-bezier(.2,.7,.3,1)', forceFallback: true, fallbackOnBody: true, fallbackTolerance: 4,
      swapThreshold: o.swapThreshold ?? 0.65, invertSwap: o.invertSwap ?? false, direction: o.direction, emptyInsertThreshold: 24, delayOnTouchOnly: true, delay: 140,
      ghostClass: 'dnd-ghost', chosenClass: 'dnd-chosen', dragClass: 'dnd-drag', fallbackClass: 'dnd-drag',
      onStart() { S.dragging = el._sv.kind || true; document.body.classList.add('is-dragging') },
      onEnd(evt) {
        S.dragging = false; document.body.classList.remove('is-dragging')
        const fromKey = evt.from.dataset, toKey = evt.to.dataset
        const info = { from: fromKey, to: toKey, oldIndex: evt.oldDraggableIndex, newIndex: evt.newDraggableIndex, moved: evt.to !== evt.from || evt.oldIndex !== evt.newIndex, item: evt.item.dataset }
        restore(evt); window.__LE_LAST_DND__ = { ...info, toCls: evt.to.className, fromCls: evt.from.className }
        if (info.moved) el._sv.onEnd?.(info)
      }
    })
  },
  updated(el, binding) { el._sv = binding.value || {} },
  unmounted(el) { el._sortable?.destroy() }
}
