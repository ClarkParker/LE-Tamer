# 06 – Preset-Dateiformat (Logical Editor / Project Logical Editor)

**Status:** Reverse-engineered aus 331 echten Preset-Dateien (210 LE-Presets „Metagrid“ aus Cubase 9,
117 PLE-Presets „Metagrid“, 4 Steinberg-Factory-LE-Presets aus Cubase 13, 5 Legacy-Presets aus Cubase-SX-Zeiten).
Der Parser `tools/leparse.py` liest **alle 331 Dateien fehlerfrei** und mit stimmigen Objektgrößen.
Konfidenz-Markierung in den Tabellen: ✅ verifiziert (mehrfach beobachtet, Bedeutung aus Preset-Namen eindeutig),
🟡 abgeleitet (Menü-Reihenfolge / Einzelbeleg), ❓ unbekannt.

> Es gibt **keine Steinberg-Dokumentation** zu diesem Format. Steinberg warnt davor, Preset-Dateien manuell zu ändern.
> Ein Forum-Nutzer hat 2022 dennoch erfolgreich per Suchen/Ersetzen im Hex-Text PLE-Presets massenhaft von
> „Name Equal“ auf „Name Contains“ umgestellt – das Format ist also robust gegenüber korrekt gebauten Dateien.

## 1. XML-Hülle

```xml
<?xml version="1.0" encoding="utf-8"?>
<Logical_EditPreset>                      <!-- PLE: <Project_Logical_EditorPreset> -->
   <int name="Can Modify" value="1"/>
   <bin name="Preset">
		0040000001000000000000000A0000000100000000000A000000010005000000
		FEFFFFFF09000000436D4F626A656374000000FFFFFFFF080000006C65546F6B
		...
   </bin>
</Logical_EditPreset>
```

* Wurzelelement: `Logical_EditPreset` (LE) bzw. `Project_Logical_EditorPreset` (PLE). Input-Transformer-Presets:
  ❓ (vermutlich analog, nicht in der Stichprobe).
* `Can Modify` = 1 bei allen beobachteten Dateien (auch bei Factory-Presets aus dem User-Ordner).
* `<bin>` enthält den Binärstrom als **Großbuchstaben-Hex**, umbrochen in Zeilen à 64 Hex-Zeichen (32 Bytes),
  eingerückt mit zwei Tabs. Whitespace ist für Cubase vermutlich irrelevant (Metagrid-PLE-Dateien sind einzeilig
  ohne Zeilenumbrüche und funktionieren).
* Dateiname = Preset-Name; Ordner = Kategorie.

## 2. Binärstrom – Gesamtaufbau

Alle Zahlen **Little-Endian**. Der Strom ist ein serialisierter Objektgraph im Stil von MFC `CArchive`
(Klassennamen inline, spätere Referenzen per Tag).

```
u32   0x00004000        Format-Marker ✅ (Legacy-Dateien aus Cubase SX: 0x0 oder 0x1)
u32   1                 konstant ✅
u32   commentLen        Länge des Kommentar-Blocks (0 = kein Kommentar)
u8[]  comment           UTF-8, NUL-terminiert; Cubase 9 hängt nach dem NUL noch EF BB BF (BOM) an ✅
                        (Legacy: nur "Text\0"). Kommentar ist der Text aus dem alten "Store"-Dialog.
--- Aktionsliste ---
u32   0x0A              Listen-Marker ✅
u16   1                 Listen-Version ✅
u32   nActions          Anzahl Aktionszeilen
      Object × nActions
--- Filter-Token-Liste ---
u32   0x0A
u16   1
u32   nTokens           Anzahl Tokens (Klammern, Bedingungszeilen, And/Or)
      Object × nTokens
--- Trailer (7 × i32) ---
i32   0
i32   function          Funktion (Tabelle 5) ✅
i32   flagPLE           LE: 0 · PLE: 1 (Bedeutung ❓, ein Forum-Fund änderte es auf 0xFF)
i32   0, 0, 0, 0
```
Legacy-Dateien (Cubase SX) haben nur `i32 0` als Trailer (Funktion implizit Transform).

## 3. Objekt-Kodierung

