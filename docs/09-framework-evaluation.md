# 09 – Fertige Bausteine statt Eigenbau: Framework-Bewertung für den visuellen Editor

Ziel: den Editor-Teil von LE-Tamer nicht selbst zu erfinden, sondern auf ein erprobtes Framework zu setzen, das
(1) ohne Build-Schritt in **eine** HTML-Datei einbettbar ist, (2) die Semantik des Logical Editors abbildet
(Zeilen mit Ziel/Bedingung/Parametern, And/Or, Klammern = verschachtelte Gruppen) und (3) eine moderne,
bedienbare Oberfläche liefert. Stand: 2026-10-04, Zahlen aus npm-Registry und jsDelivr/unpkg gemessen.

## Welche Art von Editor passt?

Der Logical Editor ist ein **Regel-/Filter-Builder** („Query Builder“): eine Liste von Bedingungszeilen,
verknüpft mit And/Or, gruppiert durch Klammern, plus eine Liste von Aktionen. Das ist exakt das Modell, das
Query-Builder-Komponenten seit Jahren für Datenbankfilter liefern: *Gruppe (AND/OR) → Regeln (Feld, Operator,
Wert[e]) → Untergruppen*. Node-Graph-Editoren (Rete, LiteGraph, Drawflow, React Flow) modellieren dagegen
Datenflüsse mit Verbindungen; für boolesche Zeilen sind sie ein Fremdkörper und erzeugen Bedienaufwand
(Knoten platzieren, Kanten ziehen), den Cubase selbst nicht hat. Blockly (Scratch-Blöcke) wäre eine dritte
Option mit hohem Lerneffekt, aber großem Fußabdruck.

## Kandidaten

| Framework | Typ | Lizenz | Letztes Release | Ohne Bundler nutzbar | Größe inline (min.) | Fit zum LE |
|---|---|---|---|---|---|---|
| **jQuery QueryBuilder** (mistic100) | Query Builder | MIT | 3.0.0 (2024-01-31, Bootstrap 5); 2.7.0 (2023-07, Bootstrap 3/4) | ✅ UMD-Standalone-Build via jsDelivr | 75 KB JS + 88 KB jQuery + 121 KB Bootstrap-3-CSS (nur CSS nötig) + 2 KB i18n de ≈ 290 KB | ★★★★★ Gruppen beliebig tief, AND/OR pro Gruppe, Operatoren pro Filter, Operatoren mit 0/1/2 Eingaben (→ Inside/Outside Range), Eingabetypen select/number/text/custom, `getRules()/setRules()` als JSON, Plugins *sortable*, *not-group*, *invert*, Validierung, Deutsch vorhanden |
| **react-querybuilder** | Query Builder | MIT | 8.24.3 (2026-09-25), sehr aktiv | ❌ kein UMD-Build → Vite-Build nötig (ergibt aber am Ende ebenfalls eine einzelne HTML-Datei) | ~60 KB + React ≈ 200 KB | ★★★★☆ gleiche Modellierung, modernes React, Drag & Drop; Toolchain-Kosten |
| **react-awesome-query-builder** | Query Builder | MIT | aktiv | ❌ nur npm/Bundler | > 300 KB mit UI-Theme | ★★★★☆ sehr mächtig (Funktionen, Feldvergleiche), für LE überdimensioniert |
| **@saas-js/conditions** | Headless-Modell | MIT | neu | ✅ (nur Modell, keine UI) | klein | ★★☆☆☆ liefert nur den Baum, UI bleibt Eigenbau |
| **Blockly** (Google/Raspberry Pi) | Block-Programmierung | Apache-2.0 | 13.3.0 (2026-09-10) | ✅ unpkg-Skripte | 968 KB core + 89 KB blocks + 37 KB msg/de ≈ 1,1 MB | ★★★☆☆ sehr anschaulich („Wenn Typ = Note und Velocity < 40 dann Velocity +10“), aber eigener Block-Satz + Generator nötig; schwer, Cubases Tabellen-Look zu treffen |
| **Drawflow** | Node-Graph | MIT | 0.0.60 | ✅ | 46 KB | ★★☆☆☆ leichtgewichtig, aber Datenfluss-Metapher passt nicht zu And/Or-Zeilen |
| **LiteGraph.js** | Node-Graph | MIT | 0.7.18 (unmaintained seit 2024) | ✅ | 491 KB | ★☆☆☆☆ |
| **Rete.js / React Flow** | Node-Graph | MIT | aktiv | ❌ Bundler | groß | ★☆☆☆☆ für dieses Problem falsche Metapher |

