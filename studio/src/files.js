// Datei speichern: lokal als Download; eingebettet in claude.ai über die Plattform-Funktion „downloads“ (dort als ZIP).
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0 } return t })()
const crc32 = (b) => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0 }
export function makeZip(files) {
  const parts = [], central = [], enc = new TextEncoder(), d = new Date(); let off = 0
  const dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF, dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF
  for (const f of files) {
    const nm = enc.encode(f.name), data = f.data, crc = crc32(data)
    const lh = new DataView(new ArrayBuffer(30)); lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(10, dt, true); lh.setUint16(12, dd, true); lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, nm.length, true)
    const ch = new DataView(new ArrayBuffer(46)); ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(12, dt, true); ch.setUint16(14, dd, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, nm.length, true); ch.setUint32(42, off, true)
    parts.push(new Uint8Array(lh.buffer), nm, data); central.push(new Uint8Array(ch.buffer), nm); off += 30 + nm.length + data.length
  }
  const cd = central.reduce((n, x) => n + x.length, 0), e = new DataView(new ArrayBuffer(22))
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cd, true); e.setUint32(16, off, true)
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: 'application/zip' })
}
export const embedded = () => typeof window.claude?.use === 'function'
// Ergebnis: { ok, how: 'download'|'platform', name } oder { ok:false, reason }
export async function saveXml(name, xml) {
  if (embedded()) {
    const dl = await window.claude.use('downloads')
    if (!dl) return { ok: false, reason: 'Speichern ist in dieser Ansicht nicht verfügbar. Die Datei le-tamer-studio.html lokal öffnen.' }
    const zipName = name.replace(/\.xml$/i, '') + '.zip'
    try { await dl.save({ filename: zipName, data: makeZip([{ name, data: new TextEncoder().encode(xml) }]) }); return { ok: true, how: 'platform', name: zipName } }
    catch (e) { return e?.code === 'declined' ? { ok: false, reason: null } : { ok: false, reason: 'Speichern abgelehnt (' + (e?.code || 'Fehler') + ').' } }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([xml], { type: 'application/xml' })); a.download = name
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 500)
  return { ok: true, how: 'download', name }
}
export function pickFile() {
  return new Promise((resolve) => {
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.xml,application/xml,text/xml'
    i.onchange = () => resolve(i.files?.[0] || null); i.click()
  })
}
export async function copyText(t) { try { await navigator.clipboard.writeText(t); return true } catch { return false } }
export const store = {
  get(k, d) { try { const v = localStorage.getItem('le-tamer:' + k); return v == null ? d : JSON.parse(v) } catch { return d } },
  set(k, v) { try { localStorage.setItem('le-tamer:' + k, JSON.stringify(v)); return true } catch { return false } }
}
