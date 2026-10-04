# 11 – Funktionsmatrix Cubase 15: Anspruch „alles“, Stand und Lücken

Ziel ist die **vollständige** Unterstützung aller Funktionen des Logical Editors (LE), Project Logical Editors (PLE),
Transformers und der Input Transformer von **Cubase 15**. Diese Matrix listet jede Funktion aus der Cubase-15-Dokumentation
(`02`–`04`) mit dem Stand im Dateiformat (`06`, `10`) und in den Oberflächen. Der zweite Teil ist eine **Checkliste
von Mini-Presets**, die in Cubase 15 gespeichert werden müssen, damit `tools/learn.py` die letzten Codes ableitet.

Legende: **✅** Code aus echten Presets belegt und im Studio nutzbar · **🟡** Code plausibel abgeleitet, noch nicht belegt
(Studio schreibt ihn, warnt aber) · **❓** Code unbekannt – Mini-Preset nötig · **⬜** Format bekannt, Oberfläche fehlt noch.

## 1. Werkzeuge und Wurzelelemente

| Werkzeug | Wurzelelement | Header-Wort 2 | Status |
|---|---|---|---|
| Logical Editor (MIDI > Logical Editor / Apply Preset) | `Logical_EditPreset` | 1 | ✅ |
| Project Logical Editor | `Project_Logical_EditorPreset` | 1 | ✅ |
| Transformer (MIDI-Insert) | `TransformerPreset` | 1 | ✅ (Format), ⬜ Export-Umschalter im Studio vorhanden, Ladetest offen |
| Track Input Transformer / Project Input Transformer | `Input_TransformerPreset` | **0** | ✅ (Format), ⬜ wie oben |

Alle vier verwenden denselben Binärstrom; Transformer/Input Transformer schreiben `LeTypeValue(0..6)` statt `(0..8)`.
Trailer seit Cubase 12: `u32 0 (kein Befehlsname) · i32 Funktion · i32 isPLE · 0 · 0x1100 · 0 · 0`.

## 2. Filter Targets

### Logical Editor, Transformer, Input Transformer
| Ziel (Cubase 15) | Klasse | Parameter | Status | Hinweis |
|---|---|---|---|---|
| Type | `leTypesTarget` | `LeTypeValue`, `LeUIntValue`, u32 0 | ✅ | Typen 0 Note, 2 Controller, 3 Program Change, 4 Aftertouch, 5 Pitchbend, 6 SysEx ✅ · 1 Poly Pressure, 7 VST 3 Event, 8 SMF Event 🟡 |
| Subtype (Value 1) | `SubTypeTarget` (C13+) / `leValue1Target` | `PMidiNoteValue` (Note), `PControllerValue` (CC), `LeUIntValue` | ✅ | beide Schreibweisen byteidentisch belegt |
| Main Value (Value 2) | `MainValueTarget` (C13+) / `leValue2Target` | `PVelocityValue` (float32) / `LeUIntValue` | ✅ | |
| Secondary Value (Value 3, Note-Off-Velocity) | ? | ? | ❓ | kein einziger Beleg im 579er-Korpus → `FT__SecondaryValue.xml` |
| Channel | `leChannelTarget` | `LEMidiChannelValue(0..15)` = Kanal − 1 | ✅ | |
| Position – Inside/Outside Bar Range | `lePositionTarget` | `LeUIntValue(0..1920)` Ticks | ✅ | 480 PPQ |
| Position – Before/Beyond Cursor, Inside/Exactly Cycle | `lePositionTarget` | `LeTTimeValue` (Vorlage) | ✅ | Werte irrelevant; Vorlage aus Factory-Preset |
| Position – Outside Cycle (219), Inside Selected Marker (222), Inside Track Loop | `lePositionTarget` | `LeTTimeValue` | 🟡 / ❓ | `COND__OutsideCycle.xml`, `COND__InsideSelectedMarker.xml`, `COND__InsideTrackLoop.xml` |
| Position – Equal / Inside Range mit echter Position (z. B. 5.1.1.0) | `lePositionTarget` | `LeTTimeValue` mit Tempo-Kontext | ⬜ | Aufbau in `06` Kap. 12 beschrieben, Zeitbasen PPQ ✅, Sekunden ✅, Samples ✅, Frames ✅ – Encoder für *neue* Werte fehlt → `FT__PositionEqual_5-1-1-0.xml`, `FT__PositionEqual_10sec.xml` |
| Length | `leLengthTarget` | `LeUIntValue` (Ticks) ✅ / `LeTTimeDiffValue` (Zeitbasis) | ✅ / ⬜ | Cubase fügt *Type = Note* automatisch hinzu |
| Property | `leFlagsTarget` | `LeFlagsValue` | ✅ | 0 Muted, 1 Selected, 2 Empty, 3 Inside NoteExp ✅ · 4 Is valid VST 3 🟡 |
| Last Event | `leHistoryTarget` | `LeHistoryValue(0..5)`, `LeAllroundValue(0..255)` | 🟡 | Klasse belegt, Bedeutung der sechs Parameter-1-Werte offen → `FT__LastEvent_*.xml` |
| Context Variable | `leContextTypeTarget` | u32 Index, u32/`LeUIntValue` | ✅ | Indizes 0, 3, 12, 13, 14 ✅ · übrige 🟡 (Reihenfolge wie Menü) |
| Assigned Voice (Score Editor) | ? | ? | ❓ | neu seit Cubase 13 → `FT__AssignedVoice.xml` |
| Assigned Stave (Score Editor) | ? | ? | ❓ | → `FT__AssignedStave.xml` |