```
[ FE FF FF FF  u32 len  char[len] "Name\0"  u16 version ]*   Basisklassen-Deklarationen (nur beim ersten Auftreten,
                                                             Reihenfolge: direkte Basisklasse zuerst, Wurzel zuletzt)
  FF FF FF FF  u32 len  char[len] "Name\0"  u16 version      Neue Klasse (erstes Auftreten) – registriert die Klasse
                                                             unter dem BYTE-OFFSET dieses FF-Markers
  oder
  u32 (0x80000000 | offset)                                  Referenz auf bereits registrierte Klasse; offset =
                                                             Byte-Offset des FE- ODER FF-Markers, an dem der Name
                                                             zuerst geschrieben wurde ✅ (in allen 331 Dateien geprüft)
u32   size                                                   Länge der folgenden Nutzdaten in Bytes ✅
u8[size] data                                                klassenspezifisch, kann verschachtelte Objekte enthalten
```

* `len` zählt das NUL-Byte mit. `version` ist bei allen LE-Klassen 0; eingebettete Tempo-Objekte haben 1/2.
* Die Referenz-Kodierung erklärt, warum Suchen/Ersetzen im Hex nur funktioniert, solange sich **keine Längen ändern**:
  jede Verschiebung macht alle folgenden Offsets ungültig. Ein Writer muss Offsets beim Serialisieren berechnen.
* Beobachtete Basisklassen-Ketten (direkte Basis zuerst):

| Klasse | Basisklassen-Deklarationen vor dem ersten FF |
|---|---|
| `leToken` | `CmObject` |
| `le*Target` (Bedingungszeilen) | `leConditionTarget`, `leToken`, `CmObject` (nur noch nicht deklarierte) |
| `leActionTarget*` | `leActionBase`, `CmObject` |
| `LeTypeValue`, `LeUIntValue`, `LeGenericOpValue` | `UIntValue`, `UValue` |
| `LeFlagsValue` | `LeUIntValue`, `UIntValue`, `UValue`, (`FShared`) |
| `LeUFloatValue` | `UFloatValue`, `UValue`, `FShared` |
| `LeDomainTypeValue` | `UIntValue` |
| `LeTTimeDiffValue` | `TDiffTimeValue`, `TTimeValueBase`, `UValue` |
| `LeTTimeValue` | `TTimeValue`, `TTimeValueBase` |
| `PControllerValue`, `LeContainerTypeValue`, `UStringValue` | keine (Basen bereits deklariert) |

## 4. Klassen und ihre Nutzdaten

### 4.1 Token (`leToken`, size 4)
| Wert | Bedeutung |
|---|---|
| 101 | `(` ✅ |
| 102 | `)` ✅ |
| 103 | **And** ✅ |
| 104 | **Or** ✅ |

Die Filterliste ist eine flache Token-Folge: `( Zeile AND Zeile OR Zeile )`. Cubase klammert den Gesamtausdruck
meist in ein äußeres Paar; Dateien ohne äußere Klammer existieren ebenfalls (3 Tokens: `Zeile AND Zeile`).
Innere Klammern erscheinen als zusätzliche 101/102-Tokens.

### 4.2 Bedingungszeile (`le…Target`)
```
u32 100            konstant ✅ (Bedeutung ❓)
u32 condition      Bedingungscode (Tabelle 6)
u32 unused         0; in Legacy-Dateien 0xCDCDCDCD (uninitialisierter Speicher) → wird ignoriert
Object P1          Parameter 1 (Wertobjekt)
Object P2          Parameter 2 (Wertobjekt; auch wenn ungenutzt vorhanden, dann value 0 und max 255/0x7FFFFFFF)
[u32 0]            nur bei leTypesTarget: ein zusätzliches Null-Wort ✅
```
Das **Filterziel steckt im Klassennamen**:

| Klasse | Filter Target | P1-Klasse | P2-Klasse |
|---|---|---|---|
| `leTypesTarget` | Type ✅ | `LeTypeValue` (0..8) | `LeUIntValue` (ungenutzt) |
| `leValue1Target` | Subtype / Value 1 ✅ | `LeUIntValue` (0..127) oder `PControllerValue` (0..127, wenn Typ Controller) | gleich |
| `leValue2Target` | Main Value / Value 2 ✅ | `LeUIntValue` (0..127) | `LeUIntValue` |
| `lePositionTarget` | Position ✅ | `LeUIntValue` (Ticks, max = Taktlänge, z. B. 1920) bei Bar Range; `LeTTimeValue` bei Cursor/Cycle | gleich |
| `leFlagsTarget` | Property ✅ | `LeFlagsValue` (0..6/7) | `LeUIntValue` (ungenutzt) |
| `leContextTypeTarget` | Context Variable ✅ | Sonderfall: `u32 p1Index, u32 p2` als Rohwerte **oder** `u32 p1Index` + `LeUIntValue(-100..100)` (zwei Varianten beobachtet) | – |
| `leContainerTypeTarget` | Container Type (PLE) ✅ | `LeContainerTypeValue` (u32) | `LeUIntValue` |
| `leNameTypeTarget` | Name (PLE) ✅ | `UStringValue` | `LeUIntValue` |
| ❓ | Length, Channel, Secondary Value, Last Event, Media Type, Color Name, Output Name, Assigned Voice/Stave | nicht in Stichprobe – vermutlich `leLengthTarget`, `leChannelTarget`, `leValue3Target`, `leLastEventTarget`, `leMediaTypeTarget`, `leColorNameTarget`, `leOutputNameTarget` | |

