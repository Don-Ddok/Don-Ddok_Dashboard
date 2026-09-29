"""캠페인 데이터(팀 매칭 모델 live_data.json)를 공개용으로 바꾼다.

1~4곳인 칸은 법인이 특정될 수 있어 -1("5곳 미만")로 바꾼다. 화면 코드(src/data/campaign.ts)는 -1을 "5곳 미만"으로 읽는다.
대상: 요약 값, 업종·중분류의 법인수와 페르소나 분포, 추천 칸의 법인수·대표조합_법인수.
이미 보유한 비율(한도조건조정_비율)은 칸이 작으면 화면에서 숨긴다.

실행: python scripts/mask-campaign.py <live_data.json 경로>   → public/data/campaign.json
"""
import json
import sys
from pathlib import Path

SMALL = 5
OUT = Path(__file__).resolve().parents[1] / 'public' / 'data' / 'campaign.json'


def m(n):
    return -1 if isinstance(n, int) and 0 < n < SMALL else n


def mask_persona(p):
    return {k: m(v) for k, v in p.items()}


def mask_cell(c):
    if not c:
        return c
    c = dict(c)
    c['법인수'] = m(c['법인수'])
    c['대표조합_법인수'] = m(c['대표조합_법인수'])
    return c


def main(src):
    d = json.loads(Path(src).read_text(encoding='utf-8'))
    for months in d['지역'].values():
        for rm in months.values():
            rm['요약'] = {k: m(v) for k, v in rm['요약'].items()}
            for ind in rm['업종']:
                ind['법인수'] = m(ind['법인수'])
                ind['페르소나'] = mask_persona(ind['페르소나'])
                for mid in ind.get('중분류', []):
                    mid['법인수'] = m(mid['법인수'])
                    mid['페르소나'] = mask_persona(mid['페르소나'])
            rm['추천'] = [mask_cell(c) for c in rm['추천']]
            rm['비노출_일반'] = mask_cell(rm['비노출_일반'])
    d['meta']['주의'] = d['meta']['주의'] + '. 공개용: 1~4곳인 칸은 -1(5곳 미만)로 가림'
    text = json.dumps(d, ensure_ascii=False, separators=(',', ':'))
    left = [n for n in __import__('re').findall(r'"(?:법인수|대표조합_법인수|[A-E]|노출법인|수출형|수입형|비노출법인)":(\d+)', text) if 0 < int(n) < SMALL]
    assert not left, f'가려지지 않은 작은 칸 {len(left)}개'
    OUT.write_text(text, encoding='utf-8')
    print(f'저장: {OUT} ({len(text) / 1e3:.0f} KB)')


if __name__ == '__main__':
    main(sys.argv[1])
