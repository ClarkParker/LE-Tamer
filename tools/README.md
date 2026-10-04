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
