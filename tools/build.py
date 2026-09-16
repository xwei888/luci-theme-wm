"""Build an architecture-independent opkg package without a cross compiler."""
from pathlib import Path
import io, tarfile, time

source=Path(__file__).resolve().parents[1]
root=source.parent
out=root/'dist'
out.mkdir(exist_ok=True)
license_path=source/'LICENSE'
if not license_path.exists():
    raise SystemExit('LICENSE is required in the source distribution')

def tar_bytes(files):
    stream=io.BytesIO()
    with tarfile.open(fileobj=stream,mode='w:gz',format=tarfile.GNU_FORMAT) as tar:
        directories=set()
        for path,_,_ in files:
            parts=path.split('/')[:-1]
            for count in range(1,len(parts)+1):
                directories.add('/'.join(parts[:count]))
        for directory in sorted(directories,key=lambda value:(value.count('/'),value)):
            item=tarfile.TarInfo('./'+directory+'/')
            item.type=tarfile.DIRTYPE;item.mode=0o755;item.uid=0;item.gid=0
            tar.addfile(item)
        for path,content,mode in files:
            item=tarfile.TarInfo('./'+path)
            item.size=len(content);item.mode=mode;item.uid=0;item.gid=0;item.mtime=int(time.time())
            tar.addfile(item,io.BytesIO(content))
    return stream.getvalue()

data=[]
for folder,prefix in [('htdocs','www'),('ucode','usr/share/ucode/luci'),('root','')]:
    for file in sorted((source/folder).rglob('*')):
        if file.is_file():
            dest=(prefix+'/' if prefix else '')+file.relative_to(source/folder).as_posix()
            data.append((dest,file.read_bytes(),0o755 if 'uci-defaults/' in dest else 0o644))
for name in ['NOTICE','LICENSE']:
    data.append(('usr/share/doc/luci-theme-wm/'+name,(source/name).read_bytes(),0o644))

control=f'''Package: luci-theme-wm
Version: 1.13.26-1
Architecture: all
Maintainer: wm contributors
Section: luci
Priority: optional
Depends: luci-base
License: Apache-2.0
Installed-Size: {sum(len(x[1]) for x in data)}
Description: wm dark theme with centered login and sidebar
'''
postinst='''#!/bin/sh
[ -n "$IPKG_INSTROOT" ] && exit 0
/bin/sh /etc/uci-defaults/30-luci-theme-wm
exit 0
'''
prerm='''#!/bin/sh
[ -n "$IPKG_INSTROOT" ] && exit 0
if [ "$(uci -q get luci.main.mediaurlbase)" = '/luci-static/wm' ]; then
 uci set luci.main.mediaurlbase='/luci-static/bootstrap'
fi
if [ "$(uci -q get luci.themes.wm)" = '/luci-static/wm' ]; then
 uci -q delete luci.themes.wm
fi
uci commit luci
exit 0
'''
members=[('debian-binary',b'2.0\n'),('control.tar.gz',tar_bytes([('control',control.encode(),0o644),('postinst',postinst.encode(),0o755),('prerm',prerm.encode(),0o755)])),('data.tar.gz',tar_bytes(data))]
package=out/'luci-theme-wm_1.13.26-1_all.ipk'
package.write_bytes(tar_bytes([(name,content,0o644) for name,content in members]))
with tarfile.open(out/'luci-theme-wm-source.tar.gz','w:gz') as tar:
    # Keep local QA, device backups, credentials and Git metadata out of releases.
    public_files=['Makefile','README.md','CHANGELOG.md','LICENSE','NOTICE','.gitignore','.gitattributes']
    for folder in ['htdocs','root','ucode','tools','docs']:
        public_files.extend(path.relative_to(source).as_posix()
                            for path in (source/folder).rglob('*')
                            if path.is_file() and '__pycache__' not in path.parts
                            and path.suffix not in ('.pyc','.pyo'))
    for name in sorted(public_files):
        path=source/name
        if path.is_file():
            tar.add(path,arcname=source.name+'/'+name)
print(f'Built {package} ({package.stat().st_size} bytes); {len(data)} package files')
