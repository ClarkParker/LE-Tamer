// Definitionen: Werkzeuge, Funktionen, Bedingungs- und Aktionsbausteine.
// Texte sind sachlich: Bezeichnung + was Cubase daraus macht. Codes stammen aus data/le-codes.json.

export const TOOLS = [
  { id: 'LE', label: 'Logical Editor', root: 'Logical_EditPreset', one: 1, typeMax: 8, propMax: 4, objects: 'Events', folder: 'Logical Edit', funcs: [1, 0, 6, 8, 2, 3, 4, 5, 7],
    open: 'MIDI › Logical Editor, Preset-Menü › User Presets' },
  { id: 'PLE', label: 'Project Logical Editor', root: 'Project_Logical_EditorPreset', one: 1, typeMax: 8, propMax: 9, objects: 'Spuren, Parts und Events', folder: 'Project Logical Editor', funcs: [1, 0, 6, 8],
    open: 'Projekt › Project Logical Editor, Preset-Menü › User Presets' },
  { id: 'TR', label: 'Transformer', root: 'TransformerPreset', one: 1, typeMax: 6, propMax: 4, objects: 'Events', folder: 'Transformer', funcs: [0, 1, 2, 3],
    open: 'MIDI-Insert „Transformer“ › Preset laden' },
  { id: 'IT', label: 'Input Transformer', root: 'Input_TransformerPreset', one: 0, typeMax: 6, propMax: 4, objects: 'eingehende Events', folder: 'Input Transformer', funcs: [0, 1, 2, 3],
    open: 'Inspector › Input Transformer › Modul › Preset laden' }
]
export const TOOL = Object.fromEntries(TOOLS.map(t => [t.id, t]))

export const FUNCS = {
  1: { label: 'Transformieren', hint: 'Treffer mit den Aktionen ändern', cubase: 'Transform', icon: 'i-lucide-pencil-line' },
  0: { label: 'Löschen', hint: 'Treffer entfernen', cubase: 'Delete', icon: 'i-lucide-trash-2', rt: { label: 'Herausfiltern', hint: 'Treffer nicht durchlassen', cubase: 'Filter' } },
  6: { label: 'Auswählen', hint: 'Treffer auswählen', cubase: 'Select', icon: 'i-lucide-square-dashed-mouse-pointer' },
  8: { label: 'Auswahl aufheben', hint: 'Treffer abwählen', cubase: 'Deselect', icon: 'i-lucide-square-dashed' },
  2: { label: 'Einfügen', hint: 'Geänderte Kopien zusätzlich einfügen', cubase: 'Insert', icon: 'i-lucide-copy-plus' },
  3: { label: 'Exklusiv einfügen', hint: 'Treffer ändern, alle übrigen Events löschen', cubase: 'Insert Exclusive', icon: 'i-lucide-filter' },
  4: { label: 'Kopieren', hint: 'Geänderte Kopien auf eine neue Spur', cubase: 'Copy', icon: 'i-lucide-copy' },
  5: { label: 'In Spur extrahieren', hint: 'Treffer auf eine neue Spur verschieben', cubase: 'Extract to Track', icon: 'i-lucide-scissors' },
  7: { label: 'In Lanes extrahieren', hint: 'Treffer in eine neue Lane verschieben', cubase: 'Extract to Lanes', icon: 'i-lucide-rows-3', unverified: true }
}
export const USES_ACTIONS = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 7: 1 }

export const NUMC = [200, 201, 202, 203, 204, 205, 207, 209]
export const CONDLABEL = { 200: 'gleich', 201: 'ungleich', 202: 'größer', 203: 'größer gleich', 204: 'kleiner', 205: 'kleiner gleich', 207: 'zwischen', 209: 'außerhalb',
  206: 'im Taktbereich', 208: 'außerhalb Taktbereich', 210: 'enthält', 221: 'enthält nicht', 211: 'gesetzt', 212: 'nicht gesetzt', 214: 'alle Typen',
  216: 'vor dem Cursor', 217: 'hinter dem Cursor', 218: 'im Cycle', 219: 'außerhalb Cycle', 220: 'genau Cycle', 222: 'im ausgewählten Marker' }
export const CONDSYM = { 200: '=', 201: '≠', 202: '>', 203: '≥', 204: '<', 205: '≤' }

