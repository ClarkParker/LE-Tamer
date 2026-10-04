# LE-Tamer

Werkzeugkasten, um den **Logical Editor von Cubase 15** (und seine Geschwister: Project Logical Editor,
Transformer, Track/Project Input Transformer) zu zähmen. Endziel ist eine **monolithische HTML-Seite**,
mit der sich Presets komfortabel bauen, verstehen und als `.xml` für Cubase exportieren lassen.

## Status

Phase 1 – **Wissen aufbauen** – ist abgeschlossen:

* Die komplette Cubase-15-Dokumentation zu allen „logischen“ Werkzeugen wurde ausgewertet und als
  deutsche Referenz aufbereitet (`docs/`).
* Das **binäre Preset-Dateiformat** (`<bin name="Preset">` in der XML-Datei) wurde anhand von
  331 echten Presets reverse-engineered. Ein Python-Parser (`tools/leparse.py`) liest alle 331 Dateien
  fehlerfrei. Die abgeleiteten Codes (Funktionen, Bedingungen, Operationen, Ziele …) liegen maschinenlesbar
  in `data/le-codes.json`.
* Offene Punkte und Unsicherheiten sind in `docs/06-preset-dateiformat.md` explizit markiert.

Phase 2 – **HTML-Preset-Builder** – ist geplant; die Anforderungen stehen in `docs/07-html-builder-anforderungen.md`.

## Inhalt

| Pfad | Inhalt |
|------|--------|
| `docs/01-ueberblick.md` | Die fünf logischen Werkzeuge in Cubase 15, Editionen, Menüpfade, Unterschiede |
| `docs/02-logical-editor-referenz.md` | Logical Editor: Filterziele, Bedingungen, Funktionen, Aktionsziele, Operationen |
| `docs/03-project-logical-editor-referenz.md` | Project Logical Editor: Filterziele, Bedingungen, Funktionen, Aktionen, Pre/Post-Befehle |
| `docs/04-transformer-und-input-transformer.md` | Echtzeit-Varianten: Transformer-Insert, Track Input Transformer, Project Input Transformer |
| `docs/05-presets-und-speicherorte.md` | Speicherorte (Windows/macOS), Factory vs. User, Migration, Tastaturbefehle, Makros |
| `docs/06-preset-dateiformat.md` | **Spezifikation des XML/Binär-Formats** inkl. Code-Tabellen und offener Fragen |
| `docs/07-html-builder-anforderungen.md` | Anforderungen und Architektur für die HTML-Seite |
| `docs/08-quellen.md` | Alle verwendeten Quellen |
| `tools/leparse.py` | Parser/Decoder für Preset-XML (Zusammenfassung, JSON, Baumansicht) |
| `data/le-codes.json` | Abgeleitete Enum-Codes mit Konfidenz-Angabe |
| `samples/` | Kleine Beispiel-Presets zum Testen des Parsers |

## Schnellstart Parser

```bash
python3 tools/leparse.py samples/steinberg-factory-c13/*.xml          # Einzeiler pro Preset
python3 tools/leparse.py --tree samples/steinberg-factory-c13/Extract_Alto.xml
python3 tools/leparse.py --json "C:/Users/<du>/Documents/Steinberg/Cubase 15/User Presets/Logical Edit/*.xml"
```
