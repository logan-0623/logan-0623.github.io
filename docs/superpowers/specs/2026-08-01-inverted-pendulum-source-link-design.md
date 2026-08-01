# Inverted-Pendulum Source Link Design

## Goal

Add a discoverable source-code link to the inverted-pendulum project introduction on `projects.html` without changing the interactive demonstration or other project content.

## Design

Place a text link directly below the description in the `LIVE SYSTEM / 02` section. The link text is `View source on GitHub ↗`, and it points to `https://github.com/logan-0623/Inverted-pendulum-control`.

The link will use the project's existing typography, color, spacing, and hover conventions so it reads as secondary project metadata rather than a competing call-to-action. It will open in a new browser tab and include `rel="noopener noreferrer"`.

## Scope

Only the inverted-pendulum project introduction and its generated page asset will change. The simulation, navigation, other project sections, and overall layout remain unchanged.

## Verification

Before implementation, add a focused automated check that fails while the repository URL is absent from the projects page bundle. After implementation, verify that the check passes, the production build succeeds, and the rendered link has the approved label, destination, new-tab behavior, and security attributes.
