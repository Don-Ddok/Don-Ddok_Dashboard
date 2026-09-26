# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary (in-product persona): a corporate-banking relationship manager (RM, 기업금융 담당자) at a Daegu/Gyeongbuk regional bank who looks after a book of local business clients. Each morning they open the dashboard to see how the regional export climate is moving and which of their exporting clients might deserve a closer look, then drill into one client's account history before deciding whether to call or review the relationship.

Audiences who evaluate the prototype (not in-product users): hiring managers and interviewers reviewing it as a portfolio piece, and the iM DiGital Banker Academy 9th-cohort panel at the statistics project presentation (2026-10-06). Both must understand what the product is within a short glance.

## Product Purpose

A monitoring prototype that turns a statistics study into a working screen. The study (team Don-Ddok, "수출 경기 충격의 법인 여신 전이") asked whether, when Daegu/Gyeongbuk exports slow down, exporting firms behave differently at the bank than comparable non-exporting firms. The prototype shows how an RM could watch for that pattern using the bank's own account data, which is available sooner and at finer (per-client) grain than official statistics.

Success: an evaluator understands the idea, the flow (region, then client list, then client detail, then evidence and limits), and the honesty of the claim in under a minute; an RM persona could actually use the screens to decide which clients to look at first.

## Positioning

Not an early-warning or credit-scoring system. It is a reference monitoring view built on a pattern the study found only as weak evidence: when regional exports fall, comparable non-exporting firms tend to cut working-capital loans while exporting firms tend to keep them. Everything the screen flags is framed as "worth a look," never as a risk verdict. The evidence-and-limits view is part of the product, not a footnote.

## Operating Context

- RM reviews a client book at the start of the day; selects a month, scans region conditions, filters the client list, opens a client.
- Official regional export statistics are published with a lag; bank account data is available at month end.
- The prototype runs as a static single-page web app, published by public link.

## Capabilities and Constraints

- Views: regional export status (Daegu, Gyeongbuk), reference-signal client list with filters, client detail (deposit balance, working-capital loan, monthly export amount over 36 months), evidence and limits.
- Signal rule (reference only): exporting client + regional export YoY below zero + deposit down more than 10% over 3 months + loan not reduced by more than 5% over 6 months. Defined in `src/data/signals.ts`.
- Data: 80 synthetic clients generated deterministically in `src/data/synthetic.ts` (names suffixed "(가상)"); real public regional export statistics in `src/data/regionExports.ts`.
- **Hard constraint:** no real bank data, firm-level values, or study coefficients derived from the bank's confidential dataset may appear in the app or repository. Study findings are described qualitatively only.
- Language: Korean UI.
- Deploy target: public link (GitHub Pages or Vercel), repository `Don-Ddok/Don-Ddok_Dashboard` (public).

## Brand Commitments

- Team name: 돈독 (Don-Ddok), iM DiGital Banker Academy 9기 통계 프로젝트. The project is an educational deliverable and not an official position of iM Bank; the app must say so and must not use iM Bank branding.
- Voice: calm, factual, plain Korean. No alarm language ("위험", "경보", "부실 예측"). Prefer "참고 신호", "살펴볼 거래처".

## Evidence on Hand

- Public data: Daegu and Gyeongbuk monthly export amounts and YoY, 2022-01 to 2025-12, from Korea Customs statistics via KITA K-stat (verified against source).
- Study conclusions (qualitative, allowed): direction consistent across methods; statistically weak evidence; not explained by exchange rates or firm size; splitting loans into sub-products or classifying by industry demand showed no signal.
- Absent and must not be fabricated: real client names, real balances, accuracy or hit-rate figures for the signal, customer testimonials, adoption by any bank.

## Product Principles

1. Honest by construction: the interface never claims more certainty than the study supports.
2. Region first, client second: show the climate before pointing at anyone.
3. Every flag explains itself: a signal always shows the three conditions that triggered it.
4. Synthetic data is labeled wherever a client appears.
5. Readable by a non-specialist in one pass: plain words over banking or statistics jargon.

## Accessibility & Inclusion

WCAG 2.1 AA contrast and keyboard navigation; charts must not rely on color alone (labels or patterns plus text summaries).
