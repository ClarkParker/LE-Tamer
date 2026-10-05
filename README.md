# LE-Tamer

Werkzeugkasten, um den **Logical Editor von Cubase 15** (und seine Geschwister: Project Logical Editor,
Transformer, Track/Project Input Transformer) zu zähmen. Kern ist **LE-Tamer Studio** – eine einzelne HTML-Datei, mit der
Musiker Presets aus Bausteinen zusammenstellen (Klaviatur, Regler, Taktraster, Drag & Drop), live am Beispiel-Clip prüfen
und als Cubase-`.xml` speichern. Läuft offline per Doppelklick, ohne Installation.

## Schnellstart

1. **`le-tamer-studio.html`** im Browser öffnen (Doppelklick, kein Server, offline; Chrome/Edge ab 80, Firefox ab 113, Safari ab 16.4).
2. Links eine Vorlage wählen, den **Assistenten** öffnen oder Bausteine anklicken bzw. auf die Fläche ziehen.
3. Einen Baustein anklicken und rechts im Inspector einstellen (Klaviatur, Bereichsregler, Taktraster …). „und“/„oder“ zwischen
   Bausteinen per Klick umschalten; einen Baustein auf „Hier ablegen: neue Oder-Gruppe“ ziehen bildet eine Klammer.
4. Funktion und Aktionen wählen. Unten zeigt die Vorschau Treffer und Ergebnis am Beispiel-Clip, die Cubase-Ansicht die Zeilen
   so, wie Cubase sie anzeigt.