## Empfehlung

**jQuery QueryBuilder 2.7.0 (Bootstrap-3-CSS) oder 3.0.0 (Bootstrap-5-CSS) als Filter-Editor**, eingebettet in
die eine HTML-Datei (Standalone-JS, CSS, de-Sprachdatei und jQuery inline; alles MIT). Gründe:

1. **1:1-Abbildung der Cubase-Semantik.** Filter = Filter Target, Operatoren pro Filter = erlaubte Bedingungen,
   `nb_inputs: 2` = Inside/Outside Range (Parameter 1 + 2), Gruppen = Klammerebenen, Gruppen-Bedingung = Bool-Spalte.
   `input: 'select'` mit `values` deckt Type/Property/Context/Container/Media Type ab; `input: function` erlaubt
   Notennamen-Eingabe (C3 ↔ 60) und Tick-Eingabe mit Takt/Zählzeit-Umrechnung.
2. **Kein Build-Schritt, offline, eine Datei** – die Kernanforderung bleibt erfüllt.
3. **Ausgereift:** seit 2014 im Einsatz, 1,7k Sterne, Deutsch-Lokalisierung, Validierung, Sortieren per Drag & Drop,
   JSON rein/raus. Die Risiken (jQuery-Abhängigkeit, moderate Weiterentwicklung) sind für ein Offline-Werkzeug
   unkritisch; der Encoder bleibt davon unabhängig.
4. **Aktionen** (kein Baum, nur Liste) bleiben eine schlanke eigene Tabelle – dafür braucht es kein Framework.

Alternative, falls ein Build-Schritt akzeptabel ist: **react-querybuilder** (aktivster Kandidat, gleiche
Modellierung) mit Vite + `vite-plugin-singlefile` → ergibt ebenfalls eine einzelne HTML-Datei.

## Abbildung LE ↔ QueryBuilder-JSON (Entwurf)

```json
{ "condition": "AND", "rules": [
    { "id": "type",   "operator": "equal",   "value": 0 },
    { "condition": "OR", "rules": [
        { "id": "position_bar", "operator": "between", "value": [460, 500] },
        { "id": "position_bar", "operator": "between", "value": [1420, 1460] } ] } ] }
```
→ Token-Liste: `( [Type = Note] AND ( [Pos InsideBarRange 460..500] OR [Pos InsideBarRange 1420..1460] ) )`.

* Operator-Mapping: `equal`→200, `not_equal`→201, `greater`→202, `greater_or_equal`→203, `less`→204,
  `less_or_equal`→205, `between`→207 (bzw. 206 bei Position/Bar Range), `not_between`→209 (bzw. 208),
  `contains`→210, `not_contains`→213 (PLE Name), eigene Operatoren `is_set`→211, `is_not_set`→212,
  `before_cursor`→216 … (0 Eingaben).
* **Import** einer Cubase-Datei mit flacher Token-Folge `A AND B OR C` (ohne Klammern): QueryBuilder verlangt
  eine Bedingung pro Gruppe. Cubase wertet die flache Folge offenbar von links nach rechts aus (die Hilfe
  empfiehlt Klammern ab drei Zeilen mit Or). Beim Import wird deshalb links-assoziativ gruppiert
  `((A AND B) OR C)`, beim Export werden Gruppen immer als explizite Klammern geschrieben – das ist eindeutig
  und entspricht dem, was Cubase selbst beim Speichern tut (äußeres Klammerpaar).

## Was bleibt Eigenbau (bewusst)
* Encoder/Decoder des Binärformats (gibt es nirgends fertig; siehe `06-preset-dateiformat.md`).
* Aktionsliste, Funktions-Auswahl, Vorschau/Erklärung, Validierung, Rezepte, Export/Import.
