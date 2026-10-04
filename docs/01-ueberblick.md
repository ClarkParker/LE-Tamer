# 01 – Überblick: Die „logischen“ Werkzeuge in Cubase 15

Cubase enthält **fünf** Werkzeuge, die nach demselben Prinzip arbeiten: *Suchen & Ersetzen* mit
**Filterbedingungen** (was wird gefunden?), einer **Funktion** (was passiert grundsätzlich?) und
**Aktionen** (was genau wird geändert?). Sie unterscheiden sich darin, *worauf* sie wirken und *wann*.

| Werkzeug | Wirkt auf | Zeitpunkt | Öffnen über | Edition |
|---|---|---|---|---|
| **Logical Editor (LE)** | MIDI-Events in ausgewählten Parts/Noten | nachträglich („anwenden“), destruktiv auf die Spur-Daten (Undo möglich) | `MIDI > Logical Editor > Setup` / `Apply Preset` | Pro (Artist: ja laut Hilfe-Map, eingeschränkt; Elements/AI/LE: nein) |
| **Project Logical Editor (PLE)** | Objekte im Projektfenster: Spuren, Parts, Events, Automation, Marker … | nachträglich | `Project > Project Logical Editor > Setup` / `Apply Preset` | Pro |
| **Transformer** (MIDI-Insert-Effekt) | MIDI-Datenstrom einer Spur **bei der Wiedergabe** | Echtzeit, nicht-destruktiv (Spurdaten bleiben unverändert) | Inspector > MIDI Inserts > Transformer | Pro, Artist, Elements |
| **Track Input Transformer** | eingehende MIDI-Daten **einer** Spur **vor** der Aufnahme | Echtzeit, verändert das, was aufgenommen wird | Inspector > Routing > Input Transformer > Track > Open Panel | Pro, Artist |
| **Project Input Transformer** | eingehende MIDI-Daten **aller** Eingänge/Spuren, für die er aktiviert ist | Echtzeit, vor der Aufnahme | `Project > Project Input Transformer` oder Inspector > Routing > Input Transformer > Project | Pro, Artist |

Steinberg selbst nennt im Forum nur „die zwei Logical Editors“ (LE und PLE); Transformer und Input
Transformer sind laut Hilfe „Abwandlungen“ des Logical Editors mit gemeinsamer Filter/Action-Logik.

## Gemeinsames Grundprinzip

```
┌──────────────────────────────────────────────────────────────────┐
│ Preset-Feld (Browser: User Presets / Factory Presets / Suche)    │
├──────────────────────────────────────────────────────────────────┤
│ Event Target Filters  (Filterzeilen)                             │
│  ( │ Filter Target │ Condition │ Param 1 │ Param 2 │ Bar Range/  │
│    │               │           │         │         │ Time Base │ ) │ Bool │
├──────────────────────────────────────────────────────────────────┤
│ Event Transform Actions (Aktionszeilen) – nur bei Funktion       │
│  Action Target │ Operation │ Param 1 │ Param 2                   │ "Transform" (und Insert/Copy/Extract)
├──────────────────────────────────────────────────────────────────┤
│ Functions (Dropdown)                                   [Apply]   │
└──────────────────────────────────────────────────────────────────┘
```

* Mehrere Filterzeilen werden mit **And/Or** (Spalte *Bool*) verknüpft; mit den **Klammer-Spalten**
  (bis zu drei Ebenen) lassen sich Teilausdrücke gruppieren. Klammern werden von innen nach außen ausgewertet.
* Aktionen sind nur relevant, wenn die Funktion sie nutzt (Transform, Insert, Insert Exclusive, Copy, Extract…).
  Bei *Select*, *Deselect*, *Delete* werden die Aktionszeilen ignoriert.
* Das **Init**-Preset setzt alles zurück.
* Im LE/Input Transformer lassen sich **MIDI-Events per Drag & Drop** in die Filterliste ziehen; die Zeilen werden
  dann aus dem Event initialisiert (Typ, Werte, Länge …).
* Die Trenn-Linie zwischen Filter- und Aktionsbereich ist verschiebbar.

## Unterschiede im Detail

### LE vs. PLE
* **LE** kennt MIDI-Begriffe: Position, Länge, Subtype (ehem. Value 1), Main Value (Value 2), Secondary Value
  (Value 3), Kanal, Typ, Eigenschaft, Last Event, Context Variable (Akkord-Analyse), Score-Editor-Zuweisungen.
* **PLE** kennt Projekt-Begriffe: Media Type, Container Type, Name, Position, Länge, Farbname, Eigenschaft,
  Output Name; Aktionen auf Spurstatus (Mute, Solo, Hide, Folder, Bypass, Routing …), Umbenennen, Farbe, Trim.
* Nur der **PLE** hat **Pre-/Post-Process Commands** (bis zu 4 + 4 Tastaturbefehle/Makros, die vor bzw. nach dem
  eigentlichen Durchlauf ausgeführt werden).
* Beide haben eine **Preset-Browser-Oberfläche** mit Suchfeld, „Save Changes as Preset“ und
  „Show User Presets Location“.

### LE vs. Echtzeit-Varianten
* **Funktionsumfang:** Der LE hat 9 Funktionen (Delete, Transform, Insert, Insert Exclusive, Copy,
  Extract to Track, Select, Extract to Lanes, Deselect). Transformer-Insert: Filter, Transform, Insert,
  Insert Exclusive. Track/Project Input Transformer: nur **Filter** und **Transform**.
* **Filterziele:** Die Echtzeit-Varianten kennen keine *Position*, *Length*, *Property*, *Context Variable*
  (nur Subtype, Main Value, Channel, Type, Secondary Value, Last Event, Assigned Voice/Stave).
* **Module:** Input Transformer haben bis zu 4 **Module** (Project IT) bzw. Module-Schalter (Track IT), jedes
  mit eigenem Preset; alle aktiven Module wirken gleichzeitig.
* **Delete im Transformer** entfernt Events nur aus dem Ausgabestrom, die Spurdaten bleiben erhalten.

## Wichtige Grenzen (aus Forum-Erfahrung)
* Es gibt **keine Variablen/Speicher** zwischen Events: „Ändere Event A abhängig von Eigenschaft von Event B“
  geht nicht (außer über *Last Event* und *Context Variable* in engen Grenzen).
* Preset-Dateien sind **XML mit binärem Hex-Blob** (siehe `06-preset-dateiformat.md`) – deshalb sind sie
  im Editor praktisch nicht von Hand änderbar. Genau hier setzt LE-Tamer an.
* Menüs/Namen änderten sich: Seit Cubase 13/14 heißen Value 1/2/3 im UI **Subtype / Main Value /
  Secondary Value**; alte Presets zeigen beim Laden ggf. noch die alten Namen.
