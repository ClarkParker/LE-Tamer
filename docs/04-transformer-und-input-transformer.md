# 04 – Echtzeit-Varianten: Transformer, Track Input Transformer, Project Input Transformer

Alle drei teilen die Filter/Action-Logik des Logical Editors, wirken aber **auf den MIDI-Datenstrom**
statt auf gespeicherte Events.

## Transformer (MIDI-Insert-Effekt)
* „Echtzeit-Version des Logical Editors“ (Plug-in-Referenz Cubase 15). Wird als **MIDI Insert** auf
  einer MIDI-/Instrumentenspur geladen.
* Verarbeitet die **Wiedergabe** der Spur „on the fly“; die Events auf der Spur bleiben unverändert.
* Funktionen: **Filter** (Events aus dem Strom entfernen), **Transform**, **Insert** (Kopien einfügen und
  transformieren), **Insert Exclusive** (nur gefundene, transformierte Events durchlassen).
* Enthält eigene Preset-Verwaltung (Plug-in-Presets).
* Verfügbar in Pro, Artist und Elements.

## Track Input Transformer
* Filtert/ändert MIDI-Daten, die **auf eine bestimmte MIDI-Spur** kommen, **bevor** sie aufgenommen werden.
* Öffnen: MIDI-Spur auswählen → Inspector → **Routing** → Pop-up **Input Transformer** → **Track** aktivieren →
  erneut öffnen → **Open Panel**.
* Fenster: **Module** (anzeigen/bearbeiten), **Preset**, Event Target Filters, Event Transform Actions, Functions.
  Bearbeiten nur nach Klick auf **Edit**.
* Typische Einsätze (laut Hilfe): Split-Keyboard (linke/rechte Hand getrennt aufnehmen), Fußpedal-Controller in
  Noten wandeln (Bassdrum), bestimmten Datentyp nur auf einem Kanal filtern, Aftertouch ↔ Controller umwandeln,
  Velocity oder Tonhöhe invertieren.
* **Achtung:** Nach Gebrauch im Inspector *Input Transformer → None* wählen, sonst bleibt er aktiv.

## Project Input Transformer
* Gleiches Prinzip, aber **global**: wirkt auf alle MIDI-Eingänge und alle Spuren, für die er aktiviert ist.
* Öffnen: `Project > Project Input Transformer` oder im Inspector (Routing → Input Transformer → **Project**
  → Open Panel).
* Bis zu **vier Module**, jedes mit eigenem Preset; Module einzeln aktivierbar.
* Funktionen: **Filter** und **Transform**. (Insert/Insert Exclusive gibt es nur im Transformer-Insert.)
* Presets: Factory-Presets im Programmordner `Presets/Input Transformer`; User-Presets unter
  `Dokumente\Steinberg\<Programm>\User Presets\Input Transformer` (Migration alter Presets in den
  Unterordner *Earlier Presets*).

## Filterziele der Input Transformer (reduzierte Liste)
Subtype · Main Value · Channel · Type · Secondary Value · Last Event · Assigned Voice (Score Editor) ·
Assigned Stave (Score Editor). **Nicht** vorhanden: Position, Length, Property, Context Variable.

## Bedingungen
Equal, Unequal, Bigger, Bigger or Equal, Less, Less or Equal, Inside Range, Outside Range, Note is Equal to
(nur Subtype/Pitch, oktavunabhängig), All Types.

## Aktionsziele
Subtype · Main Value · Channel · Type · Secondary Value · Score Editor Operation.

## Operationen
Add, Subtract, Multiply by, Divide by, Round by, Set Random Values Between, Set to Fixed Value,
Set Relative Random Values Between, Use Subtype (nur Ziel Main Value), Use Main Value (nur Ziel Subtype),
Mirror (Spiegelung um Param 1; bei Noten: Skala invertieren), Transpose to Scale (Param 1 = Grundton,
Param 2 = Skalentyp; nur mit Filterzeile *Type = Note*), Assign stave and voice, Unassign stave and voice.

## Klassische Rezepte
* **Split-Keyboard:** Modul 1: `Type = Note AND Subtype < C3` → Filter (auf Spur rechte Hand);
  Modul 2 spiegelverkehrt auf der anderen Spur.
* **Pedal → Bassdrum:** `Type = Controller AND Subtype = 64 AND Main Value > 64` → Transform:
  `Type → Set to fixed: Note`, `Subtype → Set to fixed: C1`, `Main Value → Set to fixed: 100`.
* **Velocity invertieren:** `Type = Note` → Transform: `Main Value → Mirror 64`.
* **Aftertouch → CC1:** `Type = Aftertouch` → Transform: `Type → Controller`, `Subtype → Set to fixed 1`,
  `Main Value → Use Subtype` (Aftertouch-Druck steht im Subtype).
