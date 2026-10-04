# 07 – Anforderungen & Architektur: monolithischer HTML-Preset-Builder

> **Stand:** `le-tamer.html` setzt die Muss-Funktionen 1–7 um (PLE experimentell). Encoder/Decoder liegen im
> `<script id="le-core">`-Block und werden von `tools/roundtrip-test.mjs` ohne Browser getestet
> (331/331 Dateien byte-identisch; neu erzeugte Presets identisch mit Cubase-13-Factory-Dateien).
> Stand nach Korpus-Auswertung (579 Presets): Encoder reproduziert 1374/1374 Dateien byteidentisch; neu erzeugte Presets sind
> byteidentisch mit Cubase-13- und Cubase-15-Dateien (LE legacy- und modern-Stil, PLE). Beide Oberflächen (`le-tamer.html`,
> `prototype/poc-querybuilder.html`) unterstützen Type/Subtype/Main Value/Channel/Length/Position (Bar Range, Cursor/Cycle)/
> Property/Context Variable (LE) und Container/Media/Name/Color/Property + Track Operation (PLE).
> Offen: Ladetest in Cubase 15; Zeit-*Werte*, Pre-/Post-Befehle, Output Name, Secondary Value, Score-Ziele (siehe `06`, Kap. 11/13).
>
> **Stand Phase 4:** Die Produkt-Oberfläche ist **`le-tamer-studio.html`** (Assistent nach `12-ux-konzept.md`: Ziel → Auswahl als
> Chips mit Klaviatur/Bereichsregler/Taktraster und Drag-&-Drop-Gruppen → Aktionskarten → Export, Live-Vorschau, Experten-Modus).
> `le-tamer.html` bleibt Träger des Core-Blocks und tabellarische Referenz; der QueryBuilder-PoC ist Experten-Referenz.
> Die Muss-Funktion 1 („Oberfläche wie in Cubase“) ist damit bewusst **ersetzt**: Musiker sollen keine Filterziele/Klammern
> kennen müssen. Funktionsstand und Lücken je Cubase-15-Funktion: `11-funktionsmatrix-cubase15.md`.

## Ziel
Eine **einzelne HTML-Datei** (kein Build, kein Server, offline nutzbar), mit der sich Presets für Logical Editor und
Project Logical Editor **verständlich zusammenklicken**, erklären, prüfen und als Cubase-kompatible `.xml` speichern lassen.

## Muss-Funktionen (MVP)
1. **Editor-Oberfläche wie in Cubase**: Filterzeilen (Klammer, Target, Condition, P1, P2, Bar Range/Time Base, Klammer, Bool),
   Aktionszeilen (Target, Operation, P1, P2), Funktions-Dropdown – aber mit **kontextsensitiver Hilfe** je Feld
   (Bedeutung von Subtype/Main Value je Event-Typ, erlaubte Bedingungen je Ziel, erlaubte Operationen je Aktionsziel).
2. **Klartext-Vorschau** des Ausdrucks (`( Type = Note AND Pitch = C1 ) → Transform: Velocity Add 10`) plus
   deutsche Erklärung „Was passiert?“.
3. **Export** als `<Preset-Name>.xml` (Download) im Format aus `06-preset-dateiformat.md`; LE und PLE wählbar.
4. **Import** bestehender `.xml` (Drag & Drop) → Decoder zeigt Inhalt an, erlaubt Bearbeiten und Re-Export
   (damit lassen sich Factory-Presets als Vorlagen nutzen).
5. **Validierung**: Warnungen bei typischen Fehlern (Main Value ohne Type-Filter, Range mit P1 > P2, Aktionen bei
   Select/Delete, Länge ohne Type = Note, Klammern unbalanciert).
6. **Rezept-Bibliothek**: die dokumentierten Beispiele als Vorlagen (Velocity-Kompressor, CC-Kopie, Downbeat, Extract …).
7. **Speicherort-Hinweis**: zeigt den korrekten Zielordner für Windows/macOS/Edition an.

## Kann-Funktionen
* Noten-Eingabe als `C3` ↔ 60 umschaltbar; CC-Nummern mit Namen (1 Modulation, 11 Expression …).
* Bar-Range grafisch (Takt-Zone) mit Ticks-Umrechnung (480 PPQ).
* Batch-Export (z. B. „Velocity fixed 10…120“ in 10er-Schritten) – genau der Anwendungsfall der Metagrid-Sammlungen.
* Hex-Ansicht mit Annotation (Lernmodus, wie Kapitel 9 der Format-Doku).
* Projektdatei (JSON) im Browser speichern (localStorage) / als Datei.
* PLE: Pre-/Post-Commands, sobald das Format geklärt ist.

## Technische Architektur
* **Vanilla HTML/CSS/JS**, alles inline (eine Datei); kein Framework nötig. Optional Tailwind/CDN vermeiden, um offline zu bleiben.
* Module (innerhalb der Datei als getrennte `<script>`-Blöcke):
  * `codes.js` – Enum-Tabellen aus `data/le-codes.json` (Quelle der Wahrheit; Build-Schritt oder manuelles Einbetten).
  * `model.js` – Preset-Datenmodell (Funktion, Filter-Tokens, Aktionen, Kommentar, Typ LE/PLE).
  * `decoder.js` – Port von `tools/leparse.py` (Klassen-Tabelle per Offset, Objektbaum).
  * `encoder.js` – Serialisierung: Objekte in Reihenfolge schreiben, Klassen-Offsets beim Schreiben registrieren, Referenzen
    `0x80000000 | offset` setzen, Größenfelder nach dem Schreiben der Kinder rückwärts eintragen, Hex formatieren
    (64 Zeichen/Zeile, zwei Tabs), XML-Hülle erzeugen.
  * `ui.js` – Zeilen-Editor, Dropdown-Abhängigkeiten, Vorschau, Validierung, Import/Export.
* **Testbarkeit ohne Cubase:** Round-Trip über die 331 Beispiel-Dateien: decode → encode muss **byte-identisch** sein
  (Golden-Files). Das ist der zentrale Qualitätsanker, solange nicht in Cubase getestet wird. Danach: in Cubase 15 laden,
  speichern, erneut vergleichen.
* Encoder-Strategie: Für jede Klasse die beobachtete Basisklassen-Kette (Tabelle in Kapitel 3) exakt nachbilden;
  P2-Objekte auch bei Nichtgebrauch schreiben; Gesamtausdruck in äußeres Klammerpaar setzen (wie Cubase).

## Nicht-Ziele (vorerst)
* Input-Transformer-Presets, Transformer-Plug-in-Presets (anderes Format, nicht untersucht).
* Zeitbasierte Werte in Sekunden/Frames/Cursor/Cycle (benötigen `LeTTimeValue` mit Tempo-Kontext) – zunächst nur PPQ/Ticks.

## Reihenfolge der Umsetzung
1. `encoder.js` + Round-Trip-Test gegen Beispiel-Dateien (zunächst LE: Type/Value1/Value2/Position-BarRange/Property,
   Aktionen Value1/Value2 mit Add/Subtract/Multiply/Divide/Random/Fixed).
2. Minimal-UI mit Export → **Test in Cubase 15** (kritischer Meilenstein: lädt Cubase eine selbst erzeugte Datei?).
3. Import/Decoder, Validierung, Rezepte, Hilfe-Texte.
4. PLE-Unterstützung (Container/Name/Property + Track Operation), danach fehlende Codes per Mini-Presets nachziehen.
