# Drittanbieter-Bibliotheken

| Datei | Projekt | Version | Lizenz |
|---|---|---|---|
| `jquery-3.7.1.min.js` | jQuery (OpenJS Foundation) | 3.7.1 | MIT |
| `query-builder-2.7.0.standalone.min.js`, `…default.min.css`, `…de.js` | jQuery QueryBuilder (Damien "Mistic" Sorel) | 2.7.0 | MIT |
| `bootstrap-3.4.1.min.css` | Bootstrap (Twitter, Inc.) | 3.4.1 | MIT |

Diese Dateien werden von `tools/build-poc.py` unverändert in `prototype/poc-querybuilder.html` eingebettet.

**LE-Tamer Studio** bezieht seine Bibliotheken (Vue, Nuxt UI, Reka UI, Tailwind CSS, SortableJS, Lucide-Icons, Schriften
Instrument Sans und IBM Plex Mono) über `studio/package.json` mit festen Versionen. Beim Bauen erzeugt `studio/vite.config.mjs`
die vollständige Liste der tatsächlich eingebetteten Pakete samt Lizenztexten; `studio/scripts/pack.mjs` hängt sie als Kommentar
an `le-tamer-studio.html` an. Lizenzen: MIT, ISC (Lucide), Apache-2.0 (fuse.js, @internationalized/number), OFL-1.1 (Schriften).