### 4.3 Aktionszeile (`leActionTarget…`)
```
u16 0              ✅ konstant
u32 operation      Operationscode (Tabelle 7)
u32 actionTarget   Zielcode (Tabelle 8) – redundant zum Klassennamen
Object P1
Object P2
```
| Klasse | Action Target | Code |
|---|---|---|
| `leActionTargetStart` | Position ✅ | 4000 |
| `leActionTargetLength` | Length ✅ | 4001 |
| `leActionTargetValue1` | Subtype / Value 1 ✅ | 4002 |
| `leActionTargetValue2` | Main Value / Value 2 ✅ | 4003 |
| ❓ | Channel, Type, Secondary Value, NoteExp Op, VST3 Value Op, Score Op | 4004…? 🟡 |
| `leActionTargetTrackOp` | Track Operation (PLE) ✅ | 4012 |
| ❓ | Name, Trim, Set Color (PLE) | ❓ |

P1/P2-Klassen bei Aktionen: `LeUIntValue(0..127)` für ganzzahlige Operationen; `LeUFloatValue(0..127, float)` für
Multiply/Divide; `PControllerValue` wenn Ziel Subtype bei Controllern; bei Position: `LeTTimeDiffValue` als P1 und
`LeDomainTypeValue` als P2 (Zeitbasis). Ältere Dateien nutzen auch nackte `UIntValue`/`UFloatValue` (4 Byte).

### 4.4 Wertobjekte
| Klasse | size | Layout |
|---|---|---|
| `LeUIntValue`, `PControllerValue`, `LeFlagsValue`, `LeTypeValue` | 12 | `i32 min, i32 max, i32 value` ✅ |
| `LeUFloatValue` | 12 | `i32 min, i32 max, f32 value` ✅ (z. B. 1.1 = 0x3F8CCCCD) |
| `UIntValue`, `UFloatValue`, `LeContainerTypeValue`, `LeDomainTypeValue`, `LeGenericOpValue` | 4 | `i32/f32 value` ✅ |
| `UStringValue` | var | `u32 len, u8[len]` UTF-8 inkl. NUL (+ ggf. BOM-Quirk wie beim Kommentar) ✅ |
| `LeTTimeDiffValue` | 44 | `u32 0, u32 0, u32 kind, f64 a, f64 b, u32 kind, f64 a, u32 0` – Sekunden: kind 1, a=1.0, b=Sekunden; Frames: kind 2, a=1/24 (Framelänge s), b=Anzahl Frames 🟡 |
| `LeTTimeDiffValue` (Bars) | ~498 | enthält zusätzlich eingebettete `MTempoTrackEvent`/`MSignatureTrackEvent`/`MTrackVariationCollection` (Tempo-/Taktart-Kontext zur Umrechnung) 🟡 |
| `LeTTimeValue` | 60…2380 | absolute Position (Cursor/Cycle-Bedingungen); enthält Doubles und bei P1 den kompletten Tempo-Track des Projekts zum Speicherzeitpunkt 🟡 |

**Min/Max** sind UI-Bereichsgrenzen (z. B. 0..127 für Velocity, 0..8 für Typ, 0..1920 für Bar Range),
nicht Teil der Bedingung. Ungenutzte P2-Objekte tragen max 255 oder 0x7FFFFFFF und value 0.

## 5. Funktionen (Trailer-Wort 2)
| Code | Funktion | Konfidenz |
|---|---|---|
| 0 | Delete | ✅ |
| 1 | Transform | ✅ |
| 2 | Insert | ✅ |
| 3 | Insert Exclusive | 🟡 |
| 4 | Copy | ✅ |
| 5 | Extract to Track | ✅ |
| 6 | Select | ✅ (auch PLE) |
| 7 | Extract to Lanes | 🟡 |
| 8 | Deselect | 🟡 |
PLE verwendet dieselben Codes (Delete 0, Transform 1, Select 6 ✅, Deselect 8 🟡).

