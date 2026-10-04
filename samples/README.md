# samples/

Kleine echte Preset-Dateien zum Testen des Parsers (und später des Encoders, Round-Trip byte-identisch).

## steinberg-factory-c13/
Vier Factory-Presets des Logical Editors aus der Kategorie *Musical Context* von Cubase Pro 13, die in Cubase 14/15
nicht mehr ausgeliefert werden. Veröffentlicht von einem Steinberg-Moderator im Steinberg-Forum
(https://forums.steinberg.net/t/is-there-a-way-to-get-logical-editor-presets-from-earlier-versions/969596).
© Steinberg Media Technologies GmbH – hier ausschließlich als Interoperabilitäts-Testdaten enthalten.

| Datei | Inhalt (decodiert) | Funktion |
|---|---|---|
| `Select_Highest_Pitch.xml` | `( Type = Note AND Context Variable: Highest Pitch )` | Select |
| `Select_Highest_Velocity.xml` | `( Type = Note AND Context Variable: Highest Velocity )` | Select |
| `Extract_Alto.xml` | `( Type = Note AND Context Variable: Voice = 1 )` | Extract to Track |
| `Add_Ninths_to_Chords.xml` | `( Type = Note AND Context Variable: Position in Chord (Chord Track) = 7 )` → `Subtype Add 7` | Insert |

Die 327 Presets der Metagrid-Sammlung (Analyse-Grundlage) sind Drittanbieter-Inhalt und **nicht** enthalten.
