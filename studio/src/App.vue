<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { de } from '@nuxt/ui/locale'
import { useToast } from '@nuxt/ui/composables'
import { S, undo, redo, removeItem, duplicateItem, importText, xmlText, fileName, issues, presetFolder, startHistory, loadRecipe, RECIPES } from './model/store.js'
import { saveXml, pickFile } from './files.js'
import TopBar from './components/TopBar.vue'
import LibraryPanel from './components/LibraryPanel.vue'
import EditorPane from './components/EditorPane.vue'
import InspectorPanel from './components/InspectorPanel.vue'
import PreviewPanel from './components/PreviewPanel.vue'
import StatusBar from './components/StatusBar.vue'
import CommandMenu from './components/CommandMenu.vue'
import AssistantDialog from './components/AssistantDialog.vue'

const toast = useToast()
const paletteOpen = ref(false), assistantOpen = ref(false), libOpen = ref(false), fileOver = ref(false)
const os = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent) ? 'mac' : 'win'

async function doExport() {
  if (issues.value.some(i => i.level === 'error')) { toast.add({ title: 'Export nicht möglich', description: issues.value.find(i => i.level === 'error').text, color: 'error', icon: 'i-lucide-circle-alert' }); return }
  const r = await saveXml(fileName.value, xmlText())
  if (r.ok) toast.add({ title: r.how === 'platform' ? 'Gespeichert: ' + r.name : 'Exportiert: ' + r.name, description: (r.how === 'platform' ? 'ZIP entpacken, dann die .xml nach ' : 'Datei nach ') + presetFolder(os) + ' kopieren.', icon: 'i-lucide-check', duration: 7000 })
  else if (r.reason) toast.add({ title: 'Nicht gespeichert', description: r.reason, color: 'error', icon: 'i-lucide-circle-alert' })
}
function openText(text, name) {
  try {
    const r = importText(text, name), parts = [r.bytes + ' Bytes']
    if (r.raws) parts.push(r.raws + ' Zeile(n) unverändert übernommen, nicht editierbar')
    if (r.legacy) parts.push('Altformat (Cubase SX) – Export im aktuellen Format')
    toast.add({ title: 'Geöffnet: ' + name, description: parts.join(' · '), icon: 'i-lucide-folder-open', actions: [{ label: 'Rückgängig', color: 'neutral', variant: 'outline', onClick: () => undo() }] })
  } catch (e) { toast.add({ title: 'Datei nicht lesbar', description: e.message, color: 'error', icon: 'i-lucide-circle-alert' }) }
}
async function doOpen() { const f = await pickFile(); if (f) openText(await f.text(), f.name) }
function applyRecipe(r) {
  loadRecipe(r); libOpen.value = false
  toast.add({ title: 'Vorlage geladen: ' + r.name, icon: 'i-lucide-library', duration: 3500, actions: [{ label: 'Rückgängig', color: 'neutral', variant: 'outline', onClick: () => undo() }] })
}
const cmd = { export: doExport, open: doOpen, palette: () => { paletteOpen.value = true }, assistant: () => { assistantOpen.value = true }, library: () => { libOpen.value = true }, recipe: applyRecipe }

function typing(e) { const t = e.target; return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) }
function onKey(e) {
  const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase()
  if (mod && k === 'k') { e.preventDefault(); paletteOpen.value = !paletteOpen.value; return }
  if (mod && k === 's') { e.preventDefault(); doExport(); return }
  if (mod && k === 'o') { e.preventDefault(); doOpen(); return }
  if (typing(e)) return
  if (mod && k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return }
  if (mod && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return }
  if (mod && k === 'd' && S.sel) { e.preventDefault(); duplicateItem(S.sel.id); return }
  if ((e.key === 'Delete' || e.key === 'Backspace') && S.sel) { e.preventDefault(); removeItem(S.sel.id); return }
  if (e.key === 'Escape' && S.sel) { S.sel = null }
}
function hasFiles(e) { return [...(e.dataTransfer?.types || [])].includes('Files') }
function onDragOver(e) { if (!hasFiles(e)) return; e.preventDefault(); fileOver.value = true }
function onDragLeave(e) { if (e.relatedTarget == null) fileOver.value = false }
async function onDrop(e) { if (!hasFiles(e)) return; e.preventDefault(); fileOver.value = false; const f = e.dataTransfer.files[0]; if (f) openText(await f.text(), f.name) }

onMounted(() => {
  loadRecipe(RECIPES.find(r => r.name === 'Hi-Hats auf 2 und 4 leiser')); S.source = null
  const pitch = S.root.items.find(i => i.t === 'pitch'); if (pitch) S.sel = { kind: 'chip', id: pitch.id }
  startHistory()
  window.addEventListener('keydown', onKey)
  window.__LE_READY__?.()
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <UApp :locale="de" :toaster="{ position: 'bottom-right', duration: 4500 }" :tooltip="{ delayDuration: 350 }">
    <div class="shell" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
      <TopBar :cmd="cmd" />
      <div class="body">
        <aside class="lib" aria-label="Vorlagen"><LibraryPanel :cmd="cmd" /></aside>
        <main class="work">
          <div class="editor"><EditorPane /></div>
          <PreviewPanel class="preview" />
        </main>
        <aside class="insp" aria-label="Inspector"><InspectorPanel :os="os" /></aside>
      </div>
      <StatusBar :cmd="cmd" />
      <div v-if="fileOver" class="file-over"><div><UIcon name="i-lucide-file-up" class="size-6" /><span>Preset-Datei loslassen zum Öffnen</span></div></div>
    </div>
    <USlideover v-model:open="libOpen" side="left" title="Vorlagen" :ui="{ content: 'max-w-xs', body: 'p-0' }">
      <template #body><LibraryPanel :cmd="cmd" compact /></template>
    </USlideover>
    <CommandMenu v-model:open="paletteOpen" :cmd="cmd" />
    <AssistantDialog v-model:open="assistantOpen" />
  </UApp>
</template>

<style>
.shell { height: 100%; display: grid; grid-template-rows: 46px minmax(0, 1fr) 26px; position: relative; }
.body { display: grid; grid-template-columns: 252px minmax(0, 1fr) 340px; min-height: 0; }
.lib { border-right: 1px solid var(--ui-border); background: var(--ui-bg); overflow: auto; min-height: 0; }
.work { display: grid; grid-template-rows: minmax(0, 1fr) auto; grid-template-columns: minmax(0, 1fr); min-height: 0; min-width: 0; background: var(--le-canvas); }
.editor { overflow: auto; min-height: 0; padding: 18px 24px 28px; }
.insp { border-left: 1px solid var(--ui-border); background: var(--ui-bg); overflow: auto; min-height: 0; }
.file-over { position: absolute; inset: 0; z-index: 60; display: grid; place-items: center; background: oklch(15% 0.006 232 / 0.82); backdrop-filter: blur(2px); }
.file-over > div { display: flex; align-items: center; gap: 10px; padding: 18px 24px; border: 1px dashed var(--le-accent-line); border-radius: 10px; color: var(--color-brass-100); background: var(--ui-bg); font-size: 14px; }
@media (max-width: 1180px) { .body { grid-template-columns: minmax(0, 1fr) 320px; } .lib { display: none; } }
@media (max-width: 820px) {
  .shell { height: auto; min-height: 100%; grid-template-rows: auto auto auto; }
  .body { grid-template-columns: minmax(0, 1fr); }
  .work { grid-template-rows: auto auto; }
  .editor { overflow: visible; padding: 14px 16px 20px; }
  .insp { border-left: 0; border-top: 1px solid var(--ui-border); overflow: visible; }
}
</style>
