# Research Editorial Interaction Design

## Goal

Refine Zihong Luo's portfolio for professors and research labs considering research assistant, collaboration, and future PhD opportunities. The site should feel carefully maintained and technically minded without resembling a frontend design showcase.

## Audience And Positioning

The homepage prioritizes research credibility. It leads with Vision-Language-Action models, robotic manipulation, and multimodal learning; states author roles and personal contributions precisely; and presents legged reinforcement learning as ongoing independent work rather than established humanoid-robot expertise. The current CV remains the source of truth for dates, roles, education, publications, and outcomes.

## Information Architecture

- `/` is the professor-facing Research Editorial homepage.
- `/projects.html` contains project details and meaningful interactive demonstrations.
- `/academic.html` remains a compatibility entry and renders the same research homepage as `/`.
- The homepage order is profile, selected research, news, selected publications, research experience, independent work, education, and contact.
- The projects page emphasizes robotic manipulation, ongoing legged RL, and control-system work. Less relevant demonstrations appear only as a compact archive and do not compete with research work.

## Visual Direction

Use a restrained editorial system: warm white and near-black surfaces, muted stone text, an emerald research accent, serif display headings, and sans-serif body copy. Monospace is reserved for factual metadata such as years, author roles, and project status. The page avoids oversized hero typography, floating section cards, terminal decoration, and excessive uppercase labels.

The first viewport shows the name, concise research identity, CMU affiliation, collaboration objective, portrait, primary links, and a visible hint of selected research. Featured research uses real project imagery in compact editorial rows. Publications, experience, and education use full-width lists with consistent dividers rather than repeated cards.

## Interaction Design

Interactions should resemble precise instrument feedback rather than decoration:

- The navigation marks the active section with a section number and thin accent line.
- Featured research images scale by at most one percent on hover and expose a clear project-link affordance.
- Research rows gain a thin emerald status line on hover and keyboard focus.
- Citation controls copy BibTeX and show a short `Copied` confirmation.
- Publication abstracts may expand, but author order, publication state, and personal contribution remain visible without interaction.
- Link arrows move only two to three pixels; content containers do not float or bounce.
- The theme icon uses a brief restrained rotation.
- Hover behavior has equivalent keyboard focus and touch behavior.
- Motion follows `prefers-reduced-motion` and becomes effectively instant when reduction is requested.

The design excludes custom cursors, particle backgrounds, parallax, typewriter effects, large scroll-entry animations, and decorative loading sequences.

## Components And Data

- The research homepage reuses and refines `AcademicPage` as the canonical page component.
- A dedicated `ProjectsPage` owns project navigation, selected project summaries, and interactive demonstrations.
- `constants.ts` remains the shared content source for both pages to prevent factual drift.
- Important content is never available only through hover, animation, or an expanded state.
- External links use explicit labels and icons, open safely, and remain keyboard accessible.
- Missing research imagery falls back to a titled neutral placeholder instead of leaving an empty region.

## Deployment And Privacy

The website remains a fully static Vite build. The local `dev/` source directory stays ignored by Git. `deploy.sh` publishes only the generated HTML, minified assets, CV, research imagery, and required models. The build must not publish source maps, local paths, environment variables, or development files.

## Verification

- Extend content tests to cover the canonical homepage, projects-page boundary, visible contribution metadata, citation interaction labels, and reduced-motion styling.
- Run all existing `dev` tests and the Vite production build.
- Confirm `/`, `/academic.html`, and `/projects.html` resolve to their intended entries.
- Confirm no horizontal overflow at 390, 768, and 1440 pixels.
- Confirm hover, keyboard focus, touch disclosure, citation feedback, theme switching, and reduced-motion behavior.
- Confirm the deploy output contains no source maps or local-source paths.

## Success Criteria

A professor should understand the research direction, strongest work, author roles, individual contributions, and contact path within the first minute. The homepage should feel deliberate through accuracy, hierarchy, typography, and useful feedback, while the projects page demonstrates engineering ability without weakening the academic focus.