export const CC_NAMES = { 0: 'Bank Select', 1: 'Modulation', 2: 'Breath', 4: 'Foot', 5: 'Portamento Time', 7: 'Volume', 8: 'Balance', 10: 'Pan', 11: 'Expression', 64: 'Sustain', 65: 'Portamento', 66: 'Sostenuto', 67: 'Soft Pedal', 71: 'Resonance', 72: 'Release', 73: 'Attack', 74: 'Cutoff', 91: 'Reverb', 93: 'Chorus', 120: 'All Sound Off', 121: 'Reset Controllers', 123: 'All Notes Off' }
export const TYPES = [
  { v: 0, label: 'Note' }, { v: 2, label: 'Controller' }, { v: 3, label: 'Program Change' }, { v: 4, label: 'Aftertouch' }, { v: 5, label: 'Pitchbend' }, { v: 6, label: 'SysEx' },
  { v: 1, label: 'Poly Pressure', unverified: true }, { v: 7, label: 'VST 3 Event', unverified: true }, { v: 8, label: 'SMF Event', unverified: true }
]
export const PROPS_LE = [{ v: 0, label: 'Stummgeschaltet' }, { v: 1, label: 'Ausgewählt' }, { v: 2, label: 'Leer' }, { v: 3, label: 'In Note Expression' }, { v: 4, label: 'Gültiges VST 3', unverified: true }]
export const PROPS_PLE = [...PROPS_LE, { v: 5, label: 'Versteckt' }, { v: 6, label: 'Hat Spurversion' }, { v: 7, label: 'Folgt Akkordspur' }, { v: 8, label: 'Deaktiviert' }, { v: 9, label: 'Übergeordnetes Objekt ausgewählt', unverified: true }]
export const TIMEPOS = [{ v: 216, label: 'Vor dem Cursor' }, { v: 217, label: 'Hinter dem Cursor' }, { v: 218, label: 'Im Cycle' }, { v: 220, label: 'Genau der Cycle-Bereich' },
  { v: 219, label: 'Außerhalb des Cycle', unverified: true }, { v: 222, label: 'Im ausgewählten Cycle-Marker', unverified: true }]
export const CONTEXT = [
  { v: 0, label: 'Höchste Note' }, { v: 1, label: 'Tiefste Note', unverified: true }, { v: 2, label: 'Mittlere Tonhöhe', unverified: true },
  { v: 3, label: 'Höchste Velocity' }, { v: 4, label: 'Niedrigste Velocity', unverified: true }, { v: 5, label: 'Mittlere Velocity', unverified: true },
  { v: 6, label: 'Höchster CC-Wert', unverified: true }, { v: 7, label: 'Niedrigster CC-Wert', unverified: true }, { v: 8, label: 'Mittlerer CC-Wert', unverified: true },
  { v: 9, label: 'Noten im Akkord', p2: 'Anzahl', unverified: true }, { v: 10, label: 'Stimmen im Part', p2: 'Anzahl', unverified: true }, { v: 11, label: 'Position im Akkord (Part)', p2: 'Position', unverified: true },
  { v: 12, label: 'Noten-Nr. im Akkord (tiefste = 0)', p2: 'Nummer' }, { v: 13, label: 'Position im Akkord (Akkordspur)', p2: 'Position' }, { v: 14, label: 'Stimme (oberste = 0)', p2: 'Stimme' },
  { v: 15, label: 'Höchste Note ab n Noten', p2: 'n', unverified: true }, { v: 16, label: 'Tiefste Note ab n Noten', p2: 'n', unverified: true }
]
export const MEDIA = [{ v: 0, label: 'Audio' }, { v: 1, label: 'MIDI / Instrument' }, { v: 2, label: 'Automation' }, { v: 3, label: 'Marker' }, { v: 7, label: 'Taktart' }, { v: 8, label: 'Akkord' },
  { v: 4, label: 'Transpose', unverified: true }, { v: 5, label: 'Arranger', unverified: true }, { v: 6, label: 'Tempo', unverified: true }, { v: 9, label: 'Skala', unverified: true },
  { v: 10, label: 'Video', unverified: true }, { v: 11, label: 'Gruppe', unverified: true }, { v: 12, label: 'Effekt', unverified: true }, { v: 13, label: 'Gerät', unverified: true }, { v: 14, label: 'VCA', unverified: true }]
