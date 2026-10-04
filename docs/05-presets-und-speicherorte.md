# 05 – Presets: Speicherorte, Organisation, Migration, Tastaturbefehle

## Speicherorte (Cubase 12/13/14/15)
Cubase trennt **Factory-Presets** (Programmordner) und **User-Presets** (Dokumente-Ordner):

| | Windows | macOS |
|---|---|---|
| **Factory LE** | `C:\Program Files\Steinberg\Cubase 15\Presets\Logical Edit\` | `/Applications/Cubase 15.app/Contents/Presets/Logical Edit/` (Paketinhalt anzeigen) |
| **Factory PLE** | `…\Cubase 15\Presets\Project Logical Editor\` | `…/Contents/Presets/Project Logical Editor/` |
| **Factory Input Transformer** | `…\Cubase 15\Presets\Input Transformer\` | `…/Contents/Presets/Input Transformer/` |
| **User LE** | `%USERPROFILE%\Documents\Steinberg\Cubase 15\User Presets\Logical Edit\` | `~/Documents/Steinberg/Cubase 15/User Presets/Logical Edit/` |
| **User PLE** | `…\Documents\Steinberg\Cubase 15\User Presets\Project Logical Editor\` | `~/Documents/Steinberg/Cubase 15/User Presets/Project Logical Editor/` |
| **User Input Transformer** | `…\Documents\Steinberg\Cubase 15\User Presets\Input Transformer\` | `~/Documents/Steinberg/Cubase 15/User Presets/Input Transformer/` |

* Der genaue Ordner lässt sich im Preset-Browser über **Show User Presets Location** öffnen – das ist die
  verlässlichste Methode.
* Der Programmname im Pfad entspricht der installierten Edition/Version (z. B. `Cubase 15`, `Cubase Artist 15`).
* **Alte Versionen (≤ 11):** Presets lagen im Preferences-Ordner:
  Windows `%APPDATA%\Steinberg\Cubase <n>_64\Presets\Logical Edit\`,
  macOS `~/Library/Preferences/Cubase <n>/Presets/Logical Edit/`. Factory-Presets lagen zusätzlich im Programmordner.
* **Automatische Migration:** Beim Update werden Presets aus dem alten Preferences-Ordner in den Unterordner
  **Earlier Presets** des User-Preset-Ordners kopiert. Bei einer **Neuinstallation auf frischem Rechner** fehlen sie
  → manuell aus Backup kopieren. Einige Factory-Presets früherer Versionen (z. B. *Musical Context/Extract Alto*)
  sind in Cubase 14/15 nicht mehr enthalten; die Dateien aus Cubase 13 funktionieren aber weiterhin.

## Dateien & Organisation
* **Eine Datei pro Preset**, Dateiname = Preset-Name (`Mein Preset.xml`). Umbenennen/Löschen im Dateisystem ist erlaubt.
* **Unterordner = Kategorien** im Preset-Browser (z. B. `Velocity/`, `Musical Context/`). Beliebig schachtelbar;
  Cubase liest sie beim Start (oder beim nächsten Öffnen des Browsers) ein.
* Preset-Browser: Baum mit *User Presets* und *Factory Presets*, Suchfeld (Name oder Kategorie), Expand/Collapse All,
  **Save Changes as Preset** (öffnet Datei-Dialog im User-Ordner), *Show User Presets Location*.
* Ungespeicherte Änderungen werden im Preset-Feld mit `*` markiert.
* Steinberg warnt: manuelles Ändern von Preset-Dateien kann Probleme verursachen → vor Experimenten Backup.

## Anwenden ohne Fenster & Tastaturbefehle
* `MIDI > Logical Editor > Apply Preset` bzw. `Project > Project Logical Editor > Apply Preset`.
* `Edit > Key Commands` → Kategorie **Process Logical Preset** (LE) / **Process Project Logical Editor Preset** (PLE)
  → jedes Preset ist einzeln mit einer Taste belegbar. Presets lassen sich so auch in **Makros** einbauen.
* Wichtig für Makros: Reihenfolge ist fix, Fensterzustände sind nur toggelbar → Workspaces als definierten Startpunkt nutzen
  (SOS „Macro Logical“).

## Bekannte Stolpersteine
* Nach Versionswechsel „fehlende“ Presets → fast immer Pfadproblem (alter vs. neuer Ordner, Edition im Pfad).
* macOS: `~/Library` ist standardmäßig versteckt (Finder: Alt + Gehe zu, oder `chflags nohidden ~/Library`).
* Presets sind projekt-unabhängig (global). Im Projekt selbst wird nichts gespeichert außer den Auswirkungen.
* Bug-Report in Cubase 15.0.20 zu LE-Presets im Forum erwähnt; Details offen.
