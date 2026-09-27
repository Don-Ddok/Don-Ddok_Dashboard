// 계정 시차 지도: 수출 흐름의 어느 단계에서 어떤 은행 계정이 움직이는가
// 예상 시차: 돈독 팀 분석 문서 "지역 수출 대비 은행 계정의 예상 시차"(2026-09-23)
// 결과: 팀 중간보고서의 시차 분석(예비 관찰, 이 화면에서 재현하지 않음)

/**
 * 예상과 결과의 대조. 화면에서는 다른 화면과 같은 선 모양으로 보인다.
 * match 일치(굵은 실선) / differ 예상과 다름·판단 보류(굵은 점선) / untested 미검정(가는 선) / outside 관측 창 밖(점선) / reference 기준 계열
 */
export type TimingResult = 'match' | 'differ' | 'untested' | 'outside' | 'reference'

export const RESULT_LABEL: Record<TimingResult, string> = {
  match: '일치',
  differ: '예상과 다름·보류',
  untested: '미검정',
  outside: '관측 창 밖',
  reference: '기준',
}

export interface Account {
  name: string
  expected: string // 예상 시차
  result: TimingResult
  observed?: string // 중간보고서 결과
  note?: string
}

export interface Stage {
  no: number
  name: string
  what: string
  timing: '선행' | '동행' | '후행'
  accounts: Account[]
}

export const STAGES: Stage[] = [
  {
    no: 1,
    name: '원자재 확보',
    what: '원자재를 수입하거나 국내에서 사들인다',
    timing: '선행',
    accounts: [
      { name: '수입실적', expected: '선행 1~3개월', result: 'untested', note: '주문이 줄면 선적보다 원자재 수입을 먼저 줄인다' },
      { name: '기업구매자금', expected: '선행 1~3개월', result: 'untested', note: '국내 원자재 대금용 대출, 매입은 선적보다 먼저' },
    ],
  },
  {
    no: 2,
    name: '생산·납품',
    what: '협력업체가 납품하고 생산 비용이 나간다',
    timing: '선행',
    accounts: [
      { name: '외상매출채권담보', expected: '선행 0~2개월', result: 'untested', note: '협력업체 납품은 원청의 선적보다 먼저' },
      { name: '요구불 출금', expected: '선행 0~2개월', result: 'untested', note: '원자재 대금·임금·외주비가 생산 단계에서 나감' },
    ],
  },
  {
    no: 3,
    name: '선적',
    what: '지역 수출통계에 기록되는 기준 시점',
    timing: '동행',
    accounts: [
      { name: '수출실적', expected: '동행', result: 'reference', note: '지역 수출통계와 같은 선적 거래' },
      {
        name: '요구불예금 잔액',
        expected: '동행',
        result: 'match',
        observed: 'k = 0',
        note: '출금(선행)과 입금(후행)이 섞인 값',
      },
      { name: '법인카드', expected: '동행~후행 0~2개월', result: 'match', observed: 'k = 0, 3개월 안에 사라짐' },
    ],
  },
  {
    no: 4,
    name: '대금 회수',
    what: '결제 기간을 거쳐 수출·납품 대금이 들어온다',
    timing: '후행',
    accounts: [
      { name: '요구불 입금', expected: '동행~후행 0~2개월', result: 'untested', note: '수출대금은 선적 뒤에 들어옴' },
      {
        name: '할인어음',
        expected: '후행 1~3개월',
        result: 'differ',
        observed: 'k = 0(예상보다 빠름)',
        note: '월 단위 자료라 1개월 차이가 같은 달로 묶였을 수 있음',
      },
    ],
  },
  {
    no: 5,
    name: '부족 대응',
    what: '들어온 돈이 모자라면 한도를 꺼내 쓰거나 예금·투자자산을 처분한다',
    timing: '후행',
    accounts: [
      { name: '당좌대출', expected: '후행 1~3개월', result: 'untested', note: '입금이 줄어 잔액이 모자라야 꺼내 씀' },
      { name: '수익증권·신탁', expected: '후행 2~6개월', result: 'untested', note: '잔고·당좌로도 부족할 때 처분' },
      { name: '거치식예금', expected: '후행 3~9개월', result: 'match', observed: 'k = 6', note: '해지하면 이자 손해라 마지막에 깸' },
    ],
  },
  {
    no: 6,
    name: '차입·투자 조정',
    what: '대출 신청·심사, 한도 갱신, 설비투자 결정',
    timing: '후행',
    accounts: [
      {
        name: '운전자금대출',
        expected: '후행 3~9개월',
        result: 'match',
        observed: 'k = 6(시점 일치, 전체 평균은 약함)',
        note: '파트 3: 6개월 창에서 노출·비노출 차이(약한 증거)',
      },
      { name: '여신한도', expected: '후행 9~12개월 이상', result: 'differ', observed: 'k = 6(판단 보류)', note: '연 1회 갱신, 사양에 따라 결과가 달라짐' },
      { name: '무역금융', expected: '선행과 후행이 섞임', result: 'differ', observed: 'h = 3~5, 위약검정 실패(보류)', note: '신용장기준(선행)과 실적기준(후행)을 구분할 수 없음' },
      { name: '시설자금', expected: '후행 12개월 이상', result: 'outside', observed: '무반응', note: '12개월 창으로는 측정 불가, "효과 없음"이 아님' },
    ],
  },
]

/** 수출 흐름과 무관해 어느 시차에서도 반응하지 않아야 하는 계정(위약검정용) */
export const UNRELATED: Account[] = [
  { name: '주택자금대출', expected: '무반응', result: 'untested', note: '임직원 주택·사옥 자금' },
  { name: '에너지절약시설', expected: '무반응', result: 'untested', note: '정부 사업 일정에 따른 정책자금' },
  { name: '퇴직연금', expected: '무반응', result: 'untested', note: '임금과 근속으로 정해짐' },
]

export const TIMING_SOURCE =
  '예상 시차: 돈독 팀 분석 문서 "지역 수출 대비 은행 계정의 예상 시차"(2026-09-23). 결과: 팀 중간보고서 시차 분석(예비 관찰, 이 화면에서 재현하지 않음)'
