# Publications Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the `dev/` academic website Publications section to show a formal selected-publications list limited to first-author, co-first-author, and second-author papers.

**Architecture:** Keep publication content centralized in `dev/constants.ts`. Add lightweight metadata fields for author role and optional teaser images, then render them in `dev/components/AcademicPage.tsx` and the main `dev/App.tsx` Publications section without changing site routing or unrelated sections.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS.

---

## File Structure

- Modify `dev/constants.ts`: extend `PublicationItem` with `authorRole`, optional `teaserImage`, and optional `teaserAlt`; narrow `PUBLICATIONS` to the three selected papers from the approved design.
- Modify `dev/components/AcademicPage.tsx`: add the selected-publications note and render role tags plus optional teaser image.
- Modify `dev/App.tsx`: align the modern portfolio Publications section with the same selected-publications data and display role tags.

## Task 1: Update Publication Data

**Files:**
- Modify: `dev/constants.ts`

- [ ] **Step 1: Extend the publication type**

Add these fields to `PublicationItem`:

```ts
authorRole: "First Author" | "Co-first Author" | "Second Author";
teaserImage?: string;
teaserAlt?: string;
```

- [ ] **Step 2: Narrow `PUBLICATIONS` to selected papers**

Keep only:

```ts
Gripper-aware Vision-Language-Action Models (ECCV 2026) — Second Author
PG-SAM: Prior-Guided SAM with Medical LLMs for Multi-organ Segmentation (BIBM 2025) — Co-first Author
MC-DBN: Modality Completion with Deep Belief Networks (ICPR 2024) — First Author
```

Use existing real links where available. Do not add teaser image paths unless actual image assets exist.

- [ ] **Step 3: Verify omitted papers are absent from source data**

Run:

```bash
rg -n "ChemHyperMag|Beyond Visual Grasping|Incomplete Modality|Interpretable ML|MTSA-SNN|ARIF" dev/constants.ts
```

Expected: no matches inside `PUBLICATIONS`.

## Task 2: Update Academic Publications Rendering

**Files:**
- Modify: `dev/components/AcademicPage.tsx`

- [ ] **Step 1: Add a section note**

Above the publication cards, render:

```text
* Equal contribution. Only first-author, co-first-author, and second-author papers are listed. See more on Google Scholar.
```

Link `Google Scholar` to `PROFILE.scholar`.

- [ ] **Step 2: Add formal role/status tags**

Each publication card should show:

```tsx
publication.year
publication.venue
publication.status
publication.authorRole
```

- [ ] **Step 3: Add optional teaser image rendering**

If `publication.teaserImage` exists, render an image column with `publication.teaserAlt || publication.title`. If it does not exist, render a text-only card without an empty placeholder.

## Task 3: Update Main Portfolio Publications Rendering

**Files:**
- Modify: `dev/App.tsx`

- [ ] **Step 1: Add author-role tag**

In the existing Publications section card header, add `pub.authorRole` beside venue/status.

- [ ] **Step 2: Add the selected-publications note**

Add the same note near the top of the main Publications section so both views communicate the filter rule.

## Task 4: Verify

**Files:**
- Check: `dev/constants.ts`
- Check: `dev/components/AcademicPage.tsx`
- Check: `dev/App.tsx`

- [ ] **Step 1: Build the dev site**

Run:

```bash
npm run build
```

from `dev/`.

Expected: Vite build exits 0.

- [ ] **Step 2: Check selected-publication rule**

Run:

```bash
rg -n "Only first-author|Google Scholar|First Author|Co-first Author|Second Author" dev/App.tsx dev/components/AcademicPage.tsx dev/constants.ts
```

Expected: matches in rendering files and selected publication data.

- [ ] **Step 3: Check omitted publications do not render from selected data**

Run:

```bash
rg -n "ChemHyperMag|Beyond Visual Grasping|Incomplete Modality|Interpretable ML|MTSA-SNN|ARIF" dev/constants.ts
```

Expected: no matches in active `PUBLICATIONS` data.
