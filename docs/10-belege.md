# 10 – Belege: Code-Vorkommen im Preset-Korpus

Automatisch erzeugt am 2026-10-04 mit `scratchpad/harvest/evidence.py` aus `tools/leparse.py`. Ein Code gilt als **verifiziert**, wenn seine Bedeutung aus Preset-Namen/Kommentaren oder Factory-Presets eindeutig hervorgeht; die Spalte *Belege* zählt Vorkommen je Quelle.

**Korpus:** 579 eindeutige Presets – Forum: 514, Upload (Factory-PLE): 45, r-koubou: 20.  
Wurzelelemente: `Project_Logical_EditorPreset` 205, `Logical_EditPreset` 368, `Input_TransformerPreset` 2, `TransformerPreset` 4.  
Zeitliche Verteilung (Forum: Upload-Jahr): 2011: 6, 2012: 15, 2013: 1, 2015: 5, 2018: 1, 2020: 208, 2022: 65, 2023: 64, 2024: 5, 2025: 83, ?: 61, C8–C13: 20, ≤C11: 45.

## Funktionen (Trailer-Wort 2)

| Wurzel | Code | Name | Belege |
|---|---|---|---|
| Input_TransformerPreset | 0 | Delete | 1 |
| Input_TransformerPreset | 1 | Transform | 1 |
| Logical_EditPreset | 0 | Delete | 23 |
| Logical_EditPreset | 1 | Transform | 176 |
| Logical_EditPreset | 2 | Insert | 58 |
| Logical_EditPreset | 4 | Copy | 1 |
| Logical_EditPreset | 5 | Extract to Track | 1 |
| Logical_EditPreset | 6 | Select | 100 |
| Project_Logical_EditorPreset | 0 | Delete | 14 |
| Project_Logical_EditorPreset | 1 | Transform | 139 |
| Project_Logical_EditorPreset | 6 | Select | 23 |
| Project_Logical_EditorPreset | 544501582 | ❓ | 13 |
| Project_Logical_EditorPreset | 1634953540 | ❓ | 2 |
| Project_Logical_EditorPreset | 1735290707 | ❓ | 10 |
| Project_Logical_EditorPreset | 1953064005 | ❓ | 4 |
| TransformerPreset | 1 | Transform | 1 |
| TransformerPreset | 2 | Insert | 1 |
| TransformerPreset | 3 | Insert Exclusive | 2 |

Trailer-Wort 5 (Version): `0x-10FF9A94` × 2, `0x0` × 340, `0x1100` × 201, `0x746E65` × 4, `0x1000000` × 23 – `0x1100` in allen Dateien ab Cubase 12.

## Bedingungen (Filterklasse, Code)