5. **Exportieren** (Strg+S) und die Datei in den angezeigten Ordner legen
   (Windows: `Dokumente\Steinberg\Cubase 15\User Presets\Logical Edit\`). Strg+K öffnet die Befehlsliste.

Bestehende Presets (auch Factory-Presets) lassen sich per Drag & Drop öffnen, ändern und neu speichern; unbekannte Zeilen bleiben
als Rohdaten erhalten.

## Status

Phase 4 – **LE-Tamer Studio 2** (aktuell):

* Werkzeug-Layout statt Folien-Assistent: Vorlagen links, Arbeitsfläche mit Bedingungen → Funktion → Aktionen, Inspector rechts,
  Vorschau (Piano-Roll, Cubase-Ansicht, Hex) unten, Statuszeile mit echten Hinweisen. Befehlsliste (Strg+K), Rückgängig/Wiederholen,
  Kontextmenüs, Datei-Drop, kompakter Assistent für vier häufige Aufgaben.
* Designsystem **Nuxt UI v4** (Vue 3, Reka UI, Tailwind CSS v4; MIT) – Recherche und Begründung in `docs/13-designsystem.md`.
  Eigene Bedienelemente für Klaviatur, Taktraster, Kanal-Raster und Piano-Roll.
* Monolith mit Ladebildschirm: Bibliotheken liegen komprimiert in der HTML-Datei und werden beim Öffnen im Browser entpackt
  (`studio/scripts/pack.mjs`). Getestet mit gesperrtem Netz: kein einziger externer Abruf.
* Treue zum Dateiformat: unveränderte Importe werden byteidentisch zurückgeschrieben (1359 von 1379 Korpus-Dateien; Rest ist
  das Cubase-SX-Altformat, das im aktuellen Format gespeichert wird; Unterschied sonst nur die Cubase-12+-Versionsnummer im Trailer).
  Neu gebaute Presets sind identisch mit Steinberg-Factory-Presets.
* **Vollständigkeits-Matrix** aller Cubase-15-Funktionen mit Belegstatus und Checkliste der noch fehlenden Mini-Presets:
  `docs/11-funktionsmatrix-cubase15.md`. Ungeprüfte Codes sind im Studio mit einem kleinen Kreis markiert.
* **Offen:** der Ladetest in Cubase 15 selbst, danach die Checkliste aus `docs/11`.

Phase 3 – **Belege statt Annahmen**: 579 echte Presets (Forum 2011–2026 inkl. Cubase 13/14/15, Factory-PLE, r-koubou,
Metagrid, Steinberg-Factory-LE) ausgewertet → `docs/10-belege.md`, `docs/06` Kapitel 13 (Umbenennungen ab Cubase 13,
Trailer, Channel/Last-Event-Klassen, Transformer-Presets). Framework-Bewertung `docs/09`, QueryBuilder-PoC als Experten-Referenz.

Phase 2 – **Tabellarischer Builder** `le-tamer.html` (Cubase-ähnliche Zeilen, Hilfe, Import/Export) – bleibt als Referenz und
Träger des gemeinsamen Core-Blocks (`<script id="le-core">`), den Studio und PoC beim Bauen einbetten.

Phase 1 – **Wissen aufbauen**: Cubase-15-Dokumentation zu allen logischen Werkzeugen als deutsche Referenz (`docs/01`–`05`),
Binärformat reverse-engineered (`docs/06`), Codes maschinenlesbar in `data/le-codes.json`.

## Inhalt

| Pfad | Inhalt |
|------|--------|
| `le-tamer-studio.html` | **LE-Tamer Studio** – die Oberfläche für Musiker (eine Datei, offline) |
| `studio/` | Quelle des Studios (Vite, Vue 3, Nuxt UI); `npm ci && npm run build` erzeugt `le-tamer-studio.html` |
| `le-tamer.html` | Tabellarischer Builder + **Core** (Decoder/Encoder) |
| `prototype/poc-querybuilder.html` | PoC mit jQuery QueryBuilder (Experten-Referenz) |
| `docs/01-ueberblick.md` | Die fünf logischen Werkzeuge in Cubase 15, Editionen, Menüpfade |
| `docs/02-logical-editor-referenz.md` | Logical Editor: Filterziele, Bedingungen, Funktionen, Aktionsziele, Operationen |
| `docs/03-project-logical-editor-referenz.md` | Project Logical Editor inkl. Pre/Post-Befehle |
| `docs/04-transformer-und-input-transformer.md` | Echtzeit-Varianten |
| `docs/05-presets-und-speicherorte.md` | Speicherorte, Factory vs. User, Tastaturbefehle |
| `docs/06-preset-dateiformat.md` | **Spezifikation des XML/Binär-Formats** inkl. Korpus-Auswertung |
| `docs/07-html-builder-anforderungen.md` | Anforderungen/Architektur, Stand |
| `docs/08-quellen.md` · `docs/09-framework-evaluation.md` · `docs/10-belege.md` | Quellen, Framework-Vergleich, Belegzahlen (generiert) |
| `docs/11-funktionsmatrix-cubase15.md` | **Alle Cubase-15-Funktionen mit Status** + Checkliste der Mini-Presets |
| `docs/12-ux-konzept.md` | UX-Konzept des Studios |
| `docs/13-designsystem.md` | Recherche fertiger Designsysteme, Entscheidung, Auslieferung als Monolith |
| `data/le-codes.json` | Codes mit Konfidenz (Quelle der Wahrheit) · `data/time-templates.json` Byte-Vorlagen für Cursor/Cycle |
| `tools/` | `build-poc.py`, `leparse.py`, `learn.py`, `roundtrip-test.mjs`, `evidence.py` (siehe `tools/README.md`) |
| `vendor/` | jQuery, QueryBuilder, Bootstrap für den PoC (MIT), siehe `vendor/LICENSES.md` |
| `samples/` | Vier Steinberg-Factory-Presets (Cubase 13) als Testdateien |

## Entwickeln und testen

```bash
cd studio && npm ci && npm run build && cd ..                  # Studio bauen (Node 20+, nur auf dem Entwicklungsrechner)
node tools/roundtrip-test.mjs samples/steinberg-factory-c13 "<weitere Preset-Ordner>"   # Decode→Encode byteidentisch?
python3 tools/leparse.py --tree samples/steinberg-factory-c13/Extract_Alto.xml          # Datei ansehen
python3 tools/learn.py "<Ordner mit Checklisten-Presets>"       # neue Codes aus Cubase-15-Mini-Presets lernen
```
