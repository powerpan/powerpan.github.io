#!/usr/bin/env python3
"""Optional font-maintenance utility; ordinary site builds need only the stdlib.

Pass full Google Fonts Noto Serif SC / Noto Sans SC TTF paths, in that order.
Requires fontTools. WOFF uses stdlib zlib, so Brotli is not needed.
"""
from pathlib import Path
import sys
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parent.parent
texts = '\n'.join(p.read_text() for p in root.rglob('*.html'))
texts += '\n'.join(p.read_text() for p in (root / 'js').glob('*.js'))
chars = {ord(c) for c in texts if 0x2e80 <= ord(c) <= 0x9fff or 0xf900 <= ord(c) <= 0xffef}
for name, source in zip(['serif','sans'], sys.argv[1:]):
    target = root / 'assets/fonts' / f'noto-{name}-sc-content.woff'
    # Adding an article must not drop glyphs used by older pages or UI states.
    requested = chars | (set(TTFont(target).getBestCmap()) if target.exists() else set())
    font = TTFont(source)
    if 'fvar' in font:
        font = instantiateVariableFont(font, {'wght':400 if name == 'serif' else (300,700)}, inplace=True)
    opts = subset.Options()
    opts.name_IDs = ['*']
    opts.name_legacy = True
    opts.name_languages = ['*']
    sub = subset.Subsetter(options=opts)
    sub.populate(unicodes=requested)
    sub.subset(font)
    font.flavor = 'woff'
    font.save(target)
    print(f'{target.name}: {len(requested)} requested characters, {target.stat().st_size:,} bytes')
