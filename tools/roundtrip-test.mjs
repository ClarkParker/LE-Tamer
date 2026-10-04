#!/usr/bin/env node
// Round-Trip-Test: dekodiert jede Preset-XML mit dem Core aus le-tamer.html, kodiert sie neu
// und vergleicht byteweise. Aufruf: node tools/roundtrip-test.mjs <dateien/globs...>
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../le-tamer.html', import.meta.url), 'utf8');
const m = /<script id="le-core">([\s\S]*?)<\/script>/.exec(html);
if (!m) { console.error('Kein <script id="le-core"> in le-tamer.html'); process.exit(2); }
const sandbox = { TextEncoder, TextDecoder, module: { exports: {} }, console };
vm.runInNewContext(m[1], sandbox, { filename: 'le-core.js' });
const LE = sandbox.module.exports;

function expand(args) {
  const out = [];
  for (const a of args) {
    if (fs.existsSync(a) && fs.statSync(a).isDirectory()) {
      for (const f of fs.readdirSync(a, { recursive: true })) if (f.toLowerCase().endsWith('.xml')) out.push(path.join(a, f));
    } else if (fs.existsSync(a)) out.push(a);
    else out.push(...fs.globSync ? fs.globSync(a) : []);
  }
  return out;
}
const files = expand(process.argv.slice(2));
if (!files.length) { console.error('keine Dateien'); process.exit(2); }
let ok = 0, okXml = 0, bad = [], errs = [];
for (const f of files) {
  let text;
  try { text = fs.readFileSync(f, 'latin1'); } catch (e) { errs.push([f, e.message]); continue; }
  if (!/<bin name="Preset">/.test(text)) continue;
  try {
    const { root, bytes, canModify } = LE.parseXml(text);
    const d = LE.decode(bytes);
    if (d.errors.length) errs.push([f, 'decode: ' + d.errors.join('; ')]);
    const out = LE.encode(d);
    if (LE.bytesEqual(out, bytes)) {
      ok++;
      const xml = LE.toXml(root, out, canModify);
      if (xml === fs.readFileSync(f, 'utf8')) okXml++;
    } else {
      let i = 0; while (i < Math.min(out.length, bytes.length) && out[i] === bytes[i]) i++;
      bad.push([f, `len ${bytes.length}→${out.length}, erste Abweichung @${i}`]);
    }
  } catch (e) { errs.push([f, e.message]); }
}
console.log(`Dateien: ${files.length}  byte-identisch: ${ok}  (davon XML-Text identisch: ${okXml})  abweichend: ${bad.length}  Fehler: ${errs.length}`);
for (const [f, why] of bad.slice(0, 15)) console.log('  DIFF ', path.basename(f), why);
for (const [f, why] of errs.slice(0, 15)) console.log('  ERR  ', path.basename(f), why);
process.exit(bad.length || errs.length ? 1 : 0);
