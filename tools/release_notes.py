#!/usr/bin/env python3
"""CHANGELOG.md에서 한 버전의 절을 꺼내 릴리즈 노트로 출력한다.

    python3 tools/release_notes.py 1.1.0 > notes.md

"## 1.1.0 — 2026-12-01" 같은 제목 아래, 다음 "## " 전까지가 노트다.
절이 없거나 내용이 비어 있으면 실패한다 (버전을 올릴 때 주요 수정 내용을 꼭 적게 하려는 것).
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main():
    if len(sys.argv) != 2:
        sys.exit('사용법: release_notes.py 버전')
    ver = sys.argv[1].lstrip('v')
    text = (ROOT / 'CHANGELOG.md').read_text(encoding='utf-8')
    m = re.search(r'^## %s(?:\s|$).*?\n(.*?)(?=^## |\Z)' % re.escape(ver), text, flags=re.M | re.S)
    if not m or not m.group(1).strip():
        sys.exit('CHANGELOG.md에 "## %s — 날짜" 절과 주요 수정 내용을 적어 주세요.' % ver)
    body = m.group(1).strip()
    print(body)
    print('\n---\n설치: 아래 `colophon-%s.zip`을 받아 티스토리 **관리 → 꾸미기 → 스킨 변경 → 스킨 등록**에서 올립니다. '
          '스킨을 다시 올리면 티스토리가 스킨 편집 옵션을 지우니, 옵션 값을 다시 확인하세요.' % ver)


if __name__ == '__main__':
    main()
