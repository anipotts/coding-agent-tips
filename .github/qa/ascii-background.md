# homepage ASCII field review

## scope and source

Draft [PR #315](https://github.com/anipotts/coding-agent-tips/pull/315) uses `codex/ascii-provider-field`. The September 7 repair worktree is `/Users/anipotts/.codex/worktrees/ascii-repair/coding-agent-tips`. Its signed merge `82b9e77` integrates current main `7557555`, including PR #316's navigation and controls. The design authority from PR #312 is already in main. Editorial work remains separate.

The field uses the verified provider assets to generate compact masks at build time. One canvas follows a continuous search, gather, resolve, and disperse sequence. OffscreenCanvas renders in a worker at a capped 30 fps on desktop and 24 fps on mobile. Particle count, resolution, and device pixel ratio are bounded. Hidden tabs and pause stop scheduling; reduced motion draws one resolved Codex frame. The fallback also draws one static frame. No animation library or runtime image download is required.

The single approved exception in `design.md` describes the implementation, its reading surfaces, motion controls, and verification requirements.

## verification on September 7

The initial September 5 environment blocked browser testing. Those historical restrictions no longer apply. The previous CI run `33990903386` stopped because its runner shut down during the matrix. The new run [34143213189](https://github.com/anipotts/coding-agent-tips/actions/runs/34143213189) completed the matrix and exposed the separate Lighthouse gate described below.

The following checks passed locally on the integrated animation tree:

- `bun run check`, with zero errors, warnings, or hints;
- `bun run build`;
- `bun run test:site`, including 15 canonical routes;
- `bun run check:performance`, covering delivery size and asset budgets;
- `bun run check:content` and `bun run check:ui`;
- `bun run test:ascii`, covering all 36 width, theme, and motion combinations;
- `bun run test:a11y`, including typography, reflow, text spacing, text resize, and axe across 15 routes at eight widths in both themes;
- WebMCP, navigation, and normal development search checks;
- `bun run test:audit-preview`, including compressed response parity.

The matrix checks protected text backgrounds and contrast, full-page axe results at mobile and desktop sizes, pixel stability under reduced motion and pause, live preference changes, route cleanup, no-script content, and worker transfer fallback. Widths are 320, 375, 768, 942, 959, 960, 1024, 1191, and 1440 pixels in both themes and motion preferences. Progress and partial results are saved after each combination so an interrupted runner retains useful evidence.

Manual review used the normal Astro development server at `http://127.0.0.1:4351/`, at 1440 by 900 and 375 by 812 in light and dark themes. The review included the moving field and recognizable provider forms. Full-page reduced-motion captures at 1440 and 375 pixels were also inspected in both themes. The heading, prose, guide cards, links, and footer retain readable surfaces.

A full verification run exposed a timing race in the existing WebMCP test: Astro adds the page title to its screen reader route announcer after navigation. The test now excludes that transient announcement through a test-only style in both compared pages; its strict public-text equality and registration assertions remain intact. No production announcement behavior changes.

## contrast

Reading elements sit on fully opaque canvas or component surfaces above the animation. A ten pixel canvas colored extension protects prose glyph edges. Animated pixels contribute zero to the protected text background, independent of phase. The rendered matrix verifies the computed surfaces and contrast.

| foreground against canvas | light contrast | dark contrast |
| --- | --- | --- |
| primary text | 18.88:1 | 18.24:1 |
| muted text | 7.31:1 | 8.67:1 |
| accent text | 6.84:1 | 5.01:1 |

## paired performance measurements

Both sets use three cold homepage runs per revision with Lighthouse's default mobile simulation. The unchanged baseline is main `7557555`; the candidate is the integrated animation tree at `82b9e77`. Subsequent diagnostic changes affect test scripts and this review document.

| median metric | local baseline | local animation | Linux CI baseline | Linux CI animation |
| --- | ---: | ---: | ---: | ---: |
| Lighthouse performance | 96 | 96 | 97 | 97 |
| FCP, ms | 2036.35 | 2108.03 | 1675.31 | 1674.32 |
| LCP, ms | 2486.35 | 2487.72 | 2347.86 | 2342.56 |
| TBT, ms | 0 | 0 | 0 | 0 |
| CLS | 0.000971 | 0.000971 | 0.000971 | 0.000971 |
| transferred bytes | 252264 | 256974 | 252622 | 257357 |

The animation adds approximately 4.7 KB to the measured transfer. These samples show timing variation; they establish neither a speed improvement nor a general absence of regressions.

Ten seconds of desktop worker sampling measured 271 frames locally with frame p50 1.5 ms, p95 1.9 ms, and 5.55 ms of main thread tasks. Linux CI measured 300 frames with p50 3.2 ms, p95 3.4 ms, and 9.18 ms of main thread tasks. These are instrumented Chromium samples, not whole-device power measurements.

The absolute performance gate remains **99**, TBT below 100 ms, CLS below 0.05, and worker frame p95 at most 16 ms. Both baseline and candidate miss the score gate through the original HTTP/1.1 preview. A failing baseline grants no waiver. It now records revisions, runtime provenance, medians, deltas, and separate baseline and candidate failures, and rejects missing worker samples.

Font discovery and the protocol used by the preview explain the initial investigation. The retained production repair preloads the original Instrument Sans Latin font in the homepage head. CSS and typography remain unchanged. CSS/font embedding and broad runtime bundling were measured and rejected; they are absent from the final diff.

CI reports and screenshots are retained in the [ASCII QA artifact](https://github.com/anipotts/coding-agent-tips/actions/runs/34143213189). Local initial comparison reports are in `/private/tmp/ascii-repair-audit`. The local matrix uses the system temporary `ascii-homepage-qa` directory.

## production protocol comparison

On September 7, `curl` independently confirmed that `https://agents.anipotts.com` serves HTTP/2. Vite preview serves HTTP/1.1. Default Lighthouse network simulation produced a materially different result for the same built files under those two protocols.

A paired HTTP/2 comparison of main `7557555` and the integrated animation with the original-font preload produced these medians, with all three runs in each group scoring 100:

| metric | baseline | animation and font preload |
| --- | ---: | ---: |
| Lighthouse performance | 100 | 100 |
| FCP, ms | 1430.84 | 1280.81 |
| LCP, ms | 1506.11 | 1505.81 |
| TBT, ms | 0 | 0 |
| CLS | 0.026217 | 0.000971 |
| transferred bytes | 241019 | 245219 |

The initial protocol comparison artifacts are in `/private/tmp/ascii-http2-audit`. Ten seconds of runtime sampling measured 273 frames, worker p50 1.4 ms and p95 3.0 ms, with 6.15 ms of main thread tasks. CLS varied between baseline runs; the paired results are observations, not a general claim about every device or load.

Both `audit:ascii` and `audit:performance` now use `scripts/lib/http2-preview.mjs` for Lighthouse. It forwards Vite responses through loopback HTTP/2 without changing their body, status, compression, or cache policy. A regression test verifies byte and header parity, including a compressed 404 response. Each Lighthouse run must report protocol `h2`. The certificate is generated temporarily for loopback use and removed on shutdown; the browser exception is restricted to insecure localhost.

The Lighthouse version, mobile simulation, three-run medians, score 99, TBT, CLS, and worker thresholds remain unchanged. Reports retain the measured revisions and homepage HTML hashes. The original HTTP/1.1 comparison is retained above so the protocol correction is explicit.

## review state

The animation is prepared for visual review. The production protocol comparison meets the unchanged Lighthouse gate. Final signed-head CI status is reported with the PR receipt. Keep PR #315 unmerged, as requested by Ani. A local preview, passing size budgets, and passing motion checks do not establish a production release.
