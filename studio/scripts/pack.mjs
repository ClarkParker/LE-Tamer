// Packt dist/app.js + dist/app.css in EINE HTML-Datei (../le-tamer-studio.html).
// Die Bibliotheken liegen gzip-komprimiert (base64) in der Datei und werden beim Öffnen im Browser
// per DecompressionStream entpackt – kein Server, keine Installation, kein Netzwerk.
// Aufruf: node scripts/pack.mjs [--embed <ziel.html>]  (--embed: Variante ohne <html>/<head>/<body> für Einbettungen)
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(here, '../dist')
const outFile = path.resolve(here, '../../le-tamer-studio.html')
const pkg = JSON.parse(fs.readFileSync(path.resolve(here, '../package.json'), 'utf8'))

const js = fs.readFileSync(path.join(dist, 'app.js'))
const lic = fs.readFileSync(path.join(dist, 'licenses.txt'), 'utf8').replace(/--/g, '- -')
const css = fs.readFileSync(path.join(dist, 'app.css'))
const gz = (b) => zlib.gzipSync(b, { level: 9 }).toString('base64')
const parts = [
  { id: 'css', label: 'Oberfläche', size: css.length, data: gz(css) },
  { id: 'js', label: 'Programm', size: js.length, data: gz(js) }
]
const kb = (n) => Math.round(n / 1024) + ' KB'

const loaderCss = `
:root{color-scheme:dark}
html,body{margin:0;background:#101317;color:#d5dade}
#boot{position:fixed;inset:0;display:grid;place-items:center;background:#101317;z-index:2147483000;transition:opacity .22s ease}
#boot.done{opacity:0;pointer-events:none}
#boot .b{width:min(320px,calc(100vw - 48px));font:500 13px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.01em}
#boot .t{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:14px}
#boot .n{font-size:15px;font-weight:600;color:#eef1f3;letter-spacing:.02em}
#boot .v{font:11px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#7d8790}
#boot .bar{height:2px;background:#22272d;border-radius:2px;overflow:hidden}
#boot .bar i{display:block;height:100%;width:0;background:#d9a441;transition:width .12s linear}
#boot .s{margin-top:10px;font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#7d8790;min-height:16px}
#boot .e{margin-top:14px;color:#f2a49b;font-size:13px;line-height:1.5}
@media (prefers-reduced-motion:reduce){#boot,#boot .bar i{transition:none}}`

const boot = `
(function () {
  var P = window.__LE_PAYLOAD__, bar = document.querySelector('#boot .bar i'), st = document.querySelector('#boot .s');
  function show(err) { var e = document.createElement('div'); e.className = 'e'; e.textContent = err; document.querySelector('#boot .b').appendChild(e); st.textContent = ''; }
  if (typeof DecompressionStream === 'undefined' || typeof TextDecoder === 'undefined') {
    show('Dieser Browser kann die eingebettete Datei nicht entpacken. Benötigt wird Chrome oder Edge ab Version 80, Firefox ab 113 oder Safari ab 16.4.');
    return;
  }
  document.documentElement.classList.add('dark');
  var total = P.reduce(function (n, p) { return n + p.size; }, 0), done = 0;
  function b64(s) { var bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  function unzip(p) {
    st.textContent = p.label + ' entpacken · ' + Math.round(p.size / 1024) + ' KB';
    var stream = new Blob([b64(p.data)]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text().then(function (t) { done += p.size; bar.style.width = Math.round(done / total * 100) + '%'; return t; });
  }
  var t0 = performance.now(), texts = {};
  P.reduce(function (pr, p) { return pr.then(function () { return unzip(p).then(function (t) { texts[p.id] = t; }); }); }, Promise.resolve())
    .then(function () {
      var s = document.createElement('style'); s.id = 'le-app-css'; s.textContent = texts.css; document.head.appendChild(s);
      st.textContent = 'Start';
      window.__LE_BOOT__ = { ms: Math.round(performance.now() - t0), bytes: total };
      window.__LE_READY__ = function () {
        var el = document.getElementById('boot'); el.classList.add('done'); setTimeout(function () { el.remove(); }, 260);
      };
      var sc = document.createElement('script'); sc.textContent = texts.js; document.body.appendChild(sc);
      window.__LE_PAYLOAD__ = null;
    })
    .catch(function (e) { show('Start fehlgeschlagen: ' + (e && e.message ? e.message : e)); });
})();`

const payload = 'window.__LE_PAYLOAD__=' + JSON.stringify(parts) + ';'
const body = `<div id="boot" role="status" aria-live="polite"><div class="b"><div class="t"><span class="n">LE-Tamer Studio</span><span class="v">${pkg.version}</span></div><div class="bar"><i></i></div><div class="s">Laden</div></div></div>
<div id="app"></div>
<script>${payload}</script>
<script>${boot}</script>`

const head = `<title>LE-Tamer Studio</title>\n<style>${loaderCss}</style>`
const notice = `<!--\n${lic}\n-->`
const full = `<!doctype html>\n<html lang="de" class="dark">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${body}\n${notice}\n</body>\n</html>\n`
fs.writeFileSync(outFile, full)
console.log('gepackt:', path.relative(process.cwd(), outFile), kb(full.length), '· entpackt', kb(css.length + js.length), '(CSS', kb(css.length) + ', JS', kb(js.length) + ')')
const i = process.argv.indexOf('--embed')
if (i > 0 && process.argv[i + 1]) {
  fs.writeFileSync(process.argv[i + 1], head + '\n' + body + '\n' + notice + '\n')
  console.log('Einbettungs-Variante:', process.argv[i + 1])
}
