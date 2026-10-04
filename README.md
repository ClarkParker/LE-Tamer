# LE-Tamer

Werkzeugkasten, um den **Logical Editor von Cubase 15** (und seine Geschwister: Project Logical Editor,
Transformer, Track/Project Input Transformer) zu zähmen. Kern ist **LE-Tamer Studio** – eine einzelne HTML-Datei, mit der
Musiker Presets per Assistent, Chips, Klaviatur und Drag & Drop bauen und als Cubase-`.xml` speichern, ohne Logical-Editor-
Fachbegriffe kennen zu müssen.

## Schnellstart

1. **`le-tamer-studio.html`** im Browser öffnen (Doppelklick, kein Server, offline).
2. Ziel wählen („Velocity formen“, „Controller bearbeiten“, „Spuren & Parts“ …) oder ein Rezept laden.
3. Auswahl als Chips einstellen (Klaviatur, Bereichsregler, Taktraster, Kanal-Buttons); Chips in die gestrichelte Zone ziehen =
   ODER-Gruppe (Klammern entstehen automatisch). Die Live-Vorschau zeigt, welche Noten getroffen werden und was danach passiert.
4. Funktion und Änderungs-Karten wählen, speichern. Die Datei in den angezeigten Ordner kopieren
   (Windows: `Dokumente\Steinberg\Cubase 15\User Presets\Logical Edit\`), in Cubase den Preset-Browser öffnen.

Bestehende Presets (auch Factory-Presets) lassen sich per Drag & Drop öffnen, ändern und neu speichern; unbekannte Zeilen bleiben
als Rohdaten erhalten.

## Status

Phase 4 – **LE-Tamer Studio** (aktuell):

* Neue Oberfläche nach `docs/12-ux-konzept.md`: 4-Schritt-Assistent (Ziel → Auswahl → Aktion → Fertig), 19 Chip-Arten mit
  grafischen Bedienfeldern, verschachtelbare UND/ODER-Gruppen per Drag & Drop (SortableJS), Aktionskarten mit Reglern,
  Live-Vorschau als Piano-Roll (LE) bzw. Spurliste (PLE), Klartext-Satz, Validierung, Experten-Modus mit Rohwerten,
  36 Rezepte, Export für LE, PLE, Transformer und Input Transformer. Technik: Vue 3 + SortableJS, eingebettet (MIT).
* **Vollständigkeits-Matrix** aller Cubase-15-Funktionen mit Belegstatus: `docs/11-funktionsmatrix-cubase15.md`. Neu belegt
  und umgesetzt: Zeitdifferenzen in Sekunden/Samples (Position ± ms, Länge in Sekunden), Position/Länge in Ticks, Name-,
  Farb-, Trim- und NoteExp-Aktionen, Last Event, Insert-/Send-Slot. Die noch fehlenden Codes (Secondary Value, Mirror,
  Transpose to Scale, Score-Ziele, Pre-/Post-Befehle …) stehen dort als **Checkliste von Mini-Presets**, die in Cubase 15
  gespeichert und mit `tools/learn.py` ausgewertet werden.
* Treue des Dateiformats, gemessen am 1379-Preset-Korpus: Decoder→Encoder **1379/1379 byteidentisch**. Studio-Import→Export
  (ohne Änderung): 1275 Dateien byteidentisch bzw. nur mit der Cubase-12+-Trailer-Version 0x1100 statt 0, 84 Dateien mit
  eindeutig gesetzten Klammern bei gemischten UND/ODER-Zeilen, 20 Abweichungen (Cubase-SX-Altformat, defekte Dateien).
  Neu gebaute Presets sind byteidentisch mit Factory-Presets (bis auf die Trailer-Version).
* **Offen:** der Ladetest in Cubase 15 selbst (bitte eine Studio-Datei laden und melden), danach die Checkliste aus `docs/11`.

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
| `prototype/le-tamer-studio.src.html` | Quelle des Studios (ohne eingebettete Bibliotheken); bauen mit `tools/build-studio.py` |
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
| `data/le-codes.json` | Codes mit Konfidenz (Quelle der Wahrheit) · `data/time-templates.json` Byte-Vorlagen für Cursor/Cycle |
| `tools/` | `build-studio.py`, `build-poc.py`, `leparse.py`, `learn.py`, `roundtrip-test.mjs`, `evidence.py` (siehe `tools/README.md`) |
| `vendor/` | Vue 3, SortableJS, jQuery, QueryBuilder, Bootstrap (MIT), siehe `vendor/LICENSES.md` |
| `samples/` | Vier Steinberg-Factory-Presets (Cubase 13) als Testdateien |

## Entwickeln und testen

```bash
python3 tools/build-studio.py                                  # Studio aus .src.html + vendor + Core bauen
node tools/roundtrip-test.mjs samples/steinberg-factory-c13 "<weitere Preset-Ordner>"   # Decode→Encode byteidentisch?
python3 tools/leparse.py --tree samples/steinberg-factory-c13/Extract_Alto.xml          # Datei ansehen
python3 tools/learn.py "<Ordner mit Checklisten-Presets>"       # neue Codes aus Cubase-15-Mini-Presets lernen
```