### Project Logical Editor
| Ziel | Klasse | Parameter | Status | Hinweis |
|---|---|---|---|---|
| Media Type | `leMediaTypeTarget` | `LeMediaTypeValue` | ✅ | 0 Audio, 1 MIDI, 2 Automation, 3 Marker, 7 Signature, 8 Chord ✅ · 4–6, 9–14 🟡 |
| Container Type | `leContainerTypeTarget` | `LeContainerTypeValue` | ✅ | 0 Folder, 1 Track, 2 Part, 3 Event |
| Name | `leNameTypeTarget` | `UStringValue` | ✅ | Equal 200, Contains 210, Contains Not 221 |
| Position / Length | wie LE | | ✅ / ⬜ | |
| Color Name | `leColorTypeTarget` | `UStringValue` + u32 0 | ✅ | |
| Property | `leFlagsTarget` | `LeFlagsValue(0..9)` | ✅ | 5 Hidden, 6 Has Track Version, 7 Follows Chord Track, 8 Is Disabled ✅ · 9 Parent Object Is Selected 🟡 |
| Output Name | ? | ? | ❓ | → `PLE__FT_OutputName.xml` |

## 3. Conditions

| Code | Bedingung | Gilt für | Status |
|---|---|---|---|
| 200–205 | Equal, Unequal, Bigger, Bigger or Equal, Less, Less or Equal | numerisch | ✅ |
| 206 / 208 | Inside / Outside Bar Range | Position | ✅ |
| 207 / 209 | Inside / Outside Range | numerisch, Position, Length | ✅ |
| 210 / 221 | Contains / Contains Not | Name, Color Name, Output Name | ✅ |
| 211 / 212 | Property is Set / is Not Set | Property | ✅ |
| 214 | All Types | Type, Media Type, Container Type | ✅ |
| 216 / 217 | Before / Beyond Cursor | Position | ✅ |
| 218 / 220 | Inside Cycle / Exactly Matching Cycle | Position | ✅ |
| 219 | Outside Cycle | Position | 🟡 |
| 222 | Inside Selected Marker | Position | 🟡 |
| ? | Inside Track Loop | Position | ❓ (213 oder 215?) |
| ? | Note is Equal to (alle Oktaven) | Subtype bei Noten | ❓ |
| ? | Every other Event | Last Event | ❓ |

## 4. Functions (Trailer-Wort 2)

| Code | Funktion | LE | PLE | Transformer / Input Transformer | Status |
|---|---|---|---|---|---|
| 0 | Delete (Transformer: Filter) | ✓ | ✓ | ✓ | ✅ |
| 1 | Transform | ✓ | ✓ | ✓ | ✅ |
| 2 | Insert | ✓ | – | ✓ | ✅ |
| 3 | Insert Exclusive | ✓ | – | ✓ | ✅ |
| 4 | Copy | ✓ | – | – | ✅ |
| 5 | Extract to Track | ✓ | – | – | ✅ |
| 6 | Select | ✓ | ✓ | – | ✅ |
| 7 | Extract to Lanes | ✓ | – | – | 🟡 → `FN__ExtractToLanes.xml` |
| 8 | Deselect | ✓ | ✓ | – | ✅ |

