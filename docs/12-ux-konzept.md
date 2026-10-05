# 12 – UX-Konzept „LE-Tamer Studio“: Presets bauen ohne Logical-Editor-Denken

## Ausgangslage
Cubases Logical Editor ist eine Tabelle aus Fachbegriffen (Filter Target, Condition, Parameter 1/2, Bool, Klammern). Musiker denken
aber in Absichten: *„Mach die Hi-Hats auf der Zwei leiser“*, *„Lösche alle Modulationsdaten vor dem Cursor“*, *„Hol die Alt-Stimme auf
eine eigene Spur“*. Der bisherige Builder (`le-tamer.html`) und der QueryBuilder-PoC bilden die Cubase-Tabelle nach – das ist für
Entwickler nützlich, löst aber das Problem der Zielgruppe nicht. LE-Tamer Studio bricht mit der Tabelle und übersetzt die
Absicht erst am Ende in Cubase-Logik.

## Leitprinzipien
1. **Absicht vor Mechanik.** Der Einstieg fragt *Was willst du erreichen?*, nicht *Welches Filter Target?*
2. **Zeigen statt Benennen.** Tonhöhe auf einer Klaviatur wählen, Velocity als Bereich auf einem Balken ziehen, Taktposition im
   Raster antippen – statt Zahlen in Felder zu tippen.
3. **Sofortige Rückmeldung.** Jede Änderung wird live auf einem Beispiel-Clip (Mini-Piano-Roll) simuliert: betroffene Noten leuchten,
   das Ergebnis der Aktion wird eingeblendet. Dazu die Klartext-Erklärung in einem Satz.
4. **Keine Sackgassen.** Alles, was Cubase kann, bleibt erreichbar – über einen „Experten“-Modus mit allen Zielen und Operationen,
   im gleichen Design. Der Assistent deckt die 90 % häufigen Fälle ab.
5. **Ein Klick zum Ziel.** Export legt die Datei ab; der Dialog zeigt den Zielordner und den nächsten Schritt in Cubase.

## Der Ablauf (Assistent, 4 Schritte + Ergebnis)

```
┌─ 1 Ziel ───────────┐  ┌─ 2 Auswahl ────────────┐  ┌─ 3 Aktion ─────────────┐  ┌─ 4 Fertig ─────────────┐
│ Kacheln:           │  │ Chips hinzufügen:      │  │ Kacheln je Ziel:       │  │ Name, Kategorie        │
│ ▸ Noten auswählen  │→ │ Tonhöhe · Velocity ·   │→ │ Verändern · Löschen ·  │→ │ Klartext + Vorschau    │
│ ▸ Velocity formen  │  │ Position im Takt ·     │  │ Auswählen · Kopieren · │  │ Export (.xml)          │
│ ▸ Controller       │  │ Länge · Kanal ·        │  │ Extrahieren · Einfügen │  │ „So installierst du“   │
│ ▸ Aufräumen        │  │ Eigenschaft · Akkord   │  │ Regler statt Zahlen    │  │ Als Rezept speichern   │
│ ▸ Spuren (PLE)     │  │ Gruppen per Drag&Drop  │  │                        │  │                        │
└────────────────────┘  └────────────────────────┘  └────────────────────────┘  └────────────────────────┘
                 Live-Vorschau (Piano-Roll) und Satz „Was passiert“ sind in jedem Schritt sichtbar.
```

### Schritt 1 – Ziel (Intent)
Große Kacheln mit Icon und Beispiel-Satz. Die Wahl setzt sinnvolle Vorgaben (z. B. „Velocity formen“ → Type = Note, Aktion auf
Velocity) und blendet im Folgenden nur Passendes ein. Darunter: *Rezepte* (fertige Presets) und *Datei öffnen* (bestehendes Preset
analysieren – Import-Pfad über den Decoder).

### Schritt 2 – Auswahl (Filter)
* **Chips** statt Zeilen: *Tonhöhe C1–B1*, *Velocity < 40*, *auf der 2 und 4*, *Kanal 10*, *ausgewählt*. Ein Chip öffnet ein
  passendes Bedienfeld:
  * Tonhöhe → **Klaviatur** (Klick = einzelne Note, Ziehen = Bereich, Umschalter „alle Oktaven“ = *Note is Equal to*).
  * Velocity / CC-Wert → **Bereichsregler** mit zwei Griffen und Zahlenfeld.
  * Position im Takt → **Taktraster** (Takt in 16tel, Zonen antippen/ziehen = Bar Range), Umschalter Cursor/Cycle.
  * Länge → Notenwert-Kacheln (1/32 … 1/1) oder Ticks.
  * Kanal → 16 Buttons. Eigenschaft → Schalter. Akkord-Kontext → Auswahlkarten mit Erklärung.
* **Gruppen per Drag & Drop**: Chips liegen standardmäßig in einer UND-Reihe. Ein Chip auf einen anderen gezogen bildet eine
  ODER-Gruppe (visuell ein Rahmen), Gruppen lassen sich verschachteln (= Klammern). Die Verknüpfung steht als Wort im Rahmen und ist
  umschaltbar. So entstehen Klammern, ohne dass jemand „Klammer“ denken muss.
