import { createApp } from 'vue'
import ui from '@nuxt/ui/vue-plugin'
import './styles/main.css'
import App from './App.vue'
import { S, importText } from './model/store.js'
import { buildDoc, docToState } from './model/doc.js'
import { makeZip } from './files.js'
import TIME_TPL from '../../data/time-templates.json'
import LE from 'virtual:le-core'

document.documentElement.classList.add('dark')
createApp(App).use(ui).mount('#app')
// Schnittstelle für automatische Tests (Import-/Export-Treue gegen den Preset-Korpus)
window.STUDIO = { S, LE, importText, docToState, buildDoc: (s) => buildDoc(s, TIME_TPL), makeZip }
