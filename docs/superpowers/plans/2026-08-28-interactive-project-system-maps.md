# Interactive Project System Maps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four evidence-bounded Archify system maps to the projects page as lazy static SVG previews that open full interactive artifacts in a same-origin fullscreen overlay.

**Architecture:** Archify v2.15.0 generates and validates four typed JSON specifications, self-contained HTML viewers, and dual-theme SVG previews. The existing React projects page owns presentation and navigation through one shared preview component, a native `<dialog>`, and the browser History API; an iframe is created only for the selected flow. The ignored `dev/` tree remains private, while `deploy.sh` publishes only compiled site files and the eight diagram artifacts.

**Tech Stack:** Archify v2.15.0, React 18, TypeScript, native HTML `<dialog>`, History API, Vite 6, Tailwind CSS, Node.js built-in test runner, Chrome DevTools Protocol.

---

## File Map

**Private development files under ignored `dev/`:**

- Create: `dev/archify/gvla.architecture.json` — typed GVLA topology
- Create: `dev/archify/gca-bench.workflow.json` — typed GCA-Bench pipeline
- Create: `dev/archify/robotic-arm-ik.workflow.json` — typed PSO inverse-kinematics workflow
- Create: `dev/archify/inverted-pendulum.architecture.json` — typed feedback-control architecture
- Create: `dev/archify/review/*.html` — delivered artifacts plus visual-review sidecars; never published
- Create: `dev/public/diagrams/*.html` — four trusted interactive artifacts
- Create: `dev/public/diagrams/*.svg` — four canonical static previews
- Create: `dev/components/ProjectFlowPreview.tsx` — repeated preview presentation
- Modify: `dev/components/ProjectsPage.tsx` — flow metadata, placement, dialog, and URL state
- Modify: `dev/tests/academic-content.test.mjs` — source and artifact regression checks
- Modify: `dev/scripts/cdp-layout-check.mjs` — optional runtime lazy-loading smoke check

**Tracked publication files:**

- Modify: `deploy.sh` — publish `diagrams/`
- Generate: `diagrams/*.html`
- Generate: `diagrams/*.svg`
- Generate: `projects.html`
- Generate: `assets/projects-*.js`
- Generate as required by Vite: shared hashed files under `assets/`

Do not force-add `dev/`; that boundary is an explicit repository privacy rule.

### Task 1: Lock The Integration Contract With Failing Tests

**Files:**
- Modify: `dev/tests/academic-content.test.mjs`
- Test: `dev/tests/academic-content.test.mjs`

- [ ] **Step 1: Read the preview component and deploy script in the fixture**

Add these declarations beside the existing optional component reads:

```js
const projectFlowPreview = readOptionalSource('../components/ProjectFlowPreview.tsx');
const deployScript = readSource('../../deploy.sh');

const diagramArtifactExists = (name) =>
  existsSync(new URL(`../public/diagrams/${name}`, import.meta.url));
```

- [ ] **Step 2: Add the four-flow source contract**

```js
test('declares four project system maps with lazy static previews', () => {
  for (const id of ['gvla', 'gca-bench', 'robotic-arm-ik', 'inverted-pendulum']) {
    assert.match(projectsPage, new RegExp(`['"]${id}['"]`));
  }

  assert.match(projectsPage, /ProjectFlowPreview/);
  assert.match(projectFlowPreview, /loading="lazy"/);
  assert.match(projectFlowPreview, /decoding="async"/);
  assert.match(projectFlowPreview, /aria-haspopup="dialog"/);
  assert.match(projectFlowPreview, /Explore system flow/);
});
```

- [ ] **Step 3: Add the native overlay and publication contract**

```js
test('mounts only the selected Archify viewer in a native dialog', () => {
  assert.match(projectsPage, /<dialog/);
  assert.match(projectsPage, /showModal\(\)/);
  assert.match(projectsPage, /new URLSearchParams/);
  assert.match(projectsPage, /pushState/);
  assert.match(projectsPage, /popstate/);
  assert.match(projectsPage, /activeFlowDefinition &&/);
  assert.match(projectsPage, /<iframe/);
  assert.match(projectsPage, /Open standalone/);
  assert.match(projectsPage, /Retry/);
  assert.match(projectsPage, /onError/);
  assert.match(projectsPage, /aria-label="Close system map"/);
});

