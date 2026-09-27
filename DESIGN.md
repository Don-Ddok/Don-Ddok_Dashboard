---
name: 거래처 참고 신호 월보
description: 수출 경기와 거래처 계좌 흐름을 월간 통계 보도자료 형식으로 읽는 기업금융 담당자용 화면
colors:
  paper: "#f6f7f5"
  paper-shade: "#e6f0ee"
  paper-raise: "#fbfbfa"
  ink: "#1b1e23"
  ink-2: "#464c55"
  ink-3: "#5f6570"
  rule: "#d5dae1"
  rule-mid: "#aab1bb"
  mint: "#00b39b"
  on-mint: "#0b2420"
  accent: "#007d6c"
  accent-ink: "#00705f"
  accent-wash: "#daf3ee"
  up: "#00a08a"
  down: "#c9542c"
  down-ink: "#a8401d"
  down-wash: "#f7e4dc"
  region-dg: "#2f5fb3"
  region-gb: "#7b4f93"
typography:
  display:
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, Apple SD Gothic Neo, Malgun Gothic, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.35
  title:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
  body:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "'tnum' 1"
  table:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    fontFeature: "'tnum' 1"
  label:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
  micro:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
rounded:
  none: "0"
spacing:
  s-1: "4px"
  s-2: "8px"
  s-3: "12px"
  s-4: "16px"
  s-5: "24px"
  s-6: "32px"
  s-7: "48px"
  s-8: "64px"
components:
  release-band:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.on-mint}"
    rounded: "{rounded.none}"
  release-label:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    padding: "8px 16px"
  section-number:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.on-mint}"
    size: "24px"
  table-header:
    backgroundColor: "{colors.paper-shade}"
    textColor: "{colors.ink}"
    typography: "{typography.table}"
    padding: "8px 12px"
  table-row-current:
    backgroundColor: "{colors.accent-wash}"
  badge-current:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    padding: "0 5px"
  segmented-selected:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    height: "40px"
  expand-button:
    backgroundColor: "{colors.paper-raise}"
    textColor: "{colors.ink}"
    padding: "2px 8px"
  region-tag-daegu:
    backgroundColor: "{colors.region-dg}"
    textColor: "#ffffff"
    padding: "0 6px"
  region-tag-gyeongbuk:
    backgroundColor: "{colors.region-gb}"
    textColor: "#ffffff"
    padding: "0 6px"
---

# Design System: 거래처 참고 신호 월보

## Overview

**Creative North Star: "보도자료 용지"**

이 화면은 대시보드가 아니라 통계청 보도자료를 닮은 한 장의 종이입니다. 옅은 종이 바탕에 먹색 글자, 회색 괘선으로 칸을 나누고, 민트 하나로 지금 보고 있는 달과 누를 수 있는 곳을 짚습니다. 사이드바, 네 칸짜리 지표 카드, 네온 선 그래프 같은 관리자 화면의 기본값은 쓰지 않습니다.

위계는 글자 크기와 간격, 괘선의 굵기로만 만듭니다. 카드 상자, 그림자, 둥근 모서리 없이 섹션 제목 아래 굵은 먹선, 표 머리 음영, 행 사이 가는 선이 구조를 말합니다. 정보 밀도는 높게 두되, 한 줄 요지와 "주:·자료:" 각주로 무엇을 어떻게 읽어야 하는지 먼저 알려 줍니다.

상태는 색이 아니라 **선 모양**으로 구분합니다. 같은 선 모양 규칙이 근거 잇기, 신호 이력, 범례, 증거의 세기 눈금까지 이어져, 한 번 익히면 모든 화면에서 읽힙니다.

**Key Characteristics:**
- 종이·먹·괘선·민트 하나(두 단계)의 보도자료 세계
- 선 모양 문법: 굵은 실선 충족, 굵은 점선 기준 근접, 가는 실선 미충족, 점선 해당 없음
- 섹션마다 민트 네모 번호(1, 2, 3)와 굵은 먹선
- 숫자는 표 정렬 숫자(tabular), 빼기는 U+2212
- 모서리 0, 그림자 0

## Colors

옅은 종이 위의 먹과 괘선이 대부분을 차지하고, 민트는 두 단계로 나눠 면과 글자에 각각 씁니다.

