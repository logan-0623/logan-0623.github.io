# Publications Section Design

## Goal

Update the `dev/` academic website Publications section so it reads like a formal academic profile rather than a mixed CV dump.

## Scope

The section will show selected publications in one unified list. It will include only papers where Zihong Luo is first author, co-first author, or second author. Other contributing-author papers should be omitted from the main website list and left to Google Scholar.

## Content Rules

- Include first-author, co-first-author, and second-author papers.
- Show all statuses in the same section: provisionally accepted, accepted, published, and workshop/poster where applicable.
- Show author role clearly with a compact tag such as `First Author`, `Co-first Author`, or `Second Author`.
- Keep the author-role legend concise: `* Equal contribution. Only first-author, co-first-author, and second-author papers are listed. See more on Google Scholar.`
- Use real publication teaser images only when available. Do not create fake paper images. If an image is unavailable, render the same publication card without an image.

## Initial Included Papers

- Gripper-aware Vision-Language-Action Models, ECCV 2026, Second Author.
- PG-SAM: Prior-Guided SAM with Medical LLMs for Multi-organ Segmentation, IEEE BIBM 2025, Co-first Author.
- MC-DBN: Modality Completion with Deep Belief Networks, ICPR 2024, First Author.

## Display Design

Use a formal card/list hybrid:

- A section heading and short note at the top.
- Publication cards sorted by year descending and then venue/status priority.
- Each card includes venue, year, status, author role, title, authors, optional contribution sentence, optional resource links, and optional teaser image.
- Cards should be dense enough for academic readers and avoid decorative demo styling.

## Implementation Targets

- `dev/constants.ts`: add publication role/image fields and narrow `PUBLICATIONS` to the selected papers.
- `dev/components/AcademicPage.tsx`: update publication card rendering to support role tags, optional images, and the section note.
- `dev/App.tsx`: align the main portfolio Publications section with the same selected-publication rule, or reuse the same data without reintroducing omitted papers.

## Verification

- Run `npm run build` in `dev/`.
- Check that omitted contributing-author papers no longer appear in the visible Publications section.
- Check that the note references Google Scholar for the full publication record.