test('publishes all Archify artifacts through the static deployment boundary', () => {
  for (const id of ['gvla', 'gca-bench', 'robotic-arm-ik', 'inverted-pendulum']) {
    assert.equal(diagramArtifactExists(`${id}.html`), true, `${id}.html is missing`);
    assert.equal(diagramArtifactExists(`${id}.svg`), true, `${id}.svg is missing`);
  }

  assert.match(deployScript, /diagrams/);
});
```

- [ ] **Step 4: Run the suite and verify the new contract fails**

Run:

```bash
npm --prefix dev test
```

Expected: FAIL in the three new tests because `ProjectFlowPreview.tsx`, the four artifact pairs, the dialog integration, and the `diagrams` deployment entry do not exist.

### Task 2: Prepare The Pinned Archify Authoring Tool

**Files:**
- Temporary only: `/private/tmp/archify-v2.15.0.zip`
- Temporary only: `/private/tmp/archify-v2.15.0-src/`

- [ ] **Step 1: Download and unpack the current stable release outside the repository**

Run:

```bash
curl -L --max-time 60 https://github.com/tt-a1i/archify/archive/refs/tags/v2.15.0.zip -o /private/tmp/archify-v2.15.0.zip
mkdir -p /private/tmp/archify-v2.15.0-src
unzip -q -o /private/tmp/archify-v2.15.0.zip -d /private/tmp/archify-v2.15.0-src
```

Expected: `/private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/bin/archify.mjs` exists. No package is added to the portfolio.

- [ ] **Step 2: Read the complete Archify operating contract**

Read these files completely before authoring:

```text
/private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/SKILL.md
/private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/references/viewer-runtime.md
/private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/references/delivery-contract.md
```

- [ ] **Step 3: Run the tool self-check**

Run:

```bash
node /private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/bin/archify.mjs doctor
```

Expected: exit 0 and a successful Archify doctor result. Stop and report the actual diagnostic if the command exits non-zero.

### Task 3: Author And Deliver The GVLA Architecture

**Files:**
- Create: `dev/archify/gvla.architecture.json`
- Generate: `dev/archify/review/gvla.html`
- Generate: `dev/public/diagrams/gvla.html`
- Generate: `dev/public/diagrams/gvla.svg`

- [ ] **Step 1: Read only the required architecture authoring references**

Read completely:

```text
/private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/schemas/common.schema.json
/private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/schemas/architecture.schema.json
/private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/examples/web-app.architecture.json
```

Per Archify's contract, the next edit must create the candidate; do not inspect renderer or validator internals.

- [ ] **Step 2: Create the GVLA candidate with this complete semantic contract**

Use English authored copy, `meta.quality_profile: "showcase"`, `meta.visual_preset: "editorial"`, and `meta.animation: "trace"`. Use these stable nodes and no more than these nine primary nodes:

| ID | Label | Meaning |
|---|---|---|
| `visual_observation` | Visual Observation | RGB scene input |
| `language_instruction` | Language Instruction | task objective |
| `gripper_identity` | Gripper Identity | platform, type, and instance |
| `gripper_tokenizer` | Multi-gripper Tokenizer | structured embodiment tokens |
| `vla_backbone` | VLA Backbone | multimodal policy representation |
| `platform_adapters` | Platform Adapter Pool | platform-conditioned routing |
| `gripper_adapters` | Gripper Adapter Pool | gripper-conditioned routing |
| `action_head` | Action Generation | executable action sequence |
| `robot_execution` | Robot Execution | simulation or real robot |

Author these directed relationships:

```text
visual_observation -> vla_backbone: encode scene
language_instruction -> vla_backbone: condition task
gripper_identity -> gripper_tokenizer: platform / type / instance
gripper_tokenizer -> vla_backbone: inject embodiment tokens
vla_backbone -> platform_adapters: route platform context
vla_backbone -> gripper_adapters: route gripper context
platform_adapters -> action_head: adapted policy features
gripper_adapters -> action_head: adapted strategy features
action_head -> robot_execution: executable action sequence
```

Add two evidence cards:

```text
MiGA Dataset: 103K demonstrations; 36 tasks; 5 gripper types; simulation + real world
Evaluation Focus: cross-object generalization; few-shot task adaptation; gripper adaptation
```

Add at most two guided views: `End-to-end policy` and `Embodiment conditioning`. The first follows visual/language input through action and execution; the second follows gripper identity through tokenization, routing, and action generation.

- [ ] **Step 3: Validate until the candidate has a real showcase pass**

Run after every candidate edit:

```bash
node /private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/bin/archify.mjs validate architecture dev/archify/gvla.architecture.json --quality showcase --json
```

Expected final receipt: 9 artifact checks, 0 composition errors, and 0 warnings. Repair only the diagnosed subject with a supported fix. After the pass, freeze the JSON.

- [ ] **Step 4: Deliver and collect visual evidence**

Run:

```bash
node /private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/bin/archify.mjs deliver architecture dev/archify/gvla.architecture.json dev/archify/review/gvla.html --quality showcase --json
node /private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/bin/archify.mjs visual-check dev/archify/review/gvla.html --json
```

Expected: delivery exit 0 with specification and artifact SHA-256 values; visual check exit 0, or an explicit exit 2 `skipped` result if Chrome is unavailable. Inspect the generated light/dark contact sheet before describing visual quality.

- [ ] **Step 5: Export and publish only the trusted pair**

Open the exact delivered HTML and use Archify `Export → Download SVG` to save `dev/public/diagrams/gvla.svg`. Copy the unchanged delivered artifact:

```bash
mkdir -p dev/public/diagrams
cp -f dev/archify/review/gvla.html dev/public/diagrams/gvla.html
```

Verify:

```bash
rg -n "<svg|prefers-color-scheme" dev/public/diagrams/gvla.svg
shasum -a 256 dev/archify/review/gvla.html dev/public/diagrams/gvla.html
```

Expected: the SVG contains a root SVG and dual-theme styling; both HTML checksums are identical.

### Task 4: Author And Deliver The GCA-Bench Workflow

**Files:**
- Create: `dev/archify/gca-bench.workflow.json`
- Generate: `dev/archify/review/gca-bench.html`
- Generate: `dev/public/diagrams/gca-bench.html`
- Generate: `dev/public/diagrams/gca-bench.svg`

- [ ] **Step 1: Read only the required workflow references**

Read completely:

```text
/private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/schemas/common.schema.json
/private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/schemas/workflow.schema.json
/private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/examples/agent-tool-call.workflow.json
```

The next edit must create the workflow candidate.

- [ ] **Step 2: Create the GCA-Bench candidate with this complete semantic contract**

Use English authored copy, showcase quality, the editorial preset, trace motion, and these eight primary steps:

```text
language_instruction: Language Instruction
rgbd_scene: Multi-view RGB-D Scene
semantic_reasoning: Semantic + Scene Reasoning
scenario_constraints: Scenario Constraints
grasp_plan: Grasp + Trajectory Planning
trajectory_execution: Simulated / Real Execution
execution_metrics: Execution-aware Metrics
failure_analysis: Failure Analysis
```

Use a clear left-to-right happy path. Both inputs feed `semantic_reasoning`; reasoning feeds constraints; constraints feed planning; planning feeds execution; execution feeds metrics; metrics feed failure analysis. Add one secondary relationship from failure analysis back to planning labeled `exposes brittle planning and control`, without claiming an online runtime loop.

Add these cards:

```text
Benchmark Scale: 102 tasks; 4 scenario groups; 3 instruction levels; Sim + Real
Trajectory Data: 2,000 simulation trajectories; 800 real-robot trajectories
Metrics: Detection Success Rate; Grasp Success Rate; Task Success Rate; SPL; Execution Time
Scenario Groups: singulated; cluttered; constrained; semantic
```

Add at most two views: `Detection to execution` and `Evaluation and failure`. Keep all results system-level and do not add contribution labels.

- [ ] **Step 3: Validate, deliver, and inspect**

Run:

```bash
node /private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/bin/archify.mjs validate workflow dev/archify/gca-bench.workflow.json --quality showcase --json
node /private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/bin/archify.mjs deliver workflow dev/archify/gca-bench.workflow.json dev/archify/review/gca-bench.html --quality showcase --json
node /private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/bin/archify.mjs visual-check dev/archify/review/gca-bench.html --json
```

Expected final state: 9/9 showcase checks, 0 errors, 0 warnings, an atomic delivery receipt, and inspected visual evidence. If a repair changes JSON after delivery, repeat validation and delivery.

- [ ] **Step 4: Export and publish the trusted pair**

Use `Export → Download SVG` on the delivered HTML to create `dev/public/diagrams/gca-bench.svg`, then run:

```bash
cp -f dev/archify/review/gca-bench.html dev/public/diagrams/gca-bench.html
rg -n "<svg|prefers-color-scheme" dev/public/diagrams/gca-bench.svg
shasum -a 256 dev/archify/review/gca-bench.html dev/public/diagrams/gca-bench.html
```

Expected: a dual-theme SVG and identical delivered/published HTML checksums.

### Task 5: Author And Deliver The Robotic-Arm IK Workflow

**Files:**
- Create: `dev/archify/robotic-arm-ik.workflow.json`
- Generate: `dev/archify/review/robotic-arm-ik.html`
- Generate: `dev/public/diagrams/robotic-arm-ik.html`
- Generate: `dev/public/diagrams/robotic-arm-ik.svg`

- [ ] **Step 1: Re-read the workflow schema and example, then create the next candidate**

Read the same three workflow files listed in Task 4. The next edit creates `robotic-arm-ik.workflow.json`.

- [ ] **Step 2: Encode the implemented PSO loop exactly**

Use English copy, showcase quality, editorial styling, trace motion, and these primary steps:

```text
problem_input: Target + Obstacles + Arm Configuration
swarm_initialization: Initialize 50 Particles
particle_update: Update Velocity + Joint Angles
forward_kinematics: Forward Kinematics
fitness_evaluation: Distance + Collision Fitness
best_update: Update pBest + gBest
iteration_gate: 50 Iterations Complete?
joint_solution: Best Joint-angle Solution
smooth_animation: Shortest-angle Interpolation
rendered_arm: Rendered Arm Pose
```

The main loop is `swarm_initialization -> particle_update -> forward_kinematics -> fitness_evaluation -> best_update -> iteration_gate`; the incomplete branch returns to `particle_update`, and the complete branch continues to `joint_solution -> smooth_animation -> rendered_arm`.

Add one short side branch from `problem_input` to `redundancy_search`, then `unique_solutions`, using two additional nodes. Label it as independent exploration, not part of every solve.

Add these cards:

```text
PSO: swarm 50; iterations 50; inertia 0.729; cognitive 1.494; social 1.494
Fitness: end-effector distance + 2,000 collision penalty
Continuity: half the swarm starts near the current pose
Redundancy: 25 independent runs; valid reach requires fitness < 5
```

Add views `Primary IK solve` and `Redundant solutions`.

- [ ] **Step 3: Validate, deliver, visually inspect, export, and publish**

Run:

```bash
node /private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/bin/archify.mjs validate workflow dev/archify/robotic-arm-ik.workflow.json --quality showcase --json
node /private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/bin/archify.mjs deliver workflow dev/archify/robotic-arm-ik.workflow.json dev/archify/review/robotic-arm-ik.html --quality showcase --json
node /private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/bin/archify.mjs visual-check dev/archify/review/robotic-arm-ik.html --json
```

After a 9/9 pass and perceptual inspection, export `dev/public/diagrams/robotic-arm-ik.svg`, then:

```bash
cp -f dev/archify/review/robotic-arm-ik.html dev/public/diagrams/robotic-arm-ik.html
rg -n "<svg|prefers-color-scheme" dev/public/diagrams/robotic-arm-ik.svg
shasum -a 256 dev/archify/review/robotic-arm-ik.html dev/public/diagrams/robotic-arm-ik.html
```

### Task 6: Author And Deliver The Inverted-Pendulum Architecture

**Files:**
- Create: `dev/archify/inverted-pendulum.architecture.json`
- Generate: `dev/archify/review/inverted-pendulum.html`
- Generate: `dev/public/diagrams/inverted-pendulum.html`
- Generate: `dev/public/diagrams/inverted-pendulum.svg`

- [ ] **Step 1: Re-read the architecture schema and example, then create the next candidate**

Read the same three architecture files listed in Task 3. The next edit creates `inverted-pendulum.architecture.json`.

- [ ] **Step 2: Encode the implemented feedback loop exactly**

Use English copy, showcase quality, editorial styling, trace motion, and these nine primary components:

```text
user_controls: Target + Mode + Physical Parameters
state_measurement: Cart / Angle / Velocity State
phase_manager: Controller Phase Manager
energy_shaping: Energy-shaping Swing-up
pole_placement: Linearization + Pole-placement Balance
force_command: Bounded Cart Force
nonlinear_plant: Nonlinear Cart-pendulum Dynamics
rk4_integrator: RK4 at 1 ms
diagnostics_render: Energy / Phase Diagnostics + Canvas
```

Author these relationships:

```text
user_controls -> phase_manager: select single/double, swing-up/balance, target
state_measurement -> phase_manager: angle, angular speed, cart state
phase_manager -> energy_shaping: settling / kick / swing-up / retarget
phase_manager -> pole_placement: balance capture
energy_shaping -> force_command: bounded swing-up force
pole_placement -> force_command: bounded stabilizing force
force_command -> nonlinear_plant: cart actuation + optional drag force
nonlinear_plant -> rk4_integrator: state derivatives
rk4_integrator -> state_measurement: updated state feedback
state_measurement -> diagnostics_render: energy, readiness, phase
```

Add these cards:

```text
Plant Modes: single pendulum; double pendulum
Targets: Up + Up; Up + Down retargeting
Controller Phases: settling; kick; swing-up; retarget; balance
Numerics: 1 ms step; fourth-order Runge-Kutta integration
```

Add views `Closed-loop control` and `Swing-up to balance`.

- [ ] **Step 3: Validate, deliver, visually inspect, export, and publish**

Run:

```bash
node /private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/bin/archify.mjs validate architecture dev/archify/inverted-pendulum.architecture.json --quality showcase --json
node /private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/bin/archify.mjs deliver architecture dev/archify/inverted-pendulum.architecture.json dev/archify/review/inverted-pendulum.html --quality showcase --json
node /private/tmp/archify-v2.15.0-src/archify-2.15.0/archify/bin/archify.mjs visual-check dev/archify/review/inverted-pendulum.html --json
```

After a 9/9 pass and perceptual inspection, export `dev/public/diagrams/inverted-pendulum.svg`, then:

```bash
cp -f dev/archify/review/inverted-pendulum.html dev/public/diagrams/inverted-pendulum.html
rg -n "<svg|prefers-color-scheme" dev/public/diagrams/inverted-pendulum.svg
shasum -a 256 dev/archify/review/inverted-pendulum.html dev/public/diagrams/inverted-pendulum.html
```

### Task 7: Add The Shared Static Preview Component

**Files:**
- Create: `dev/components/ProjectFlowPreview.tsx`
- Modify: `dev/components/ProjectsPage.tsx`
- Modify: `deploy.sh`
- Test: `dev/tests/academic-content.test.mjs`

- [ ] **Step 1: Create the minimal reusable preview**

Create `ProjectFlowPreview.tsx` with this complete implementation:

```tsx
import React from 'react';

