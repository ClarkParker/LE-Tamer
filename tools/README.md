# tools/

## leparse.py
Decoder für LE-/PLE-Preset-Dateien (nur Python-Standardbibliothek, Python ≥ 3.8).

```bash
python3 tools/leparse.py samples/steinberg-factory-c13/*.xml
python3 tools/leparse.py --tree samples/steinberg-factory-c13/Extract_Alto.xml
python3 tools/leparse.py --json "pfad/zu/User Presets/Logical Edit/**/*.xml" > alle.jsonl
```
Die Namen der Codes stammen aus `data/le-codes.json`; unbekannte Codes werden als Zahl ausgegeben.
Geprüft an 331 echten Presets (Cubase SX, 9, 13) – alle ohne Fehler.

## roundtrip-test.mjs
Lädt den Core-Script-Block aus `le-tamer.html` in Node (ohne Browser), dekodiert jede Preset-XML, kodiert sie neu
und vergleicht byteweise. Exit-Code 0 nur bei 100 % Übereinstimmung.

```bash
node tools/roundtrip-test.mjs samples/steinberg-factory-c13 "pfad/zu/weiteren/Presets"
```
Ergebnis auf dem Analyse-Korpus: 331 Dateien, 331 byte-identisch. Der XML-*Text* ist nur bei Dateien mit CRLF-Zeilenenden
identisch (Cubase 13); Cubase 9 auf macOS schrieb reine CR-Zeilenenden.

## evidence.py
Erzeugt `docs/10-belege.md` (Belegzahlen je Code) aus dem lokalen Preset-Korpus. Der Korpus selbst (Forum-Anhänge, Metagrid,
Factory-Presets) ist aus Lizenzgründen **nicht** im Repo; die Pfade am Skriptanfang müssen auf eine lokale Sammlung zeigen.
Die Zuordnung Code → Name kommt aus `data/le-codes.json`.
