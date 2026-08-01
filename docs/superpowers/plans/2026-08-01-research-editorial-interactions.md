# Research Editorial Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the restrained professor-facing research page the canonical homepage and move meaningful engineering demonstrations to a dedicated projects page with precise, accessible micro-interactions.

**Architecture:** A shared `ResearchApp` owns theme state and renders `AcademicPage` for both `/` and `/academic.html`. A separate `ProjectsPage` owns project summaries and lazy-loaded interactive demonstrations. Both pages read factual content from `constants.ts`; Vite builds three static HTML entries and `deploy.sh` publishes only their generated assets.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Three Fiber, Node test runner.

---

### Task 1: Lock The Page Boundary With Failing Tests

**Files:**
- Modify: `dev/tests/academic-content.test.mjs`
- Test: `dev/tests/academic-content.test.mjs`

- [ ] **Step 1: Read the new entry sources in the test fixture**

```js
const mainEntry = readSource('../index.tsx');
const academicEntry = readSource('../academic.tsx');
const projectsEntry = readSource('../projects.tsx');
const projectsPage = readSource('../components/ProjectsPage.tsx');
const projectsHtml = readSource('../projects.html');
const viteConfig = readSource('../vite.config.ts');
```

- [ ] **Step 2: Add assertions for the canonical research homepage and projects boundary**

```js
test('uses the research editorial page as the canonical homepage', () => {
  assert.match(mainEntry, /ResearchApp/);
  assert.match(academicEntry, /ResearchApp/);
  assert.doesNotMatch(mainEntry, /from '.\/App'/);
});

test('ships a dedicated projects page with relevant interactive work', () => {
  assert.match(projectsHtml, /Research Projects and Interactive Systems/);
  assert.match(viteConfig, /projects:/);
  assert.match(projectsPage, /RoboticArmSimulator/);
  assert.match(projectsPage, /QuadrupedPolicyDemo/);
  assert.match(projectsPage, /InvertedPendulumFinal/);
  assert.doesNotMatch(projectsPage, /SnakeGame|Break Time/);
});
```

- [ ] **Step 3: Run the focused test and verify it fails because the new entries do not exist**

Run: `npm --prefix dev test`

Expected: FAIL while reading `projects.tsx` or `components/ProjectsPage.tsx`.

### Task 2: Add Shared Entries And Static Build Routing

**Files:**
- Create: `dev/components/ResearchApp.tsx`
- Create: `dev/projects.tsx`
- Create: `dev/projects.html`
- Modify: `dev/index.tsx`
- Modify: `dev/academic.tsx`
- Modify: `dev/vite.config.ts`
- Modify: `deploy.sh`

- [ ] **Step 1: Extract the shared research entry component**

```tsx
const ResearchApp: React.FC = () => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return <AcademicPage isDark={isDark} toggleTheme={() => setIsDark((value) => !value)} />;
};
```

- [ ] **Step 2: Render `ResearchApp` from both `index.tsx` and `academic.tsx`**

Both entry files mount the same component under `React.StrictMode`; neither imports `App`.

- [ ] **Step 3: Add `projects.html` and `projects.tsx`**

`projects.html` uses the title `Zihong Luo | Research Projects and Interactive Systems` and imports `/projects.tsx`. `projects.tsx` mounts `ProjectsPage` and owns the same persisted theme behavior through a small wrapper.

- [ ] **Step 4: Add the third Vite input**

```ts
input: {
  main: path.resolve(__dirname, 'index.html'),
  academic: path.resolve(__dirname, 'academic.html'),
  projects: path.resolve(__dirname, 'projects.html'),
},
```

- [ ] **Step 5: Publish `projects.html` from `deploy.sh`**

Add `projects.html` to `published_files`; do not change the ignored `dev/` boundary.

### Task 3: Build The Research Editorial Homepage

**Files:**
- Modify: `dev/components/AcademicPage.tsx`
- Modify: `dev/index.css`
- Test: `dev/tests/academic-content.test.mjs`

- [ ] **Step 1: Add failing source assertions for the approved visual hierarchy**

```js
test('uses the restrained research editorial hierarchy', () => {
  assert.match(academicPage, /Research Editorial/);
  assert.match(academicPage, /Selected Research/);
  assert.match(academicPage, /Last updated August 2026/);
  assert.match(academicPage, /projects\.html/);
  assert.doesNotMatch(academicPage, /Typewriter|parallax|animate-pulse/);
});
```

- [ ] **Step 2: Replace the sidebar profile card with an editorial first viewport**

Use an unframed two-column desktop layout with the name and research statement on the left and the existing optimized portrait on the right. Keep the H1 at a restrained size, surface CMU and collaboration intent, and place `Selected Research`, `Projects`, `CV`, and `Email` as clear commands.

- [ ] **Step 3: Convert featured research cards to editorial rows**