* **Live-Vorschau**: Beispiel-Clip (4 Takte, Drums oder Melodie wählbar, eigene MIDI-Datei ladbar) – getroffene Noten leuchten.

### Schritt 3 – Aktion
Kacheln: *Verändern*, *Löschen*, *Nur auswählen*, *Kopie einfügen*, *Auf neue Spur*, *Auf neue Lane*, *Nur die behalten* (Insert
Exclusive). Bei *Verändern*: Aktions-Karten (Velocity, Tonhöhe, Position, Länge, Kanal, Typ …) mit Reglern: *+10*, *×0,9*, *fest 100*,
*zufällig 60–100*, *Rampe 127→40 im Loop*, *spiegeln um C3*, *in Skala D-Dur*. Karten sind per Drag sortierbar (Reihenfolge =
Ausführungsreihenfolge). Die Vorschau zeigt vorher/nachher.

### Schritt 4 – Fertig
Name, Kategorie (Unterordner), Klartext-Zusammenfassung, Byte-Größe, Schreibstil (Cubase 13+/kompatibel) als kleiner Schalter im
Details-Bereich. Export-Button, Zielordner mit Kopierknopf, Kurzanleitung („In Cubase: MIDI > Logical Editor > Apply Preset“).

### Experten-Modus
Dieselben Daten, als kompakte Liste mit allen Zielen/Bedingungen/Operationen (auch die seltenen: Last Event, Secondary Value,
NoteExp, Score). Umschalten jederzeit ohne Datenverlust. Für PLE identischer Aufbau mit Spur-/Part-Chips und Spur-Operationen.

## Visuelle Richtung
* Dunkles, ruhiges Studio-Thema mit einer Akzentfarbe (Cyan) für Aktives und einer Signalfarbe (Amber) für Hinweise; große
  Berührungsflächen (≥ 40 px), abgerundete Karten, weiche Schatten, dezente Bewegung (Chips „setzen sich“, Vorschau blendet).
* Typografie: Systemschrift, klare Hierarchie (Titel 24, Karte 16, Hilfe 13). Zahlen in Monospace.
* Icons als Inline-SVG (Lucide-Stil), keine Icon-Fonts (offline).
* Tastatur: Tab-Reihenfolge entlang des Assistenten, Enter = weiter, Esc = Bedienfeld schließen. Kontrast ≥ 4.5:1.

## Technik
* **Vue 3** mit **Nuxt UI v4** (MIT) für Bedienelemente und Zustand, gebaut mit Vite zu einer Datei (siehe `13-designsystem.md`).
* **SortableJS** (MIT, 45 KB) für Drag & Drop von Chips, Gruppen und Aktionskarten (Touch-fähig).
* Klaviatur, Bereichsregler, Taktraster, Piano-Roll: eigene kleine Komponenten (SVG/Canvas), weil kein Framework sie in dieser
  Form bietet.
* **LE-Core** (Decoder/Encoder) unverändert aus `le-tamer.html`; die Studio-Oberfläche erzeugt dasselbe Modell wie bisher
  (Filter-Baum → Token-Liste, Aktionen → Liste), damit Export/Import und alle Tests weitergelten.
* Build: `studio/` (Vite) baut die App, `studio/scripts/pack.mjs` packt sie mit Ladebildschirm in `le-tamer-studio.html`.

## Umsetzungsstand (Studio 2)
Nach Rückmeldung („wirkt wie eine Präsentationsfolie, Werbetexte“) wurde der Vier-Schritt-Assistent als Hauptoberfläche verworfen.
Studio 2 ist ein **Werkzeug-Layout**, wie man es aus DAWs kennt:

* Kopfleiste: Werkzeug (LE/PLE/Transformer/Input Transformer), Preset-Name, Rückgängig/Wiederholen, Assistent, Befehle, Öffnen, Exportieren.
* Links: Vorlagen mit automatisch erzeugter Kurzbeschreibung, eigene Vorlagen (lokal im Browser), Datei öffnen.
* Mitte: Bedingungen als Bausteine (Klick oder Drag & Drop aus der Palette), „und“/„oder“ als klickbare Wörter, Gruppen statt Klammern;
  Funktion; Aktionen als sortierbare Zeilen mit direkten Zahlenfeldern.
* Rechts: Inspector für den ausgewählten Baustein (Klaviatur, Bereichsregler mit Werteverteilung, Taktraster, Kanal-Raster, Listen)
  bzw. Preset-Eigenschaften und Zielordner.
* Unten: Vorschau (Treffer/Ergebnis als Piano-Roll mit Velocity- bzw. CC-Spur, PLE als Spurliste), Cubase-Ansicht (Zeilen wie im
  Logical Editor), Datei als Hex.
* Der Assistent ist ein Dialog für vier häufige Aufgaben und schreibt das Ergebnis in den Editor.
* Texte: sachlich, Bezeichnungen aus Musikersicht, Cubase-Begriffe als Zusatz; Hinweise nur bei echten Problemen.