## 6. Bedingungen (condition)
| Code | Bedingung | Konfidenz |
|---|---|---|
| 200 | Equal | ✅ |
| 201 | Unequal | ✅ |
| 202 | Bigger | 🟡 |
| 203 | Bigger or Equal | 🟡 |
| 204 | Less | 🟡 |
| 205 | Less or Equal | 🟡 |
| 206 | Inside Bar Range | ✅ |
| 207 | Inside Range | ✅ |
| 208 | Outside Bar Range | 🟡 |
| 209 | Outside Range | ✅ |
| 210 | Contains (PLE, Name) | ✅ (Forum) |
| 211 | Property is Set | ✅ |
| 212 | Property is Not Set | ✅ |
| 213 | Contains Not | 🟡 |
| 214, 215 | ❓ (All Types? Note is Equal to?) | ❓ |
| 216 | Before Cursor | ✅ |
| 217 | Beyond Cursor | ✅ |
| 218 | Inside Cycle | ✅ |
| 219 | Outside Cycle | 🟡 |
| 220 | Inside Track Loop | 🟡 |
| 221 | Exactly Matching Cycle | 🟡 |
| 222 | Inside Selected Marker | 🟡 |
| ❓ | Every other Event | ❓ |

## 7. Operationen (operation)
| Code | Operation | Konfidenz |
|---|---|---|
| 221 | „keine/ungültig“ – in inaktiven Aktionslisten (Funktion Select/Copy) beobachtet | 🟡 |
| 304 | Add | ✅ |
| 305 | ❓ | ❓ |
| 306 | Subtract | ✅ |
| 307 | Multiply by | ✅ |
| 308 | Divide by | ✅ |
| 309 | Round by | 🟡 |
| 310 | Set Random Values Between | ✅ |
| 311 | ❓ | ❓ |
| 312 | Set to Fixed Value | ✅ |
| 313 | Set Relative Random Values Between | 🟡 |
| 314 … | Use Subtype, Use Main Value, Mirror, Invert, Add Length, Linear/Relative Change in Loop Range, Transpose to Scale … | ❓ |
| 331 | Track Operation **Folder** (PLE) | ✅ (P1 `LeGenericOpValue` 0 = Open/Enable, vermutlich 1 = Close/Disable, 2 = Toggle 🟡) |
| 343 | Track Operation **Hide Track** (PLE) | 🟡 (aus „Sichtbarkeits-Szenen“ abgeleitet; alternativ Lanes Active) |
| 332–342 | Record, Monitor, Solo, Mute, Read, Write, EQ Bypass, Inserts Bypass, Sends Bypass, Send Slot, Insert Slot | 🟡 (Reihenfolge wie Menü) |

## 8. Aufzählungswerte in Wertobjekten
**LeTypeValue** (Event-Typ; max 8 in Cubase 9, 6 in SX): 0 Note ✅ · 1 Poly Pressure 🟡 · 2 Controller ✅ ·
3 Program Change 🟡 · 4 Aftertouch ✅ · 5 Pitchbend ✅ · 6 VST 3 Event 🟡 · 7 SysEx 🟡 · 8 SMF Event 🟡
(Cubase 15 kennt weitere Typen → max vermutlich > 8).

**LeFlagsValue** (Property): 0 Muted ✅ · 1 Selected ✅ · 2 Empty 🟡 · 3 Inside NoteExp 🟡 · 4 Is valid VST 3 🟡 ·
5 Hidden (PLE) ✅ · 6 Has Track Version 🟡 · 7 Follows Chord Track 🟡 · 8 Is Disabled 🟡 · 9 Parent Object Is Selected 🟡.

**Context Variable (P1-Index)**: 0 Highest Pitch ✅ · 1 Lowest Pitch 🟡 · 2 Average Pitch 🟡 · 3 Highest Velocity ✅ ·
4 Lowest Velocity 🟡 · 5 Average Velocity 🟡 · 6/7/8 Highest/Lowest/Average CC 🟡 · 9 No. of Notes in Chord 🟡 ·
10 No. of Voices 🟡 · 11 Position in Chord (Part) 🟡 · 12 Note Number in Chord 🟡 · 13 Position in Chord (Chord Track) ✅ ·
14 Voice ✅ · 15 Highest in Chord from at least n 🟡 · 16 Lowest in Chord from at least n 🟡.

**LeContainerTypeValue** (PLE): 0 Folder Track ✅ · 1 Track 🟡 · 2 Part 🟡 · 3 Event 🟡.

**LeDomainTypeValue** (Zeitbasis bei Position-Aktionen): 0 Bars/Beats (PPQ) ✅ · 1 Seconds ✅ · 2 Samples 🟡 · 3 Frames ✅.

