"""Erzeugt docs/10-belege.md aus dem lokalen Preset-Korpus (nicht im Repo; Pfade unten anpassen). Belegzahlen pro Code."""
import sys,glob,json,collections,os,hashlib,datetime
sys.path.insert(0,'/home/user/LE-Tamer/tools')
from leparse import load,Parser
SC='/tmp/claude-0/-home-user-LE-Tamer/4fba3ba8-233a-55f4-bfb4-ff60d194b2c5/scratchpad/'
codes=json.load(open('/home/user/LE-Tamer/data/le-codes.json'))
log={os.path.basename(e['file']).rsplit('.',1)[0]:e for e in json.load(open(SC+'harvest/download_log.json'))}
def year(fn,src):
    if src!='Forum': return {'Upload (Factory-PLE)':'≤C11','r-koubou':'C8–C13','Metagrid':'C9','Steinberg C13':'C13'}[src]
    key='_'.join(os.path.basename(fn).split('_')[:2]); e=log.get(key); return e['date'][:4] if e else '?'
sources=[('Forum',glob.glob(SC+'harvest/files/*.xml')+glob.glob(SC+'harvest/unz/*.xml')),('Upload (Factory-PLE)',glob.glob(SC+'user_presets/**/*.xml',recursive=True)),('r-koubou',glob.glob(SC+'gh/CubaseLogicalEditorFiles/**/*.xml',recursive=True)),('Metagrid',glob.glob(SC+'forum/attachments/mg/Cubase/**/*.xml',recursive=True)),('Steinberg C13',glob.glob(SC+'forum/attachments/att_*.xml'))]
seen=set(); nfiles=collections.Counter(); roots=collections.Counter(); years=collections.Counter()
cond=collections.defaultdict(collections.Counter); act=collections.defaultdict(collections.Counter); ops=collections.defaultdict(collections.Counter); enum=collections.defaultdict(collections.Counter); classes=collections.defaultdict(collections.Counter); funcs=collections.Counter(); trailer5=collections.Counter()
def walk(o,src):
    classes[o['cls']][src]+=1
    if 'cond' in o: cond[(o['cls'],o['cond'])][src]+=1
    if 'op' in o:
        act[(o['cls'],o['target'])][src]+=1; ops[(o['target'],o['op'])][src]+=1
        for p in o.get('params',[]):
            if p['cls']=='LeGenericOpValue' and 'value' in p: enum[('LeGenericOpValue',p['value'])][src]+=1
    if 'cond' in o:
        for p in o.get('params',[]):
            if p['cls'] in ('LeTypeValue','LeFlagsValue','LeContainerTypeValue','LeMediaTypeValue') and 'value' in p: enum[(p['cls'],p['value'])][src]+=1
        if o['cls']=='leContextTypeTarget' and o.get('extra'): enum[('ContextVar',o['extra'][0])][src]+=1
    for p in o.get('params',[]): walk(p,src)
for src,fl in sources:
    for fn in sorted(set(fl)):
        try: data=open(fn,'rb').read()
        except Exception: continue
        if b'<bin name="Preset">' not in data: continue
        h=hashlib.md5(data).hexdigest()
        if h in seen: continue
        seen.add(h)
        try: b,root=load(fn); r=Parser(b).parse()
        except Exception: continue
        nfiles[src]+=1; roots[root]+=1; years[year(fn,src)]+=1
        if len(r['trailer'])>1: funcs[(root,r['trailer'][1])]+=1
        if len(r['trailer'])>4: trailer5[r['trailer'][4]]+=1
        for o in r['actions']+r['filters']: walk(o,src)
def name(tbl,k): e=codes.get(tbl,{}).get(str(k)); return (e['name']+(' 🟡' if e.get('confidence')=='inferred' else '')) if e else '❓'
def fmt(c): return ', '.join(f'{k} {v}' for k,v in sorted(c.items(),key=lambda x:-x[1]))
L=[]; w=L.append
w('# 10 – Belege: Code-Vorkommen im Preset-Korpus\n')
w(f'Automatisch erzeugt am {datetime.date.today()} mit `scratchpad/harvest/evidence.py` aus `tools/leparse.py`. Ein Code gilt als **verifiziert**, wenn seine Bedeutung aus Preset-Namen/Kommentaren oder Factory-Presets eindeutig hervorgeht; die Spalte *Belege* zählt Vorkommen je Quelle.\n')
w(f'**Korpus:** {sum(nfiles.values())} eindeutige Presets – '+', '.join(f'{k}: {v}' for k,v in nfiles.items())+'.  ')
w('Wurzelelemente: '+', '.join(f'`{k}` {v}' for k,v in roots.items())+'.  ')
w('Zeitliche Verteilung (Forum: Upload-Jahr): '+', '.join(f'{k}: {v}' for k,v in sorted(years.items()))+'.\n')
w('## Funktionen (Trailer-Wort 2)\n\n| Wurzel | Code | Name | Belege |\n|---|---|---|---|')
for (root,f),v in sorted(funcs.items()): w(f'| {root} | {f} | {name("functions",f)} | {v} |')
w(f'\nTrailer-Wort 5 (Version): '+', '.join(f'`0x{k:X}` × {v}' for k,v in sorted(trailer5.items()))+' – `0x1100` in allen Dateien ab Cubase 12.\n')
w('## Bedingungen (Filterklasse, Code)\n\n| Klasse | Code | Name | Belege |\n|---|---|---|---|')
for (cls,c),v in sorted(cond.items(),key=lambda x:(x[0][1],x[0][0])): w(f'| `{cls}` | {c} | {name("conditions",c)} | {fmt(v)} |')
w('\n## Aktionsziele (Klasse, Target-ID)\n\n| Klasse | ID | Name | Belege |\n|---|---|---|---|')
for (cls,t),v in sorted(act.items(),key=lambda x:(x[0][1],x[0][0])): w(f'| `{cls}` | {t} | {name("action_targets",t)} | {fmt(v)} |')
w('\n## Operationen (Target-ID, Op-Code)\n\n| Target | Op | Name | Belege |\n|---|---|---|---|')
for (t,o),v in sorted(ops.items()): w(f'| {t} {name("action_targets",t)} | {o} | {name("operations",o)} | {fmt(v)} |')
w('\n## Aufzählungswerte\n\n| Klasse | Wert | Name | Belege |\n|---|---|---|---|')
tbl={'LeTypeValue':'event_types','LeFlagsValue':'properties','LeContainerTypeValue':'container_types','LeMediaTypeValue':'media_types','LeGenericOpValue':'generic_op','ContextVar':'context_variables'}
for (cls,val),v in sorted(enum.items(),key=lambda x:(x[0][0],x[0][1])): w(f'| `{cls}` | {val} | {name(tbl[cls],val)} | {fmt(v)} |')
w('\n## Klassen (Vorkommen)\n\n| Klasse | Belege |\n|---|---|')
for cls,v in sorted(classes.items()): w(f'| `{cls}` | {fmt(v)} |')
open('/home/user/LE-Tamer/docs/10-belege.md','w').write('\n'.join(L)+'\n'); print('docs/10-belege.md written,',len(L),'lines')