| Klasse | Code | Name | Belege |
|---|---|---|---|
| `MainValueTarget` | 200 | Equal | Forum 2 |
| `SubTypeTarget` | 200 | Equal | Forum 2 |
| `leChannelTarget` | 200 | Equal | Forum 3 |
| `leColorTypeTarget` | 200 | Equal | Upload (Factory-PLE) 1 |
| `leContainerTypeTarget` | 200 | Equal | Forum 100, Upload (Factory-PLE) 53 |
| `leContextTypeTarget` | 200 | Equal | Forum 12 |
| `leHistoryTarget` | 200 | Equal | Forum 1 |
| `leMediaTypeTarget` | 200 | Equal | Upload (Factory-PLE) 23, Forum 21 |
| `leNameTypeTarget` | 200 | Equal | Forum 6 |
| `leTypesTarget` | 200 | Equal | Forum 341, r-koubou 23 |
| `leValue1Target` | 200 | Equal | Forum 142, r-koubou 6 |
| `leMediaTypeTarget` | 201 | Unequal | Upload (Factory-PLE) 4 |
| `leTypesTarget` | 201 | Unequal | Forum 2, r-koubou 2 |
| `leValue1Target` | 201 | Unequal | r-koubou 1 |
| `lePositionTarget` | 202 | Bigger | Upload (Factory-PLE) 1 |
| `leValue1Target` | 202 | Bigger | Forum 1 |
| `leValue2Target` | 202 | Bigger | Forum 5 |
| `lePositionTarget` | 203 | Bigger or Equal | Forum 1 |
| `leLengthTarget` | 204 | Less | Upload (Factory-PLE) 3, r-koubou 1 |
| `leValue1Target` | 204 | Less | Forum 2 |
| `leValue2Target` | 204 | Less | Forum 1 |
| `leLengthTarget` | 205 | Less or Equal | Forum 1, r-koubou 1 |
| `lePositionTarget` | 206 | Inside Bar Range | Forum 67 |
| `leLengthTarget` | 207 | Inside Range | Forum 24 |
| `leValue1Target` | 207 | Inside Range | Forum 6 |
| `leValue2Target` | 207 | Inside Range | Forum 12 |
| `lePositionTarget` | 208 | Outside Bar Range | Forum 17, Upload (Factory-PLE) 8 |
| `leValue2Target` | 209 | Outside Range | Forum 1 |
| `leNameTypeTarget` | 210 | Contains | Forum 98, Upload (Factory-PLE) 6 |
| `leFlagsTarget` | 211 | Property is Set | Forum 95, Upload (Factory-PLE) 13, r-koubou 1 |
| `leFlagsTarget` | 212 | Property is Not Set | Forum 10, Upload (Factory-PLE) 2 |
| `leContainerTypeTarget` | 214 | All Types | Forum 12 |
| `lePositionTarget` | 216 | Before Cursor | Forum 3 |
| `lePositionTarget` | 217 | Beyond Cursor | Forum 3, Upload (Factory-PLE) 2 |
| `lePositionTarget` | 218 | Inside Cycle | Forum 23 |
| `lePositionTarget` | 220 | Exactly Matching Cycle | Upload (Factory-PLE) 1 |
| `leNameTypeTarget` | 221 | Contains Not | Forum 1, Upload (Factory-PLE) 1 |

## Aktionsziele (Klasse, Target-ID)

| Klasse | ID | Name | Belege |
|---|---|---|---|
| `leActionTargetStart` | 4000 | Position | Forum 57, Upload (Factory-PLE) 11, r-koubou 3 |
| `leActionTargetLength` | 4001 | Length | Forum 22, r-koubou 3, Upload (Factory-PLE) 1 |
| `leActionTargetValue1` | 4002 | Subtype (Value 1) | Forum 56, r-koubou 4 |
| `leActionTargetValue2` | 4003 | Main Value (Value 2) | Forum 140, r-koubou 8 |
| `leActionTargetChannel` | 4005 | Channel | Forum 9 |
| `leActionTargetTypes` | 4006 | Type | Forum 39, r-koubou 2 |
| `leActionTargetName` | 4007 | Name | Forum 81, Upload (Factory-PLE) 3 |
| `leActionTargetTrackOp` | 4012 | Track Operation | Forum 96, Upload (Factory-PLE) 18 |
| `leActionTargetTrim` | 4013 | Trim | Upload (Factory-PLE) 1 |
| `leActionTargetColor` | 4014 | Set Color | Forum 9, Upload (Factory-PLE) 1 |
| `leActionTargetNXPOp` | 4016 | NoteExp Operation | r-koubou 1 |
| `ActionTargetVelocity` | 4022 | Velocity (Cubase 13+) | Forum 1 |
| `ActionTargetMainValue` | 4024 | Main Value (Cubase 13+) | Forum 26 |
| `ActionTargetSubType` | 4025 | Subtype (Cubase 13+) | Forum 26 |

## Operationen (Target-ID, Op-Code)