## 5. Action Targets

| Code | Ziel | Klasse | Parameter | Status |
|---|---|---|---|---|
| 4000 | Position | `leActionTargetStart` | `LeTTimeDiffValue` (Add/Subtract), `LeUIntValue` | ✅ Lesen · ⬜ eigene Werte (Vorlagen für Ticks folgen aus `AT__PositionAdd_1Beat.xml`) |
| 4001 | Length | `leActionTargetLength` | `LeTTimeDiffValue` / `LeUIntValue` | ✅ Lesen · ⬜ wie oben |
| 4025 / 4002 | Subtype | `ActionTargetSubType` (C13+) / `leActionTargetValue1` | `LeUIntValue`, `PControllerValue` | ✅ |
| 4024 / 4003 | Main Value | `ActionTargetMainValue` (C13+) / `leActionTargetValue2` | `PVelocityValue` / `LeUIntValue`, `LeUFloatValue` | ✅ |
| 4022 | Velocity (Cubase 13+, wenn Type = Note) | `ActionTargetVelocity` | `PVelocityValue` | ✅ |
| 4005 | Channel | `leActionTargetChannel` | `LEMidiChannelValue` | ✅ |
| 4006 | Type | `leActionTargetTypes` | `LeTypeValue` + u32 0 | ✅ |
| ? | Secondary Value | ? | ? | ❓ → `AT__SecondaryValue_Fixed64.xml` |
| 4016 | NoteExp Operation | `leActionTargetNXPOp` | 355 Remove NoteExp ✅ | ✅ / Create One Shot, Reverse ❓ |
| ? | VST 3 Value Operation | ? | Float 0.0–1.0 | ❓ → `AT__VST3Value_Fixed0-5.xml` |
| ? | Score Editor Operation | ? | Assign/Unassign stave and voice | ❓ → `AT__ScoreAssign.xml`, `AT__ScoreUnassign.xml` |
| 4007 | Name (PLE) | `leActionTargetName` | `UStringValue`, `LeMagicNamesValue`/`LeUIntValue` | ✅ |
| 4012 | Track Operation (PLE) | `leActionTargetTrackOp` | `LeGenericOpValue`, `LeUIntValue` (Slot) | ✅ |
| 4013 | Trim (PLE, Automation) | `leActionTargetTrim` | ? | ✅ Klasse · ❓ Operationen → `PLE__AT_TrimInc3dB.xml` |
| 4014 | Set Color (PLE) | `leActionTargetColor` | `UStringValue`/Index, `LeUIntValue` | ✅ Set to Fixed · ❓ Increment/Decrement |

## 6. Operations

