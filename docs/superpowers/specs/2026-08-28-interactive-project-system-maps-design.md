# Interactive Project System Maps Design

## Goal

Help AI/ML and robotics research-engineer interviewers understand selected projects at three levels: the system purpose, the end-to-end technical flow, and the underlying algorithms or stack. The first release covers GVLA, GCA-Bench, the robotic-arm inverse-kinematics demo, and the inverted-pendulum control demo.

## Product Boundary

Archify owns graph generation, validation, SVG export, and interactive exploration. The portfolio owns placement, navigation, loading, and visual identity.

The site will show a static SVG preview near each project. Selecting `Explore system flow` opens the full Archify artifact in a same-origin, full-viewport overlay. The interactive HTML is mounted only after selection and unmounted on close.

The implementation will not add React Router, a modal library, Mermaid, React Flow, a second graph runtime, or a custom Archify fork.

## Source Of Truth

- The August 2026 resume is the source for public career framing and personal experience claims.
- The official GVLA and GCA-Bench project pages are the source for paper-level architecture, dataset, benchmark, and result facts.
- The current portfolio source is the source for the robotic-arm and inverted-pendulum implementations.
- The first release presents system-level flows and does not mark individual nodes as personal contributions. A later revision may add contribution detail after the project responsibilities are supplied and reviewed.

The resume describes personal GVLA work across three robot platforms and four gripper types, while the official GVLA project page describes the complete MiGA system as five gripper types, 36 tasks, and 103,000 demonstrations. Because the first release is system-level, the diagram will use the official five-gripper system scope and will not mix in the resume's narrower personal-work scope.

## Diagram Content

### GVLA

- Type: `architecture`
- Primary question: How does gripper embodiment change VLA action generation?
- Main path: RGB observation and language instruction plus hierarchical gripper identity; multi-gripper tokenization; VLA backbone; platform- and gripper-aware adapter routing; action sequence; simulated or real robot execution.
- Supporting facts: MiGA contains 103,000 demonstrations across 36 tasks and five gripper types in simulation and real-world settings.
- Secondary exploration: platform/type/instance representation, Dual Mixture-of-Adapters, strategy divergence, and zero-shot or few-shot adaptation.

### GCA-Bench

- Type: `workflow`
- Primary question: How does the benchmark evaluate grasping beyond pose detection?
- Main path: language instruction and multi-view RGB-D scene; semantic and scene reasoning; grasp and trajectory planning; simulated or real execution; execution-aware metrics; failure analysis.
- Supporting facts: 102 grasping tasks, four scenario groups, three instruction levels, and simulation plus real-world data.
- Secondary exploration: singulated, cluttered, constrained, and semantic scenarios; multi-stage actions; Detection Success Rate, Grasp Success Rate, Task Success Rate, SPL, and execution time.

### Robotic Arm Inverse Kinematics

- Type: `workflow`
- Primary question: How does particle swarm optimization find a reachable collision-aware arm pose?
- Main path: target, obstacles, and arm configuration; swarm initialization; forward kinematics; target-distance and collision fitness; personal/global best update; joint-angle solution; smoothed canvas animation.
- Supporting facts: 50 particles and 50 iterations per solve.
- Secondary exploration: collision penalty, current-pose seeding, and the redundancy explorer's 25 independent runs.

### Inverted Pendulum Control

- Type: `architecture`
- Primary question: How does the simulator move from swing-up to stable feedback control?
- Main path: target and mode selection; state measurement; controller phase selection; force command; nonlinear cart-pendulum dynamics; RK4 integration; updated state feedback.
- Secondary exploration: single and double pendulums, energy shaping, settling/kick/swing-up/balance phases, pole-placement stabilization, and Up + Up or Up + Down retargeting.

Each artifact will contain one obvious main path and approximately 8–12 primary nodes. Supporting metrics belong in cards instead of additional edges. No fact, metric, or project responsibility will be invented to make a diagram appear more complete.

## Site Integration

The existing `ProjectsPage` remains the only page shell. GVLA and GCA-Bench previews appear with their project descriptions. The robotic-arm and inverted-pendulum previews appear between each Live System introduction and its existing interactive demo.

A small `ProjectFlowPreview` component renders the shared preview pattern:

