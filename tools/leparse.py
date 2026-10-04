#!/usr/bin/env python3
"""leparse.py – Decoder für Cubase Logical-Editor- / Project-Logical-Editor-Preset-Dateien (.xml).

Liest den Hex-Blob aus <bin name="Preset">, zerlegt den Objektstrom (MFC-CArchive-ähnlich:
Klassennamen inline, Referenzen 0x8000_0000 | Byte-Offset) und gibt Filter/Aktionen lesbar aus.

Aufruf:
  leparse.py <datei.xml> [...]          Einzeiler pro Preset
  leparse.py --tree <datei.xml> [...]   Objektbaum mit Offsets/Größen
  leparse.py --json <datei.xml> [...]   JSON-Dump (eine Zeile pro Datei)
Nur Standardbibliothek. Format-Doku: docs/06-preset-dateiformat.md
"""
import glob
import json
import os
import re
import struct
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
try:
    CODES = json.load(open(os.path.join(HERE, '..', 'data', 'le-codes.json'), encoding='utf-8'))
except Exception:  # Tool auch ohne data/ lauffähig
    CODES = {}


def _name(table, key, default=None):
    e = CODES.get(table, {}).get(str(key))
    return e['name'] if e else (default if default is not None else str(key))


def load(fn):
    s = open(fn, encoding='utf-8', errors='replace').read()
    m = re.search(r'<bin name="Preset">(.*?)</bin>', s, re.S)
    if not m:
        raise ValueError('kein <bin name="Preset"> gefunden')
    root = re.search(r'<(\w+)>', s).group(1)
    return bytes.fromhex(re.sub(r'\s+', '', m.group(1))), root


def f32(u):
    return struct.unpack('<f', struct.pack('<I', u & 0xFFFFFFFF))[0]


class Parser:
    VALUE12 = ('LeUIntValue', 'PControllerValue', 'LeFlagsValue', 'LeTypeValue', 'LeUFloatValue')
    VALUE4 = ('LeContainerTypeValue', 'LeDomainTypeValue', 'LeGenericOpValue', 'UIntValue', 'UFloatValue')

    def __init__(self, b):
        self.b, self.i, self.classes, self.errors = b, 0, {}, []

    def u32(self):
        v = struct.unpack_from('<I', self.b, self.i)[0]; self.i += 4; return v

    def i32(self):
        v = struct.unpack_from('<i', self.b, self.i)[0]; self.i += 4; return v

    def u16(self):
        v = struct.unpack_from('<H', self.b, self.i)[0]; self.i += 2; return v

    def peek32(self, o=0):
        return struct.unpack_from('<I', self.b, self.i + o)[0] if self.i + o + 4 <= len(self.b) else None

    def cstr(self):
        ln = self.u32(); raw = self.b[self.i:self.i + ln]; self.i += ln
        return raw.rstrip(b'\0').decode('latin1')

    def is_tag(self):
        t = self.peek32()
        if t in (0xFFFFFFFE, 0xFFFFFFFF):
            ln = self.peek32(4)
            return ln is not None and 0 < ln < 48
        return t is not None and (t & 0xFFFF0000) == 0x80000000 and (t & 0xFFFF) in self.classes

    def obj(self):
        bases = []
        while self.peek32() == 0xFFFFFFFE:
            off = self.i; self.i += 4
            name = self.cstr(); ver = self.u16()
            bases.append({'name': name, 'ver': ver, 'off': off}); self.classes[off] = name
        tag = self.peek32()
        if tag == 0xFFFFFFFF:
            off = self.i; self.i += 4; name = self.cstr(); ver = self.u16()
            self.classes[off] = name; kind = 'new'
        elif tag is not None and (tag & 0xFFFF0000) == 0x80000000:
            self.i += 4; off = tag & 0xFFFF; name = self.classes.get(off); kind = 'ref'; ver = None
            if name is None:
                raise ValueError(f'unaufgelöste Klassenreferenz 0x{off:X} bei Offset {self.i - 4}')
        else:
            raise ValueError(f'ungültiges Tag 0x{tag:08X} bei Offset {self.i}')
        size = self.u32(); start = self.i; end = start + size
        o = {'cls': name, 'kind': kind, 'off': off, 'ver': ver, 'bases': bases, 'size': size, 'data_off': start}
        if name.startswith('leActionTarget'):
            o['flags16'] = self.u16(); o['op'] = self.u32(); o['target'] = self.u32()
            o['params'], o['extra'] = [], []
            while self.i < end:
                (o['params'].append(self.obj()) if self.is_tag() else o['extra'].append(self.i32()))
        elif name.startswith('le') and name.endswith('Target'):
            o['c0'] = self.u32(); o['cond'] = self.u32(); o['c2'] = self.u32()
            o['params'], o['extra'] = [], []
            while self.i < end:
                (o['params'].append(self.obj()) if self.is_tag() else o['extra'].append(self.i32()))
        elif name == 'leToken':
            o['token'] = self.u32()
        elif name in self.VALUE12 and size == 12:
            a, b_, c = self.i32(), self.i32(), self.i32()
            o['min'], o['max'] = a, b_
            o['value'] = round(f32(c), 6) if name == 'LeUFloatValue' else c
        elif name in self.VALUE4 and size == 4:
            v = self.i32(); o['value'] = round(f32(v), 6) if name == 'UFloatValue' else v
        elif name == 'UStringValue':
            o['raw'] = self.b[start:end].hex()
            try:
                ln = self.u32(); o['str'] = self.b[self.i:self.i + ln].split(b'\0')[0].decode('utf-8', 'replace')
            except Exception:
                pass
            self.i = end
        else:
            o['raw'] = self.b[start:end].hex(); self.i = end
        if self.i != end:
            self.errors.append(f'Größenabweichung in {name}: {self.i} statt {end}'); self.i = end
        return o

    def lst(self):
        m = self.u32(); v = self.u16(); n = self.u32()
        if m != 0x0A or v != 1:
            self.errors.append(f'unerwarteter Listenkopf {m}/{v}')
        return [self.obj() for _ in range(n)]

    def parse(self):
        r = {'magic': self.u32(), 'one': self.u32()}
        cl = self.u32(); r['comment_raw'] = self.b[self.i:self.i + cl].hex(); self.i += cl
        r['comment'] = self.b[self.i - cl:self.i].split(b'\0')[0].decode('utf-8', 'replace')
        r['actions'] = self.lst(); r['filters'] = self.lst()
        rest = []
        while self.i + 4 <= len(self.b):
            rest.append(self.i32())
        r['trailer'] = rest; r['tail'] = self.b[self.i:].hex()
        r['function'] = rest[1] if len(rest) > 1 else None
        r['errors'] = self.errors
        return r


