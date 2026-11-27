#!/usr/bin/env python3
"""Colophon 스킨 zip 만들기

    python3 tools/build.py                                  # 기본판 → dist/colophon-{버전}.zip
    python3 tools/build.py --preset presets/example.json    # 프리셋을 넣은 판
    python3 tools/build.py --preset my.json --out my-skin.zip

프리셋(JSON)은 스킨 옵션이 비어 있을 때 대신 보일 값이다.
티스토리는 스킨을 다시 올리면 스킨 편집 옵션을 지우므로(글 옵션은 빈칸, 선택 옵션은 첫 항목),
자기 블로그 값을 프리셋으로 넣어 두면 다시 올려도 소개·프로필·푸터가 유지된다.
같은 값은 index.xml의 옵션 기본값에도 들어간다.

프리셋 키: heroKicker, heroTitle, heroDesc, profileDesc, techStack, githubUrl, contactEmail,
          footerText, copyrightStart, mastheadText, defaultTheme(light|dark|system)
"""
import argparse
import html
import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIN = ROOT / 'skin'
FILES = ['skin.html', 'style.css', 'index.xml', 'images/script.js',
         'preview1600.jpg', 'preview560.jpg', 'preview256.jpg', 'preview.gif']
TEXT_KEYS = ['heroKicker', 'heroTitle', 'heroDesc', 'profileDesc', 'techStack', 'githubUrl',
             'contactEmail', 'footerText', 'copyrightStart', 'mastheadText']
SCRIPT_KEYS = ['mastheadText', 'techStack']          # 스크립트가 읽는 값 (#colophon-cfg data-preset)


def render_skin_html(src: str, preset: dict) -> str:
    # {{preset.json}}: 스크립트용 값 (작은따옴표 속성 안)
    data = {k: preset[k] for k in SCRIPT_KEYS if preset.get(k)}
    src = src.replace('{{preset.json}}', html.escape(json.dumps(data, ensure_ascii=False), quote=True))

    # <s_not_var_X>{{preset.X|틀}}</s_not_var_X>: 값이 있으면 채우고, 없으면 블록째 지운다
    def block(m):
        name, key, tpl = m.group(1), m.group(2), m.group(3)
        val = preset.get(key, '')
        if not val:
            return ''
        v = html.escape(str(val), quote=True)
        body = tpl.replace('{v}', v) if tpl is not None else v
        return '<s_not_var_%s>%s</s_not_var_%s>' % (name, body, name)

    src = re.sub(r'<s_not_var_(\w+)>\{\{preset\.(\w+)(?:\|(.*?))?\}\}</s_not_var_\1>', block, src, flags=re.S)
    left = re.findall(r'\{\{preset[^}]*\}\}', src)
    if left:
        sys.exit('처리하지 못한 자리표시: %s' % left)
    return src


def render_index_xml(src: str, preset: dict) -> str:
    for key in TEXT_KEYS:
        if preset.get(key):
            val = str(preset[key]).replace(']]>', ']]]]><![CDATA[>')
            src, n = re.subn(r'(<name>%s</name>.*?<value>)<!\[CDATA\[.*?\]\]>(</value>)' % key,
                             lambda m: m.group(1) + '<![CDATA[' + val + ']]>' + m.group(2), src, count=1, flags=re.S)
            if not n:
                sys.exit('index.xml에 옵션이 없습니다: %s' % key)
    theme = preset.get('defaultTheme')
    if theme:
        if theme not in ('light', 'dark', 'system'):
            sys.exit('defaultTheme은 light, dark, system 중 하나여야 합니다')
        src = re.sub(r'(<name>defaultTheme</name>.*?<value>)\w+(</value>)', r'\g<1>%s\2' % theme, src, count=1, flags=re.S)
    return src


def main():
    ap = argparse.ArgumentParser(description='Colophon 스킨 zip 만들기')
    ap.add_argument('--preset', help='프리셋 JSON 파일')
    ap.add_argument('--out', help='출력 zip 경로 (기본: dist/colophon-{버전}.zip)')
    a = ap.parse_args()

    preset = {}
    if a.preset:
        preset = json.loads(Path(a.preset).read_text(encoding='utf-8'))
        unknown = set(preset) - set(TEXT_KEYS) - {'defaultTheme', '$comment'}
        if unknown:
            sys.exit('알 수 없는 프리셋 키: %s' % sorted(unknown))

    index = (SKIN / 'index.xml').read_text(encoding='utf-8')
    version = re.search(r'<version>([^<]+)</version>', index).group(1).strip()
    out = Path(a.out) if a.out else ROOT / 'dist' / ('colophon-%s.zip' % version)
    out.parent.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for name in FILES:
            p = SKIN / name
            if name == 'skin.html':
                z.writestr(name, render_skin_html(p.read_text(encoding='utf-8'), preset))
            elif name == 'index.xml':
                z.writestr(name, render_index_xml(p.read_text(encoding='utf-8'), preset))
            else:
                z.write(p, name)
    print('built', out, '(Colophon %s%s)' % (version, ', preset: ' + a.preset if a.preset else ''))


if __name__ == '__main__':
    main()