| Code | Operation | Ziele | Status |
|---|---|---|---|
| 304 / 306 | Add / Subtract | numerisch, Position, Length | ✅ |
| 307 / 308 | Multiply by / Divide by | numerisch, Position, Length | ✅ (Float-Parameter `LeUFloatValue`) |
| 309 | Round by | numerisch | ✅ |
| 310 | Set Random Values Between | numerisch | ✅ |
| 311 | Set Relative Random Values Between | numerisch | ✅ |
| 312 | Set to Fixed Value | alle | ✅ |
| 317 | Linear Change in Loop Range | numerisch | ✅ |
| ? | Relative Change in Loop Range | numerisch | ❓ (vermutlich 318) → `OP__RelativeChangeInLoop.xml` |
| ? | Use Subtype (Ziel Main Value) | | ❓ → `OP__UseSubtype.xml` |
| ? | Use Main Value (Ziel Subtype) | | ❓ → `OP__UseMainValue.xml` |
| ? | Mirror | Subtype, Main Value | ❓ → `OP__Mirror64.xml` |
| ? | Invert | NoteExp, VST 3 | ❓ → `OP__Invert.xml` |
| ? | Add Length | Position | ❓ → `OP__AddLength.xml` |
| ? | Move to Cursor | Position | ❓ → `OP__MoveToCursor.xml` |
| ? | Transpose to Scale | Subtype (Type = Note) | ❓ → `OP__TransposeToScale_D_Major.xml` |
| 355 | Remove NoteExp | NoteExp Operation | ✅ |
| ? | Create One Shot / Reverse | NoteExp Operation | ❓ → `OP__NXP_CreateOneShot.xml`, `OP__NXP_Reverse.xml` |
| 326 / 327 / 328 | Replace / Append / Prepend | Name | ✅ |
| 329 / 330 | Generate Name / Replace Search String | Name | ✅ |
| 365 | Erase Before | Name | ✅ |
| ? | Erase After / Erase Front Character / Erase End Character | Name | ❓ (366–368?) → `PLE__OP_EraseAfter.xml` … |
| 331–335 | Folder, Record, Monitor, Solo, Mute | Track Operation | ✅ |
| 336 / 337 / 338 | Read, Write, EQ Bypass | Track Operation | 🟡 → `PLE__OP_Read.xml`, `PLE__OP_Write.xml`, `PLE__OP_EQBypass.xml` |
| 340 | Inserts Bypass | Track Operation | ✅ |
| 341 | Sends Bypass | Track Operation | 🟡 → `PLE__OP_SendsBypass.xml` |
| 342 / 343 / 344 | Lanes Active, Hide Track, Time Domain | Track Operation | ✅ |
| 370 / 371 | Enable Send Slot / Enable Insert Slot by Number | Track Operation | 🟡 / ✅ |
| ? | Connect Output / Connect Input | Track Operation | ❓ → `PLE__OP_ConnectOutput.xml`, `PLE__OP_ConnectInput.xml` |
| ? | Set Color Increment / Decrement | Set Color | ❓ → `PLE__OP_ColorIncrement.xml` |
| ? | Increment / Decrement Volume in dB | Trim | ❓ → `PLE__AT_TrimInc3dB.xml` |
| 339, 364 | (unbekannt, aus Forum-Presets) | Track Operation | ❓ – werden beim Lernen vermutlich den obigen zugeordnet |

## 7. Änderungen Cubase 12 → 13 → 15 (Dokumentations-Diff + Korpus)

* **Cubase 13:** Umbenennung *Value 1/2/3 → Subtype / Main Value / Secondary Value*; neue Unterklassen `SubTypeTarget`,
  `MainValueTarget`, `ActionTargetSubType` (4025), `ActionTargetMainValue` (4024), `ActionTargetVelocity` (4022); Velocity als
  float32 (`PVelocityValue`). Neue Ziele *Assigned Voice/Stave* und *Score Editor Operation* (Dorico-basierter Noteneditor),
  Operationen *Use Subtype / Use Main Value*. Alte Dateien bleiben ladbar, Cubase 13–15 lesen beide Schreibweisen.
* **Cubase 14:** keine Änderung an den LE/PLE-Kapiteln gegenüber 13.
* **Cubase 15:** Kapiteltext identisch mit 14; im Format neu belegt: `PControllerValue.max = 32895` (14-Bit-/MIDI-2.0-Controller,
  RPN/NRPN) und `LeUIntValue(0..127)` als P2 von *Set Color*.
* **Pre-/Post-Process-Befehle (PLE, seit Cubase 12):** in keiner der 579 Dateien gesetzt. Der Trailer beginnt mit einem
  Befehlsnamen-String (Cubase 11); wie 4 + 4 Befehle in Cubase 15 abgelegt werden, klärt `PRE__OnePreCommand.xml`.

## 8. Checkliste: Mini-Presets aus Cubase 15 exportieren

So geht's (5 Minuten für alles):
1. Cubase 15 → *MIDI > Logical Editor* (für `PLE__*`: *Project > Project Logical Editor*; für `TR__*`: Transformer-Insert;
   für `IT__*`: Track Input Transformer).
