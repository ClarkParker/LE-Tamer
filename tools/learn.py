#!/usr/bin/env python3
"""learn.py – liest Mini-Presets aus Cubase (benannt nach docs/11-funktionsmatrix-cubase15.md) und leitet daraus
die noch fehlenden Codes ab. Aufruf: python3 tools/learn.py <Ordner mit den Checklisten-Presets>
Benennung: <GRUPPE>__<Name>.xml  z. B.  COND__NoteIsEqualTo.xml, OP__Mirror.xml, FT__SecondaryValue.xml, AT__Value3.xml
Das Skript gibt pro Datei die beobachteten Klassen/Codes aus und schreibt learn-result.json ins aktuelle Verzeichnis."""
import sys, os, glob, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from leparse import load, Parser, summarize

def flat(o, acc):
    acc.append(o)
    for p in o.get('params', []): flat(p, acc)
    return acc

def main(folder):
    out = {}
    for fn in sorted(glob.glob(os.path.join(folder, '**', '*.xml'), recursive=True)):
        try:
            b, root = load(fn); p = Parser(b); r = p.parse()
        except Exception as e:
            print('FEHLER', os.path.basename(fn), e); continue
        name = os.path.splitext(os.path.basename(fn))[0]
        objs = []
        for o in r['actions'] + r['filters']: flat(o, objs)
        rec = {'root': root, 'function': r['function'], 'trailer': r['trailer'], 'summary': summarize(r)[1:],
               'conditions': sorted({(o['cls'], o['cond']) for o in objs if 'cond' in o}),
               'actions': sorted({(o['cls'], o['target'], o['op']) for o in objs if 'op' in o}),
               'value_classes': sorted({(o['cls'], o['size'], o.get('min'), o.get('max'), o.get('value')) for o in objs if o.get('size') in (4, 12) and o['cls'].endswith('Value')}, key=str),
               'raw_classes': sorted({(o['cls'], o['size']) for o in objs if 'raw' in o and 'str' not in o}),
               'errors': p.errors}
        out[name] = rec
        print(f"\n== {name} [{root}] fn={r['function']} trailer={r['trailer']}")
        print('   F:', rec['summary'][0][:200]); print('   A:', rec['summary'][1][:200])
        print('   conds:', rec['conditions']); print('   acts:', rec['actions'])
        if rec['raw_classes']: print('   raw:', rec['raw_classes'])
        if p.errors: print('   !!', p.errors)
    json.dump(out, open('learn-result.json', 'w'), indent=1, default=str)
    print('\n→ learn-result.json geschrieben,', len(out), 'Dateien')

if __name__ == '__main__':
    if len(sys.argv) < 2: print(__doc__); sys.exit(1)
    main(sys.argv[1])
