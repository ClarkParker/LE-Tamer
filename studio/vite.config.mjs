import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import fs from 'node:fs'
import path from 'node:path'

// Der LE-Core (Decoder/Encoder) lebt genau einmal: im <script id="le-core">-Block von ../le-tamer.html.
// Dieses virtuelle Modul liest ihn beim Bauen und exportiert ihn als ES-Modul.
function leCore() {
  const id = 'virtual:le-core', rid = '\0' + id
  return {
    name: 'le-core',
    resolveId(s) { return s === id ? rid : null },
    load(s) {
      if (s !== rid) return null
      const file = path.resolve(__dirname, '../le-tamer.html')
      this.addWatchFile(file)
      const m = /<script id="le-core">([\s\S]*?)<\/script>/.exec(fs.readFileSync(file, 'utf8'))
      if (!m) throw new Error('le-core-Block in le-tamer.html nicht gefunden')
      return m[1].replace("if (typeof module !== 'undefined') module.exports = LE;", '') + '\nexport default LE;\n'
    }
  }
}

// Alle im Quelltext genannten Lucide-Icons sammeln, damit sie eingebettet werden (kein Nachladen aus dem Netz).
function usedIcons(dir) {
  const out = new Set()
  for (const f of fs.readdirSync(dir, { recursive: true })) {
    if (!/\.(vue|js)$/.test(f)) continue
    for (const m of fs.readFileSync(path.join(dir, f), 'utf8').matchAll(/i-lucide-([a-z0-9-]+)/g)) out.add('lucide:' + m[1])
  }
  return [...out].sort()
}

// Lizenzhinweise aller Pakete, die tatsächlich im Bundle landen (MIT/ISC/OFL verlangen die Weitergabe der Hinweise).
function licenses() {
  return {
    name: 'le-licenses',
    generateBundle(_, bundle) {
      const pkgs = new Map()
      for (const chunk of Object.values(bundle)) {
        for (const id of Object.keys(chunk.modules || {})) {
          const m = /node_modules\/((?:@[^/]+\/)?[^/]+)\//.exec(id.replace(/\\/g, '/')); if (!m) continue
          const dir = path.resolve(__dirname, 'node_modules', m[1]); if (pkgs.has(m[1]) || !fs.existsSync(dir)) continue
          const pj = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
          const lf = fs.readdirSync(dir).find(f => /^(licen[sc]e|copying)(\.|$)/i.test(f))
          pkgs.set(m[1], { name: m[1], version: pj.version, license: pj.license || '?', text: lf ? fs.readFileSync(path.join(dir, lf), 'utf8').trim() : '' })
        }
      }
      for (const [f, what] of [['@fontsource-variable/instrument-sans', 'Schrift'], ['@fontsource/ibm-plex-mono', 'Schrift'], ['@iconify-json/lucide', 'Icons']]) {
        const dir = path.resolve(__dirname, 'node_modules', f), pj = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
        const lf = fs.readdirSync(dir).find(x => /^licen[sc]e/i.test(x))
        pkgs.set(f, { name: f + ' (' + what + ')', version: pj.version, license: pj.license, text: lf ? fs.readFileSync(path.join(dir, lf), 'utf8').trim() : '' })
      }
      const list = [...pkgs.values()].sort((a, b) => a.name.localeCompare(b.name))
      const out = 'Eingebettete Drittanbieter-Software in LE-Tamer Studio\n\n' + list.map(p => `== ${p.name} ${p.version} (${p.license})\n${p.text}`).join('\n\n')
      this.emitFile({ type: 'asset', fileName: 'licenses.txt', source: out })
      this.emitFile({ type: 'asset', fileName: 'licenses.json', source: JSON.stringify(list.map(({ name, version, license }) => ({ name, version, license }))) })
    }
  }
}

export default defineConfig({
  base: './',
  define: { 'import.meta.dev': 'false' },
  plugins: [
    leCore(),
    licenses(),
    vue(),
    ui({
      router: false,
      dts: false,
      colorMode: false,
      ui: { colors: { primary: 'brass', neutral: 'mist', warning: 'orange', error: 'red', success: 'emerald', info: 'sky' } },
      icon: { clientBundle: { scan: true, icons: usedIcons(path.resolve(__dirname, 'src')) } }
    })
  ],
  build: {
    target: 'es2020',
    minify: process.env.LE_DEBUG ? false : 'oxc',
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    modulePreload: false,
    rolldownOptions: { output: { banner: '"use strict";', format: 'iife', inlineDynamicImports: true, entryFileNames: 'app.js', assetFileNames: 'app[extname]' } }
  }
})