export const CONTAINER = [{ v: 0, label: 'Ordnerspur' }, { v: 1, label: 'Spur' }, { v: 2, label: 'Part' }, { v: 3, label: 'Event' }]
export const NOTEVALS = [{ label: '1/1', v: 1920 }, { label: '1/2', v: 960 }, { label: '1/4', v: 480 }, { label: '1/8', v: 240 }, { label: '1/16', v: 120 }, { label: '1/32', v: 60 },
  { label: '1/4 punk.', v: 720 }, { label: '1/8 punk.', v: 360 }, { label: '1/8 T', v: 160 }, { label: '1/16 T', v: 80 }]
export const TRACKOPS = [
  { v: 331, label: 'Ordner', modes: ['öffnen', 'schließen', 'umschalten'] }, { v: 334, label: 'Solo' }, { v: 335, label: 'Mute' }, { v: 332, label: 'Aufnahme' }, { v: 333, label: 'Monitor' },
  { v: 343, label: 'Spur ausblenden', modes: ['ausblenden', 'einblenden', 'umschalten'] }, { v: 342, label: 'Lanes aktiv' }, { v: 340, label: 'Inserts Bypass' },
  { v: 344, label: 'Zeitbasis', modes: ['musikalisch', 'linear', 'umschalten'] }, { v: 371, label: 'Insert-Slot', slot: true },
  { v: 336, label: 'Automation lesen', unverified: true }, { v: 337, label: 'Automation schreiben', unverified: true }, { v: 338, label: 'EQ Bypass', unverified: true },
  { v: 341, label: 'Sends Bypass', unverified: true }, { v: 370, label: 'Send-Slot', slot: true, unverified: true }]
export const GENOP = ['einschalten', 'ausschalten', 'umschalten']
export const NAMEOPS = [{ v: 326, label: 'Ersetzen', p1: 'Neuer Name' }, { v: 327, label: 'Anhängen', p1: 'Text' }, { v: 328, label: 'Voranstellen', p1: 'Text' },
  { v: 329, label: 'Nummerieren', p1: 'Text', p2: 'Startnummer' }, { v: 330, label: 'Suchen und ersetzen', p1: 'Suchen', p2: 'Ersetzen durch' }, { v: 365, label: 'Text davor löschen', p1: 'Bis zu' }]
export const COLORS = Array.from({ length: 16 }, (_, i) => 'Color ' + (i + 1))