### Primary
- **보도자료 민트** (#00b39b): 머리 띠, 섹션 번호 네모, 증가 막대처럼 **면**으로만 씁니다. 위 글자는 흰색이 아니라 어두운 먹녹색(#0b2420, 대비 약 6.2:1).
- **짙은 민트** (#007d6c): 현재 위치(탭 밑줄, 기준월 세로선, 당월 표시), 선택된 필터, 주요 조작처럼 **선과 작은 면**. 흰 글자와 대비 약 5.1:1.
- **민트 글자** (#00705f): 링크와 강조 숫자. 종이 위 대비 약 5.6:1.
- **민트 물** (#daf3ee): 기준월 행·칸의 옅은 바탕.

### Secondary
- **감소 주황** (#c9542c, 글자 #a8401d): 1년 전보다 줄어든 막대와 숫자, 흐름선의 판정 구간. 증가는 민트(#00a08a).

### Tertiary
- **대구 청색** (#2f5fb3), **경북 자주** (#7b4f93): 지역 칩과 상세 그래프의 지역 선에만.

### Neutral
- **종이** (#f6f7f5): 바탕. **표 머리 음영** (#e6f0ee), **펼친 행** (#fbfbfa).
- **먹** (#1b1e23): 본문, 굵은 괘선. **먹 2** (#464c55): 보조 본문. **먹 3** (#5f6570): 각주·캡션.
- **괘선** (#d5dae1): 행 사이. **중간 괘선** (#aab1bb): 미충족 선, 입력칸 테두리.

### Named Rules
**두 민트 규칙.** 밝은 민트는 면, 짙은 민트는 선과 글자. 밝은 민트 위에 흰 글자를 올리지 않는다(대비 2.7:1).

**색은 보조 규칙.** 증감은 기준선 위·아래와 부호, 상태는 선 모양, 지역은 이름으로 함께 표시한다. 색만으로 뜻을 전하지 않는다.

## Typography

**Font:** Pretendard Variable (프로젝트 안에 포함, 대체: Apple SD Gothic Neo, Malgun Gothic)

**Character:** 한 가지 한글 산세리프로 크기와 굵기만 바꿔 보도자료의 차분한 위계를 만든다. 숫자는 전부 표 정렬 숫자.

### Hierarchy
- **Display** (800, 2rem, 1.1, 자간 -0.045em): 제호 "거래처 참고 신호 월보"에만.
- **Headline** (700, 1.75rem, 1.35): 화면마다 한 문장 요지. 핵심 숫자는 증감 색과 굵은 밑줄.
- **Title** (700, 1.125rem): 섹션 제목(번호 네모와 함께).
- **Body** (400, 0.9375rem, 1.6): 설명 문단, 65ch 안팎.
- **Table** (400, 0.8125rem): 통계표. 머리는 600.
- **Label** (600, 0.75rem): 칸 이름, 범례, 각주.
- **Micro** (700, 0.6875rem): "당월"·기준월 값 표시 같은 작은 표지와 폰의 막대 값에만.

단계는 고정 rem(비율 약 1.2)이며 화면 폭에 따라 늘리지 않는다.

## Layout

- 본문 폭 최대 72rem, 좌우 여백 24px(폰 16px).
- 간격 단계 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64px.
- 월보 첫 화면: 머리 → 한 줄 요지 → 지역 수출(표 7 : 막대 5) → 살펴볼 거래처. 1440×900에서 살펴볼 거래처 첫 행까지 보이게 유지한다.
- 근거와 한계: 본문 + 오른쪽 20rem 핵심 숫자 열(1024px 이상), 좁으면 핵심 숫자가 제목 바로 아래로.
- 거래처 상세: 네 칸 사실표, 그래프는 1024px 이상에서 2열.
- 구간: 640px(폰), 860px(지역 수출 1열), 1024px(2열 전환). 폰에서 표는 칸을 줄이고, 넘치면 표 영역만 옆으로 밀며 안내 문구를 띄운다.

## Elevation & Depth

그림자를 쓰지 않는 평면 체계다. 깊이는 표 머리 음영, 펼친 행의 한 단계 밝은 바탕, 굵기가 다른 괘선으로 만든다. 대화 상자(그래프 크게 보기)도 그림자 없이 먹색 1px 테두리, 위쪽 민트 6px 띠, 먹색 60% 뒷막으로 띄운다.

한 가지 예외로 페이지 맨 위 양쪽 끝에 민트·청색의 옅은 빛번짐이 있다(요청에 따라 넣은 장식, 스크롤하면 함께 올라가 표 뒤에는 깔리지 않음). 새 화면으로 넓히지 않는다.

### Named Rules
**괘선이 깊이 규칙.** 떠 보이게 하고 싶으면 그림자 대신 선을 굵게 하거나 바탕을 한 단계 바꾼다.

## Shapes

모든 모서리는 0이다. 형태 언어는 괘선이다. 섹션 제목 아래 2px 먹선, 표 아래 1px 먹선, 행 사이 1px 괘선, 제호 아래 3px + 1px 겹줄. 둥근 모양은 흐림 장식 안쪽에만 있고 보이는 테두리로 드러나지 않는다.

## Components

### 머리(보도자료 띠와 제호)
- 띠: 밝은 민트 바탕에 옅은 사선 괘선 무늬, 왼쪽에 짙은 민트 "보도자료" 도장(흰 글자, 자간 0.18em), 시연용 표시, 제목, 오른쪽 담당.
- 제호: 보도자료 표지 모양 표장 + Display 제목, 오른쪽 기준월 선택. 아래 겹줄.

### 섹션 제목
- 민트 네모(24px) 안 번호가 화면마다 자동으로 1, 2, 3 매겨지고, 제목 아래 2px 먹선. 오른쪽에 단위·기준 설명.

### 통계표
- 머리 음영 #e6f0ee, 머리 아래 1px 먹선, 행 사이 1px 괘선, 마지막 행 아래 1px 먹선. 숫자는 오른쪽 정렬.
- 기준월 행: 민트 물 바탕, 굵게, "당월" 표시(짙은 민트, 흰 글자).
- 증감 숫자: 감소 주황 글자, 증가 민트 글자.

### 버튼과 선택
- 기준월 선택: 먹 1px 테두리, 좌우 화살표 버튼, 가운데 월 선택.
- 필터(구간 선택): 중간 괘선 테두리, 선택은 짙은 민트 바탕 흰 글자.
- 상태 개수 줄: 다섯 칸, 선택 칸은 민트 물 바탕과 위쪽 4px 짙은 민트 선.
- "근거" 펼치기: 옅은 바탕, 중간 괘선 테두리, 펼치면 짙은 민트 테두리와 화살표 뒤집힘.

### 지역 칩
- 대구 청색, 경북 자주 바탕에 흰 글자(대비 6.2:1 안팎), 모서리 0.

### 근거 잇기(대표 구성 요소)
- 세 조건이 가로 한 줄의 밑줄 칸으로 놓이고, 칸 밑줄과 칸 사이 연결선이 같은 바닥선에서 이어진다. 선 모양이 상태를 말하고, 연결선은 두 칸 중 약한 쪽을 따른다. 펼칠 때 왼쪽부터 차례로 그어진다. 폰에서는 세로로 쌓이고 짧은 세로선으로 잇는다.

### 증감 막대와 흐름선
- 전년동월비 막대: 기준선 위 민트, 아래 주황. 기준월 칸은 민트 물 바탕과 위쪽 짙은 민트 선.
- 표 안 흐름선(96×24): 앞 구간 중간 괘선, 마지막 3개월 주황 굵게, 끝점.

### 그래프와 크게 보기
- 제목 줄 오른쪽에 기준월 값, 기준월에 짙은 민트 세로선과 월 표시.
- 그래프를 누르면 대화 상자로 크게 본다. Esc·닫기·바깥 클릭으로 닫히고 초점이 그래프로 돌아온다.

### 증거의 세기 눈금
- 근거 없음(가는 선) · 약한 증거(굵은 점선, 민트 물 바탕) · 유의(굵은 실선) 세 구간에 결과 위치를 짙은 민트 세로선으로 표시.

### 각주
- "주:" 번호 목록과 "자료:" 한 줄. 모든 화면 끝에 둔다.

## Do's and Don'ts

### Do:
- **Do** 상태를 선 모양 네 가지(굵은 실선 4px, 굵은 점선 2~3px, 가는 실선 1px, 점선)로 표시하고 범례를 함께 둔다.
- **Do** 밝은 민트(#00b39b)는 면에만, 글자와 선에는 짙은 민트(#007d6c, #00705f)를 쓴다.
- **Do** 증감을 색과 함께 위치와 부호로 보여 준다. 빼기는 U+2212.
- **Do** 가상 거래처 이름 뒤에 "(가상)"을 붙이고, 각주에 가상 데이터와 약한 증거임을 적는다.
- **Do** 움직임은 한 번만(막대가 자라고, 행이 차례로, 선이 그어짐) 하고 동작 줄이기 설정이면 모두 끈다.
- **Do** 1440×900 첫 화면에 살펴볼 거래처 첫 행이 보이는지 확인한다.

### Don't:
- **Don't** 카드 상자, 그림자, 둥근 모서리를 쓴다.
- **Don't** 밝은 민트 위에 흰 글자를 올린다.
- **Don't** 사이드바와 네 칸 지표 카드로 첫 화면을 구성한다.
- **Don't** 색만으로 상태나 증감을 구분한다.
- **Don't** 실제 은행 이름, 로고, 담당자 정보, 사업자등록번호처럼 실제 기관 문서로 보일 요소를 넣는다.
- **Don't** 연구가 뒷받침하지 않는 원인 설명이나 위험 판정 문구를 넣는다.
