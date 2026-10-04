# 02 – Logical Editor (MIDI) – Referenz Cubase 15

Quelle: Cubase Pro 15.0.30 Operation Manual, Kapitel „Logical Editor“ (siehe `08-quellen.md`), ergänzt um
Praxiswissen aus Sound-on-Sound/MusicTech-Artikeln und Steinberg-Forum.

## Fenster
`MIDI > Logical Editor > Setup` öffnet das Fenster (MIDI-Part muss ausgewählt sein). Elemente:
**Preset** · **Event Target Filters** · **Event Transform Actions** · **Functions** · **Apply**.
`MIDI > Logical Editor > Apply Preset` wendet ein Preset direkt aus dem Projektfenster an, ohne das Fenster zu öffnen.

## Filterzeile – Spalten
| Spalte | Bedeutung |
|---|---|
| **(** | Linke Klammer (bis zu 3 Ebenen) |
| **Filter Target** | Welche Eigenschaft wird geprüft; bestimmt die Optionen der anderen Spalten |
| **Condition** | Vergleich zwischen Eigenschaft und Parameter(n) |
| **Parameter 1** | Vergleichswert |
| **Parameter 2** | Nur bei Range-Bedingungen (Inside/Outside Range) bzw. bei Context-Variablen mit zweitem Wert |
| **Bar Range / Time Base** | Nur bei Filter Target *Position*: bei *Inside/Outside Bar Range* ein grafischer Bereich innerhalb eines Taktes (in Ticks ab Taktanfang); sonst die Zeitbasis (PPQ, Sekunden, Samples, Frames) |
| **)** | Rechte Klammer |
| **Bool** | And / Or zur nächsten Zeile |

## Filter Targets (Filterziele)
| Ziel (Cubase 15) | Alt-Name | Beschreibung |
|---|---|---|
| **Position** | – | Startposition des Events. Equal = exakte Position (Param 1); Inside/Outside Range = Bereich Param 1–2; Inside/Outside Bar Range = Zone innerhalb jedes Taktes (grafisch oder Param 1/2 in Ticks). |
| **Length** | – | Notenlänge (Param 1, bzw. Range Param 1–2); Zeitbasis in der Spalte Bar Range/Time Base. Nur für Noten sinnvoll → Cubase fügt automatisch *Type = Note* hinzu. |
| **Subtype** | Value 1 | Bedeutung hängt vom Event-Typ ab (Note: Tonhöhe; Controller: CC-Nummer …), siehe Tabelle unten. |
| **Main Value** | Value 2 | Bedeutung hängt vom Event-Typ ab (Note: Velocity; Controller: Wert …). |
| **Channel** | – | MIDI-Kanal 1–16 (Equal, Range …). Nützlich bei Type-0-MIDI-Files oder Multi-Channel-Aufnahmen. |
| **Type** | – | Event-Typ (Param 1): Note, Poly Pressure, Controller, Program Change, Aftertouch, Pitchbend, VST 3 Event, SysEx, SMF Event, … |
| **Property** | – | Cubase-Eigenschaften: Muted, Selected, Empty, Inside NoteExp, Is valid VST 3 … mit Bedingungen *Property is Set / is Not Set*. |
| **Secondary Value** | Value 3 | Note-Off-Velocity von Noten. |
| **Last Event** | – | Bezieht sich auf Events, die den LE/Input Transformer bereits passiert haben; Param 1 = Eigenschaft (z. B. *Event Counter*), Param 2 = Wert. Mit *Every other Event* lässt sich jedes x-te Event treffen. |
| **Context Variable** | – | Akkord-/Kontext-Analyse (höchste/tiefste/mittlere Tonhöhe, Velocity, CC; Anzahl Noten/Stimmen im Akkord, Position im Akkord, Stimme …) – siehe unten. |
| **Assigned Voice (Score Editor)** | – | Manuell zugewiesene Stimme im Noteneditor (neu seit dem Dorico-basierten Score Editor). |
| **Assigned Stave (Score Editor)** | – | Manuell zugewiesenes Notensystem. |

### Bedeutung von Subtype / Main Value / Secondary Value je Event-Typ
| Event-Typ | Subtype (Value 1) | Main Value (Value 2) | Secondary (Value 3) |
|---|---|---|---|
| Note | Tonhöhe (0–127, Eingabe auch als `C3`, `D#4`) | Velocity | Note-Off-Velocity |
| Poly Pressure | gedrückte Taste | Druckwert | – |
| Controller | CC-Nummer | CC-Wert | – |
| Program Change | Programmnummer | – | – |
| Aftertouch | Druckwert | – | – |
| Pitchbend | Feinanteil (nicht immer genutzt) | Grobanteil | – |
| VST 3 Event | – | Parameterwert, auf 0–127 skaliert (für Feinauflösung: Action Target *VST 3 Value Operation*) | – |
| SysEx | nicht genutzt | nicht genutzt | – |

