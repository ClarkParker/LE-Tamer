# 03 – Project Logical Editor (PLE) – Referenz Cubase 15

`Project > Project Logical Editor > Setup` (Fenster) bzw. `> Apply Preset` (direkt anwenden).
Fenster: Preset · Event Target Filters · Event Transform Actions · **Pre & Post Commands** (ausklappbar) ·
Functions · Apply. Alles ist per `Edit > Undo` rückgängig zu machen. Steinberg empfiehlt ausdrücklich,
in einem Testprojekt zu experimentieren („nicht jede Kombination macht Sinn“).

## Filterzeile
Dieselben Spalten wie im LE (Klammern, Filter Target, Condition, Parameter 1/2, Bar Range/Time Base, Bool).

## Filter Targets
| Ziel | Parameter 1 / Bedeutung |
|---|---|
| **Media Type** | Audio (Events, Parts, Spuren) · MIDI (Parts, Spuren) · Automation · Marker · Transpose · Arranger · Tempo · Signature · Chord · Scale Event · Video · Group · Effect · Device · VCA |
| **Container Type** | **Folder Track** (inkl. FX-/Group-Ordner) · **Track** · **Part** (Audio/MIDI/Instrument-Parts, keine Folder-Parts) · **Event** (Automationspunkte, Marker, Audio-, Arranger-, Transpose-, Tempo-, Taktart-Events) |
| **Name** | Text in Param 1; Bedingungen Equal / Contains / Contains Not |
| **Position** | wie LE: Equal (mit Zeitbasis), Inside/Outside Range, Inside/Outside Bar Range, Cursor-/Cycle-Bedingungen |
| **Length** | Länge in gewählter Zeitbasis (PPQ, Sekunden, Samples, Frames); Hilfe empfiehlt zusätzliche Zeile *Media Type* |
| **Color Name** | Farbname (Equal / Contains / Contains Not) |
| **Property** | Is Muted · Is Selected · Is Empty · Inside NoteExp · Is valid VST 3 · Is Hidden · Has Track Version · Follows Chord Track · Is Disabled · Parent Object Is Selected |
| **Output Name** | Ausgangsname (Param 1, Auswahlmenü oder Text), bei MIDI/Instrument zusätzlich MIDI-Kanal (Param 2); Equal / Contains / Contains Not |

## Conditions
Equal · Unequal · Bigger · Bigger or Equal · Less · Less or Equal · Inside Range · Outside Range ·
Inside Bar Range · Outside Bar Range · Before Cursor · Beyond Cursor · Inside Cycle · Outside Cycle ·
Inside Track Loop · Exactly Matching Cycle · Inside Selected Marker · All Types (alle Media-/Container-Typen) ·
Property is Set · Property is Not Set · **Contains** · **Contains Not** (Name/Color Name/Output Name).

## Functions
| Funktion | Wirkung |
|---|---|
| **Delete** | Löscht gefundene Elemente. (Hinweis: gelöschte Automationsspuren kommen per Undo zurück, aber geschlossen.) |
| **Transform** | Wendet die Aktionsliste an. |
| **Select** | Wählt gefundene Elemente im Projektfenster aus. |
| **Deselect** | Hebt Auswahl auf. |

Tipp aus dem Forum: Ein Transform-Preset erst mit **Select** testen, um zu sehen, *was* getroffen wird.

## Action Targets
| Ziel | Beschreibung |
|---|---|
| **Position** | verschiebt Elemente (Zeitbasis aus Spalte Bar Range/Time Base; *Random* nutzt Zeitbasis des Elements) |
| **Length** | ändert Länge |
| **Track Operation** | ändert Spurstatus (Operationen siehe unten). Achtung: wirkt ggf. auch auf Automationsspuren – *Toggle* kann Überraschungen bringen |
| **Name** | umbenennen (String-Operationen) |
| **Trim** | nur Automation: Lautstärke in dB anheben/absenken |
| **Set Color** | Farbe setzen (Param 1 = Farbe) bzw. Increment/Decrement in der Palette |

## Operations
**Numerisch (Position/Length):** Add · Subtract · Multiply by · Divide by · Round by · Set Random Values Between ·
Set Relative Random Values Between · Set to Fixed Value · Move to Cursor.

**Name:** Replace (Param 1 = neuer Name) · Append / Prepend (Param 2 = String, auch *Std. Names* wie Datum) ·
Generate Name (Param 1 = Text, Param 2 = Startnummer, +1 pro Element) · Replace Search String (Param 1 → Param 2) ·
Erase Before / Erase After (Param 1 = Suchstring) · Erase Front Character · Erase End Character.

**Track Operation** (Param 1 meist Enable / Disable / Toggle): Folder (Open/Close/Toggle) · Record · Monitor · Solo ·
Mute · Read · Write · EQ Bypass · Inserts Bypass · Sends Bypass · Enable Send Slot by Number (Param 2 = Slot) ·
Enable Insert Slot by Number (Param 2 = Slot) · Lanes Active · Hide Track · Time Domain (Musical/Linear/Toggle) ·
Connect Output (Param 1 = Ausgang) · Connect Input (Param 1 = Eingang).

**Set Color:** Set to Fixed Value · Increment · Decrement.

**Trim:** Increment Volume in dB · Decrement Volume in dB.

## Pre- und Post-Process Commands
* Bis zu **4 Pre-** und **4 Post-Befehle** (Tastaturbefehle oder Makros) pro Preset; werden mit dem Preset gespeichert.
* Reihenfolge: Pre-Commands → Filter → Actions → Post-Commands. Post-Commands laufen auch ohne Aktionen.
* Befehle per Drag verschieben, mit Alt/Opt kopieren; Browser mit Suche und Kategorien.
* Damit lassen sich Makro-Ketten bauen (klassisch: PLE-Preset selektiert Spuren → Makro arbeitet auf der Auswahl).

## Tastaturbefehle für Presets
`Edit > Key Commands` → Kategorie **Process Logical Preset** (PLE) bzw. **Process Logical Preset**/MIDI-Logical für LE
→ Preset wählen, Taste zuweisen. Presets erscheinen dort unter ihrem Dateinamen (Ordner = Kategorie).

## Praxis-Rezepte (SOS/MusicTech)
* **Inserts auf allen ausgewählten Spuren bypassen:** `Container Type = Track AND Property is Set: Selected` →
  Transform `Track Operation: Inserts Bypass → Toggle`.
* **Automation im Cycle löschen (nur ausgewählte Spuren):** `Media Type = Automation AND Container Type = Event AND
  Position Inside Cycle AND Property is Set: Parent Object Is Selected` → Delete.
* **Alle Folder öffnen:** `Container Type = Folder Track` → Transform `Track Operation: Folder → Open`.
* **Spuren nach Name färben:** `Name Contains "Kit"` → Transform `Set Color → Set to fixed <Farbe>`.
* **Datum an Spurnamen anhängen:** `Container Type = Track AND Property is Set: Selected` →
  `Name → Append, Param 2 = Std. Names → Date`.
* **Alle gemuteten Parts/Events löschen:** `( Container Type = Part OR Container Type = Event ) AND Property is Set: Muted` → Delete.
* **Sichtbarkeits-Szenen (Metagrid-Stil):** `Container Type = Folder Track AND Name = "<Ordner>"` →
  `Track Operation: Hide Track → Enable/Disable`.
