// Vorlagen. Die Kurzbeschreibung erzeugt die Oberfläche aus dem Inhalt (summary), damit sie immer stimmt.
const ch = (t, cond, p1, p2, extra) => ({ t, cond, p1, p2: p2 ?? p1, ...extra })
const gr = (bool, items) => ({ group: bool, items })
const ac = (t, op, p1, p2, extra) => ({ t, op, p1, p2: p2 ?? 0, ...extra })
const R = (cat, name, tool, func, items, actions = []) => ({ cat, name, tool, func, items, actions })

export const RECIPE_CATS = ['Velocity', 'Noten', 'Controller', 'Aufräumen', 'Spuren', 'Echtzeit']
export const RECIPES = [
  R('Velocity', 'Velocity +10', 'LE', 1, [ch('type', 200, 0)], [ac('velocity', 304, 10)]),
  R('Velocity', 'Velocity auf 100', 'LE', 1, [ch('type', 200, 0)], [ac('velocity', 312, 100)]),
  R('Velocity', 'Velocity komprimieren', 'LE', 1, [ch('type', 200, 0)], [ac('velocity', 308, 1.15), ac('velocity', 304, 8)]),
  R('Velocity', 'Velocity humanisieren ±6', 'LE', 1, [ch('type', 200, 0)], [ac('velocity', 311, -6, 6)]),
  R('Velocity', 'Velocity-Rampe im Cycle', 'LE', 1, [ch('type', 200, 0)], [ac('velocity', 317, 127, 32)]),
  R('Velocity', 'Velocity begrenzen auf 110', 'LE', 1, [ch('type', 200, 0), ch('velocity', 202, 110)], [ac('velocity', 312, 110)]),
  R('Noten', 'Hi-Hats auf 2 und 4 leiser', 'LE', 1, [ch('type', 200, 0), ch('pitch', 200, 42), gr(104, [ch('barpos', 206, 460, 500), ch('barpos', 206, 1420, 1460)])], [ac('velocity', 306, 20)]),
  R('Noten', 'Zählzeit 1 betonen', 'LE', 1, [ch('type', 200, 0), ch('barpos', 206, 0, 100)], [ac('velocity', 304, 30)]),
  R('Noten', 'Kick (C1) in Spur extrahieren', 'LE', 5, [ch('type', 200, 0), ch('pitch', 200, 36)]),
  R('Noten', 'Auswahl eine Oktave höher kopieren', 'LE', 2, [ch('type', 200, 0), ch('property', 211, 1)], [ac('pitch', 304, 12)]),
  R('Noten', 'Höchste Akkordnote auswählen', 'LE', 6, [ch('type', 200, 0), ch('context', 203, 15, 3)]),
  R('Noten', 'Alt-Stimme extrahieren', 'LE', 5, [ch('type', 200, 0), ch('context', 200, 14, 1)]),
  R('Noten', 'Leise Noten auswählen', 'LE', 6, [ch('type', 200, 0), ch('velocity', 207, 0, 20)]),
  R('Noten', 'Noten kürzer als 1/32 löschen', 'LE', 0, [ch('type', 200, 0), ch('length', 204, 60, 60, { unit: 'ticks' })]),
  R('Noten', 'Notenlänge halbieren', 'LE', 1, [ch('type', 200, 0)], [ac('length', 307, 0.5, 0, { unit: 'ticks' })]),
  R('Noten', 'Noten 10 ms früher', 'LE', 1, [ch('type', 200, 0)], [ac('position', 306, 10, 0, { unit: 'ms' })]),
  R('Controller', 'Modulation (CC 1) löschen', 'LE', 0, [ch('type', 200, 2), ch('ccnum', 200, 1)]),
  R('Controller', 'CC 1 zusätzlich als CC 11', 'LE', 2, [ch('type', 200, 2), ch('ccnum', 200, 1)], [ac('ccnum', 312, 11)]),
  R('Controller', 'Controller-Werte × 0,8', 'LE', 1, [ch('type', 200, 2)], [ac('ccval', 307, 0.8)]),
  R('Controller', 'Alle Controller löschen', 'LE', 0, [ch('type', 200, 2), ch('ccnum', 207, 0, 127)]),
  R('Controller', 'Aftertouch → Modulation', 'LE', 1, [ch('type', 200, 4)], [ac('type', 312, 2), ac('subtype', 312, 1)]),
  R('Aufräumen', 'Stummgeschaltete Events löschen', 'LE', 0, [ch('property', 211, 0)]),
  R('Aufräumen', 'Controller vor dem Cursor löschen', 'LE', 0, [ch('type', 200, 2), ch('timepos', 216, 0)]),
  R('Aufräumen', 'Alles außer Noten löschen', 'LE', 0, [ch('type', 201, 0)]),
  R('Aufräumen', 'Kanal 1 → Kanal 2', 'LE', 1, [ch('channel', 200, 1)], [ac('channel', 312, 2)]),
  R('Aufräumen', 'Note Expression entfernen', 'LE', 1, [ch('type', 200, 0)], [ac('nxp', 355, 0)]),
  R('Spuren', 'Sichtbare Ordner öffnen', 'PLE', 1, [ch('container', 200, 0), ch('property', 212, 5)], [ac('trackop', 331, 0, 1)]),
  R('Spuren', 'Spuren mit „Perc“ auswählen', 'PLE', 6, [ch('container', 200, 1), ch('name', 210, 'Perc')]),
  R('Spuren', 'Nur Audiospuren zeigen', 'PLE', 1, [ch('container', 200, 1), ch('media', 201, 0)], [ac('trackop', 343, 0, 1)]),
  R('Spuren', 'Insert-Slot 1 ausschalten', 'PLE', 1, [ch('container', 200, 1)], [ac('trackop', 371, 1, 1)]),
  R('Spuren', 'Ausgewählte Spuren umbenennen', 'PLE', 1, [ch('container', 200, 1), ch('property', 211, 1)], [ac('plename', 327, 'Pads', 0), ac('plename', 365, 'Pads', 0)]),
  R('Spuren', 'Ausgewählte Parts einfärben', 'PLE', 1, [ch('container', 200, 2), ch('property', 211, 1)], [ac('plecolor', 312, 'Color 9')]),
  R('Spuren', 'Stummgeschaltete Parts löschen', 'PLE', 0, [gr(104, [ch('container', 200, 2), ch('container', 200, 3)]), ch('property', 211, 0)]),
  R('Echtzeit', 'Split: Noten unter C3 sperren', 'IT', 0, [ch('type', 200, 0), ch('pitch', 204, 60)]),
  R('Echtzeit', 'Sustain-Pedal spielt C1', 'IT', 1, [ch('type', 200, 2), ch('ccnum', 200, 64), ch('ccval', 202, 64)], [ac('type', 312, 0), ac('subtype', 312, 36), ac('mainvalue', 312, 100)]),
  R('Echtzeit', 'Velocity live begrenzen', 'TR', 1, [ch('type', 200, 0), ch('velocity', 202, 110)], [ac('velocity', 312, 110)])
]