2. Preset „Init“ laden, **genau eine** Zeile wie angegeben einstellen, als Preset speichern – **Name exakt wie unten**
   (Cubase schreibt `<Name>.xml` nach `Dokumente\Steinberg\Cubase 15\User Presets\Logical Edit\` bzw.
   `…\Project Logical Editor\`, `…\Transformer\`, `…\Input Transformer\`).
3. Ordner zippen und hochladen. Auswertung: `python3 tools/learn.py <Ordner>` → `learn-result.json`; daraus werden
   `data/le-codes.json`, Core und Studio nachgezogen.

Namensschema: `GRUPPE__Name.xml` – FT Filterziel · COND Bedingung · FN Funktion · AT Aktionsziel · OP Operation ·
PLE Project Logical Editor · TR Transformer · IT Input Transformer · PRE Pre-/Post-Befehle.

| Datei | Einstellung in Cubase 15 | Das lernen wir |
|---|---|---|
| `FT__SecondaryValue.xml` | Filter: *Type Equal Note* AND *Secondary Value Bigger 64* | Klasse + Wertklasse für Value 3 |
| `FT__LastEvent_0.xml` … `FT__LastEvent_5.xml` | Filter: *Last Event Equal*, Parameter 1 = 1., 2., … 6. Listeneintrag, Parameter 2 = 7 | Reihenfolge der `LeHistoryValue`-Einträge |
| `FT__AssignedVoice.xml` | Filter: *Assigned Voice (Score Editor) Equal 2* | Klasse, Wertklasse |
| `FT__AssignedStave.xml` | Filter: *Assigned Stave (Score Editor) Equal 2* | Klasse, Wertklasse |
| `FT__PositionEqual_5-1-1-0.xml` | Filter: *Position Equal 5.1.1.0* (Zeitbasis PPQ) | `LeTTimeValue` mit echtem Wert |
| `FT__PositionEqual_10sec.xml` | Filter: *Position Equal 00:00:10.000* (Zeitbasis Sekunden) | Sekunden-Variante |
| `FT__PositionRange_2-1_to_3-1.xml` | Filter: *Position Inside Range 2.1.1.0 – 3.1.1.0* | zwei Zeitwerte |
| `FT__Length_Eighth.xml` | Filter: *Length Equal 0.0.2.0* (= Achtel, Zeitbasis PPQ) | `LeTTimeDiffValue` PPQ |
| `FT__Length_1sec.xml` | Filter: *Length Bigger 1 s* (Zeitbasis Sekunden) | Sekunden-Diff |
| `FT__Type_PolyPressure.xml`, `FT__Type_VST3.xml`, `FT__Type_SMF.xml` | Filter: *Type Equal …* | Typ-Indizes 1, 7, 8 |
| `FT__Property_VST3.xml` | Filter: *Property is Set – Is valid VST 3* | Property-Index 4 |
| `FT__Context_1.xml` … `FT__Context_16.xml` (nur die noch unbelegten: 1, 2, 4–11, 15, 16) | Filter: *Context Variable Equal*, Parameter 1 = n-ter Eintrag, Parameter 2 = 3 | Indizes der Context-Variablen |
| `COND__NoteIsEqualTo.xml` | Filter: *Type Equal Note* AND *Subtype Note is Equal to C3* | Code für „alle Oktaven“ |
| `COND__EveryOtherEvent.xml` | Filter: *Last Event – Event Counter – Every other Event 2* | Code + Parameter |
| `COND__OutsideCycle.xml`, `COND__InsideTrackLoop.xml`, `COND__InsideSelectedMarker.xml` | Filter: *Position …* | Codes 219/222/? |
| `COND__AllTypes.xml` | Filter: *Type All Types* | Bestätigung 214 beim LE |
| `FN__ExtractToLanes.xml` | Funktion *Extract to Lanes*, Filter beliebig | Code 7 |
| `AT__SecondaryValue_Fixed64.xml` | Transform: *Secondary Value Set to Fixed Value 64* | Klasse + Zielcode |
| `AT__PositionAdd_1Beat.xml` | Transform: *Position Add 0.1.0.0* | `LeTTimeDiffValue` für eigene Werte |
| `AT__PositionAdd_100ms.xml` | Transform: *Position Add 100 ms* (Zeitbasis Sekunden) | Sekunden-Diff in Aktionen |
| `AT__LengthFixed_Quarter.xml` | Transform: *Length Set to Fixed Value 0.1.0.0* | Längenwert |
| `AT__VST3Value_Fixed0-5.xml` | Transform: *VST 3 Value Operation Set to Fixed Value 0.5* | Klasse, Float-Format |
| `AT__ScoreAssign.xml`, `AT__ScoreUnassign.xml` | Transform: *Score Editor Operation – Assign/Unassign stave and voice* | Klasse + Op-Codes |
| `OP__Mirror64.xml` | Transform: *Main Value Mirror 64* | Op-Code |
| `OP__UseSubtype.xml` | Transform: *Main Value Use Subtype* | Op-Code |
| `OP__UseMainValue.xml` | Transform: *Subtype Use Main Value* | Op-Code |
| `OP__TransposeToScale_D_Major.xml` | Filter *Type Equal Note*; Transform: *Subtype Transpose to Scale, D, Major* | Op-Code, Grundton-/Skalen-Kodierung |
| `OP__RelativeChangeInLoop.xml` | Transform: *Main Value Relative Change in Loop Range 0 → −100* | Op-Code |
| `OP__AddLength.xml` | Transform: *Position Add Length* | Op-Code |
| `OP__MoveToCursor.xml` | Transform: *Position Move to Cursor* | Op-Code |
| `OP__Invert.xml` | Transform: *NoteExp Operation Invert* (falls anwählbar) | Op-Code |
| `OP__NXP_CreateOneShot.xml`, `OP__NXP_Reverse.xml` | Transform: *NoteExp Operation …* | Op-Codes |
| `OP__Round10.xml`, `OP__Random60-100.xml`, `OP__RelRandom-5-5.xml` | Transform auf *Velocity* (Type = Note): Round by 10 · Set Random 60–100 · Set Relative Random −5…5 | Cubase-15-Schreibweise für Velocity (float) bei diesen Ops |
| `PLE__FT_OutputName.xml` | PLE-Filter: *Output Name Contains „Stereo Out“* | Klasse, Parameter |
| `PLE__FT_Media_*.xml` (Transpose, Arranger, Tempo, Scale, Video, Group, Effect, Device, VCA) | PLE-Filter: *Media Type Equal …* | Media-Indizes 4–6, 9–14 |
| `PLE__FT_Property_ParentSelected.xml` | PLE-Filter: *Property is Set – Parent Object Is Selected* | Index 9 |
| `PLE__OP_Read.xml`, `PLE__OP_Write.xml`, `PLE__OP_EQBypass.xml`, `PLE__OP_SendsBypass.xml` | PLE Transform: *Track Operation … Enable* | Codes 336–341 |
| `PLE__OP_SendSlot3.xml` | PLE Transform: *Track Operation Enable Send Slot by Number 3* | Code 370 + Slot |
| `PLE__OP_ConnectOutput.xml`, `PLE__OP_ConnectInput.xml` | PLE Transform: *Track Operation Connect Output/Input …* | Codes + Parameter |
| `PLE__OP_EraseAfter.xml`, `PLE__OP_EraseFront.xml`, `PLE__OP_EraseEnd.xml` | PLE Transform: *Name Erase After „x“* / *Erase Front Character* / *Erase End Character* | Codes 366–368? |
| `PLE__OP_ColorIncrement.xml`, `PLE__OP_ColorDecrement.xml` | PLE Transform: *Set Color Increment / Decrement* | Op-Codes |
| `PLE__AT_TrimInc3dB.xml`, `PLE__AT_TrimDec3dB.xml` | PLE Transform: *Trim Increment/Decrement Volume in dB 3* | Op-Codes, Wertklasse |
| `PLE__OP_PositionMoveToCursor.xml` | PLE Transform: *Position Move to Cursor* | Op-Code im PLE |
| `PRE__OnePreCommand.xml` | PLE: beliebiges Preset + **ein** Pre-Process-Befehl (z. B. *Edit – Select All*) | Ablage der Pre-/Post-Befehle |
| `PRE__FourPreFourPost.xml` | PLE: 4 Pre- + 4 Post-Befehle | Listenformat |
| `TR__Filter_NoteBelowC3.xml` | Transformer-Insert: Modul *Filter*, *Type Equal Note* AND *Subtype Less C3* | Transformer-Export-Gegenprobe |
| `IT__Pedal_to_Kick.xml` | Track Input Transformer: *Type Equal Controller* AND *Subtype Equal 64* → Type Note, Subtype C1, Main Value 100 | Input-Transformer-Gegenprobe (Header-Wort 0, Typ-Max 6) |

Jede Datei genügt einmal; Reihenfolge egal. Sobald `learn-result.json` vorliegt, werden die ❓-Zeilen dieser Matrix zu ✅
und das Studio schaltet die zugehörigen Chips/Karten frei.