interface ProjectFlowPreviewProps {
  flowId: string;
  title: string;
  diagramType: string;
  summary: string;
  previewSrc: string;
  onOpen: (trigger: HTMLButtonElement) => void;
}

const ProjectFlowPreview: React.FC<ProjectFlowPreviewProps> = ({
  flowId,
  title,
  diagramType,
  summary,
  previewSrc,
  onOpen,
}) => (
  <figure className="mt-7 border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#141413]">
    <img
      src={previewSrc}
      alt={`Static preview of the ${title} system map`}
      loading="lazy"
      decoding="async"
      className="aspect-[16/9] w-full bg-stone-50 object-contain dark:bg-stone-950"
    />
    <figcaption className="flex flex-col gap-4 border-t border-stone-200 p-4 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">{diagramType}</p>
        <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{summary}</p>
      </div>
      <button
        type="button"
        data-flow-id={flowId}
        aria-haspopup="dialog"
        onClick={(event) => onOpen(event.currentTarget)}
        className="shrink-0 text-left text-sm font-medium text-stone-900 hover:text-emerald-700 dark:text-stone-100 dark:hover:text-emerald-400"
      >
        Explore system flow ↗
      </button>
    </figcaption>
  </figure>
);

export default ProjectFlowPreview;
```

- [ ] **Step 2: Add the four local flow definitions to `ProjectsPage.tsx`**

Import the component and add this constant above `ProjectsPage`:

```tsx
import ProjectFlowPreview from './ProjectFlowPreview';

