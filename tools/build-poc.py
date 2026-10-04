#!/usr/bin/env python3
"""Baut prototype/poc-querybuilder.html aus prototype/poc-querybuilder.src.html:
<!--INLINE:pfad--> wird durch den Dateiinhalt ersetzt, <!--INLINE:le-core--> durch den Core-Script-Block aus le-tamer.html,
<!--INLINE-JSON:pfad--> durch den JSON-Text. Ergebnis: eine einzige, offline nutzbare HTML-Datei."""
import re,os,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=open(os.path.join(ROOT,'prototype/poc-querybuilder.src.html'),encoding='utf-8').read()
core=re.search(r'<script id="le-core">([\s\S]*?)</script>',open(os.path.join(ROOT,'le-tamer.html'),encoding='utf-8').read()).group(1)
def safe_js(t): return t.replace('</script','<\\/script')
def safe_css(t):
    t=re.sub(r'@font-face\{[^}]*Glyphicons[^}]*\}','',t)  # Bootstrap-Icon-Fonts werden nicht benoetigt (offline, keine Dateien)
    return t.replace('</style','<\\/style')
def repl(m):
    kind,path=m.group(1),m.group(2)
    if path=='le-core': return safe_js(core)
    t=open(os.path.join(ROOT,path),encoding='utf-8').read()
    if kind=='INLINE-JSON': return t
    return safe_css(t) if path.endswith('.css') else safe_js(t)
out=re.sub(r'<!--(INLINE|INLINE-JSON):([^>]+?)-->',repl,src)
dst=os.path.join(ROOT,'prototype/poc-querybuilder.html'); open(dst,'w',encoding='utf-8').write(out)
print('built',dst,len(out),'bytes')
