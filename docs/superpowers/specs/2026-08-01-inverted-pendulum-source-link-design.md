# Inverted-Pendulum Source Link Design

## Goal

Add a discoverable source-code link to the inverted-pendulum project introduction in the private development source without changing the interactive demonstration or other project content.

## Design

Place a text link directly below the description in the `LIVE SYSTEM / 02` section. The link text is `View source on GitHub ↗`, and it points to `https://github.com/logan-0623/Inverted-pendulum-control`.

The link will use the project's existing typography, color, spacing, and hover conventions so it reads as secondary project metadata rather than a competing call-to-action. It will open in a new browser tab and include `rel="noopener noreferrer"`.

## Scope

Only the inverted-pendulum project introduction in `dev/components/ProjectsPage.tsx` will change. The simulation, navigation, other project sections, generated files in the repository root, and overall layout remain unchanged.

## Verification

Before implementation, add a focused automated check that fails while the repository URL is absent from the projects page source. After implementation, verify that the development test suite and production build pass and that the source link has the approved label, destination, new-tab behavior, and security attributes. Do not run `deploy.sh`; the user will publish the generated output separately.