| Target | Op | Name | Belege |
|---|---|---|---|
| 4000 Position | 221 | (keine) | Forum 3 |
| 4000 Position | 304 | Add | Forum 30, Upload (Factory-PLE) 7 |
| 4000 Position | 306 | Subtract | Forum 8 |
| 4000 Position | 307 | Multiply by | Forum 14, r-koubou 1 |
| 4000 Position | 308 | Divide by | Forum 2, r-koubou 1 |
| 4000 Position | 309 | Round by | Upload (Factory-PLE) 3 |
| 4000 Position | 311 | Set Relative Random Values Between | Upload (Factory-PLE) 1, r-koubou 1 |
| 4001 Length | 304 | Add | Forum 5 |
| 4001 Length | 307 | Multiply by | Forum 13, r-koubou 2 |
| 4001 Length | 308 | Divide by | Forum 2, r-koubou 1 |
| 4001 Length | 312 | Set to Fixed Value | Forum 2, Upload (Factory-PLE) 1 |
| 4002 Subtype (Value 1) | 304 | Add | Forum 22, r-koubou 2 |
| 4002 Subtype (Value 1) | 306 | Subtract | Forum 7 |
| 4002 Subtype (Value 1) | 308 | Divide by | Forum 1 |
| 4002 Subtype (Value 1) | 312 | Set to Fixed Value | Forum 26, r-koubou 2 |
| 4003 Main Value (Value 2) | 304 | Add | Forum 40, r-koubou 2 |
| 4003 Main Value (Value 2) | 306 | Subtract | Forum 45, r-koubou 3 |
| 4003 Main Value (Value 2) | 307 | Multiply by | Forum 10 |
| 4003 Main Value (Value 2) | 308 | Divide by | Forum 10 |
| 4003 Main Value (Value 2) | 310 | Set Random Values Between | Forum 3, r-koubou 1 |
| 4003 Main Value (Value 2) | 312 | Set to Fixed Value | Forum 16, r-koubou 2 |
| 4003 Main Value (Value 2) | 317 | Linear Change in Loop Range | Forum 16 |
| 4005 Channel | 312 | Set to Fixed Value | Forum 9 |
| 4006 Type | 222 | ❓ | Forum 1 |
| 4006 Type | 312 | Set to Fixed Value | Forum 38, r-koubou 2 |
| 4007 Name | 326 | Replace | Forum 1 |
| 4007 Name | 327 | Append | Forum 39, Upload (Factory-PLE) 1 |
| 4007 Name | 328 | Prepend | Forum 1 |
| 4007 Name | 329 | Generate Name | Upload (Factory-PLE) 1 |
| 4007 Name | 330 | Replace Search String | Forum 5, Upload (Factory-PLE) 1 |
| 4007 Name | 365 | Erase Before | Forum 35 |
| 4012 Track Operation | 331 | Folder | Forum 7, Upload (Factory-PLE) 2 |
| 4012 Track Operation | 332 | Record | Forum 23 |
| 4012 Track Operation | 333 | Monitor | Forum 17 |
| 4012 Track Operation | 334 | Solo | Forum 1 |
| 4012 Track Operation | 335 | Mute | Upload (Factory-PLE) 5, Forum 2 |
| 4012 Track Operation | 340 | Inserts Bypass | Upload (Factory-PLE) 1 |
| 4012 Track Operation | 342 | Lanes Active | Upload (Factory-PLE) 1 |
| 4012 Track Operation | 343 | Hide Track | Forum 9, Upload (Factory-PLE) 9 |
| 4012 Track Operation | 344 | Time Domain | Forum 4 |
| 4012 Track Operation | 364 | ❓ | Forum 1 |
| 4012 Track Operation | 370 | Enable Send Slot by Number 🟡 | Forum 1 |
| 4012 Track Operation | 371 | Enable Insert Slot by Number | Forum 31 |
| 4013 Trim | 307 | Multiply by | Upload (Factory-PLE) 1 |
| 4014 Set Color | 312 | Set to Fixed Value | Forum 9, Upload (Factory-PLE) 1 |
| 4016 NoteExp Operation | 355 | Remove NoteExp | r-koubou 1 |
| 4022 Velocity (Cubase 13+) | 312 | Set to Fixed Value | Forum 1 |
| 4024 Main Value (Cubase 13+) | 312 | Set to Fixed Value | Forum 26 |
| 4025 Subtype (Cubase 13+) | 304 | Add | Forum 1 |
| 4025 Subtype (Cubase 13+) | 312 | Set to Fixed Value | Forum 25 |