- Archify-exported SVG loaded as an image
- one-sentence reading prompt
- compact diagram-type label
- `Explore system flow` action

The preview SVG and full HTML must be generated from the same Archify JSON specification.

## Overlay And Navigation

Opening a flow adds `?flow=<id>` to `projects.html`, mounts the overlay, and loads only that flow's HTML in a same-origin iframe. The supported IDs are `gvla`, `gca-bench`, `robotic-arm-ik`, and `inverted-pendulum`. An unsupported value is ignored.

The overlay uses the site's typography, background, borders, project title, short reading instruction, `Close`, and `Open standalone`. Archify owns the iframe's search, focus, pan/zoom, theme, finite main-path playback, upstream/downstream reach, route probing, semantic views, and export controls.

Browser Back and the visible Close action are the primary exit paths. Because the iframe is same-origin, the site may attach a small keyboard listener after load: an Escape event that Archify does not prevent closes the overlay, while an Escape consumed by Archify only clears its internal focus or route state. Closing restores document scrolling and focus to the triggering action.

A direct URL such as `projects.html?flow=gvla` opens the matching overlay after the page mounts. Opening and closing use the browser History API; no routing dependency is needed.

## Loading And Failure Behavior

- Static previews use lazy-loaded SVG images.
- No Archify HTML is requested during the initial page load.
- At most one iframe exists at a time.
- Closing the overlay unmounts the iframe.
- While the iframe loads, the overlay shows a restrained loading state.
- If loading fails, the overlay retains the static preview and offers `Retry` and `Open standalone`.
- One artifact failure does not affect the other flows or the existing interactive demos.

## Accessibility And Motion

- Preview actions and overlay controls are keyboard accessible and have explicit names.
- The overlay has an accessible title and prevents interaction with the background page while open.
- Focus enters the overlay on open and returns to the trigger on close.
- Information is never available only through animation or hover.
- Archify trace playback is finite and user initiated.
- `prefers-reduced-motion` disables effective playback motion.
- The SVG preview remains understandable without JavaScript animation.

## Files And Deployment

- `dev/archify/*.json`: four typed Archify sources
- `dev/public/diagrams/*.svg`: four static previews
- `dev/public/diagrams/*.html`: four interactive artifacts
- `dev/components/ProjectFlowPreview.tsx`: shared preview UI
- `dev/components/ProjectsPage.tsx`: flow metadata, overlay state, and query-string navigation
- `deploy.sh`: publish the generated `diagrams/` directory

Archify remains an authoring tool, not a website runtime dependency. Its generated HTML stays outside the Vite JavaScript bundle.

## Verification

- Validate every JSON artifact with Archify's `showcase` quality profile.
- Use Archify `deliver` for each final HTML, export the canonical SVG from that exact delivered artifact, then run its visual check and inspect the generated evidence.
- Confirm each SVG and HTML pair has the same title, core nodes, relationships, and metrics.
- Extend the existing Node content test with the four stable IDs, accessible control labels, conditional iframe mounting, and published artifact existence.
- Run the existing tests and Vite production build.
- Confirm no diagram HTML request occurs before a preview is selected and only the selected artifact loads afterward.
- Verify direct-link opening, invalid-flow handling, Back, Close, focus restoration, background scroll locking, retry, and standalone fallback.
- Check the project page at 390, 768, and 1440 pixels with no horizontal overflow.
- Check all four desktop overlays and confirm reduced-motion behavior.
- Confirm the publish output contains the `diagrams/` directory and no source maps or local paths.

## Success Criteria

- An interviewer can identify each project's input, core algorithm or system, execution path, and output from the static preview in about 30 seconds.
- An interested interviewer can open the overlay and play the main path, inspect nodes, search, and trace exact routes without leaving the portfolio experience.
- The initial project-page load does not include any interactive Archify HTML.
- The four diagrams are evidence-bounded, individually validated, accessible, and visually consistent with the portfolio shell.

## Out Of Scope

- Personal-contribution overlays or component ownership labels
- Diagrams for Go2 PPO or LeRobot SO-101
- Live telemetry from the existing demos into Archify
- Editing diagrams in the browser
- Continuous or automatic animation
- A generalized diagram management system