// Bedingungsbausteine. ctx: nur sinnvoll, wenn der Event-Typ Note ('note') bzw. Controller ('cc') ist.
export const CHIPDEF = {
  type: { label: 'Event-Typ', cubase: 'Type', icon: 'i-lucide-tag', tools: ['LE', 'TR', 'IT'], editor: 'options', opts: TYPES, conds: [200, 201, 214], def: { cond: 200, p1: 0 } },
  pitch: { label: 'Tonhöhe', cubase: 'Subtype (Pitch)', icon: 'i-lucide-piano', tools: ['LE', 'TR', 'IT'], ctx: 'note', editor: 'keyboard', conds: NUMC, def: { cond: 200, p1: 60, p2: 60 } },
  velocity: { label: 'Velocity', cubase: 'Main Value (Velocity)', icon: 'i-lucide-chart-no-axes-column-increasing', tools: ['LE', 'TR', 'IT'], ctx: 'note', editor: 'range', min: 0, max: 127, conds: NUMC, def: { cond: 204, p1: 40, p2: 40 } },
  ccnum: { label: 'Controller-Nr.', cubase: 'Subtype (CC-Nummer)', icon: 'i-lucide-hash', tools: ['LE', 'TR', 'IT'], ctx: 'cc', editor: 'cc', conds: NUMC, def: { cond: 200, p1: 1, p2: 1 } },
  ccval: { label: 'Controller-Wert', cubase: 'Main Value (CC-Wert)', icon: 'i-lucide-sliders-horizontal', tools: ['LE', 'TR', 'IT'], ctx: 'cc', editor: 'range', min: 0, max: 127, conds: NUMC, def: { cond: 202, p1: 64, p2: 64 } },
  subtype: { label: 'Wert 1', cubase: 'Subtype', icon: 'i-lucide-binary', tools: ['LE', 'TR', 'IT'], ctx: 'other', editor: 'range', min: 0, max: 127, conds: NUMC, def: { cond: 200, p1: 0, p2: 0 } },
  mainvalue: { label: 'Wert 2', cubase: 'Main Value', icon: 'i-lucide-binary', tools: ['LE', 'TR', 'IT'], ctx: 'other', editor: 'range', min: 0, max: 127, conds: NUMC, def: { cond: 200, p1: 0, p2: 0 } },
  channel: { label: 'Kanal', cubase: 'Channel', icon: 'i-lucide-cable', tools: ['LE', 'TR', 'IT'], editor: 'channel', conds: [200, 201, 207, 209], def: { cond: 200, p1: 1, p2: 1 } },
  barpos: { label: 'Position im Takt', cubase: 'Position · Bar Range', icon: 'i-lucide-columns-4', tools: ['LE', 'PLE'], editor: 'bar', conds: [206, 208], def: { cond: 206, p1: 460, p2: 500 } },
  timepos: { label: 'Cursor / Cycle', cubase: 'Position', icon: 'i-lucide-repeat-2', tools: ['LE', 'PLE'], editor: 'timepos', conds: [216, 217, 218, 220, 219, 222], def: { cond: 216 } },
  length: { label: 'Länge', cubase: 'Length', icon: 'i-lucide-move-horizontal', tools: ['LE', 'PLE'], editor: 'length', conds: NUMC, def: { cond: 204, p1: 120, p2: 120, unit: 'ticks' } },
  property: { label: 'Eigenschaft', cubase: 'Property', icon: 'i-lucide-flag', tools: ['LE', 'PLE', 'TR', 'IT'], editor: 'property', conds: [211, 212], def: { cond: 211, p1: 1 } },
  context: { label: 'Akkord-Kontext', cubase: 'Context Variable', icon: 'i-lucide-layers', tools: ['LE'], editor: 'context', conds: [200, 201, 202, 203, 204, 205], def: { cond: 200, p1: 14, p2: 1 } },
  lastevent: { label: 'Letztes Event', cubase: 'Last Event', icon: 'i-lucide-history', tools: ['LE', 'TR', 'IT'], expert: true, editor: 'numbers', conds: NUMC, def: { cond: 200, p1: 0, p2: 0 }, unverified: true },
  container: { label: 'Objektart', cubase: 'Container Type', icon: 'i-lucide-box', tools: ['PLE'], editor: 'options', opts: CONTAINER, conds: [200, 201, 214], def: { cond: 200, p1: 1 } },
  media: { label: 'Spurtyp', cubase: 'Media Type', icon: 'i-lucide-audio-lines', tools: ['PLE'], editor: 'options', opts: MEDIA, conds: [200, 201, 214], def: { cond: 200, p1: 1 } },
  name: { label: 'Name', cubase: 'Name', icon: 'i-lucide-type', tools: ['PLE'], editor: 'text', conds: [210, 200, 221], def: { cond: 210, p1: '' } },
  color: { label: 'Farbe', cubase: 'Color Name', icon: 'i-lucide-palette', tools: ['PLE'], editor: 'text', conds: [200, 210, 221], def: { cond: 200, p1: 'Color 1' } },
  raw: { label: 'Unbekannte Zeile', cubase: '', icon: 'i-lucide-file-code-2', tools: [], editor: 'raw', conds: [], def: {} }
}