## Aufzählungswerte

| Klasse | Wert | Name | Belege |
|---|---|---|---|
| `ContextVar` | 0 | Highest Pitch | Forum 1 |
| `ContextVar` | 3 | Highest Velocity | Forum 1 |
| `ContextVar` | 12 | Note Number in Chord (lowest = 0) | Forum 7 |
| `ContextVar` | 13 | Position in Chord (Chord Track) | Forum 1 |
| `ContextVar` | 14 | Voice | Forum 1 |
| `ContextVar` | 15 | Highest in Chord from at Least n Notes 🟡 | Forum 1 |
| `LeContainerTypeValue` | 0 | Folder Track | Forum 29, Upload (Factory-PLE) 3 |
| `LeContainerTypeValue` | 1 | Track | Forum 74, Upload (Factory-PLE) 21 |
| `LeContainerTypeValue` | 2 | Part | Upload (Factory-PLE) 18, Forum 5 |
| `LeContainerTypeValue` | 3 | Event | Upload (Factory-PLE) 11, Forum 4 |
| `LeFlagsValue` | 0 | Muted | Forum 7, Upload (Factory-PLE) 4 |
| `LeFlagsValue` | 1 | Selected | Forum 88, Upload (Factory-PLE) 7 |
| `LeFlagsValue` | 2 | Empty | Upload (Factory-PLE) 2, Forum 1 |
| `LeFlagsValue` | 3 | Inside NoteExp | r-koubou 1 |
| `LeFlagsValue` | 5 | Hidden | Forum 7 |
| `LeFlagsValue` | 6 | Has Track Version | Upload (Factory-PLE) 1 |
| `LeFlagsValue` | 7 | Follows Chord Track | Upload (Factory-PLE) 1 |
| `LeFlagsValue` | 8 | Is Disabled | Forum 2 |
| `LeGenericOpValue` | 0 | Enable / Open / Hide | Forum 24, Upload (Factory-PLE) 4 |
| `LeGenericOpValue` | 1 | Disable / Close / Show | Forum 39, Upload (Factory-PLE) 1 |
| `LeGenericOpValue` | 2 | Toggle | Forum 33, Upload (Factory-PLE) 13 |
| `LeMediaTypeValue` | 0 | Audio | Upload (Factory-PLE) 8, Forum 4 |
| `LeMediaTypeValue` | 1 | MIDI | Upload (Factory-PLE) 14, Forum 4 |
| `LeMediaTypeValue` | 2 | Automation | Forum 3, Upload (Factory-PLE) 3 |
| `LeMediaTypeValue` | 3 | Marker | Forum 3 |
| `LeMediaTypeValue` | 6 | Tempo 🟡 | Forum 2 |
| `LeMediaTypeValue` | 7 | Signature | Upload (Factory-PLE) 1 |
| `LeMediaTypeValue` | 8 | Chord | Upload (Factory-PLE) 1 |
| `LeMediaTypeValue` | 11 | Group 🟡 | Forum 1 |
| `LeMediaTypeValue` | 12 | Effect 🟡 | Forum 1 |
| `LeMediaTypeValue` | 13 | Device 🟡 | Forum 3 |
| `LeTypeValue` | 0 | Note | Forum 199, r-koubou 16 |
| `LeTypeValue` | 1 | Poly Pressure 🟡 | Forum 3 |
| `LeTypeValue` | 2 | Controller | Forum 138, r-koubou 6 |
| `LeTypeValue` | 3 | Program Change | r-koubou 1 |
| `LeTypeValue` | 4 | Aftertouch | Forum 1 |
| `LeTypeValue` | 5 | Pitchbend | Forum 2, r-koubou 1 |
| `LeTypeValue` | 6 | SysEx | r-koubou 1 |