**Falle:** `Main Value = 64` ohne Typ-Filter trifft Noten mit Velocity 64 *und* Controller mit Wert 64.
Fast immer gehört eine Zeile `Type Equal Note` (oder Controller) dazu. Sobald `Type = Note` gesetzt ist,
zeigt Cubase die Spalten als *Pitch* und *Velocity* an.

### Context Variable – Werte für Parameter 1
Ohne Parameter 2: **Highest / Lowest / Average Pitch**, **Highest / Lowest / Average Velocity**,
**Highest / Lowest / Average CC Value** (bezogen auf den Part bzw. die Auswahl).
Mit Parameter 2: **No. of Notes in Chord (Part)**, **No. of Voices (Part)**, **Position in Chord (Part)**,
**Note Number in Chord (lowest = 0)**, **Position in Chord (Chord Track)**, **Voice**,
**Highest in Chord from at Least n Notes**, **Lowest in Chord from at Least n Notes**.
Eine Note gehört zu einem Akkord, wenn mindestens zwei weitere Noten gleichzeitig klingen.
Die Factory-Kategorie *Musical Context* zeigt die Möglichkeiten (z. B. „Extract Alto“ = Voice = 1, Funktion
Extract to Track).

## Conditions (Bedingungen)
| Bedingung | Gilt für | Bedeutung |
|---|---|---|
| Equal / Unequal | alle | gleich / ungleich Param 1 |
| Bigger / Bigger or Equal / Less / Less or Equal | numerisch | größer (gleich) / kleiner (gleich) Param 1 |
| Inside Range / Outside Range | numerisch, Position, Length | zwischen Param 1 (klein) und Param 2 (groß) bzw. außerhalb |
| Inside Bar Range / Outside Bar Range | Position | innerhalb/außerhalb der Zone in **jedem** Takt der Auswahl (Spalte Bar Range) |
| Before Cursor / Beyond Cursor | Position | vor / nach dem Positionszeiger |
| Inside Cycle / Outside Cycle | Position | innerhalb / außerhalb der Locator-Bereichs |
| Inside Track Loop | Position | innerhalb des unabhängigen Spur-Loops |
| Exactly Matching Cycle | Position | exakt gleich dem Cycle-Bereich |
| Inside Selected Marker | Position | innerhalb des ausgewählten Cycle-Markers |
| Note is Equal to | Subtype (Pitch) | gleiche Note in **allen Oktaven** (z. B. alle C) |
| All Types | Type | alle Event-Typen |
| Property is Set / Property is Not Set | Property | Eigenschaft gesetzt / nicht gesetzt |
| Every other Event | Last Event (Param 1 = Event Counter) | jedes x-te Event, x = Param 2 |

## Functions (Funktionen)
| Funktion | Wirkung |
|---|---|
| **Delete** | Löscht alle gefundenen Events. |
| **Transform** | Ändert gefundene Events gemäß Aktionsliste. |
| **Insert** | Kopiert gefundene Events, transformiert die Kopien und fügt sie **zusätzlich** in den Part ein (Original bleibt). |
| **Insert Exclusive** | Transformiert gefundene Events; **alle nicht gefundenen werden gelöscht**. |
| **Copy** | Kopiert gefundene Events, transformiert sie und legt sie in einen **neuen Part auf einer neuen MIDI-Spur**. Original unverändert. |
| **Extract to Track** | Transformiert gefundene Events und **verschiebt** sie in einen neuen Part auf einer neuen Spur. |
| **Select** | Wählt gefundene Events aus (zur Weiterarbeit im Key-Editor etc.). |
| **Extract to Lanes** | Wie Extract to Track, aber in neue Lane statt neue Spur. |
| **Deselect** | Hebt die Auswahl auf. |