const PROJECT_FLOWS = {
  gvla: {
    title: 'Gripper-aware VLA / MiGA',
    diagramType: 'ARCHITECTURE',
    summary: 'Follow embodiment-aware conditioning from visual and language input to executable robot action.',
    previewSrc: '/diagrams/gvla.svg',
    viewerSrc: '/diagrams/gvla.html',
  },
  'gca-bench': {
    title: 'GCA-Bench',
    diagramType: 'WORKFLOW',
    summary: 'Trace complex grasping from instruction and scene reasoning through execution-aware evaluation.',
    previewSrc: '/diagrams/gca-bench.svg',
    viewerSrc: '/diagrams/gca-bench.html',
  },
  'robotic-arm-ik': {
    title: 'Robotic Arm Inverse Kinematics',
    diagramType: 'WORKFLOW',
    summary: 'Inspect the particle-swarm solve from target and obstacles to a collision-aware joint configuration.',
    previewSrc: '/diagrams/robotic-arm-ik.svg',
    viewerSrc: '/diagrams/robotic-arm-ik.html',
  },
  'inverted-pendulum': {
    title: 'Inverted Pendulum Control',
    diagramType: 'ARCHITECTURE',
    summary: 'Follow the closed feedback loop from phase selection and force control to nonlinear state updates.',
    previewSrc: '/diagrams/inverted-pendulum.svg',
    viewerSrc: '/diagrams/inverted-pendulum.html',
  },
} as const;