## Klassen (Vorkommen)

| Klasse | Belege |
|---|---|
| `ActionTargetMainValue` | Forum 26 |
| `ActionTargetSubType` | Forum 26 |
| `ActionTargetVelocity` | Forum 1 |
| `LEMidiChannelValue` | Forum 24 |
| `LeAllroundValue` | Forum 1 |
| `LeContainerTypeValue` | Forum 112, Upload (Factory-PLE) 53 |
| `LeDomainTypeValue` | Forum 45, Upload (Factory-PLE) 2 |
| `LeFlagsValue` | Forum 105, Upload (Factory-PLE) 15, r-koubou 1 |
| `LeGenericOpValue` | Forum 96, Upload (Factory-PLE) 18 |
| `LeHistoryValue` | Forum 1 |
| `LeMagicNamesValue` | Forum 35 |
| `LeMediaTypeValue` | Upload (Factory-PLE) 27, Forum 21 |
| `LeTTimeDiffValue` | Forum 95, Upload (Factory-PLE) 4, r-koubou 2 |
| `LeTTimeValue` | Forum 60, Upload (Factory-PLE) 8 |
| `LeTypeValue` | Forum 382, r-koubou 27 |
| `LeUFloatValue` | Forum 75, r-koubou 7, Upload (Factory-PLE) 3 |
| `LeUIntValue` | Forum 1541, Upload (Factory-PLE) 159, r-koubou 65 |
| `MainValueTarget` | Forum 2 |
| `PControllerValue` | Forum 228, r-koubou 4 |
| `PMidiNoteValue` | Forum 14, r-koubou 4 |
| `PVelocityValue` | Forum 58 |
| `SubTypeTarget` | Forum 2 |
| `UFloatValue` | Forum 8, Upload (Factory-PLE) 3 |
| `UIntValue` | Forum 30, r-koubou 2 |
| `UStringValue` | Forum 200, Upload (Factory-PLE) 13 |
| `leActionTargetChannel` | Forum 9 |
| `leActionTargetColor` | Forum 9, Upload (Factory-PLE) 1 |
| `leActionTargetLength` | Forum 22, r-koubou 3, Upload (Factory-PLE) 1 |
| `leActionTargetNXPOp` | r-koubou 1 |
| `leActionTargetName` | Forum 81, Upload (Factory-PLE) 3 |
| `leActionTargetStart` | Forum 57, Upload (Factory-PLE) 11, r-koubou 3 |
| `leActionTargetTrackOp` | Forum 96, Upload (Factory-PLE) 18 |
| `leActionTargetTrim` | Upload (Factory-PLE) 1 |
| `leActionTargetTypes` | Forum 39, r-koubou 2 |
| `leActionTargetValue1` | Forum 56, r-koubou 4 |
| `leActionTargetValue2` | Forum 140, r-koubou 8 |
| `leChannelTarget` | Forum 3 |
| `leColorTypeTarget` | Upload (Factory-PLE) 1 |
| `leContainerTypeTarget` | Forum 112, Upload (Factory-PLE) 53 |
| `leContextTypeTarget` | Forum 12 |
| `leFlagsTarget` | Forum 105, Upload (Factory-PLE) 15, r-koubou 1 |
| `leHistoryTarget` | Forum 1 |
| `leLengthTarget` | Forum 25, Upload (Factory-PLE) 3, r-koubou 2 |
| `leMediaTypeTarget` | Upload (Factory-PLE) 27, Forum 21 |
| `leNameTypeTarget` | Forum 105, Upload (Factory-PLE) 7 |
| `lePositionTarget` | Forum 114, Upload (Factory-PLE) 12 |
| `leToken` | Forum 1254, Upload (Factory-PLE) 182, r-koubou 48 |
| `leTypesTarget` | Forum 343, r-koubou 25 |
| `leValue1Target` | Forum 151, r-koubou 7 |
| `leValue2Target` | Forum 19 |