## Action Targets (Aktionsziele) – nur bei Transform & Co.
| Ziel (Cubase 15) | Alt-Name | Beschreibung |
|---|---|---|
| **Position** | – | verschiebt Events |
| **Length** | – | ändert Notenlängen |
| **Subtype** | Value 1 | je Typ (Note: Tonhöhe) |
| **Main Value** | Value 2 | je Typ (Note: Velocity) |
| **Channel** | – | MIDI-Kanal |
| **Type** | – | Event-Typ ändern (z. B. Aftertouch → Modulation, Pitchbend → VST 3 Tuning) |
| **Secondary Value** | Value 3 | Note-Off-Velocity |
| **NoteExp Operation** | – | Note-Expression-Operation (Remove NoteExp, Create One Shot, Reverse …) |
| **VST 3 Value Operation** | – | Operationen im VST-3-Wertebereich 0.0–1.0 statt 0–127 |
| **Score Editor Operation** | – | Assign/Unassign stave and voice |

## Operations (Operationen)
| Operation | Verfügbar für | Bedeutung |
|---|---|---|
| Add / Subtract | numerisch, Position, Length | Param 1 addieren / subtrahieren |
| Multiply by / Divide by | numerisch, Position, Length | mit Param 1 multiplizieren / dividieren (Fließkomma, z. B. 1.1 = +10 %) |
| Round by | numerisch | auf Vielfache von Param 1 runden |
| Set Random Values Between | numerisch | Zufallswert zwischen Param 1 und Param 2 (auch negativ) |
| Set to Fixed Value | alle | fester Wert Param 1 |
| Set Relative Random Values Between | numerisch | Zufallswert aus Param 1..2 **addieren** |
| Use Subtype | Ziel Main Value | Subtype in Main Value kopieren |
| Use Main Value | Ziel Subtype | Main Value in Subtype kopieren |
| Mirror | Subtype, Main Value | Spiegelung um Param 1 (Noten: Skala invertieren um Zentralton) |
| Invert | NoteExp / VST 3 | Note-Expression-Daten invertieren |
| Add Length | Position (nur Noten) | Notenlänge zur Position addieren (→ Note-Off-Position) |
| Linear Change in Loop Range | numerisch | lineare Rampe Param 1 → Param 2 zwischen den Locatoren, **ersetzt** Werte |
| Relative Change in Loop Range | numerisch | Rampe Param 1 → Param 2 wird **addiert** (z. B. 0 → −100 = Velocity-Fade-out mit erhaltenen Relationen) |
| Remove NoteExp / Create One Shot / Reverse | NoteExp Operation | Note-Expression-Daten entfernen / One-Shot-Parameter anlegen / umkehren |
| Move to Cursor | Position | Event-Start auf Positionszeiger |
| Transpose to Scale | Subtype (mit Type = Note) | Param 1 = Grundton, Param 2 = Skala; jede Note auf nächste Skalennote |
| Assign / Unassign stave and voice | Score Editor Operation | Notensystem/Stimme zuweisen bzw. entfernen |

## Klammern & Boolesche Logik
* Nur relevant ab 3 Zeilen mit **Or**. Beispiel aus der Hilfe: `( Type = Note AND Pitch = C3 ) OR Channel = 1`
  vs. `Type = Note AND ( Pitch = C3 OR Channel = 1 )`.
* Im Dateiformat wird der gesamte Ausdruck als Token-Liste gespeichert: `(`, Zeile, `AND`, Zeile, `)` –
  Cubase selbst klammert beim Speichern den Gesamtausdruck häufig in ein äußeres Klammerpaar.

## Praxis-Rezepte (aus Fachartikeln)
* **Kick (C1) extrahieren:** `Type = Note AND Pitch = C1` → *Extract to Track*.
* **Sub-Bass unter Akkorde:** `Type = Note AND Context Variable: Lowest in Chord from at least 3 Notes` →
  *Insert* mit `Subtype Subtract 12`, `Main Value Subtract 20`.
* **Downbeat betonen (4/4):** `Type = Note AND Position Inside Bar Range 0–100 Ticks (OR 1815–1920)` →
  Transform `Main Value Multiply 1.1` (Cubase rechnet intern mit 480 PPQ: 1 Takt 4/4 = 1920 Ticks).
* **Jede 7. Note löschen:** `Last Event: Event Counter, Every other Event, Param 2 = 7` → Delete.
* **Velocity komprimieren:** `Type = Note` → `Main Value Divide by 1.15` **und** `Main Value Add 8`
  (zwei Aktionszeilen).
* **CC1 → CC11 kopieren:** `Type = Controller AND Subtype = 1` → *Insert* mit `Subtype Set to fixed 11`.
* **Alle CC vor dem Cursor löschen:** `Type = Controller AND Subtype Inside Range 0–127 AND Position Before Cursor` → Delete.
