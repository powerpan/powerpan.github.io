#!/usr/bin/env python3
"""Zip only the verified public package, with reproducible archive metadata."""
import hashlib
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / 'release-manifest.json').read_text())
dist = ROOT / 'dist'
actual = {p.relative_to(dist).as_posix() for p in dist.rglob('*') if p.is_file()}
if actual != set(manifest['files']):
    raise SystemExit('Public package file inventory has changed; rebuild before packaging.')
target = ROOT / 'webblog-reimagined-production.zip'
temporary = target.with_suffix('.zip.tmp')
with zipfile.ZipFile(temporary, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    for rel, expected in sorted(manifest['files'].items()):
        data = (dist / rel).read_bytes()
        if hashlib.sha256(data).hexdigest() != expected['sha256']:
            raise SystemExit('Public package checksum mismatch: ' + rel)
        entry = zipfile.ZipInfo(rel, date_time=(1980, 1, 1, 0, 0, 0))
        entry.compress_type = zipfile.ZIP_DEFLATED
        entry.external_attr = 0o100644 << 16
        archive.writestr(entry, data)
temporary.replace(target)
print(f'Packaged {len(actual)} public files: {target} ({target.stat().st_size:,} bytes)')
