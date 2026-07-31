# Academic Portfolio Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `dev/` academic homepage around VLA and robotic manipulation, using the current CV as the factual source while fixing mobile layout and image performance.

**Architecture:** Keep the existing React, TypeScript, Vite, and Tailwind implementation. Centralize factual content in `dev/constants.ts`, keep narrative copy in `dev/components/ProfileRichText.tsx`, and make `dev/components/AcademicPage.tsx` the focused professor-facing composition. Add source-level regression tests with Node's built-in test runner because the repository has no browser test framework.

**Tech Stack:** React 18, TypeScript, Vite 6, Tailwind CSS 3, Node test runner

---

## File Structure

- Modify `dev/constants.ts`: align profile, experience, publication, featured research, and independent-project data with the approved design and current CV.
- Modify `dev/components/ProfileRichText.tsx`: replace the broad robotics narrative with the approved VLA/manipulation positioning.
- Modify `dev/components/AcademicPage.tsx`: reorder sections, add featured research and education, simplify contact links, and make the header responsive.
- Modify `dev/index.html`: align title and social metadata with VLA and robotic manipulation.
- Modify `dev/academic.html`: align academic-entry metadata with the same positioning.
- Modify `dev/package.json`: expose the Node regression-test command.
- Create `dev/tests/academic-content.test.mjs`: lock down content, section, and asset requirements.
- Create `dev/profile.webp`: optimized portrait.
- Create `dev/public/research/gvla-overview.webp`: optimized official GVLA teaser.
- Create `dev/public/research/gca-overview.webp`: optimized official GCA-Bench teaser.

### Task 1: Add Content Regression Tests

**Files:**
- Create: `dev/tests/academic-content.test.mjs`
- Modify: `dev/package.json`

- [ ] **Step 1: Add the test command**

Add `"test": "node --test tests/*.test.mjs"` to `dev/package.json`.

- [ ] **Step 2: Write failing tests**

The test reads the relevant source files and asserts:

```js
assert.match(profileSection, /Vision-Language-Action Models/);
assert.doesNotMatch(activeCopy, /humanoid/i);
assert.match(experienceSection, /Oct 2025 [–-] May 2026/);
assert.match(experienceSection, /Prof\. Trendaferov/);
assert.match(publicationSection, /gca2026/);
assert.match(publicationSection, /imdr2025/);
assert.match(academicPage, /academic-featured-research/);
assert.match(academicPage, /academic-education/);
assert.doesNotMatch(academicPage, /Modern View|Personal Webpage|<WebCV/);
assert.ok(statSync('profile.webp').size < 300_000);
```

- [ ] **Step 3: Run tests and verify RED**

Run: `npm test`

Expected: failures for the old positioning, missing selected publications and sections, obsolete links, and missing optimized portrait.

### Task 2: Align Content With The CV

**Files:**
- Modify: `dev/constants.ts`
- Modify: `dev/components/ProfileRichText.tsx`
- Modify: `dev/index.html`
- Modify: `dev/academic.html`

- [ ] **Step 1: Update profile positioning**

Use:

```text
Vision-Language-Action Models · Robotic Manipulation · Multimodal Learning
```

Remove humanoid claims and describe legged robot learning only as an emerging independent interest.

- [ ] **Step 2: Correct experience data**

Set SmartLab to `Oct 2025 – May 2026` with `Prof. Trendaferov`. Use accepted publication outcomes from the CV for ECCV, IROS, BIBM, AAAI, and ICPR.

- [ ] **Step 3: Expand selected publications**

Add GCA-Bench and IMDR to `PUBLICATIONS`, extend `authorRole` with `Contributing Author`, and attach real project/paper resources.

- [ ] **Step 4: Correct featured and independent project data**

Give GVLA and GCA-Bench current CV statuses and official project URLs. Mark the Go2/MuJoCo item as an ongoing independent project and remove humanoid and unverified sim-to-real claims.

- [ ] **Step 5: Update metadata**

Use `Zihong Luo | VLA Models and Robotic Manipulation` for the main title and consistent VLA/manipulation descriptions for both HTML entries.

- [ ] **Step 6: Run tests**

Run: `npm test`

Expected: content assertions pass; asset assertions remain failing until Task 3.

### Task 3: Recompose The Academic Page

**Files:**
- Modify: `dev/components/AcademicPage.tsx`

- [ ] **Step 1: Simplify the header**

Remove `Modern View`. Keep desktop navigation and add a horizontally scrollable mobile section nav below the brand row.

- [ ] **Step 2: Simplify the profile panel**

Use the optimized portrait with `object-cover`. Keep Email, Google Scholar, GitHub, and PDF CV. Remove location, self-link, Web CV control, and the duplicate Academic Objective box.

- [ ] **Step 3: Compact About**

Render the approved two-paragraph research narrative followed by readable interest tags. Remove the duplicate Current Focus card.

- [ ] **Step 4: Add Featured Research**

Render GVLA and GCA-Bench immediately after About with real teaser imagery, venue/status/role metadata, personal contribution, and project links.

- [ ] **Step 5: Make publications and experience compact**

Use list-style separators instead of full cards. Update the publication note to describe relevance-based selection.

- [ ] **Step 6: Show only independent projects**

Filter the project data by the independent-project flag so the academic page shows the ongoing legged locomotion project without duplicating research and internship work.

- [ ] **Step 7: Add concise education and collaboration sections**

Render CMU and UoL from the CV education data. End with the approved research-collaboration statement and contact links.

- [ ] **Step 8: Run tests**

Run: `npm test`

Expected: all content and structural tests pass except any asset-size failures not yet resolved.

### Task 4: Add And Optimize Visual Assets

**Files:**
- Create: `dev/profile.webp`
- Create: `dev/public/research/gvla-overview.webp`
- Create: `dev/public/research/gca-overview.webp`

- [ ] **Step 1: Optimize the portrait**

Resize the existing portrait to approximately 800 pixels on its long display axis and encode it as WebP below 300 KB.

- [ ] **Step 2: Download official research teasers**

Use the official sources:

```text
https://airvlab.github.io/G-VLA/static/images/introduction.png
https://airvlab.github.io/GCA-Bench/static/images/paper/gca-overview.png
```

- [ ] **Step 3: Optimize teaser images**

Resize each teaser to a practical web width and encode as WebP while preserving readable diagrams.

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: all tests pass.

### Task 5: Verify The Finished Page

**Files:**
- Check: `dev/`

- [ ] **Step 1: Run the production build**

Run: `npm run build`

Expected: Vite exits 0 with both HTML entries and optimized assets.

- [ ] **Step 2: Start the local site**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite serves the site on an available local port.

- [ ] **Step 3: Capture target viewports**

Capture the academic homepage at:

```text
390 × 844
768 × 1024
1440 × 1100
```

- [ ] **Step 4: Verify layout and content**

Confirm no horizontal overflow, no clipped text, real research images render, the featured research section appears near the first viewport, and the collaboration/contact path is clear.

- [ ] **Step 5: Inspect the final diff**

Run:

```bash
git status --short
git diff -- docs/superpowers/specs/2026-07-31-academic-portfolio-optimization-design.md docs/superpowers/plans/2026-07-31-academic-portfolio-optimization.md
```

Because `dev/` is intentionally ignored, inspect its changed files directly and do not force-add or commit them unless the user explicitly asks.