export const OPLABEL = { 304: '+', 306: '−', 307: '×', 308: '÷', 309: 'Runden', 310: 'Zufall', 311: 'Zufall ±', 312: 'Fest', 317: 'Rampe', 355: 'Entfernen' }
export const OPNAME = { 304: 'Addieren', 306: 'Subtrahieren', 307: 'Multiplizieren', 308: 'Dividieren', 309: 'Runden auf Vielfache', 310: 'Zufallswert zwischen', 311: 'Zufällig ± zwischen', 312: 'Fester Wert', 317: 'Rampe im Cycle', 355: 'Entfernen' }
export const ACTDEF = {
  velocity: { label: 'Velocity', cubase: 'Main Value / Velocity', icon: 'i-lucide-chart-no-axes-column-increasing', tools: ['LE', 'TR', 'IT'], ctx: 'note', kind: 'num', min: 0, max: 127, ops: [304, 306, 307, 308, 312, 310, 311, 309, 317], def: { op: 304, p1: 10, p2: 0 } },
  pitch: { label: 'Tonhöhe', cubase: 'Subtype (Pitch)', icon: 'i-lucide-piano', tools: ['LE', 'TR', 'IT'], ctx: 'note', kind: 'pitch', ops: [304, 306, 312, 310, 311, 309], def: { op: 304, p1: 12, p2: 0 } },
  ccnum: { label: 'Controller-Nr.', cubase: 'Subtype (CC-Nummer)', icon: 'i-lucide-hash', tools: ['LE', 'TR', 'IT'], ctx: 'cc', kind: 'ccnum', ops: [312, 304, 306], def: { op: 312, p1: 11, p2: 0 } },
  ccval: { label: 'Controller-Wert', cubase: 'Main Value (CC-Wert)', icon: 'i-lucide-sliders-horizontal', tools: ['LE', 'TR', 'IT'], ctx: 'cc', kind: 'num', min: 0, max: 127, ops: [304, 306, 307, 308, 312, 310, 311, 309, 317], def: { op: 307, p1: 0.8, p2: 0 } },
  subtype: { label: 'Wert 1', cubase: 'Subtype', icon: 'i-lucide-binary', tools: ['LE', 'TR', 'IT'], ctx: 'other', kind: 'num', min: 0, max: 127, ops: [304, 306, 307, 308, 312, 310, 311, 309], def: { op: 312, p1: 0, p2: 0 } },
  mainvalue: { label: 'Wert 2', cubase: 'Main Value', icon: 'i-lucide-binary', tools: ['LE', 'TR', 'IT'], ctx: 'other', kind: 'num', min: 0, max: 127, ops: [304, 306, 307, 308, 312, 310, 311, 309, 317], def: { op: 312, p1: 64, p2: 0 } },
  channel: { label: 'Kanal', cubase: 'Channel', icon: 'i-lucide-cable', tools: ['LE', 'TR', 'IT'], kind: 'channel', ops: [312, 304, 306], def: { op: 312, p1: 1, p2: 0 } },
  type: { label: 'Event-Typ', cubase: 'Type', icon: 'i-lucide-tag', tools: ['LE', 'TR', 'IT'], kind: 'type', ops: [312], def: { op: 312, p1: 2, p2: 0 } },
  position: { label: 'Position', cubase: 'Position', icon: 'i-lucide-arrow-right-left', tools: ['LE', 'PLE'], kind: 'time', ops: [304, 306, 309, 307, 308, 311], def: { op: 304, p1: 120, p2: 0, unit: 'ticks' }, unverified: true },
  length: { label: 'Länge', cubase: 'Length', icon: 'i-lucide-move-horizontal', tools: ['LE', 'PLE'], kind: 'time', ops: [307, 308, 312, 304, 306], def: { op: 307, p1: 0.5, p2: 0, unit: 'ticks' }, unverified: true },
  nxp: { label: 'Note Expression', cubase: 'NoteExp Operation', icon: 'i-lucide-audio-waveform', tools: ['LE'], kind: 'none', ops: [355], def: { op: 355, p1: 0, p2: 0 } },
  trackop: { label: 'Spur-Schalter', cubase: 'Track Operation', icon: 'i-lucide-toggle-right', tools: ['PLE'], kind: 'trackop', ops: TRACKOPS.map(o => o.v), def: { op: 335, p1: 2, p2: 1 } },
  plename: { label: 'Name', cubase: 'Name', icon: 'i-lucide-type', tools: ['PLE'], kind: 'name', ops: NAMEOPS.map(o => o.v), def: { op: 327, p1: '', p2: 0 } },
  plecolor: { label: 'Farbe', cubase: 'Set Color', icon: 'i-lucide-palette', tools: ['PLE'], kind: 'color', ops: [312], def: { op: 312, p1: 'Color 1', p2: 0 } },
  trim: { label: 'Automation skalieren', cubase: 'Trim', icon: 'i-lucide-volume-2', tools: ['PLE'], kind: 'factor', ops: [307], def: { op: 307, p1: 1.1, p2: 0 }, unverified: true },
  raw: { label: 'Unbekannte Aktion', cubase: '', icon: 'i-lucide-file-code-2', tools: [], kind: 'raw', ops: [], def: {} }
}