TOK = {101: '(', 102: ')', 103: 'AND', 104: 'OR'}


def pv(o):
    if o is None:
        return '-'
    if 'value' in o:
        return f"{o['cls']}({o['min']}..{o['max']}={o['value']})" if 'min' in o else f"{o['cls']}({o['value']})"
    if 'str' in o:
        return f"Str({o['str']!r})"
    return f"{o['cls']}[{o['size']}B]"


def summarize(r):
    f = []
    for o in r['filters']:
        if o['cls'] == 'leToken':
            f.append(TOK.get(o['token'], str(o['token'])))
        else:
            ps, ex = o['params'], o['extra']
            tgt = _name('filter_target_classes', o['cls'], o['cls'])
            cond = _name('conditions', o['cond'])
            p1 = pv(ps[0]) if ps else '-'
            p2 = pv(ps[1]) if len(ps) > 1 else '-'
            x = f" raw{ex}" if ex and not (o['cls'] == 'leTypesTarget' and ex == [0]) else ''
            f.append(f"[{tgt} {cond} P1={p1} P2={p2}{x}]")
    a = []
    for o in r['actions']:
        ps = o['params']
        a.append(f"[{_name('action_targets', o['target'])} {_name('operations', o['op'])} "
                 f"P1={pv(ps[0]) if ps else '-'} P2={pv(ps[1]) if len(ps) > 1 else '-'}]")
    fn = _name('functions', r['function']) if r['function'] is not None else 'legacy'
    return fn, ' '.join(f), ' ; '.join(a)


def tree(o, ind=2):
    b = ''.join(f"[base {x['name']}@{x['off']}] " for x in o['bases'])
    head = f"{' ' * ind}{b}<{o['cls']}{'*' if o['kind'] == 'ref' else ''}@{o['off']} size={o['size']}>"
    vals = {k: o[k] for k in ('token', 'c0', 'cond', 'c2', 'op', 'target', 'min', 'max', 'value', 'str', 'extra') if k in o and o[k] not in ([], None)}
    out = head + (' ' + json.dumps(vals, ensure_ascii=False) if vals else '') + '\n'
    if 'raw' in o and 'str' not in o:
        out += ' ' * (ind + 4) + 'raw ' + o['raw'][:120] + ('…' if len(o['raw']) > 120 else '') + '\n'
    for k in o.get('params', []):
        out += tree(k, ind + 4)
    return out


def main(argv):
    mode = 'summary'
    files = []
    for a in argv:
        if a in ('--tree', '--json'):
            mode = a[2:]
        else:
            files.extend(glob.glob(a) or [a])
    if not files:
        print(__doc__); return 1
    for fn in files:
        try:
            b, root = load(fn); r = Parser(b).parse()
        except Exception as e:
            print(f"FEHLER {fn}: {e}"); continue
        if mode == 'json':
            r['file'] = fn; r['root'] = root; r['bytes'] = len(b)
            print(json.dumps(r, ensure_ascii=False))
        elif mode == 'tree':
            fn_, fs, as_ = summarize(r)
            print(f"\n#### {fn}  [{root}]  {len(b)} Bytes  Funktion={fn_}  Kommentar={r['comment']!r}  Trailer={r['trailer']}")
            print(' ACTIONS:')
            for o in r['actions']:
                print(tree(o), end='')
            print(' FILTERS:')
            for o in r['filters']:
                print(tree(o), end='')
            if r['errors']:
                print(' WARNUNGEN:', r['errors'])
        else:
            fn_, fs, as_ = summarize(r)
            name = os.path.splitext(os.path.basename(fn))[0]
            print(f"{name[:48]:48s} {fn_:17s} {fs}{('  →  ' + as_) if as_ else ''}" + (f"  !!{r['errors']}" if r['errors'] else ''))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