Each row keeps real imagery, venue, status, author role, summary, and visible contribution. Add a persistent `Project page` label and only a one-percent image scale on hover/focus.

- [ ] **Step 4: Convert independent work to a compact homepage preview**

Show the ongoing status, project title, short evidence, and a single link to `projects.html`; leave demonstrations and large technical panels to the projects page.

- [ ] **Step 5: Add the maintained footer**

Render `Last updated August 2026` alongside concise links to CV, Scholar, GitHub, and Email.

- [ ] **Step 6: Remove negative global letter spacing and define reduced motion**

```css
h1, h2, h3, h4, h5, h6 { letter-spacing: 0; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

### Task 4: Add Precise, Accessible Micro-Interactions

**Files:**
- Create: `dev/components/CitationButton.tsx`
- Modify: `dev/components/AcademicPage.tsx`
- Test: `dev/tests/academic-content.test.mjs`

- [ ] **Step 1: Add failing assertions for interaction labels and accessibility**

```js
const citationButton = readSource('../components/CitationButton.tsx');

test('provides restrained and accessible research interactions', () => {
  assert.match(academicPage, /aria-current/);
  assert.match(academicPage, /focus-within:border-l-emerald/);
  assert.match(citationButton, /Copy BibTeX/);
  assert.match(citationButton, /Copied/);
  assert.match(citationButton, /aria-live="polite"/);
});
```

- [ ] **Step 2: Implement `CitationButton`**

The button accepts `title`, `year`, and optional `bibtex`. It copies the provided citation or a minimal `@article` fallback, displays `Copied` for 1.5 seconds, and exposes the status through a polite live region. A `Copy` icon is always present.

- [ ] **Step 3: Track the active navigation section**

Use one `IntersectionObserver` in `AcademicPage` to set the active section. Navigation buttons render their two-digit index, a thin emerald line, and `aria-current="location"` only when active.

- [ ] **Step 4: Apply equivalent hover and focus feedback**

Research and publication rows use `group` plus `focus-within` so image scaling, the status line, and link-arrow movement work for pointer and keyboard users. No essential text changes visibility.

- [ ] **Step 5: Run tests and verify the interaction assertions pass**

Run: `npm --prefix dev test`

Expected: all content and interaction tests pass.

### Task 5: Build The Focused Projects Page

**Files:**
- Create: `dev/components/ProjectsPage.tsx`
- Test: `dev/tests/academic-content.test.mjs`

- [ ] **Step 1: Create a quiet project-page shell**

Use the same typography, colors, theme control, and homepage link. The header states that the page contains selected implementations and that ongoing legged RL is exploratory work.

- [ ] **Step 2: Render project evidence from `PROJECTS`**

Use compact full-width rows for the independent project and relevant manipulation/control items. Keep year, status, technical stack, and limitations visible.

- [ ] **Step 3: Lazy-load the three relevant demonstrations**

```tsx
const RoboticArmSimulator = lazy(() => import('./RoboticArmSimulator'));
const QuadrupedPolicyDemo = lazy(() => import('./QuadrupedPolicyDemo'));
const InvertedPendulumFinal = lazy(() => import('./InvertedPendulumFinal'));
```

The Go2 Three.js scene is full-width and unframed. Controls use Lucide icons with explicit accessible labels. Each lazy fallback has stable dimensions so loading does not shift the page.

- [ ] **Step 4: Keep unrelated games out of the page**

Do not import `SnakeGame`, `RLSnakeGame`, or the old full portfolio `App`.

### Task 6: Build, Publish, And Verify

**Files:**
- Generated: `index.html`
- Generated: `academic.html`
- Generated: `projects.html`
- Generated: `assets/*`
- Generated: `models/*`
- Generated: `research/*`

- [ ] **Step 1: Run the complete content test suite**

Run: `npm --prefix dev test`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run the production build**

Run: `npm --prefix dev run build`

Expected: Vite emits `index.html`, `academic.html`, `projects.html`, shared CSS, split JavaScript chunks, images, and model files with no source maps.

- [ ] **Step 3: Run the deployment script**

Run: `./deploy.sh`

Expected: the three HTML entries and only static build output are synchronized to the repository root.

- [ ] **Step 4: Verify privacy and route output**

Run: `git check-ignore -v dev/App.tsx` and inspect `git status --short`.

Expected: `dev/` remains ignored; only the plan/spec, deploy script, generated HTML, and generated static directories are visible to Git.

- [ ] **Step 5: Inspect desktop and mobile layouts**

Check 1440x900, 768x1024, and 390x844. Confirm no horizontal overflow, no overlapping text, stable demo dimensions, keyboard-visible focus, meaningful canvas pixels, and no unintended console or asset-loading errors.

- [ ] **Step 6: Leave the worktree uncommitted for user review**

Report the local preview URL and list the changed files. Do not commit or push until the user has reviewed `dev`.