type FlowId = keyof typeof PROJECT_FLOWS;

const RESEARCH_FLOW_BY_TITLE: Partial<Record<string, FlowId>> = {
  'Gripper-aware VLA / MiGA': 'gvla',
  'GCA-Bench': 'gca-bench',
};
```

- [ ] **Step 3: Keep the new component unmounted until the open handler exists**

Do not render `ProjectFlowPreview` yet. Task 8 adds all four instances after `openFlow` exists, so the TypeScript source is never left with an undefined handler between steps.

- [ ] **Step 4: Add the diagrams publication directory**

Add `diagrams` to `published_dirs` without changing any other deployment behavior:

```bash
published_dirs=(
  assets
  diagrams
  models
  research
)
```

- [ ] **Step 5: Run the tests and record the remaining failures**

Run:

```bash
npm --prefix dev test
```

Expected: the preview, artifact-existence, and deployment assertions pass; the overlay assertions still fail until Task 8.

### Task 8: Add The Native Fullscreen Overlay And URL State

**Files:**
- Modify: `dev/components/ProjectsPage.tsx`
- Test: `dev/tests/academic-content.test.mjs`

- [ ] **Step 1: Add the minimal URL parser**

Add below the flow types:

```tsx
const flowIdFromLocation = (): FlowId | null => {
  const value = new URLSearchParams(window.location.search).get('flow');
  return value && Object.hasOwn(PROJECT_FLOWS, value) ? value as FlowId : null;
};
```

- [ ] **Step 2: Convert `ProjectsPage` to a block component and add state**

Update the React import to include `useEffect`, `useRef`, and `useState`. Inside the component, before `return`, add:

```tsx
const dialogRef = useRef<HTMLDialogElement>(null);
const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
const [activeFlow, setActiveFlow] = useState<FlowId | null>(flowIdFromLocation);
const [frameKey, setFrameKey] = useState(0);
const [frameLoaded, setFrameLoaded] = useState(false);
const [frameFailed, setFrameFailed] = useState(false);
const activeFlowDefinition = activeFlow ? PROJECT_FLOWS[activeFlow] : null;
```

- [ ] **Step 3: Synchronize native dialog, background scroll, and browser Back**

Add these effects:

```tsx
useEffect(() => {
  const handlePopState = () => setActiveFlow(flowIdFromLocation());
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, []);

useEffect(() => {
  const dialog = dialogRef.current;
  if (!dialog) return;

  if (activeFlow && !dialog.open) dialog.showModal();
  if (!activeFlow && dialog.open) dialog.close();
}, [activeFlow]);

useEffect(() => {
  if (!activeFlow) return;

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  return () => {
    document.body.style.overflow = previousOverflow;
  };
}, [activeFlow]);

useEffect(() => {
  setFrameLoaded(false);
  setFrameFailed(false);
}, [activeFlow, frameKey]);
```

- [ ] **Step 4: Add open, close, and retry actions**

```tsx
const openFlow = (flowId: FlowId, trigger: HTMLButtonElement) => {
  const url = new URL(window.location.href);
  url.searchParams.set('flow', flowId);
  window.history.pushState({ projectFlow: flowId }, '', url);
  lastTriggerRef.current = trigger;
  setActiveFlow(flowId);
};

const closeFlow = () => {
  if (window.history.state?.projectFlow) {
    window.history.back();
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete('flow');
  window.history.replaceState(window.history.state, '', url);
  setActiveFlow(null);
};

const retryFlow = () => setFrameKey((value) => value + 1);
```

The `openFlow` call passed to each preview is `(trigger) => openFlow(flowId, trigger)`.

- [ ] **Step 5: Place previews beside their existing content**

Inside the `PROJECTS.map` article, render a preview only when `RESEARCH_FLOW_BY_TITLE[project.title]` resolves. Pass the current flow definition and `(trigger) => openFlow(flowId, trigger)`.

Immediately before `RoboticArmSimulator`, render `PROJECT_FLOWS['robotic-arm-ik']`. Immediately before `InvertedPendulumFinal`, render `PROJECT_FLOWS['inverted-pendulum']`. Do not move or alter either live demo.

- [ ] **Step 6: Render one native dialog after the page main content**

Add this dialog once, as the final child of the page shell:

```tsx
<dialog
  ref={dialogRef}
  aria-labelledby="project-flow-title"
  onCancel={(event) => {
    event.preventDefault();
    closeFlow();
  }}
  onClose={() => lastTriggerRef.current?.focus()}
  className="m-0 h-dvh max-h-none w-screen max-w-none bg-[#fcfcfa] p-0 text-stone-900 backdrop:bg-black/70 dark:bg-[#10100f] dark:text-stone-100"
>
  {activeFlowDefinition && (
    <div className="flex h-full flex-col">
      <header className="flex min-h-14 items-center justify-between gap-4 border-b border-stone-200 px-4 dark:border-stone-800 sm:px-6">
        <div className="min-w-0">
          <p className="font-mono text-[9px] text-emerald-700 dark:text-emerald-400">{activeFlowDefinition.diagramType}</p>
          <h2 id="project-flow-title" className="truncate font-serif text-lg font-bold">{activeFlowDefinition.title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-sm">
          <a
            href={activeFlowDefinition.viewerSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-stone-600 hover:text-emerald-700 dark:text-stone-300 dark:hover:text-emerald-400 sm:inline"
          >
            Open standalone ↗
          </a>
          <button type="button" onClick={closeFlow} aria-label="Close system map" className="font-medium">
            Close
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        {!frameLoaded && !frameFailed && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-stone-500">
            Loading interactive system map...
          </div>
        )}
        {frameFailed ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <img src={activeFlowDefinition.previewSrc} alt="Static system map preview" className="max-h-[60vh] max-w-full" />
            <p className="text-sm text-stone-600 dark:text-stone-300">The interactive map could not be loaded.</p>
            <div className="flex gap-4 text-sm font-medium">
              <button type="button" onClick={retryFlow}>Retry</button>
              <a href={activeFlowDefinition.viewerSrc} target="_blank" rel="noopener noreferrer">Open standalone ↗</a>
            </div>
          </div>
        ) : (
          <iframe
            key={`${activeFlow}-${frameKey}`}
            src={activeFlowDefinition.viewerSrc}
            title={`${activeFlowDefinition.title} interactive system map`}
            onLoad={() => setFrameLoaded(true)}
            onError={() => setFrameFailed(true)}
            className={`h-full w-full border-0 ${frameLoaded ? 'visible' : 'invisible'}`}
          />
        )}
      </div>
    </div>
  )}
</dialog>
```

- [ ] **Step 7: Run tests and production type/build checks**

Run:

```bash
npm --prefix dev test
npm --prefix dev run build
```

Expected: all Node tests pass; Vite builds all three entries without TypeScript or bundling errors. Inspect the bundle report and confirm each diagram remains a public file rather than part of `projects-*.js`.

### Task 9: Add One Runtime Check For Lazy Loading And History

**Files:**
- Modify: `dev/scripts/cdp-layout-check.mjs`
- Test: runtime against the local Vite server

- [ ] **Step 1: Add an optional flow smoke check after the page settles**

Insert this block after the existing double `requestAnimationFrame` wait and before the generic layout evaluation:

```js
if (captureMode === 'flow-smoke') {
  const smoke = await send('Runtime.evaluate', {
    expression: `(async () => {
      const diagramRequests = () => performance.getEntriesByType('resource')
        .map((entry) => entry.name)
        .filter((name) => /\\/diagrams\\/.*\\.html(?:[?#]|$)/.test(name));
      const before = diagramRequests();
      const trigger = document.querySelector('[data-flow-id="gvla"]');
      if (!trigger) return { error: 'GVLA trigger missing', before };

      trigger.click();
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const dialog = document.querySelector('dialog');
      const iframe = dialog?.querySelector('iframe');
      const afterOpen = diagramRequests();
      history.back();
      await new Promise((resolve) => setTimeout(resolve, 100));

      return {
        before,
        afterOpen,
        opened: Boolean(dialog?.open && iframe),
        closed: !dialog?.open && !dialog?.querySelector('iframe'),
        restoredUrl: !new URL(location.href).searchParams.has('flow'),
        focusRestored: document.activeElement === trigger,
      };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });

  const result = smoke.result.value;
  if (
    result.error
    || result.before.length !== 0
    || result.afterOpen.length !== 1
    || !result.opened
    || !result.closed
    || !result.restoredUrl
    || !result.focusRestored
  ) {
    throw new Error(`Flow smoke check failed: ${JSON.stringify(result)}`);
  }
}
```

- [ ] **Step 2: Start the local site and a disposable headless Chrome session**

Run in separate terminal sessions:

```bash
npm --prefix dev run dev -- --host 127.0.0.1
```

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --remote-debugging-port=9222 --user-data-dir=/private/tmp/loganweb-flow-chrome http://127.0.0.1:3000/projects.html
```

Expected: Vite serves the projects page and Chrome exposes DevTools on port 9222.

- [ ] **Step 3: Run the lazy-loading smoke check**

```bash
node dev/scripts/cdp-layout-check.mjs 9222 http://127.0.0.1:3000/projects.html 1440 900 /private/tmp/loganweb-flow-smoke.png flow-smoke
```

Expected: exit 0; zero diagram HTML requests before activation, exactly one after selecting GVLA, the native dialog opens, browser Back closes it and unmounts the iframe, the URL no longer has `flow`, and focus returns to the triggering button.

- [ ] **Step 4: Verify direct and invalid flow URLs manually through the same browser session**

Navigate to `http://127.0.0.1:3000/projects.html?flow=gca-bench` and confirm the GCA-Bench dialog opens with one iframe. Navigate to `?flow=unknown` and confirm no dialog or iframe opens and the rest of the page remains usable.

### Task 10: Publish, Inspect, And Commit The Static Site

**Files:**
- Modify: `deploy.sh`
- Generate: `diagrams/*`
- Generate: `projects.html`
- Generate: `assets/*`
- Test: full private tests, production build, deployment output, responsive browser checks

- [ ] **Step 1: Verify the deployment boundary before publishing**

Run:

```bash
rg -n "published_dirs|diagrams" deploy.sh
```

Expected: `diagrams` appears once inside `published_dirs`; no private `dev/archify` path is copied directly.

- [ ] **Step 2: Run the full private verification suite and build**

```bash
npm --prefix dev test
npm --prefix dev run build
```

Expected: all tests pass with zero failures; Vite emits the three HTML entries plus `dist/diagrams/` and no source maps.

- [ ] **Step 3: Publish through the existing deployment workflow**

```bash
./deploy.sh
```

Expected: `diagrams/` contains exactly the four HTML viewers and four SVG previews, and the root `projects.html` references the new compiled project bundle.

- [ ] **Step 4: Verify publication privacy and exact artifact set**

Run:

```bash
find diagrams -maxdepth 1 -type f -print | sort
find . -path './dev' -prune -o -type f -name '*.map' -print
rg -n "/Users/|/private/tmp/|dev/archify" diagrams projects.html assets -g '*.html' -g '*.svg' -g '*.js'
rg -n "prefers-reduced-motion" diagrams -g '*.html' -g '*.svg'
git check-ignore -v dev/archify/gvla.architecture.json dev/components/ProjectFlowPreview.tsx
```

Expected: eight published diagram files; no source maps; no local absolute paths; both private sources remain ignored.

- [ ] **Step 5: Inspect responsive site integration**

Use the existing CDP layout script at 390×844, 768×1024, and 1440×900. At each size confirm `documentScrollWidth <= innerWidth`, previews remain readable, the close control remains visible, and no console or asset-loading error occurs. Check light and dark portfolio themes. Inspect each Archify artifact's earlier light/dark visual-check contact sheet separately; do not treat the site screenshot as a substitute for Archify's visual review.

- [ ] **Step 6: Run fresh final verification**

```bash
npm --prefix dev test
npm --prefix dev run build
git diff --check
git status --short
```

Expected: tests and build exit 0, diff check prints nothing, and status contains only task-owned publication changes plus the user's pre-existing `README.md` and `.DS_Store` changes.

- [ ] **Step 7: Commit only task-owned tracked files**

Stage the task-owned paths reported by `git status`; do not stage `README.md`, `.DS_Store`, or ignored `dev/` sources. The expected tracked paths are `deploy.sh`, `projects.html`, task-generated `assets/` changes, and `diagrams/`.

```bash
git add deploy.sh projects.html diagrams assets
git commit -m "Add interactive project system maps"
```

Expected: one implementation commit containing only deployable public artifacts and their deployment wiring. Re-run `git status --short` and confirm the user's pre-existing changes remain unstaged.

## Plan Self-Review Checklist

- [x] All four diagrams have exact types, node IDs, relationships, facts, cards, and views.
- [x] Every artifact follows Archify's schema-first, candidate-next, validate-after-edit, freeze, deliver, and visual-review contract.
- [x] SVG previews and HTML viewers originate from the same frozen JSON.
- [x] The website owns only preview presentation, dialog navigation, and lazy iframe mounting.
- [x] The first network request for a diagram HTML occurs only after activation.
- [x] Back, direct links, invalid flow IDs, close, focus restoration, failure fallback, and reduced motion are covered.
- [x] Existing mechanical-arm and inverted-pendulum demos remain unchanged.
- [x] Deployment publishes only eight diagram artifacts and no review sidecars or private sources.
- [x] No new portfolio runtime dependency is introduced.
- [x] Final commands verify tests, build, responsive layout, privacy, and task-only staging.
