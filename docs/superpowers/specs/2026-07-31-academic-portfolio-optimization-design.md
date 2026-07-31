# Academic Portfolio Optimization Design

## Goal

Optimize the `dev/` website for professors and research labs evaluating Zihong Luo for research assistant, collaboration, and future PhD opportunities.

## Positioning

The site will lead with Vision-Language-Action models and robotic manipulation. Earlier work in medical imaging, multimodal representation learning, and interpretable machine learning will support that focus as evidence of broader research ability. Legged robot learning will appear as an ongoing independent project, not as established expertise in humanoid robotics.

## Source Of Truth

`CS_Zihongluo.pdf` is the source of truth for education, research experience, publication status, dates, author roles, and outcomes. Current personal projects may appear outside the CV when explicitly marked as ongoing independent work.

## Page Structure

1. Profile and research statement
2. Featured Research: GVLA and GCA-Bench
3. News
4. Selected Publications
5. Research Experience
6. Independent Projects
7. Education
8. Contact and CV

The academic page remains the default experience. The prominent `Modern View` link and self-referential `Personal Webpage` link will be removed.

## Content Rules

- Use `Vision-Language-Action Models · Robotic Manipulation · Multimodal Learning` as the concise research identity.
- Remove claims of humanoid-robot expertise.
- Show GVLA as second-author work and GCA-Bench as contributing-author work.
- Select publications by relevance and representative contribution, not only author position.
- Include GVLA, GCA-Bench, PG-SAM, MC-DBN, and IMDR.
- Give each publication an author-role label and a concise personal-contribution statement.
- Mark the MuJoCo/PPO legged locomotion work as `Ongoing Independent Project`.
- Do not claim completed sim-to-real evaluation for the legged project.

## Visual Design

Retain the restrained academic palette, serif headings, and emerald accent. Use real project imagery for featured research, compact lists for publications and experience, and cards only for featured research and the independent project. Reduce tiny uppercase labels and excessive letter spacing.

## Responsive And Performance Requirements

- No horizontal overflow at 390, 768, or 1440 pixels.
- Mobile header provides usable section navigation without the previous two-view control.
- Long titles, research tags, and email addresses wrap safely.
- Replace the 9.6 MB portrait with a responsive WebP asset below 300 KB.
- Use locally stored, optimized teaser images from the official GVLA and GCA-Bench project pages.

## Verification

- Run the content regression tests.
- Run `npm run build` in `dev/`.
- Render and inspect desktop and mobile screenshots.
- Confirm the page has no horizontal overflow at the target widths.
- Confirm all visible dates, statuses, roles, and education entries match the current CV.
