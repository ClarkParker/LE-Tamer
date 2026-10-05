# 13 – Designsystem für LE-Tamer Studio: Recherche und Entscheidung

## Anforderungen
* Ergebnis ist **eine einzige HTML-Datei**, die auf dem Zielrechner ohne Installation, ohne Server und ohne Netz läuft
  (Doppelklick, `file://`). Alle Bibliotheken, Schriften und Icons müssen in der Datei stecken.
* Modernes, ruhiges Werkzeug-Design für Musiker; kein Präsentations- oder Landingpage-Layout.
* Fertiges, gepflegtes System statt Eigenbau: Bedienelemente mit Tastaturbedienung und Barrierefreiheit, Theming über Tokens.
* Passt zum vorhandenen Stack (Vue 3) und zu einer MIT-kompatiblen Lizenz.

## Kandidaten (Stand Oktober 2026)

| System | Basis | Lizenz | Offline in einer Datei | Bewertung |
|---|---|---|---|---|
| **Nuxt UI v4** | Vue 3, Reka UI, Tailwind CSS v4 | MIT (seit v4 inkl. ehemals kostenpflichtiger Pro-Komponenten) | ja: Vite-Plugin für reines Vue, Icons werden beim Bauen eingebettet (`icon.clientBundle`) | 125+ Komponenten, u. a. Befehlspalette, Baum, Bereichsregler, Kontextmenü, verschiebbare Dashboard-Panels; Theming über Farb-Aliase und CSS-Variablen. **Gewählt.** |
| PrimeVue 4 | Vue 3 | MIT | ja, mit Bundler | Sehr groß (90+ Komponenten, starke Tabellen); Presets Aura/Lara/Nora wirken nach Enterprise-Verwaltungsoberfläche. |
| shadcn-vue | Vue 3, Reka UI, Tailwind | MIT | ja, mit Bundler | Komponenten werden ins Projekt kopiert (volle Kontrolle), aber mehr Eigenarbeit; gleiche Basis wie Nuxt UI. |
| Naive UI | Vue 3 | MIT | ja | Gutes Dunkel-Theme, Optik eher Verwaltungsoberfläche. |
| Web Awesome 3 (Shoelace-Nachfolger) | Web Components | MIT (Kern) | ja | Nur zwei Themes frei; die edleren Themes (Premium, Glossy, Matter …) sind kostenpflichtig. |
| Spectrum Web Components (Adobe) | Web Components | Apache-2.0 | aufwendig | Optik der Adobe-Pro-Apps; Reifegrad von Spectrum 2 laut Doku unklar, Integration in Vue umständlich. |
| AudioUI (Cutoff) | React | GPL-3.0 / kommerziell | – | Audio-spezifische Regler, aber React und GPL – nicht übernommen. |
| webaudio-controls | Web Components | – | ja | Drehregler/Keyboard im Plug-in-Stil; für dieses Werkzeug nicht nötig. |

## Entscheidung
**Nuxt UI v4 auf Vue 3**, gebaut mit **Vite**. Gründe: vollständig MIT, Vue-Stack bleibt, Reka UI liefert zugängliche Grundbausteine
(Fokusführung, Tastatur, ARIA), Befehlspalette/Kontextmenü/Bereichsregler/Toasts sind fertig, und das Theming läuft über wenige Tokens.
Musik-spezifische Bedienelemente (Klaviatur, Taktraster, Piano-Roll-Vorschau, Kanal-Raster) sind eigene Komponenten, weil kein
System sie in dieser Form anbietet.

Eigenes Erscheinungsbild auf Basis der Nuxt-UI-Tokens:
* Neutraltöne „Graphit“ (leicht kühl, Basis Tailwind *mist*), Arbeitsfläche dunkler als die Seitenleisten.
* Ein Akzent „Messing“ (eigene Palette `brass`, oklch ≈ 78 % / 0,12 / 75°) für Auswahl, Treffer und die Export-Schaltfläche.
* Schriften: **Instrument Sans** (variable Breite, für kompakte Beschriftungen) und **Martian Mono** (Werte, Ticks, Hex).
  Beide OFL 1.1, als Latin-Teilmenge eingebettet.
* Icons: Lucide (ISC), beim Bauen eingebettet.

## Auslieferung als Monolith mit Ladebildschirm
`studio/scripts/pack.mjs` legt CSS und JavaScript **gzip-komprimiert (base64)** in die HTML-Datei. Beim Öffnen zeigt ein
Ladebildschirm den Fortschritt; der Browser entpackt die Teile mit der eingebauten `DecompressionStream`-API in den Arbeitsspeicher
und startet die App. Voraussetzung: Chrome/Edge ab 80, Firefox ab 113, Safari ab 16.4 – auf älteren Browsern erscheint ein
Hinweis statt einer leeren Seite. Eine fertige Alternative für dasselbe Prinzip ist das Vite-Plugin
`vite-plugin-singlefile-compression` (MIT); der eigene Packer wurde gewählt, weil er den Ladebildschirm und die Fehlermeldung
steuert.

## Quellen
* Nuxt UI – Installation für Vue: https://ui.nuxt.com/docs/getting-started/installation/vue
* Nuxt UI – Icons für Vue (Offline-Bündelung): https://ui.nuxt.com/docs/getting-started/integrations/icons/vue
* Nuxt UI v4 (MIT, Pro zusammengeführt): https://nuxt.com/blog/nuxt-ui-v4
* PrimeVue Theming: https://primevue.dev/theming/styled/
* Web Awesome Themes: https://webawesome.com/docs/themes/
* Spectrum Web Components, Migration auf Spectrum 2: https://opensource.adobe.com/spectrum-web-components/migrating-to-spectrum2/
* vite-plugin-singlefile: https://www.npmjs.com/package/vite-plugin-singlefile · vite-plugin-singlefile-compression: https://github.com/bddjr/vite-plugin-singlefile-compression
* AudioUI: https://github.com/cutoff/audio-ui · webaudio-controls: http://g200kg.github.io/webaudio-controls/docs/
