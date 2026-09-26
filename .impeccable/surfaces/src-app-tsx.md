---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/main.tsx"]
---

## Scope and mode

Whole app (월보 home, 거래처 목록, 거래처 상세, 근거와 한계). Mode: Operate. Audience: corporate-banking RM persona; evaluators are hiring managers and the 10/6 panel.

## Direction contract

THESIS: This month's reference signals are published as a monthly statistical release, with sources and footnotes, not as an alert board. It refuses the admin default: sidebar, four KPI cards, neon line chart.

OWN-WORLD: Off-white release paper, ink body, cool rule grey, one release blue as the only accent. Ruled statistical tables with shaded header rows, year-on-year change columns, "주:" and "자료:" footnotes. No cards, no shadows, square corners. One workhorse Korean sans with tabular figures; hierarchy by size and spacing only.

STORY: The RM reads the reference month and a one-line summary, checks the regional export table, opens a client row to see the three conditions connect, then goes to the client page. Footnotes state synthetic data and weak evidence.

FIRST VIEWPORT: Full-width release masthead (publication name, reference-month selector right, one large summary sentence). Below, 7/5 split: Daegu and Gyeongbuk export table (last 6 months) and a YoY bar strip. Then the full-width "살펴볼 거래처" table; footnotes begin at the bottom edge. Primary actions: month selector and row expansion.

FORM: Statistical release, position 3 of my ordered list, seed key 4a9d2a87. Signature interaction: expanding a row draws ruled connectors lighting the three conditions in order (region down, deposits down, loan held). State by line form: met is a solid heavy rule, near-miss dashed, not applicable an explicit "해당 없음" cell. Raises kept from seven-segment, emission rail, festival lineup, Kraftwerk.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Deployment host (GitHub Pages vs Vercel) decided at publish time.
