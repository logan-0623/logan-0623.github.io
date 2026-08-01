# Inverted-Pendulum Source Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an external GitHub source link beneath the inverted-pendulum project description on the public projects page.

**Architecture:** Make one surgical edit to the private React source under `dev/`; the user's existing `deploy.sh` workflow will publish it later. Extend the existing source-content test to assert the repository URL, approved label, new-tab behavior, and security attributes before a Vite build verifies that the development source remains deployable.

**Tech Stack:** Static HTML, compiled React/Vite JavaScript, Node.js built-in test runner, Vite 6.

---

### Task 1: Add a failing source-link regression test

**Files:**
- Modify: `dev/tests/academic-content.test.mjs`
- Test: `dev/tests/academic-content.test.mjs`

- [x] **Step 1: Write the failing test**

```js
test('links the inverted-pendulum demo to its public source', () => {
  const demoSection = sourceSection(projectsPage, 'LIVE SYSTEM / 02', '</section>');

  assert.match(demoSection, /href="https:\/\/github\.com\/logan-0623\/Inverted-pendulum-control"/);
  assert.match(demoSection, /target="_blank"/);
  assert.match(demoSection, /rel="noopener noreferrer"/);
  assert.match(demoSection, /View source on GitHub ↗/);
});
```

- [x] **Step 2: Run the test to verify it fails**

Run:

```bash
npm --prefix dev test
```

Expected: FAIL in `links the inverted-pendulum demo to its public source` because the source does not yet contain the repository URL.

- [x] **Step 3: Keep the failing test in the private source tree**

Do not commit at this checkpoint because `dev/` is intentionally ignored and remains private development source.

### Task 2: Add the source link to the project introduction

**Files:**
- Modify: `dev/components/ProjectsPage.tsx:106`
- Test: `dev/tests/academic-content.test.mjs`

- [x] **Step 1: Add the minimal React link element**

In the `LIVE SYSTEM / 02` introduction, immediately after the description paragraph, add:

```tsx
<a
  href="https://github.com/logan-0623/Inverted-pendulum-control"
  target="_blank"
  rel="noopener noreferrer"
  className="mt-5 inline-flex items-center text-sm font-medium text-stone-800 transition-colors hover:text-emerald-700 dark:text-stone-200 dark:hover:text-emerald-400"
>
  View source on GitHub ↗
</a>
```

- [x] **Step 2: Run the focused test to verify it passes**

Run:

```bash
npm --prefix dev test
```

Expected: PASS with the full development test suite and no failures.

- [x] **Step 3: Run the production build**

Run:

```bash
npm --prefix dev run build
```

Expected: Vite exits successfully and reports a completed production build in `dev/dist` without errors. Do not run `deploy.sh`.

- [x] **Step 4: Inspect the final diff**

Run:

```bash
rg -n "Inverted-pendulum-control|View source on GitHub" dev/components/ProjectsPage.tsx dev/dist/assets/projects-*.js
```

Expected: the approved repository URL and label appear in the source and the generated development bundle.

- [x] **Step 5: Stop before deployment**

Report the verified `dev` changes to the user. Do not copy `dev/dist` into the repository root, run `deploy.sh`, commit, or push; the user will deploy separately.