**Positionen** in Ticks: 480 PPQ intern (1 Viertel = 480, 1 Takt 4/4 = 1920). Bar-Range-Objekte tragen als max die
Taktlänge (1920; in manchen Dateien 3840/5760 – vermutlich Taktart des Projekts beim Speichern).

## 9. Vollständig annotiertes Beispiel – Factory-Preset „Extract Alto“ (Cubase 13)
```
00400000 01000000 00000000                       Marker, 1, kein Kommentar
0A000000 0100 00000000                           Aktionsliste: 0 Einträge
0A000000 0100 05000000                           Filterliste: 5 Tokens
@32  FEFFFFFF 09000000 "CmObject\0" 0000          Basis-Deklaration
@51  FFFFFFFF 08000000 "leToken\0" 0000           Klasse leToken  (Offset 0x33)
     04000000 65000000                            size 4, Token 101 = "("
@77  FEFFFFFF 12000000 "leConditionTarget\0" 0000
@105 FFFFFFFF 0E000000 "leTypesTarget\0" 0000     Klasse leTypesTarget
     81000000                                     size 129
       64000000 C8000000 00000000                 100, Equal, 0
@145   FEFFFFFF 0A000000 "UIntValue\0" 0000
@165   FEFFFFFF 07000000 "UValue\0" 0000
@182   FFFFFFFF 0C000000 "LeTypeValue\0" 0000     P1-Klasse
       0C000000 00000000 08000000 00000000        min 0, max 8, value 0 = Note
@220   FFFFFFFF 0C000000 "LeUIntValue\0" 0000     P2-Klasse (Offset 0xDC)
       0C000000 00000000 FFFFFF7F 00000000        min 0, max MAXINT, value 0 (ungenutzt)
       00000000                                   Null-Wort von leTypesTarget
     33000080 04000000 67000000                   ref leToken@0x33, size 4, 103 = AND
     FFFFFFFF 14000000 "leContextTypeTarget\0" 0000
     14000000                                     size 20
       64000000 C8000000 00000000 0E000000 01000000   100, Equal, 0, P1 = 14 (Voice), P2 = 1
     33000080 04000000 66000000                   ref leToken, 102 = ")"
     00000000 05000000 00000000 00000000 00000000 00000000 00000000   Trailer: Funktion 5 = Extract to Track
```
→ Lesart: `( Type = Note AND Context Variable: Voice = 1 )`, Funktion *Extract to Track* – „Alt-Stimme extrahieren“.

## 10. Legacy-Varianten (Cubase SX/SL, in alten Factory-Presets)
* Marker 0 oder 1 statt 0x4000, Trailer nur `00000000`.
* `LeTypeValue` max 6, `LeFlagsValue` max 2.
* leTypesTarget mit zusätzlichem Anhang `u32 4, "144\0"` (Rest einer alten Namenskodierung).
* Drittes Wort der Bedingungszeile 0xCDCDCDCD.
Cubase 9–15 lädt diese Dateien weiterhin; ein Writer sollte **nur das aktuelle Format** (0x4000) erzeugen.

## 11. Offene Fragen / nächste Schritte zur Verifikation
1. Codes für Channel/Type/Secondary-Value-Ziele, Length-Bedingung, Last Event, Media Type, Color Name, Output Name,
   Name-/Color-/Trim-Aktionen → fehlen in der Stichprobe. **Vorgehen:** in Cubase 15 je ein Mini-Preset speichern und
   mit `tools/leparse.py --tree` auslesen (eine Datei pro Unbekannter genügt).
2. Operation-Codes 305, 309, 311, 313 ff. und Mirror/Transpose-Parameter (Grundton/Skala).
3. PLE-Trailer-Wort 3 (1 vs. 0xFF) – Bedeutung klären (evtl. Zähler/Flags für Pre-/Post-Commands).
4. Speicherung der **Pre-/Post-Process Commands** im PLE-Preset (nicht in Stichprobe).
5. `LeTTimeValue`/`LeTTimeDiffValue` vollständig dekodieren bzw. minimal gültige Variante ohne eingebetteten
   Tempo-Track finden (wichtig für Cursor-/Cycle-Bedingungen und Bars-Offsets im Builder).
6. Verifikation, dass Cubase Dateien **ohne** äußeres Klammerpaar und mit frei gewählten (aber korrekten) Offsets lädt
   (Round-Trip-Test: Datei im Builder erzeugen → in Cubase laden → speichern → byteweise vergleichen).
7. Input-Transformer-Preset-Format (Wurzelelement, Modul-Struktur).
