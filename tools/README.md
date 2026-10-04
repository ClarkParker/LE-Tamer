# tools/

## build-studio.py
Baut **`le-tamer-studio.html`** (die Produkt-Oberfläche) aus `prototype/le-tamer-studio.src.html`: `<!--INLINE:pfad-->` wird durch
den Dateiinhalt ersetzt (Vue 3, SortableJS), `<!--INLINE:le-core-->` durch den Core-Script-Block aus `le-tamer.html`,
`<!--INLINE-JSON:pfad-->` durch JSON (`data/time-templates.json`). Ergebnis: eine einzige, offline nutzbare HTML-Datei.

```bash
python3 tools/build-studio.py
```
Der Core (Decoder/Encoder) lebt nur einmal, in `le-tamer.html`; Studio und QueryBuilder-PoC binden ihn beim Bauen ein.

## build-poc.py
Dasselbe für `prototype/poc-querybuilder.html` (jQuery QueryBuilder, Experten-Referenz).

## leparse.py
Decoder für LE-/PLE-/Transformer-Preset-Dateien (nur Python-Standardbibliothek, Python ≥ 3.8).

```bash
python3 tools/leparse.py samples/steinberg-factory-c13/*.xml
python3 tools/leparse.py --tree samples/steinberg-factory-c13/Extract_Alto.xml
python3 tools/leparse.py --json "pfad/zu/User Presets/Logical Edit/**/*.xml" > alle.jsonl
```
Die Namen der Codes stammen aus `data/le-codes.json`; unbekannte Codes werden als Zahl ausgegeben.
Geprüft an 1379 echten Presets (Cubase SX bis 15) – alle ohne Fehler.

## learn.py
Liest die **Mini-Presets der Checkliste** aus `docs/11-funktionsmatrix-cubase15.md` (Dateinamen `GRUPPE__Name.xml`) und listet
pro Datei die beobachteten Klassen, Bedingungs-/Operations-Codes und Wertklassen; schreibt `learn-result.json`. Damit werden die
letzten unbekannten Codes (Secondary Value, Mirror, Transpose to Scale, Score-Ziele, Pre-/Post-Befehle …) nachgezogen.

```bash
python3 tools/learn.py "pfad/zum/Ordner/mit/den/Checklisten-Presets"
```

## roundtrip-test.mjs
Lädt den Core-Script-Block aus `le-tamer.html` in Node (ohne Browser), dekodiert jede Preset-XML, kodiert sie neu
und vergleicht byteweise. Exit-Code 0 nur bei 100 % Übereinstimmung.

```bash
node tools/roundtrip-test.mjs samples/steinberg-factory-c13 "pfad/zu/weiteren/Presets"
```
Ergebnis auf dem Analyse-Korpus: 1379 Dateien, 1379 byte-identisch. Der XML-*Text* ist nur bei Dateien mit CRLF-Zeilenenden
identisch (Cubase 12+); ältere macOS-Dateien haben reine CR-Zeilenenden.

## evidence.py
Erzeugt `docs/10-belege.md` (Belegzahlen je Code) aus dem lokalen Preset-Korpus. Der Korpus selbst (Forum-Anhänge, Metagrid,
Factory-Presets) ist aus Lizenzgründen **nicht** im Repo; die Pfade am Skriptanfang müssen auf eine lokale Sammlung zeigen.
