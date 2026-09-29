"""팀 매칭 모델 데이터(demo/live_data.json)를 공개용 파일 두 개로 나눈다.

- public/data/campaign.json : 이번 달 추천(단계 × 업종 × 페르소나 × 추천 상품)
- public/data/insight.json  : 팀 인사이트(지역 수출, 요구불 반응, 업종 노출, 상품 보유, 법인 군집, 가설 검증)

1~4곳인 칸은 법인이 특정될 수 있어 -1("5곳 미만")로 바꾼다. 화면 코드는 -1을 "5곳 미만"으로 읽는다.
작은 칸에서 나온 비율(업종 노출 비중)은 함께 지운다(null).

실행: python scripts/mask-campaign.py <live_data.json 경로>
"""
import json
import re
import sys
from pathlib import Path

SMALL = 5
DATA = Path(__file__).resolve().parents[1] / 'public' / 'data'


def m(n):
    return -1 if isinstance(n, int) and not isinstance(n, bool) and 0 < n < SMALL else n


def mask_dict(d):
    return {k: m(v) for k, v in d.items()}


def mask_cell(c):
    if not c:
        return c
    c = dict(c)
    c['법인수'] = m(c['법인수'])
    c['대표조합_법인수'] = m(c['대표조합_법인수'])
    return c


def campaign(d):
    for months in d['지역'].values():
        for rm in months.values():
            rm['요약'] = mask_dict(rm['요약'])
            for ind in rm['업종']:
                ind['법인수'] = m(ind['법인수'])
                ind['페르소나'] = mask_dict(ind['페르소나'])
                for mid in ind.get('중분류', []):
                    mid['법인수'] = m(mid['법인수'])
                    mid['페르소나'] = mask_dict(mid['페르소나'])
            rm['추천'] = [mask_cell(c) for c in rm['추천']]
            rm['비노출_일반'] = mask_cell(rm['비노출_일반'])
    meta = d['meta']
    # 상품 안내 링크: 예전 데이터는 '상품몰', 새 데이터는 '홈페이지'
    meta['링크'] = meta.pop('상품몰', None) or meta.pop('홈페이지', None)
    meta['링크이름'] = '상품몰' if 'fpm' in (meta['링크'] or '') else '홈페이지'
    meta['주의'] = meta['주의'] + '. 공개용: 1~4곳인 칸은 5곳 미만으로 가림'
    return d


def insight(ins):
    for x in ins['업종노출']:
        small = 0 < x['노출'] < SMALL
        for k in ('노출', '수출형', '수입형'):
            x[k] = m(x[k])
        if small:
            x['노출비중'] = None
    for g in ins['상품관계']['집단']:
        g['법인수'] = m(g['법인수'])
    for g in ins['클러스터']['군집']:
        g['법인수'] = m(g['법인수'])
        for k in ('지역', '세그먼트', '페르소나'):
            g[k] = mask_dict(g[k])
        for u in g['업종상위']:
            u['법인수'] = m(u['법인수'])
    return ins


def check(text, name):
    keys = r'법인수|대표조합_법인수|[A-E]|노출법인|수출형|수입형|비노출법인|노출|대구|경북'
    left = [n for n in re.findall(rf'"(?:{keys})":(\d+)(?![.\d])', text) if 0 < int(n) < SMALL]
    assert not left, f'{name}: 가려지지 않은 작은 칸 {len(left)}개'


def main(src):
    d = json.loads(Path(src).read_text(encoding='utf-8'))
    ins = d.pop('인사이트', None)
    for name, obj in [('campaign.json', campaign(d)), ('insight.json', insight(ins) if ins else None)]:
        if obj is None:
            continue
        text = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
        check(text, name)
        (DATA / name).write_text(text, encoding='utf-8')
        print(f'저장: public/data/{name} ({len(text) / 1e3:.0f} KB)')


if __name__ == '__main__':
    main(sys.argv[1])
