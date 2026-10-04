#!/usr/bin/env python3
"""Baut le-tamer-studio.html aus prototype/le-tamer-studio.src.html:
<!--INLINE:pfad--> wird durch den Dateiinhalt ersetzt, <!--INLINE:le-core--> durch den Core-Script-Block aus le-tamer.html,
<!--INLINE-JSON:pfad--> durch den JSON-Text. Ergebnis: eine einzige, offline nutzbare HTML-Datei (Vue 3 + SortableJS eingebettet)."""
import re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'prototype/le-tamer-studio.src.html'), encoding='utf-8').read()
core = re.search(r'<script id="le-core">([\s\S]*?)</script>', open(os.path.join(ROOT, 'le-tamer.html'), encoding='utf-8').read()).group(1)
def safe_js(t): return t.replace('</script', '<\\/script')
def repl(m):
    kind, path = m.group(1), m.group(2)
    if path == 'le-core': return safe_js(core)
    t = open(os.path.join(ROOT, path), encoding='utf-8').read()
    if kind == 'INLINE-JSON': return t.strip()
    return t.replace('</style', '<\\/style') if path.endswith('.css') else safe_js(t)
out = re.sub(r'<!--(INLINE|INLINE-JSON):([^>]+?)-->', repl, src)
dst = os.path.join(ROOT, 'le-tamer-studio.html'); open(dst, 'w', encoding='utf-8').write(out)
print('built', dst, len(out), 'bytes')
